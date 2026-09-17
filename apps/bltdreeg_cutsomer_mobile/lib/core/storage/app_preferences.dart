import 'package:shared_preferences/shared_preferences.dart';

/// Typed access to simple persisted flags. Anything relational or cached
/// server data belongs in the drift `AppDatabase` instead.
final class AppPreferences {
  AppPreferences._(this._prefs);

  static const _kLocale = 'locale_code';
  static const _kOnboardingSeen = 'onboarding_seen';
  static const _kGuestMode = 'guest_mode';

  static Future<AppPreferences> create() async {
    final prefs = await SharedPreferencesWithCache.create(
      cacheOptions: const SharedPreferencesWithCacheOptions(
        allowList: {_kLocale, _kOnboardingSeen, _kGuestMode},
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
}
