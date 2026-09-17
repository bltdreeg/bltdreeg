/// `RuleFailure.code` values produced by the auth API (and its fake).
abstract final class AuthFailureCodes {
  static const invalidCredentials = 'auth.invalid_credentials';
  static const phoneNotRegistered = 'auth.phone_not_registered';
  static const phoneTaken = 'auth.phone_taken';
  static const otpInvalid = 'auth.otp_invalid';
  static const otpLocked = 'auth.otp_locked';
  static const otpResendTooSoon = 'auth.otp_resend_too_soon';

  /// `data` keys.
  static const attemptsLeft = 'attemptsLeft';
  static const lockMinutes = 'lockMinutes';
}
