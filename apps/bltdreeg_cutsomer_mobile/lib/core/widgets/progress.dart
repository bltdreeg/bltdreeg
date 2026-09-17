import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';

/// Row of rounded segments with animated colors. Base of the booking step
/// indicator and the queue-stage bar.
class SegmentedProgressBar extends StatelessWidget {
  const SegmentedProgressBar({
    required this.colors,
    this.height = 4,
    this.gap = 6,
    super.key,
  });

  /// One color per segment.
  final List<Color> colors;
  final double height;
  final double gap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < colors.length; i++) ...[
          if (i > 0) SizedBox(width: gap),
          Expanded(
            child: AnimatedContainer(
              duration: AppMotion.medium,
              curve: AppMotion.standard,
              height: height,
              decoration: BoxDecoration(
                color: colors[i],
                borderRadius: BorderRadius.circular(height / 2),
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// Booking flow indicator: segments + "الخطوة 1 من 3".
class StepProgress extends StatelessWidget {
  const StepProgress({required this.current, required this.total, super.key});

  /// 1-based.
  final int current;
  final int total;

  @override
  Widget build(BuildContext context) {
    final fmt = context.fmt;
    return Semantics(
      label: context.l10n.stepOf(fmt.number(current), fmt.number(total)),
      excludeSemantics: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SegmentedProgressBar(
            colors: [
              for (var i = 1; i <= total; i++)
                i <= current ? AppColors.primary : AppColors.divider,
            ],
          ),
          const SizedBox(height: 6),
          Text(
            context.l10n.stepOf(fmt.number(current), fmt.number(total)),
            style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
