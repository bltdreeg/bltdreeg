import 'package:flutter/material.dart';

/// Phase-1 baseline theme. Replaced by the full token-driven theme
/// (AppColors / AppTypography / AppRadius / AppShadows) in phase 2.
abstract final class AppTheme {
  static const fontFamily = 'Cairo';

  static ThemeData light() => ThemeData(
    useMaterial3: true,
    fontFamily: fontFamily,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF0F766E),
      surface: Colors.white,
    ),
    scaffoldBackgroundColor: Colors.white,
  );
}
