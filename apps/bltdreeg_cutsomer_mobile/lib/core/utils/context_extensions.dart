import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../localization/generated/app_localizations.dart';
import '../network/connectivity_cubit.dart';
import 'formatters.dart';

extension BuildContextX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);

  /// Formatters for the active locale (always Western digits).
  AppFormatters get fmt =>
      AppFormatters(Localizations.localeOf(this).languageCode);

  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  ColorScheme get colors => Theme.of(this).colorScheme;

  bool get isRtl => Directionality.of(this) == TextDirection.rtl;
  Size get screenSize => MediaQuery.sizeOf(this);
  EdgeInsets get viewPadding => MediaQuery.viewPaddingOf(this);

  /// Honors the OS "reduce motion" setting.
  bool get reduceMotion => MediaQuery.disableAnimationsOf(this);

  /// Rebuilds the caller when connectivity changes.
  bool get watchIsOnline =>
      select<ConnectivityCubit, bool>((cubit) => cubit.state.isOnline);

  void showToast(String message) {
    ScaffoldMessenger.of(this)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }
}

extension StringX on String {
  /// Initials for avatar fallbacks, board style: `كريم عبد الرحمن` → `ك ع`.
  String get initials {
    final words = trim()
        .split(RegExp(r'\s+'))
        .where((w) => w.isNotEmpty)
        .toList();
    if (words.isEmpty) return '';
    final first = words.first.characters.first;
    if (words.length == 1) return first;
    // Board style: first letter of the first two words, space separated.
    return '$first ${words[1].characters.first}';
  }

  /// Wraps LTR content (phone numbers, `+20`, codes) in a directional
  /// isolate so it renders correctly inside RTL sentences.
  String get ltrIsolate => '\u2066$this\u2069';
}

abstract final class AppHaptics {
  static Future<void> tap() => HapticFeedback.selectionClick();
  static Future<void> success() => HapticFeedback.mediumImpact();
  static Future<void> alert() => HapticFeedback.heavyImpact();
}
