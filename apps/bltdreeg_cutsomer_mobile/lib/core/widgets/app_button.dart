import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

enum AppButtonVariant {
  /// Teal filled (`.btn.pri`).
  primary,

  /// White with a line border (`.btn.sec`).
  secondary,

  /// Teal tint (`.btn.ghost`).
  ghost,

  /// Red filled (`.btn.danger`).
  danger,

  /// Secondary with red text and pink border (cancel / leave queue / logout).
  dangerOutline,

  /// Green filled ("أنا في المحل").
  success,

  /// White fill with teal text, for use on teal-tint cards.
  onTint,
}

enum AppButtonSize {
  lg(AppSizes.buttonLg, AppRadius.field),
  md(AppSizes.buttonMd, AppRadius.field),
  sm(AppSizes.buttonSm, AppRadius.field),
  xs(AppSizes.buttonXs, 9);

  const AppButtonSize(this.height, this.radius);

  final double height;
  final double radius;
}

class AppButton extends StatelessWidget {
  const AppButton({
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.lg,
    this.icon,
    this.isLoading = false,
    this.expand = true,
    this.height,
    super.key,
  });

  final String label;

  /// Null renders the disabled style.
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;

  /// Leading icon asset (`AppAssets.icon*`).
  final String? icon;
  final bool isLoading;

  /// Fill the available width (default) or hug content.
  final bool expand;

  /// Overrides the size's height for one-off board measurements.
  final double? height;

  bool get _enabled => onPressed != null;

  ({Color bg, Color fg, Color? border}) _colors() {
    if (!_enabled) {
      return switch (variant) {
        AppButtonVariant.secondary ||
        AppButtonVariant.dangerOutline ||
        AppButtonVariant.onTint => (
          bg: AppColors.bg,
          fg: AppColors.textDisabled,
          border: AppColors.border,
        ),
        _ => (bg: AppColors.disabled, fg: AppColors.onDisabled, border: null),
      };
    }
    return switch (variant) {
      AppButtonVariant.primary => (
        bg: AppColors.primary,
        fg: AppColors.onPrimary,
        border: null,
      ),
      AppButtonVariant.secondary => (
        bg: AppColors.bg,
        fg: AppColors.textPrimary,
        border: AppColors.border,
      ),
      AppButtonVariant.ghost => (
        bg: AppColors.tealTint,
        fg: AppColors.tealDark,
        border: null,
      ),
      AppButtonVariant.danger => (
        bg: AppColors.error,
        fg: AppColors.onPrimary,
        border: null,
      ),
      AppButtonVariant.dangerOutline => (
        bg: AppColors.bg,
        fg: AppColors.error,
        border: AppColors.errBorder,
      ),
      AppButtonVariant.success => (
        bg: AppColors.success,
        fg: AppColors.onPrimary,
        border: null,
      ),
      AppButtonVariant.onTint => (
        bg: AppColors.bg,
        fg: AppColors.tealDark,
        border: null,
      ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final colors = _colors();
    final textStyle =
        (size == AppButtonSize.lg
                ? AppTypography.button
                : AppTypography.buttonSm)
            .copyWith(
              color: colors.fg,
              fontSize: switch (size) {
                AppButtonSize.lg => 16,
                AppButtonSize.md => 15,
                AppButtonSize.sm => 14,
                AppButtonSize.xs => 13.5,
              },
            );

    final content = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (icon != null) ...[
          AppIcon(icon!, size: AppSizes.iconSm, color: colors.fg),
          const SizedBox(width: AppSpacing.sm),
        ],
        Flexible(
          child: Text(
            label,
            style: textStyle,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );

    return AppPressable(
      onTap: isLoading ? null : onPressed,
      enabled: _enabled && !isLoading,
      semanticLabel: label,
      child: AnimatedContainer(
        duration: AppMotion.fast,
        height: height ?? size.height,
        width: expand ? double.infinity : null,
        padding: EdgeInsets.symmetric(
          horizontal: size == AppButtonSize.xs ? 14 : 18,
        ),
        decoration: BoxDecoration(
          color: colors.bg,
          borderRadius: BorderRadius.circular(size.radius),
          border: colors.border == null
              ? null
              : Border.all(color: colors.border!),
        ),
        alignment: Alignment.center,
        child: ExcludeSemantics(
          child: AnimatedSwitcher(
            duration: AppMotion.fast,
            child: isLoading
                ? SizedBox.square(
                    key: const ValueKey('loading'),
                    dimension: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: colors.fg,
                    ),
                  )
                : KeyedSubtree(key: const ValueKey('label'), child: content),
          ),
        ),
      ),
    );
  }
}

enum AppIconButtonStyle {
  /// White with line border (top-bar buttons).
  outline,

  /// Surface fill, no border (sheet close).
  filled,

  /// Teal border + tint (active filter button).
  active,
}

class AppIconButton extends StatelessWidget {
  const AppIconButton({
    required this.icon,
    required this.onPressed,
    required this.semanticLabel,
    this.size = AppSizes.topBarButton,
    this.iconSize = AppSizes.icon,
    this.style = AppIconButtonStyle.outline,
    this.iconColor,
    this.matchTextDirection = false,
    this.showDot = false,
    this.count,
    super.key,
  });

  final String icon;
  final VoidCallback? onPressed;
  final String semanticLabel;
  final double size;
  final double iconSize;
  final AppIconButtonStyle style;
  final Color? iconColor;
  final bool matchTextDirection;

  /// Unread dot (notification bell).
  final bool showDot;

  /// Numeric badge (active filters count).
  final int? count;

  @override
  Widget build(BuildContext context) {
    final radius = size >= 42 ? AppRadius.md : AppRadius.field;
    final (bg, border, fg) = switch (style) {
      AppIconButtonStyle.outline => (
        AppColors.bg,
        AppColors.border,
        AppColors.textPrimary,
      ),
      AppIconButtonStyle.filled => (
        AppColors.surf,
        null,
        AppColors.textPrimary,
      ),
      AppIconButtonStyle.active => (
        AppColors.tealTint,
        AppColors.primary,
        AppColors.tealDark,
      ),
    };

    return AppPressable(
      onTap: onPressed,
      semanticLabel: semanticLabel,
      child: SizedBox.square(
        dimension: size,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Positioned.fill(
              child: AnimatedContainer(
                duration: AppMotion.fast,
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(radius),
                  border: border == null ? null : Border.all(color: border),
                ),
                alignment: Alignment.center,
                child: AppIcon(
                  icon,
                  size: iconSize,
                  color: iconColor ?? fg,
                  matchTextDirection: matchTextDirection,
                ),
              ),
            ),
            if (showDot)
              PositionedDirectional(
                top: size * 0.21,
                end: size * 0.24,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: AppColors.error,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.bg, width: 1.5),
                  ),
                ),
              ),
            if (count != null && count! > 0)
              PositionedDirectional(
                top: -6,
                end: -6,
                child: CountBadge(count: count!),
              ),
          ],
        ),
      ),
    );
  }
}

