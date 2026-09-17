import 'package:bltdreeg_cutsomer_mobile/core/network/api_client.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/auth_local_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/fake_auth_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/entities/auth_session.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/entities/otp_challenge.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late FakeConnectivityService connectivity;
  late InMemoryAuthLocalDataSource local;

  AuthRepositoryImpl build() => AuthRepositoryImpl(
    remote: FakeAuthRemoteDataSource(
      server: FakeServer(
        environment: testEnvironment,
        connectivity: connectivity,
      ),
    ),
    local: local,
    apiClient: ApiClient(
      environment: testEnvironment,
      connectivity: connectivity,
    ),
  );

  setUp(() {
    connectivity = FakeConnectivityService();
    local = InMemoryAuthLocalDataSource();
  });

  test('sign-in persists the session and emits authenticated', () async {
    final repo = build();
    final result = await repo.signInWithEmail(
      email: FakeAuthRemoteDataSource.demoEmail,
      password: FakeAuthRemoteDataSource.demoPassword,
    );
    expect(result.isOk, isTrue);
    expect(repo.currentSession.status, AuthStatus.authenticated);
    expect(local.session?.user.firstName, 'كريم');
  });

  test('restores a stored session offline, before any network call', () async {
    await build().signInWithEmail(
      email: FakeAuthRemoteDataSource.demoEmail,
      password: FakeAuthRemoteDataSource.demoPassword,
    );
    connectivity.setForcedOffline(value: true);

    final relaunched = build();
    await relaunched.restoreSession();
    expect(relaunched.currentSession.status, AuthStatus.authenticated);
    expect(relaunched.currentSession.user?.phone, '01023456789');
  });

  test('guest mode survives relaunch; sign out clears the session', () async {
    final repo = build();
    await repo.continueAsGuest();
    final relaunched = build();
    await relaunched.restoreSession();
    expect(relaunched.currentSession.status, AuthStatus.guest);

    await relaunched.signInWithEmail(
      email: FakeAuthRemoteDataSource.demoEmail,
      password: FakeAuthRemoteDataSource.demoPassword,
    );
    expect(local.guestMode, isFalse);
    await relaunched.signOut();
    expect(relaunched.currentSession.status, AuthStatus.unauthenticated);
    expect(local.session, isNull);
  });

  test('registration creates an account after OTP', () async {
    final repo = build();
    final challenge = (await repo.startRegistration(
      const RegistrationRequest(
        firstName: 'منى',
        lastName: 'حسن',
        phone: '01123456789',
        password: 'salon2026',
      ),
    )).valueOrNull!;
    expect(challenge.purpose, OtpPurpose.register);

    final session = await repo.verifyOtp(
      challenge: challenge,
      code: FakeAuthRemoteDataSource.demoOtp,
    );
    expect(session.valueOrNull?.user.fullName, 'منى حسن');
    // Same phone can't register twice.
    final again = await repo.startRegistration(
      const RegistrationRequest(
        firstName: 'x',
        lastName: 'y',
        phone: '01123456789',
        password: 'salon2026',
      ),
    );
    expect(again.isOk, isFalse);
  });
}
