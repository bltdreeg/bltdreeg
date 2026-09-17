import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/storage/app_preferences.dart';

/// Switches on frame 37. Queue updates aren't here: they're always on, by
/// product decision — without them a customer loses their turn.
enum NotificationSetting {
  favoriteOffers('notif_offers'),
  favoriteFree('notif_favorite_free'),
  rateReminder('notif_rate_reminder'),
  newSalons('notif_new_salons', defaultOn: false),
  push('notif_push'),
  sms('notif_sms');

  const NotificationSetting(this.key, {this.defaultOn = true});

  final String key;
  final bool defaultOn;
}

class NotificationSettingsCubit extends Cubit<Map<NotificationSetting, bool>> {
  NotificationSettingsCubit(this._prefs)
    : super({
        for (final s in NotificationSetting.values)
          s: _prefs.notificationEnabled(s.key, defaultValue: s.defaultOn),
      });

  final AppPreferences _prefs;

  Future<void> toggle(
    NotificationSetting setting, {
    required bool value,
  }) async {
    emit({...state, setting: value});
    await _prefs.setNotificationEnabled(setting.key, value: value);
  }
}