class CountBadge extends StatelessWidget {
  const CountBadge({required this.count, super.key});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minWidth: 19),
      height: 19,
      padding: const EdgeInsets.symmetric(horizontal: 5),
      decoration: const BoxDecoration(
        color: AppColors.primary,
        borderRadius: AppRadius.pillAll,
      ),
      alignment: Alignment.center,
      child: Text(
        '$count',
        style: AppTypography.tag.copyWith(
          color: AppColors.onPrimary,
          fontSize: 11,
          fontWeight: FontWeight.w800,
          height: 1,
        ),
      ),
    );
  }
}

/// Teal bold text action ("نسيت كلمة السر؟", "شوف الكل", "غيّر").
class AppLinkButton extends StatelessWidget {
  const AppLinkButton({
    required this.label,
    required this.onPressed,
    this.color = AppColors.primary,
    this.fontSize = 13.5,
    this.underline = false,
    this.fontWeight = FontWeight.w700,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final Color color;
  final double fontSize;
  final bool underline;
  final FontWeight fontWeight;

  @override
  Widget build(BuildContext context) {
    return AppPressable(
      onTap: onPressed,
      semanticLabel: label,
      behavior: HitTestBehavior.translucent,
      child: Padding(
        // Enlarges the hit area without changing layout much.
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Text(
          label,
          style: AppTypography.link.copyWith(
            color: onPressed == null ? AppColors.textDisabled : color,
            fontSize: fontSize,
            fontWeight: fontWeight,
            decoration: underline ? TextDecoration.underline : null,
            decorationColor: color,
          ),
        ),
      ),
    );
  }
}

/// Convenience: the chevron that marks tappable rows, mirrored for RTL.
class ForwardChevron extends StatelessWidget {
  const ForwardChevron({super.key});

  @override
  Widget build(BuildContext context) => const AppIcon(
    AppAssets.iconChevronRight,
    size: AppSizes.iconSm,
    color: AppColors.textDisabled,
    matchTextDirection: true,
  );
}
