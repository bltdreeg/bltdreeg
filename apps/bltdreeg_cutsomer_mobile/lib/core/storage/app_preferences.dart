import 'package:shared_preferences/shared_preferences.dart';

/// Typed access to simple persisted flags. Anything relational or cached
/// server data belongs in the drift `AppDatabase` instead.
final class AppPreferences {
  AppPreferences._(this._prefs);

  static const _kLocale = 'locale_code';
  static const _kOnboardingSeen = 'onboarding_seen';
  static const _kGuestMode = 'guest_mode';
  static const _kSelectedArea = 'selected_area_id';

  /// Notification switches (frame 37). Queue updates have no key: they are
  /// always on by product decision.
  static const notificationKeys = {
    'notif_offers',
    'notif_favorite_free',
    'notif_rate_reminder',
    'notif_new_salons',
    'notif_push',
    'notif_sms',
  };

  static Future<AppPreferences> create() async {
    final prefs = await SharedPreferencesWithCache.create(
      cacheOptions: const SharedPreferencesWithCacheOptions(
        allowList: {
          _kLocale,
          _kOnboardingSeen,
          _kGuestMode,
          _kSelectedArea,
          ...notificationKeys,
        },
      ),
    );
    return AppPreferences._(prefs);
  }

  final SharedPreferencesWithCache _prefs;

  String? get localeCode => _prefs.getString(_kLocale);
  Future<void> setLocaleCode(String code) => _prefs.setString(_kLocale, code);

  bool get onboardingSeen => _prefs.getBool(_kOnboardingSeen) ?? false;
  Future<void> setOnboardingSeen() => _prefs.setBool(_kOnboardingSeen, true);

  /// User chose "browse without an account" (frame 43).
  bool get guestMode => _prefs.getBool(_kGuestMode) ?? false;
  Future<void> setGuestMode({required bool value}) =>
      _prefs.setBool(_kGuestMode, value);

  /// Notification switch, on unless the customer turned it off.
  bool notificationEnabled(String key, {bool defaultValue = true}) =>
      _prefs.getBool(key) ?? defaultValue;

  Future<void> setNotificationEnabled(String key, {required bool value}) =>
      _prefs.setBool(key, value);

  /// Area the discovery feed is showing (frame 40).
  String? get selectedAreaId => _prefs.getString(_kSelectedArea);
  Future<void> setSelectedAreaId(String id) =>
      _prefs.setString(_kSelectedArea, id);
}
