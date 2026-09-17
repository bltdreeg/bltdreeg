import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_tone.dart';
import '../theme/app_typography.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

/// Bordered surface with the card radius. Tappable cards get press-scale
/// with a gentler factor than buttons.
class AppCard extends StatelessWidget {
  const AppCard({
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
    this.color = AppColors.bg,
    this.borderColor = AppColors.border,
    this.borderWidth = 1,
    this.radius = AppRadius.card,
    this.semanticLabel,
    super.key,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color color;
  final Color? borderColor;
  final double borderWidth;
  final double radius;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final card = AnimatedContainer(
      duration: AppMotion.fast,
      padding: padding,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(radius),
        border: borderColor == null
            ? null
            : Border.all(color: borderColor!, width: borderWidth),
      ),
      child: child,
    );
    if (onTap == null) return card;
    return AppPressable(
      onTap: onTap,
      pressedScale: 0.985,
      semanticLabel: semanticLabel,
      child: card,
    );
  }
}

/// Inline info box with an icon (surface / teal / warn / error variants
/// seen across the board, e.g. "هنبعتلك كود تأكيد…").
class AppNotice extends StatelessWidget {
  const AppNotice({
    required this.message,
    this.tone = AppTone.neutral,
    this.icon = AppAssets.iconAlertCircle,
    this.title,
    this.action,
    this.bordered,
    this.emphasized = false,
    this.iconSize = AppSizes.iconSm,
    super.key,
  });

  final String message;
  final AppTone tone;
  final String icon;
  final String? title;

  /// Link-style action under the message.
  final Widget? action;

  /// Defaults to a border only for the neutral tone, as on the board.
  final bool? bordered;

  /// Bolder message text (warnings, teal tips).
  final bool emphasized;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    final fg = tone == AppTone.neutral
        ? AppColors.textSecondary
        : tone.foreground;
    final hasBorder = bordered ?? tone == AppTone.neutral;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: tone.background,
        borderRadius: AppRadius.mdAll,
        border: hasBorder ? Border.all(color: AppColors.border) : null,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 3),
            child: AppIcon(icon, size: iconSize, color: fg),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: AppTypography.bodyStrong.copyWith(
                      color: fg,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                Text(
                  message,
                  style: AppTypography.note.copyWith(
                    color: fg,
                    fontWeight: emphasized ? FontWeight.w600 : FontWeight.w500,
                  ),
                ),
                if (action != null) ...[const SizedBox(height: 6), action!],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// 8px grey band separating page sections (`.divider`).
class SectionDivider extends StatelessWidget {
  const SectionDivider({this.margin = 18, super.key});

  final double margin;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 8,
      margin: EdgeInsets.symmetric(vertical: margin),
      decoration: const BoxDecoration(
        color: AppColors.surf,
        border: Border.symmetric(
          horizontal: BorderSide(color: AppColors.divider),
        ),
      ),
    );
  }
}

/// `.sec-h`: section title with an optional "See all" action.
class SectionHeader extends StatelessWidget {
  const SectionHeader({
    required this.title,
    this.actionLabel,
    this.onAction,
    this.trailing,
    this.padding = const EdgeInsets.only(top: 22, bottom: 12),
    super.key,
  });

  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;
  final Widget? trailing;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        children: [
          Expanded(
            child: Semantics(
              header: true,
              child: Text(title, style: AppTypography.sectionTitle),
            ),
          ),
          ?trailing,
          if (actionLabel != null)
            AppPressable(
              onTap: onAction,
              semanticLabel: actionLabel,
              child: Text(
                actionLabel!,
                style: AppTypography.link.copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Root tab title ("حجوزاتي", "حسابي").
class PageTitle extends StatelessWidget {
  const PageTitle(this.title, {super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 4),
      child: Semantics(
        header: true,
        child: Text(title, style: AppTypography.pageTitle),
      ),
    );
  }
}
