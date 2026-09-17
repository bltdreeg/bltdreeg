import 'package:get_it/get_it.dart';

import '../../core/config/app_environment.dart';
import 'data/datasources/api_auth_remote_data_source.dart';
import 'data/datasources/auth_local_data_source.dart';
import 'data/datasources/auth_remote_data_source.dart';
import 'data/datasources/fake_auth_remote_data_source.dart';
import 'data/repositories/auth_repository_impl.dart';
import 'domain/entities/otp_challenge.dart';
import 'domain/repositories/auth_repository.dart';
import 'domain/usecases/auth_usecases.dart';
import 'presentation/login/login_cubit.dart';
import 'presentation/otp/otp_cubit.dart';
import 'presentation/register/register_cubit.dart';
import 'presentation/session/auth_session_cubit.dart';

void registerAuthModule(GetIt sl, AppEnvironment env) {
  sl
    // Swapping to the real backend is this one line.
    ..registerLazySingleton<AuthRemoteDataSource>(
      () => env.usesFakeBackend
          ? FakeAuthRemoteDataSource(server: sl())
          : ApiAuthRemoteDataSource(sl()),
    )
    ..registerLazySingleton<AuthLocalDataSource>(
      () => SecureAuthLocalDataSource(database: sl(), preferences: sl()),
    )
    ..registerLazySingleton<AuthRepository>(
      () => AuthRepositoryImpl(remote: sl(), local: sl(), apiClient: sl()),
    )
    ..registerFactory(() => SignInWithEmail(sl()))
    ..registerFactory(() => RequestLoginOtp(sl()))
    ..registerFactory(() => StartRegistration(sl()))
    ..registerFactory(() => ResendOtp(sl()))
    ..registerFactory(() => VerifyOtp(sl()))
    ..registerFactory(() => ContinueAsGuest(sl()))
    ..registerFactory(() => SignOut(sl()))
    ..registerLazySingleton<AuthSessionCubit>(
      () => AuthSessionCubit(
        repository: sl(),
        continueAsGuest: sl(),
        signOut: sl(),
      ),
      dispose: (c) => c.close(),
    )
    ..registerFactoryParam<LoginCubit, LoginMethod, void>(
      (method, _) => LoginCubit(
        signInWithEmail: sl(),
        requestLoginOtp: sl(),
        initialMethod: method,
      ),
    )
    ..registerFactory(() => RegisterCubit(startRegistration: sl()))
    ..registerFactoryParam<OtpCubit, OtpChallenge, void>(
      (challenge, _) =>
          OtpCubit(challenge: challenge, verifyOtp: sl(), resendOtp: sl()),
    );
}
