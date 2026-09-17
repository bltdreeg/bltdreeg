import 'package:flutter/painting.dart';

import 'app_colors.dart';

/// Semantic color families used by notices, badges, dialogs and pills.
enum AppTone {
  neutral(
    background: AppColors.surf,
    foreground: AppColors.textSecondary,
    border: AppColors.border,
    solid: AppColors.textSecondary,
  ),
  primary(
    background: AppColors.tealTint,
    foreground: AppColors.tealDark,
    border: AppColors.tealTint2,
    solid: AppColors.primary,
  ),
  success(
    background: AppColors.okTint,
    foreground: AppColors.okDark,
    border: AppColors.okBorder,
    solid: AppColors.ok,
  ),
  warning(
    background: AppColors.warnTint,
    foreground: AppColors.warnText,
    border: AppColors.warnBorder,
    solid: AppColors.warn,
  ),
  danger(
    background: AppColors.errTint,
    foreground: AppColors.errText,
    border: AppColors.errBorder,
    solid: AppColors.err,
  );

  const AppTone({
    required this.background,
    required this.foreground,
    required this.border,
    required this.solid,
  });

  /// Tinted fill.
  final Color background;

  /// Text and icons on [background].
  final Color foreground;

  final Color border;

  /// Saturated accent (dots, solid fills, icons on white).
  final Color solid;
}
