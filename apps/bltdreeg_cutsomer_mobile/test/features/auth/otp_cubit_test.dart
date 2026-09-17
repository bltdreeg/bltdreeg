import 'dart:async';

import 'package:bloc_test/bloc_test.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/api_client.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/auth_local_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/fake_auth_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/entities/otp_challenge.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/usecases/auth_usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/presentation/otp/otp_cubit.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late DateTime now;
  late StreamController<void> ticker;
  late AuthRepositoryImpl repository;
  late OtpChallenge challenge;

  setUp(() async {
    now = DateTime(2026, 9, 17, 9, 41);
    ticker = StreamController<void>();
    final connectivity = FakeConnectivityService();
    repository = AuthRepositoryImpl(
      remote: FakeAuthRemoteDataSource(
        server: FakeServer(
          environment: testEnvironment,
          connectivity: connectivity,
        ),
        clock: () => now,
      ),
      local: InMemoryAuthLocalDataSource(),
      apiClient: ApiClient(
        environment: testEnvironment,
        connectivity: connectivity,
      ),
    );
    challenge = (await repository.requestLoginOtp(
      FakeAuthRemoteDataSource.demoPhone,
    )).valueOrNull!;
  });

  tearDown(() => ticker.close());

  OtpCubit build() => OtpCubit(
    challenge: challenge,
    verifyOtp: VerifyOtp(repository),
    resendOtp: ResendOtp(repository),
    clock: () => now,
    ticker: ticker.stream,
  );

  blocTest<OtpCubit, OtpState>(
    'a complete correct code verifies automatically and succeeds',
    build: build,
    act: (cubit) => cubit.codeChanged(FakeAuthRemoteDataSource.demoOtp),
    wait: const Duration(milliseconds: 50),
    verify: (cubit) {
      expect(cubit.state.status, OtpStatus.success);
      expect(repository.currentSession.isAuthenticated, isTrue);
    },
  );

  blocTest<OtpCubit, OtpState>(
    'a wrong code shows the invalid state with attempts left (frame 20)',
    build: build,
    act: (cubit) => cubit.codeChanged('7319'),
    wait: const Duration(milliseconds: 50),
    verify: (cubit) {
      expect(cubit.state.status, OtpStatus.invalid);
      expect(cubit.state.attemptsLeft, 2);
    },
  );

  blocTest<OtpCubit, OtpState>(
    'editing after a wrong code clears the red state',
    build: build,
    act: (cubit) async {
      cubit.codeChanged('7319');
      await Future<void>.delayed(const Duration(milliseconds: 20));
      cubit.codeChanged('731');
    },
    wait: const Duration(milliseconds: 50),
    verify: (cubit) => expect(cubit.state.status, OtpStatus.editing),
  );

  blocTest<OtpCubit, OtpState>(
    'three wrong codes lock verification',
    build: build,
    act: (cubit) async {
      for (final code in ['1111', '2222', '3333']) {
        cubit.codeChanged(code.substring(0, 3));
        cubit.codeChanged(code);
        await Future<void>.delayed(const Duration(milliseconds: 20));
      }
    },
    wait: const Duration(milliseconds: 50),
    verify: (cubit) {
      expect(cubit.state.status, OtpStatus.locked);
      expect(cubit.state.lockMinutes, 10);
      expect(cubit.state.canVerify, isFalse);
    },
  );

  test('resend unlocks when the countdown ends and resets the code', () async {
    final cubit = build();
    addTearDown(cubit.close);

    expect(cubit.state.canResend, isFalse);
    expect(cubit.state.resendIn, const Duration(seconds: 60));

    now = now.add(const Duration(seconds: 22));
    ticker.add(null);
    await Future<void>.delayed(Duration.zero);
    expect(cubit.state.resendIn, const Duration(seconds: 38));

    now = now.add(const Duration(seconds: 38));
    ticker.add(null);
    await Future<void>.delayed(Duration.zero);
    expect(cubit.state.canResend, isTrue);

    cubit.codeChanged('12');
    await cubit.resend();
    expect(cubit.state.resendCount, 1);
    expect(cubit.state.code, isEmpty);
    expect(cubit.state.canResend, isFalse);
  });
}
