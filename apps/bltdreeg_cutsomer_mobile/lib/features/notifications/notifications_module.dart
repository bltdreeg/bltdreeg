import 'package:get_it/get_it.dart';

import '../../core/config/app_environment.dart';
import 'data/notifications_data.dart';
import 'domain/app_notification.dart';
import 'presentation/notifications_cubit.dart';

/// Notifications list (frames 32-33) and the home bell badge.
void registerNotificationsModule(GetIt sl, AppEnvironment env) {
  sl
    ..registerLazySingleton<NotificationsRemoteDataSource>(
      () => env.usesFakeBackend
          ? FakeNotificationsRemoteDataSource(sl())
          : ApiNotificationsRemoteDataSource(sl()),
    )
    ..registerLazySingleton<NotificationsRepository>(
      () => NotificationsRepositoryImpl(
        remote: sl(),
        database: sl(),
        outbox: sl(),
      ),
    )
    ..registerFactory(() => NotificationsCubit(sl()))
    ..registerLazySingleton(() => UnreadNotificationsCubit(sl()));
}
