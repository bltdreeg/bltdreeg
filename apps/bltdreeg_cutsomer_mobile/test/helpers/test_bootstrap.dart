import 'package:bltdreeg_cutsomer_mobile/core/config/app_environment.dart';
import 'package:bltdreeg_cutsomer_mobile/core/di/injection.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/storage/app_preferences.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/auth_local_data_source.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

const testEnvironment = AppEnvironment(
  backendMode: BackendMode.fake,
  apiBaseUrl: 'https://test.invalid',
  queueSocketUrl: 'wss://test.invalid',
  simulatedLatency: Duration.zero,
);

/// Resets the service locator with in-memory preferences and a fake
/// connectivity service. Returns the preferences for per-test setup.
Future<AppPreferences> bootstrapForTest({
  bool onboardingSeen = true,
  String? localeCode,
  bool online = true,
  InMemoryAuthLocalDataSource? authLocal,
}) async {
  await sl.reset(dispose: false);
  SharedPreferencesAsyncPlatform.instance =
      InMemorySharedPreferencesAsync.empty();
  final prefs = await AppPreferences.create();
  if (onboardingSeen) await prefs.setOnboardingSeen();
  if (localeCode != null) await prefs.setLocaleCode(localeCode);
  await configureDependencies(
    environment: testEnvironment,
    preferences: prefs,
    connectivity: FakeConnectivityService(online: online),
    authLocal: authLocal ?? InMemoryAuthLocalDataSource(),
  );
  return prefs;
}
