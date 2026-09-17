import '../../domain/entities/auth_session.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/entities/user.dart';

/// Server contract for auth. Implementations throw `AppException`s.
///
/// * [FakeAuthRemoteDataSource]: in-memory, used while there's no backend.
/// * [ApiAuthRemoteDataSource]: dio implementation of the same contract.
abstract interface class AuthRemoteDataSource {
  Future<AuthSession> signInWithEmail(String email, String password);

  Future<OtpChallenge> requestLoginOtp(String phone);

  Future<OtpChallenge> startRegistration(RegistrationRequest request);

  Future<OtpChallenge> resendOtp(OtpChallenge challenge);

  Future<AuthSession> verifyOtp(OtpChallenge challenge, String code);

  Future<User> fetchMe();

  Future<void> signOut();
}
