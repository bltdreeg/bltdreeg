import 'package:flutter/cupertino.dart' show CupertinoPageTransitionsBuilder;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_colors.dart';
import 'app_dimens.dart';
import 'app_typography.dart';

/// Light theme built from the design tokens. Dark mode is a future
/// extension: every widget reads colors from [AppColors] semantic aliases,
/// so a dark palette can be introduced as a `ThemeExtension` later.
abstract final class AppTheme {
  static const fontFamily = AppTypography.fontFamily;

  static const systemOverlay = SystemUiOverlayStyle(
    statusBarColor: Color(0x00000000),
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: AppColors.bg,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  static ThemeData light() {
    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: AppColors.primary,
      onPrimary: AppColors.onPrimary,
      primaryContainer: AppColors.tealTint,
      onPrimaryContainer: AppColors.tealDark,
      secondary: AppColors.tealDark,
      onSecondary: AppColors.onPrimary,
      tertiary: AppColors.warning,
      onTertiary: AppColors.onWarn,
      error: AppColors.error,
      onError: AppColors.onPrimary,
      errorContainer: AppColors.errorTint,
      onErrorContainer: AppColors.errorText,
      surface: AppColors.surface,
      onSurface: AppColors.textPrimary,
      onSurfaceVariant: AppColors.textSecondary,
      surfaceContainerLowest: AppColors.bg,
      surfaceContainerLow: AppColors.surf,
      surfaceContainer: AppColors.surf,
      surfaceContainerHigh: AppColors.surf,
      surfaceContainerHighest: AppColors.dis,
      outline: AppColors.border,
      outlineVariant: AppColors.divider,
      scrim: AppColors.scrim,
    );

    final textTheme = AppTypography.textTheme();

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      fontFamily: fontFamily,
      textTheme: textTheme,
      scaffoldBackgroundColor: AppColors.background,
      canvasColor: AppColors.background,
      dividerColor: AppColors.divider,
      disabledColor: AppColors.onDisabled,
      // Buttons animate with press-scale instead of ink ripples.
      splashFactory: NoSplash.splashFactory,
      highlightColor: const Color(0x00000000),
      splashColor: const Color(0x00000000),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      visualDensity: VisualDensity.standard,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: FadeForwardsPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
        },
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        surfaceTintColor: const Color(0x00000000),
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: AppTypography.topBarTitle.copyWith(
          color: AppColors.textPrimary,
        ),
        systemOverlayStyle: systemOverlay,
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
        space: 1,
      ),
      iconTheme: const IconThemeData(
        color: AppColors.textPrimary,
        size: AppSizes.icon,
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColors.primary,
      ),
      textSelectionTheme: const TextSelectionThemeData(
        cursorColor: AppColors.primary,
        selectionColor: AppColors.tealTint2,
        selectionHandleColor: AppColors.primary,
      ),
      inputDecorationTheme: InputDecorationTheme(
        isDense: true,
        border: InputBorder.none,
        hintStyle: AppTypography.input.copyWith(
          color: AppColors.textDisabled,
          fontWeight: FontWeight.w500,
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Color(0x00000000),
        modalBarrierColor: AppColors.scrim,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.sheetTop),
        showDragHandle: false,
        elevation: 0,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: const Color(0x00000000),
        barrierColor: AppColors.scrim,
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.dialogAll),
        titleTextStyle: AppTypography.dialogTitle.copyWith(
          color: AppColors.textPrimary,
        ),
        contentTextStyle: AppTypography.bodyLong,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.textPrimary,
        contentTextStyle: AppTypography.label.copyWith(color: AppColors.bg),
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.mdAll),
        elevation: 0,
      ),
      datePickerTheme: const DatePickerThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Color(0x00000000),
        headerBackgroundColor: AppColors.primary,
        headerForegroundColor: AppColors.onPrimary,
      ),
    );
  }
}
