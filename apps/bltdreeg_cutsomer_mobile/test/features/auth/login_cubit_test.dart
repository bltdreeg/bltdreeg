import 'package:bltdreeg_cutsomer_mobile/core/error/failures.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/api_client.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/utils/validators.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/auth_local_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/fake_auth_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/auth_failure_codes.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/usecases/auth_usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/presentation/login/login_cubit.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late FakeConnectivityService connectivity;
  late LoginCubit cubit;

  setUp(() {
    connectivity = FakeConnectivityService();
    final repository = AuthRepositoryImpl(
      remote: FakeAuthRemoteDataSource(
        server: FakeServer(
          environment: testEnvironment,
          connectivity: connectivity,
        ),
      ),
      local: InMemoryAuthLocalDataSource(),
      apiClient: ApiClient(
        environment: testEnvironment,
        connectivity: connectivity,
      ),
    );
    cubit = LoginCubit(
      signInWithEmail: SignInWithEmail(repository),
      requestLoginOtp: RequestLoginOtp(repository),
      initialMethod: LoginMethod.phone,
    );
  });

  tearDown(() => cubit.close());

  group('inline phone validation (frame 05)', () {
    test('no error while a valid prefix is still being typed', () {
      cubit.phoneChanged('0102345');
      expect(cubit.state.visiblePhoneError, isNull);
      expect(cubit.state.isPhoneValid, isFalse);
    });

    test('error as soon as the prefix cannot become valid', () {
      cubit.phoneChanged('013');
      expect(cubit.state.visiblePhoneError, ValidationError.invalidPhone);
    });

    test('error after leaving the field with an incomplete number', () {
      cubit
        ..phoneChanged('0102 345 67')
        ..phoneFocusLost();
      expect(cubit.state.visiblePhoneError, ValidationError.invalidPhone);
    });

    test('Arabic-Indic digits are accepted', () {
      cubit.phoneChanged('٠١٠٢٣٤٥٦٧٨٩');
      expect(cubit.state.isPhoneValid, isTrue);
      expect(cubit.state.visiblePhoneError, isNull);
    });
  });

  test('phone submit issues an OTP challenge', () async {
    cubit.phoneChanged(FakeAuthRemoteDataSource.demoPhone);
    await cubit.submitPhone();
    expect(cubit.state.status, SubmitStatus.success);
    expect(cubit.state.challenge?.phone, FakeAuthRemoteDataSource.demoPhone);
  });

  test('unregistered phone fails with a rule failure', () async {
    cubit.phoneChanged('01523456789');
    await cubit.submitPhone();
    expect(cubit.state.status, SubmitStatus.failure);
    expect(
      cubit.state.failure,
      const RuleFailure(AuthFailureCodes.phoneNotRegistered),
    );
  });

  test('offline submit reports a network failure', () async {
    connectivity.setForcedOffline(value: true);
    cubit.phoneChanged(FakeAuthRemoteDataSource.demoPhone);
    await cubit.submitPhone();
    expect(cubit.state.failure, isA<NetworkFailure>());
  });

  group('email', () {
    test('validation errors show only after submitting', () async {
      cubit.methodChanged(LoginMethod.email);
      expect(cubit.state.visibleEmailError, isNull);
      await cubit.submitEmail();
      expect(cubit.state.visibleEmailError, ValidationError.required);
      expect(cubit.state.status, SubmitStatus.idle);
    });

    test('wrong password → invalid credentials', () async {
      cubit
        ..methodChanged(LoginMethod.email)
        ..emailChanged(FakeAuthRemoteDataSource.demoEmail)
        ..passwordChanged('nope12345');
      await cubit.submitEmail();
      expect(
        cubit.state.failure,
        const RuleFailure(AuthFailureCodes.invalidCredentials),
      );
    });

    test('correct credentials succeed', () async {
      cubit
        ..methodChanged(LoginMethod.email)
        ..emailChanged(FakeAuthRemoteDataSource.demoEmail)
        ..passwordChanged(FakeAuthRemoteDataSource.demoPassword);
      await cubit.submitEmail();
      expect(cubit.state.status, SubmitStatus.success);
    });
  });
}
