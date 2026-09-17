import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

enum AppChipStyle {
  /// White with line border; teal filled when selected (`.chip`, `.chip.on`).
  standard,

  /// Teal tint, used for applied filters (`.chip.lead`).
  applied,

  /// Borderless secondary text ("امسح الكل").
  plain,
}

class AppChip extends StatelessWidget {
  const AppChip({
    required this.label,
    this.onTap,
    this.selected = false,
    this.style = AppChipStyle.standard,
    this.icon,
    this.showCheckWhenSelected = false,
    this.onRemove,
    this.height = 36,
    this.fontSize = 13.5,
    super.key,
  });

  final String label;
  final VoidCallback? onTap;
  final bool selected;
  final AppChipStyle style;

  /// Leading icon asset.
  final String? icon;

  /// Multi-select chips show a check when on (filter "service" group).
  final bool showCheckWhenSelected;

  /// Shows a trailing ✕; tapping the chip removes it.
  final VoidCallback? onRemove;
  final double height;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final (bg, border, fg) = switch ((style, selected)) {
      (AppChipStyle.standard, true) => (
        AppColors.primary,
        AppColors.primary,
        AppColors.onPrimary,
      ),
      (AppChipStyle.standard, false) => (
        AppColors.bg,
        AppColors.border,
        AppColors.textPrimary,
      ),
      (AppChipStyle.applied, _) => (
        AppColors.tealTint,
        AppColors.tealTint2,
        AppColors.tealDark,
      ),
      (AppChipStyle.plain, _) => (
        const Color(0x00FFFFFF),
        const Color(0x00FFFFFF),
        AppColors.textSecondary,
      ),
    };

    final leading = showCheckWhenSelected && selected
        ? AppAssets.iconCheckBold
        : icon;

    return AppPressable(
      onTap: onRemove ?? onTap,
      semanticLabel: onRemove != null ? context.l10n.a11yRemove(label) : label,
      child: Semantics(
        selected: selected,
        child: AnimatedContainer(
          duration: AppMotion.fast,
          curve: AppMotion.standard,
          height: height,
          padding: EdgeInsetsDirectional.only(
            start: 14,
            end: onRemove != null ? 10 : 14,
          ),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: AppRadius.pillAll,
            border: Border.all(color: border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (leading != null) ...[
                AppIcon(leading, size: AppSizes.iconSm, color: fg),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                maxLines: 1,
                style: AppTypography.label.copyWith(
                  color: fg,
                  fontSize: fontSize,
                ),
              ),
              if (onRemove != null) ...[
                const SizedBox(width: 6),
                AppIcon(AppAssets.iconClose, size: AppSizes.iconSm, color: fg),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Two-line day chip ("النهارده / 15") for quick date rows.
class AppDateChip extends StatelessWidget {
  const AppDateChip({
    required this.topLabel,
    required this.bottomLabel,
    required this.selected,
    required this.onTap,
    this.enabled = true,
    super.key,
  });

  final String topLabel;
  final String bottomLabel;
  final bool selected;
  final VoidCallback? onTap;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final fg = !enabled
        ? AppColors.textDisabled
        : selected
        ? AppColors.onPrimary
        : AppColors.textPrimary;
    return AppPressable(
      onTap: enabled ? onTap : null,
      enabled: enabled,
      semanticLabel: '$topLabel $bottomLabel',
      child: Semantics(
        selected: selected,
        child: AnimatedContainer(
          duration: AppMotion.fast,
          height: 56,
          constraints: const BoxConstraints(minWidth: 64),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : AppColors.bg,
            borderRadius: AppRadius.pillAll,
            border: Border.all(
              color: selected ? AppColors.primary : AppColors.border,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                topLabel,
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w600,
                  color: selected
                      ? AppColors.onPrimary
                      : AppColors.textSecondary,
                  height: 1.2,
                ),
              ),
              Text(
                bottomLabel,
                style: AppTypography.label.copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: fg,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Horizontally scrolling chip row with page gutters (`.chips`).
class ChipRail extends StatelessWidget {
  const ChipRail({required this.children, this.spacing = 8, super.key});

  final List<Widget> children;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.gutter,
        vertical: 2,
      ),
      child: Row(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) SizedBox(width: spacing),
            children[i],
          ],
        ],
      ),
    );
  }
}
