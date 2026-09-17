import 'package:bltdreeg_cutsomer_mobile/core/network/api_client.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/storage/app_preferences.dart';
import 'package:bltdreeg_cutsomer_mobile/features/account/presentation/edit_profile_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/features/account/presentation/notification_settings_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/auth_local_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/fake_auth_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/entities/auth_session.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/domain/entities/user.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late FakeConnectivityService connectivity;
  late FakeAuthRemoteDataSource remote;
  late InMemoryAuthLocalDataSource local;
  late AuthRepositoryImpl auth;
  late AppPreferences prefs;

  setUp(() async {
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    prefs = await AppPreferences.create();
    connectivity = FakeConnectivityService();
    remote = FakeAuthRemoteDataSource(
      server: FakeServer(
        environment: testEnvironment,
        connectivity: connectivity,
      ),
    );
    local = InMemoryAuthLocalDataSource();
    auth = AuthRepositoryImpl(
      remote: remote,
      local: local,
      apiClient: ApiClient(
        environment: testEnvironment,
        connectivity: connectivity,
      ),
    );
  });

  Future<User> signIn() async {
    final result = await auth.signInWithEmail(
      email: FakeAuthRemoteDataSource.demoEmail,
      password: FakeAuthRemoteDataSource.demoPassword,
    );
    return result.valueOrNull!.user;
  }

  group('edit profile (frame 36)', () {
    test('saves the editable fields and updates the session', () async {
      final user = await signIn();
      final cubit = EditProfileCubit(user: user, repository: auth);
      addTearDown(cubit.close);

      expect(cubit.state.firstName, 'كريم');
      cubit
        ..setFirstName('كريم')
        ..setLastName('عبد الرحمن الشريف')
        ..setEmail('  karim@example.com  ')
        ..setBirthDate(DateTime(1996, 3, 14))
        ..setAreaName('دجلة، القاهرة');
      await cubit.save();

      expect(cubit.state.status, EditProfileStatus.saved);
      final updated = auth.currentSession.user!;
      expect(updated.lastName, 'عبد الرحمن الشريف');
      expect(updated.email, 'karim@example.com');
      expect(updated.areaName, 'دجلة، القاهرة');
      // The phone is the identity and this form never touches it.
      expect(updated.phone, user.phone);
    });

    test('an empty first name blocks saving', () async {
      final user = await signIn();
      final cubit = EditProfileCubit(user: user, repository: auth)
        ..setFirstName('   ');
      addTearDown(cubit.close);
      expect(cubit.state.canSave, isFalse);
      await cubit.save();
      expect(cubit.state.status, EditProfileStatus.editing);
    });

    test('clearing the optional email stores nothing', () async {
      final user = await signIn();
      final cubit = EditProfileCubit(user: user, repository: auth)
        ..setEmail('');
      addTearDown(cubit.close);
      await cubit.save();
      expect(auth.currentSession.user!.email, isNull);
    });

    test('deleting the account signs out on the device', () async {
      final user = await signIn();
      final cubit = EditProfileCubit(user: user, repository: auth);
      addTearDown(cubit.close);

      await cubit.deleteAccount();
      expect(cubit.state.status, EditProfileStatus.deleted);
      expect(auth.currentSession.status, AuthStatus.unauthenticated);
      expect(await local.readSession(), isNull);
    });
  });

  group('notification settings (frame 37)', () {
    test('defaults match the board, new-salon offers start off', () {
      final cubit = NotificationSettingsCubit(prefs);
      addTearDown(cubit.close);
      expect(cubit.state[NotificationSetting.favoriteOffers], isTrue);
      expect(cubit.state[NotificationSetting.rateReminder], isTrue);
      expect(cubit.state[NotificationSetting.newSalons], isFalse);
      expect(cubit.state[NotificationSetting.sms], isTrue);
    });

    test('a switch persists across screens', () async {
      final cubit = NotificationSettingsCubit(prefs);
      addTearDown(cubit.close);
      await cubit.toggle(NotificationSetting.favoriteOffers, value: false);
      expect(cubit.state[NotificationSetting.favoriteOffers], isFalse);

      final reopened = NotificationSettingsCubit(prefs);
      addTearDown(reopened.close);
      expect(reopened.state[NotificationSetting.favoriteOffers], isFalse);
    });

    test('queue updates have no switch to turn off', () {
      expect(
        NotificationSetting.values.map((s) => s.key),
        isNot(contains('notif_queue')),
      );
      expect(
        AppPreferences.notificationKeys,
        NotificationSetting.values.map((s) => s.key).toSet(),
      );
    });
  });
}
