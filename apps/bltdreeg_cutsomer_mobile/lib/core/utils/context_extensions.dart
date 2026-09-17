import 'package:flutter/material.dart';

import '../localization/generated/app_localizations.dart';

extension BuildContextX on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this);

  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  ColorScheme get colors => Theme.of(this).colorScheme;

  bool get isRtl => Directionality.of(this) == TextDirection.rtl;
  Size get screenSize => MediaQuery.sizeOf(this);
  EdgeInsets get viewPadding => MediaQuery.viewPaddingOf(this);

  bool get reduceMotion => MediaQuery.disableAnimationsOf(this);
}
