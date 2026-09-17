import 'package:bltdreeg_cutsomer_mobile/core/localization/generated/app_localizations.dart';
import 'package:bltdreeg_cutsomer_mobile/core/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

extension PumpApp on WidgetTester {
  /// Pumps [child] inside a themed, localized `MaterialApp` (Arabic by
  /// default) without DI or routing, for isolated component tests.
  Future<void> pumpComponent(
    Widget child, {
    Locale locale = const Locale('ar'),
  }) async {
    await pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        locale: locale,
        supportedLocales: AppLocalizations.supportedLocales,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        home: Scaffold(body: Center(child: child)),
      ),
    );
    await pump();
  }
}
