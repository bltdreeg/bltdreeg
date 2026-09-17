import 'package:get_it/get_it.dart';

import '../auth/domain/entities/user.dart';
import 'presentation/account_cubit.dart';
import 'presentation/edit_profile_cubit.dart';
import 'presentation/notification_settings_cubit.dart';

/// Account area: profile, notification switches, language, help.
void registerAccountModule(GetIt sl) {
  sl
    ..registerFactory(() => AccountCubit(bookings: sl(), watchFavorites: sl()))
    ..registerFactoryParam<EditProfileCubit, User, void>(
      (user, _) => EditProfileCubit(user: user, repository: sl()),
    )
    ..registerFactory(() => NotificationSettingsCubit(sl()));
}
