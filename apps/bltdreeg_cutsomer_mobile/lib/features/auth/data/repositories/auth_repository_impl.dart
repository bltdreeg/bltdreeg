import 'dart:async';

import '../../../../core/error/failures.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_data_source.dart';
import '../datasources/auth_remote_data_source.dart';

final class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required this._remote,
    required this._local,
    required ApiClient apiClient,
  }) : _api = apiClient;

  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;
  final ApiClient _api;

  final _controller = StreamController<SessionSnapshot>.broadcast();
  SessionSnapshot _current = const SessionSnapshot.unknown();
  final _pending = <String, OtpChallenge>{};

  @override
  OtpChallenge? pendingChallenge(String phone) => _pending[phone];

  Future<Result<OtpChallenge>> _trackChallenge(
    Future<OtpChallenge> Function() request,
  ) async {
    final result = await guardResult(request);
    if (result case Ok(value: final challenge)) {
      _pending[challenge.phone] = challenge;
    }
    return result;
  }

  @override
  SessionSnapshot get currentSession => _current;

  @override
  Stream<SessionSnapshot> watchSession() async* {
    yield _current;
    yield* _controller.stream;
  }

  void _emit(SessionSnapshot snapshot) {
    if (snapshot == _current) return;
    _current = snapshot;
    _controller.add(snapshot);
  }

  @override
  Future<void> restoreSession() async {
    final stored = await _local.readSession();
    if (stored == null) {
      _emit(
        SessionSnapshot(
          status: _local.guestMode
              ? AuthStatus.guest
              : AuthStatus.unauthenticated,
        ),
      );
      return;
    }
    // Offline-first: trust the cached session right away...
    _api.setAccessToken(stored.accessToken);
    _emit(SessionSnapshot(status: AuthStatus.authenticated, user: stored.user));
    // ...then reconcile the profile without blocking startup.
    unawaited(_refreshProfile());
  }

  Future<void> _refreshProfile() async {
    final result = await guardResult(_remote.fetchMe);
    switch (result) {
      case Ok(:final value):
        await _local.saveUser(value);
        _emit(SessionSnapshot(status: AuthStatus.authenticated, user: value));
      case Err(failure: UnauthorizedFailure()):
        await _clear();
      case Err():
        // Offline or server hiccup: keep the cached profile.
        break;
    }
  }

  @override
  Future<Result<AuthSession>> signInWithEmail({
    required String email,
    required String password,
  }) => _authenticate(() => _remote.signInWithEmail(email, password));

  @override
  Future<Result<OtpChallenge>> requestLoginOtp(String phone) =>
      _trackChallenge(() => _remote.requestLoginOtp(phone));

  @override
  Future<Result<OtpChallenge>> startRegistration(RegistrationRequest request) =>
      _trackChallenge(() => _remote.startRegistration(request));

  @override
  Future<Result<OtpChallenge>> resendOtp(OtpChallenge challenge) =>
      _trackChallenge(() => _remote.resendOtp(challenge));

  @override
  Future<Result<AuthSession>> verifyOtp({
    required OtpChallenge challenge,
    required String code,
  }) =>
      // The challenge stays pending after success: the OTP route may rebuild
      // while it shows its confirmation, and a new request replaces it.
      _authenticate(() => _remote.verifyOtp(challenge, code));

  Future<Result<AuthSession>> _authenticate(
    Future<AuthSession> Function() request,
  ) async {
    final result = await guardResult(request);
    if (result case Ok(value: final session)) {
      await _local.saveSession(session);
      await _local.setGuestMode(value: false);
      _api.setAccessToken(session.accessToken);
      _emit(
        SessionSnapshot(status: AuthStatus.authenticated, user: session.user),
      );
    }
    return result;
  }

  @override
  Future<Result<User>> updateProfile(ProfileUpdate update) async {
    final result = await guardResult(() => _remote.updateProfile(update));
    if (result case Ok(:final value)) {
      await _local.saveUser(value);
      _emit(SessionSnapshot(status: AuthStatus.authenticated, user: value));
    }
    return result;
  }

  @override
  Future<Result<void>> deleteAccount() async {
    final result = await guardResult(_remote.deleteAccount);
    if (result.isOk) await _clear();
    return result;
  }

  @override
  Future<void> continueAsGuest() async {
    await _local.setGuestMode(value: true);
    _emit(const SessionSnapshot(status: AuthStatus.guest));
  }

  @override
  Future<Result<void>> signOut() async {
    // Best effort server call; the device session is cleared regardless so
    // signing out works offline.
    await guardResult(_remote.signOut);
    await _clear();
    return const Ok(null);
  }

  Future<void> _clear() async {
    await _local.clearSession();
    _pending.clear();
    _api.setAccessToken(null);
    _emit(const SessionSnapshot(status: AuthStatus.unauthenticated));
  }
}
