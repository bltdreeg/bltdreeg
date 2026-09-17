import '../../../../core/usecase/usecase.dart';
import '../../../../core/utils/result.dart';
import '../entities/auth_session.dart';
import '../entities/otp_challenge.dart';
import '../repositories/auth_repository.dart';

// One class per action. Kept in one file because each is a thin delegate;
// split a use case out once it grows real orchestration logic.

final class SignInWithEmail
    implements UseCase<AuthSession, ({String email, String password})> {
  const SignInWithEmail(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<AuthSession>> call(({String email, String password}) p) =>
      _repository.signInWithEmail(email: p.email.trim(), password: p.password);
}

final class RequestLoginOtp implements UseCase<OtpChallenge, String> {
  const RequestLoginOtp(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<OtpChallenge>> call(String phone) =>
      _repository.requestLoginOtp(phone);
}

final class StartRegistration
    implements UseCase<OtpChallenge, RegistrationRequest> {
  const StartRegistration(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<OtpChallenge>> call(RegistrationRequest request) =>
      _repository.startRegistration(request);
}

final class ResendOtp implements UseCase<OtpChallenge, OtpChallenge> {
  const ResendOtp(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<OtpChallenge>> call(OtpChallenge challenge) =>
      _repository.resendOtp(challenge);
}

final class VerifyOtp
    implements UseCase<AuthSession, ({OtpChallenge challenge, String code})> {
  const VerifyOtp(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<AuthSession>> call(({OtpChallenge challenge, String code}) p) =>
      _repository.verifyOtp(challenge: p.challenge, code: p.code);
}

final class ContinueAsGuest implements UseCase<void, NoParams> {
  const ContinueAsGuest(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<void>> call(NoParams _) async {
    await _repository.continueAsGuest();
    return const Ok(null);
  }
}

final class SignOut implements UseCase<void, NoParams> {
  const SignOut(this._repository);

  final AuthRepository _repository;

  @override
  Future<Result<void>> call(NoParams _) => _repository.signOut();
}
