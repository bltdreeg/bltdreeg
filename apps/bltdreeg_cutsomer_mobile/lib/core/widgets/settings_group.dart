import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'app_button.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

/// `.g-label` above a group.
class GroupLabel extends StatelessWidget {
  const GroupLabel(this.text, {this.padding, super.key});

  final String text;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? const EdgeInsetsDirectional.fromSTEB(4, 0, 4, 8),
      child: Semantics(
        header: true,
        child: Text(text, style: AppTypography.groupLabel),
      ),
    );
  }
}

/// Bordered group of rows with hairline separators (`.group`).
class SettingsGroup extends StatelessWidget {
  const SettingsGroup({
    required this.children,
    this.margin = const EdgeInsets.only(bottom: 14),
    super.key,
  });

  final List<Widget> children;
  final EdgeInsetsGeometry margin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.bg,
        borderRadius: AppRadius.cardAll,
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          for (var i = 0; i < children.length; i++) ...[
            if (i > 0) const Divider(),
            children[i],
          ],
        ],
      ),
    );
  }
}

/// `.row-item`: icon, title (+subtitle), value, trailing / chevron.
class SettingsRow extends StatelessWidget {
  const SettingsRow({
    required this.title,
    this.icon,
    this.iconColor = AppColors.textSecondary,
    this.subtitle,
    this.value,
    this.trailing,
    this.onTap,
    this.showChevron,
    this.dimmed = false,
    this.titleStyle,
    super.key,
  });

  final String title;
  final String? icon;
  final Color iconColor;
  final String? subtitle;
  final String? value;
  final Widget? trailing;
  final VoidCallback? onTap;

  /// Defaults to true when [onTap] is set and there's no [trailing].
  final bool? showChevron;

  /// Locked/unavailable rows (guest state).
  final bool dimmed;
  final TextStyle? titleStyle;

  @override
  Widget build(BuildContext context) {
    final chevron = showChevron ?? (onTap != null && trailing == null);
    final row = Opacity(
      opacity: dimmed ? 0.6 : 1,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          children: [
            if (icon != null) ...[
              AppIcon(icon!, color: iconColor),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: titleStyle ?? AppTypography.body),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(subtitle!, style: AppTypography.caption),
                  ],
                ],
              ),
            ),
            if (value != null) ...[
              const SizedBox(width: 8),
              Text(
                value!,
                style: AppTypography.meta.copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            if (trailing != null) ...[const SizedBox(width: 10), trailing!],
            if (chevron) ...[const SizedBox(width: 10), const ForwardChevron()],
          ],
        ),
      ),
    );
    if (onTap == null) return row;
    return AppPressable(
      onTap: onTap,
      pressedScale: 0.98,
      semanticLabel: title,
      child: row,
    );
  }
}

/// Divider used by board rows that aren't inside a [SettingsGroup].
class RowDivider extends StatelessWidget {
  const RowDivider({super.key});

  @override
  Widget build(BuildContext context) =>
      const Divider(height: 1, color: AppColors.divider);
}

/// Standard vertical gap helper for page sections.
class Gap extends StatelessWidget {
  const Gap(this.size, {super.key});

  final double size;

  @override
  Widget build(BuildContext context) => SizedBox(width: size, height: size);
}

/// Content padding with the page gutter.
class PagePadding extends StatelessWidget {
  const PagePadding({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) =>
      Padding(padding: AppSpacing.pageH, child: child);
}
