import 'package:flutter/material.dart';

import '../theme/app_typography.dart';
import 'animations/fade_slide_in.dart';
import 'app_button.dart';

/// Shared empty state (`.empty`): illustration, title, message, actions.
/// Used by bookings, search, notifications, favorites, offline and success
/// screens. Content enters with a short staggered rise so empty screens
/// don't feel frozen.
class EmptyStateView extends StatelessWidget {
  const EmptyStateView({
    required this.illustration,
    required this.title,
    this.message,
    this.primaryLabel,
    this.onPrimary,
    this.primaryIcon,
    this.secondaryLabel,
    this.onSecondary,
    this.expandActions = false,
    this.titleStyle,
    this.padding = const EdgeInsets.fromLTRB(34, 36, 34, 36),
    this.animate = true,
    super.key,
  });

  final Widget illustration;
  final String title;
  final String? message;
  final String? primaryLabel;
  final VoidCallback? onPrimary;
  final String? primaryIcon;
  final String? secondaryLabel;
  final VoidCallback? onSecondary;

  /// Full-width buttons (offline, search) vs hugging CTA (bookings).
  final bool expandActions;
  final TextStyle? titleStyle;
  final EdgeInsetsGeometry padding;
  final bool animate;

  @override
  Widget build(BuildContext context) {
    Widget step(int i, Widget child) => animate
        ? FadeSlideIn(
            delay: Duration(milliseconds: 70 * i),
            child: child,
          )
        : child;

    return Padding(
      padding: padding,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (animate)
            FadeSlideIn(scaleFrom: 0.9, offset: 6, child: illustration)
          else
            illustration,
          const SizedBox(height: 20),
          step(
            1,
            Semantics(
              header: true,
              child: Text(
                title,
                textAlign: TextAlign.center,
                style: titleStyle ?? AppTypography.emptyTitle,
              ),
            ),
          ),
          if (message != null) ...[
            const SizedBox(height: 8),
            step(
              2,
              Text(
                message!,
                textAlign: TextAlign.center,
                style: AppTypography.bodyLong,
              ),
            ),
          ],
          if (primaryLabel != null) ...[
            const SizedBox(height: 22),
            step(
              3,
              AppButton(
                label: primaryLabel!,
                onPressed: onPrimary,
                icon: primaryIcon,
                expand: expandActions,
                size: AppButtonSize.md,
              ),
            ),
          ],
          if (secondaryLabel != null) ...[
            const SizedBox(height: 10),
            step(
              4,
              AppButton(
                label: secondaryLabel!,
                onPressed: onSecondary,
                variant: AppButtonVariant.secondary,
                expand: expandActions,
                size: AppButtonSize.md,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
