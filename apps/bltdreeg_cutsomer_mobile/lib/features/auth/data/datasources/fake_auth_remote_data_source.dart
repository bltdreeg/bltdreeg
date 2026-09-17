import '../../../../core/error/exceptions.dart';
import '../../../../core/network/fake_server.dart';
import '../../domain/auth_failure_codes.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/entities/user.dart';
import 'auth_remote_data_source.dart';

/// In-memory auth backend that follows the same rules the real API will.
///
/// Demo data:
/// * email `karim.abdelrahman@gmail.com`, password `barber2026`
/// * mobile `01023456789` is registered
/// * every OTP code is `1234`; 3 wrong attempts lock the phone for 10 min
final class FakeAuthRemoteDataSource implements AuthRemoteDataSource {
  FakeAuthRemoteDataSource({required this._server, DateTime Function()? clock})
    : _clock = clock ?? DateTime.now;

  static const demoEmail = 'karim.abdelrahman@gmail.com';
  static const demoPassword = 'barber2026';
  static const demoPhone = '01023456789';
  static const demoOtp = '1234';

  static const codeLength = 4;
  static const maxAttempts = 3;
  static const resendCooldown = Duration(seconds: 60);
  static const lockDuration = Duration(minutes: 10);

  final FakeServer _server;
  final DateTime Function() _clock;

  final Map<String, ({User user, String password})> _accounts = {
    demoPhone: (
      user: User(
        id: 'u-karim',
        firstName: 'كريم',
        lastName: 'عبد الرحمن',
        phone: demoPhone,
        email: demoEmail,
        birthDate: DateTime(1996, 3, 14),
        areaName: 'المعادي، القاهرة',
      ),
      password: demoPassword,
    ),
  };

  final _pendingRegistrations = <String, RegistrationRequest>{};
  final _attemptsLeft = <String, int>{};
  final _lockedUntil = <String, DateTime>{};
  final _resendAt = <String, DateTime>{};
  String? _currentUserPhone;

  @override
  Future<AuthSession> signInWithEmail(String email, String password) =>
      _server(() {
        final match = _accounts.values.where(
          (a) => a.user.email?.toLowerCase() == email.toLowerCase(),
        );
        if (match.isEmpty || match.first.password != password) {
          throw const RuleException(AuthFailureCodes.invalidCredentials);
        }
        return _session(match.first.user);
      });

  @override
  Future<OtpChallenge> requestLoginOtp(String phone) => _server(() {
    if (!_accounts.containsKey(phone)) {
      throw const RuleException(AuthFailureCodes.phoneNotRegistered);
    }
    return _issue(phone, OtpPurpose.login);
  });

  @override
  Future<OtpChallenge> startRegistration(RegistrationRequest request) =>
      _server(() {
        if (_accounts.containsKey(request.phone)) {
          throw const RuleException(AuthFailureCodes.phoneTaken);
        }
        _pendingRegistrations[request.phone] = request;
        return _issue(request.phone, OtpPurpose.register);
      });

  @override
  Future<OtpChallenge> resendOtp(OtpChallenge challenge) => _server(() {
    final availableAt = _resendAt[challenge.phone];
    if (availableAt != null && _clock().isBefore(availableAt)) {
      throw const RuleException(AuthFailureCodes.otpResendTooSoon);
    }
    return _issue(challenge.phone, challenge.purpose);
  });

  @override
  Future<AuthSession> verifyOtp(OtpChallenge challenge, String code) =>
      _server(() {
        final phone = challenge.phone;
        final lockedUntil = _lockedUntil[phone];
        if (lockedUntil != null && _clock().isBefore(lockedUntil)) {
          throw RuleException(
            AuthFailureCodes.otpLocked,
            data: {
              AuthFailureCodes.lockMinutes: lockedUntil
                  .difference(_clock())
                  .inMinutes
                  .clamp(1, 60),
            },
          );
        }
        if (code != demoOtp) {
          final left = (_attemptsLeft[phone] ?? maxAttempts) - 1;
          if (left <= 0) {
            _lockedUntil[phone] = _clock().add(lockDuration);
            _attemptsLeft.remove(phone);
            throw RuleException(
              AuthFailureCodes.otpLocked,
              data: {AuthFailureCodes.lockMinutes: lockDuration.inMinutes},
            );
          }
          _attemptsLeft[phone] = left;
          throw RuleException(
            AuthFailureCodes.otpInvalid,
            data: {AuthFailureCodes.attemptsLeft: left},
          );
        }
        _attemptsLeft.remove(phone);
        if (challenge.purpose == OtpPurpose.register) {
          final request = _pendingRegistrations.remove(phone);
          if (request == null) {
            throw const RuleException(AuthFailureCodes.otpInvalid);
          }
          _accounts[phone] = (
            user: User(
              id: 'u-${_clock().microsecondsSinceEpoch}',
              firstName: request.firstName,
              lastName: request.lastName,
              phone: phone,
              email: request.email,
            ),
            password: request.password,
          );
        }
        return _session(_accounts[phone]!.user);
      });

  @override
  Future<User> fetchMe() => _server(() {
    final phone = _currentUserPhone;
    // The fake keeps no server-side session across app restarts; treat the
    // demo account as the owner of any stored token.
    return _accounts[phone ?? demoPhone]!.user;
  });

  @override
  Future<User> updateProfile(ProfileUpdate update) => _server(() {
    final phone = _currentUserPhone ?? demoPhone;
    final account = _accounts[phone]!;
    final updated = account.user.copyWith(
      firstName: update.firstName,
      lastName: update.lastName,
      email: update.email,
      clearEmail: update.email == null,
      birthDate: update.birthDate,
      clearBirthDate: update.birthDate == null,
      areaName: update.areaName,
    );
    _accounts[phone] = (user: updated, password: account.password);
    return updated;
  });

  @override
  Future<void> deleteAccount() => _server(() {
    _accounts.remove(_currentUserPhone ?? demoPhone);
    _currentUserPhone = null;
  });

  @override
  Future<void> signOut() => _server(() => _currentUserPhone = null);

  OtpChallenge _issue(String phone, OtpPurpose purpose) {
    final resendAt = _clock().add(resendCooldown);
    _resendAt[phone] = resendAt;
    _attemptsLeft[phone] = maxAttempts;
    return OtpChallenge(
      phone: phone,
      purpose: purpose,
      codeLength: codeLength,
      resendAvailableAt: resendAt,
      attemptsLeft: maxAttempts,
    );
  }

  AuthSession _session(User user) {
    _currentUserPhone = user.phone;
    return AuthSession(
      accessToken: 'fake.${user.id}.${_clock().millisecondsSinceEpoch}',
      user: user,
    );
  }
}
