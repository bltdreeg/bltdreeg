import 'dart:async';

import 'package:get_it/get_it.dart';

import '../../features/account/account_module.dart';
import '../../features/auth/auth_module.dart';
import '../../features/auth/data/datasources/auth_local_data_source.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/booking/booking_module.dart';
import '../../features/favorites/domain/favorites_repository.dart';
import '../../features/notifications/notifications_module.dart';
import '../../features/onboarding/onboarding_module.dart';
import '../../features/queue/queue_module.dart';
import '../../features/rating/rating_module.dart';
import '../../features/salon_details/salon_details_module.dart';
import '../../features/salons/salons_module.dart';
import '../config/app_environment.dart';
import '../database/app_database.dart';
import '../localization/locale_cubit.dart';
import '../network/api_client.dart';
import '../network/connectivity_cubit.dart';
import '../network/connectivity_service.dart';
import '../network/fake_server.dart';
import '../router/app_router.dart';
import '../storage/app_preferences.dart';

/// Service locator.
///
/// Plain `get_it` with hand-written registration functions (one per feature)
/// rather than `injectable`: the graph is small enough to read top to bottom,
/// the fake/real backend switch stays an explicit `if`, and build_runner is
/// kept for drift only.
final sl = GetIt.instance;

Future<void> configureDependencies({
  AppEnvironment? environment,
  AppPreferences? preferences,
  AppDatabase? database,
  ConnectivityService? connectivity,
  AuthLocalDataSource? authLocal,
}) async {
  final env = environment ?? AppEnvironment.fromDefines();
  sl
    ..registerSingleton<AppEnvironment>(env)
    ..registerSingleton<AppPreferences>(
      preferences ?? await AppPreferences.create(),
    )
    ..registerLazySingleton<AppDatabase>(
      () => database ?? AppDatabase(),
      dispose: (db) => db.close(),
    )
    ..registerLazySingleton<ConnectivityService>(
      () => connectivity ?? AppConnectivityService(),
      dispose: (s) => s.dispose(),
    )
    ..registerLazySingleton<ApiClient>(
      () => ApiClient(environment: env, connectivity: sl()),
    )
    ..registerLazySingleton<FakeServer>(
      () => FakeServer(environment: env, connectivity: sl()),
    )
    // App-wide cubits live for the whole session.
    ..registerLazySingleton<LocaleCubit>(
      () => LocaleCubit(preferences: sl(), apiClient: sl()),
      dispose: (c) => c.close(),
    )
    ..registerLazySingleton<ConnectivityCubit>(
      () => ConnectivityCubit(sl()),
      dispose: (c) => c.close(),
    )
    ..registerLazySingleton<AppRouter>(
      () => AppRouter(preferences: sl(), session: sl(), authRepository: sl()),
    );

  registerOnboardingModule(sl);
  registerAuthModule(sl, env);
  registerSalonsModule(sl, env);
  registerSalonDetailsModule(sl, env);
  registerBookingModule(sl, env);
  registerQueueModule(sl);
  registerRatingModule(sl, env);
  registerNotificationsModule(sl, env);
  registerAccountModule(sl);
  if (authLocal != null) {
    sl
      ..unregister<AuthLocalDataSource>()
      ..registerSingleton<AuthLocalDataSource>(authLocal);
  }

  // Restore the stored session before the first frame so the router guard
  // and the account tab start in the right state.
  await sl<AuthRepository>().restoreSession();
  // Pull server favorites for a signed-in user (keeps local copy offline).
  if (sl<AuthRepository>().currentSession.isAuthenticated) {
    unawaited(sl<FavoritesRepository>().sync());
  }
}
