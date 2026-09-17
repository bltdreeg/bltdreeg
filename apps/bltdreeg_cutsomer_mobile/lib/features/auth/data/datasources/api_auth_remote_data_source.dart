import '../../../../core/network/api_client.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/entities/user.dart';
import '../models/auth_models.dart';
import 'auth_remote_data_source.dart';

/// Real backend implementation. Selected with `--dart-define=BACKEND=real`.
final class ApiAuthRemoteDataSource implements AuthRemoteDataSource {
  const ApiAuthRemoteDataSource(this._api);

  final ApiClient _api;

  @override
  Future<AuthSession> signInWithEmail(String email, String password) async =>
      AuthSessionModel.fromJson(
        await _api.postJson(
          '/auth/login',
          body: {'email': email, 'password': password},
        ),
      );

  @override
  Future<OtpChallenge> requestLoginOtp(String phone) async =>
      OtpChallengeModel.fromJson(
        await _api.postJson('/auth/otp', body: {'phone': phone}),
      );

  @override
  Future<OtpChallenge> startRegistration(RegistrationRequest r) async =>
      OtpChallengeModel.fromJson(
        await _api.postJson(
          '/auth/register',
          body: {
            'first_name': r.firstName,
            'last_name': r.lastName,
            'phone': r.phone,
            'email': r.email,
            'password': r.password,
          },
        ),
      );

  @override
  Future<OtpChallenge> resendOtp(OtpChallenge challenge) async =>
      OtpChallengeModel.fromJson(
        await _api.postJson(
          '/auth/otp/resend',
          body: {'phone': challenge.phone, 'purpose': challenge.purpose.name},
        ),
      );

  @override
  Future<AuthSession> verifyOtp(OtpChallenge challenge, String code) async =>
      AuthSessionModel.fromJson(
        await _api.postJson(
          '/auth/otp/verify',
          body: {
            'phone': challenge.phone,
            'purpose': challenge.purpose.name,
            'code': code,
          },
        ),
      );

  @override
  Future<User> fetchMe() async => UserModel.fromJson(await _api.getJson('/me'));

  @override
  Future<User> updateProfile(ProfileUpdate update) async => UserModel.fromJson(
    await _api.putJson(
      '/me',
      body: {
        'first_name': update.firstName,
        'last_name': update.lastName,
        'email': update.email,
        'birth_date': update.birthDate?.toIso8601String(),
        'area_name': update.areaName,
      },
    ),
  );

  @override
  Future<void> deleteAccount() => _api.deleteJson('/me');

  @override
  Future<void> signOut() => _api.postJson('/auth/logout');
}
