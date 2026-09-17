import 'dart:ui';

import 'package:flutter_bloc/flutter_bloc.dart';

import '../network/api_client.dart';
import '../storage/app_preferences.dart';

/// Current app locale. Switching emits immediately; `MaterialApp` rebuilds
/// with the new locale and flips `TextDirection` live, no restart.
class LocaleCubit extends Cubit<Locale> {
  LocaleCubit({required AppPreferences preferences, required this._apiClient})
    : _preferences = preferences,
      super(_initial(preferences)) {
    _apiClient.setLanguage(state.languageCode);
  }

  static const supported = [Locale('ar'), Locale('en')];
  static const fallback = Locale('ar');

  final AppPreferences _preferences;
  final ApiClient _apiClient;

  static Locale _initial(AppPreferences preferences) {
    final code = preferences.localeCode;
    return supported.firstWhere(
      (l) => l.languageCode == code,
      orElse: () => fallback,
    );
  }

  bool get isArabic => state.languageCode == 'ar';

  Future<void> setLocale(Locale locale) async {
    if (locale.languageCode == state.languageCode) return;
    _apiClient.setLanguage(locale.languageCode);
    emit(locale);
    await _preferences.setLocaleCode(locale.languageCode);
  }
}
