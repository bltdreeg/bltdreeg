import '../../../../core/utils/result.dart';
import '../entities/auth_session.dart';
import '../entities/otp_challenge.dart';

abstract interface class AuthRepository {
  /// Current session, then every change. Drives the router guard.
  Stream<SessionSnapshot> watchSession();

  SessionSnapshot get currentSession;

  /// The latest unverified OTP challenge for [phone], if any. Lets the OTP
  /// screen be rebuilt from its URL (refreshes, restoration).
  OtpChallenge? pendingChallenge(String phone);

  /// Restores a stored session instantly (offline-first), then refreshes the
  /// profile from the server in the background.
  Future<void> restoreSession();

  Future<Result<AuthSession>> signInWithEmail({
    required String email,
    required String password,
  });

  Future<Result<OtpChallenge>> requestLoginOtp(String phone);

  /// Validates the registration and texts an OTP to confirm the phone.
  Future<Result<OtpChallenge>> startRegistration(RegistrationRequest request);

  Future<Result<OtpChallenge>> resendOtp(OtpChallenge challenge);

  Future<Result<AuthSession>> verifyOtp({
    required OtpChallenge challenge,
    required String code,
  });

  Future<void> continueAsGuest();

  Future<Result<void>> signOut();
}
