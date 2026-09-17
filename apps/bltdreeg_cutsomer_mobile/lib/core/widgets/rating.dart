import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

/// `★ 4.8 (214)` label used in lists.
class RatingLabel extends StatelessWidget {
  const RatingLabel({
    required this.rating,
    this.reviewsCount,
    this.suffix,
    this.muted = false,
    super.key,
  });

  final double rating;
  final int? reviewsCount;

  /// Replaces the plain count, e.g. "(214 تقييم)".
  final String? suffix;

  /// Grey star for unavailable barbers.
  final bool muted;

  @override
  Widget build(BuildContext context) {
    final fmt = context.fmt;
    final trailing =
        suffix ??
        (reviewsCount == null
            ? null
            : context.l10n.reviewsCount(fmt.number(reviewsCount!)));
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        AppIcon(
          AppAssets.iconStarFilled,
          size: 14,
          color: muted ? AppColors.textDisabled : AppColors.rating,
        ),
        const SizedBox(width: 3),
        Text(
          fmt.rating(rating),
          style: AppTypography.metaStrong.copyWith(fontSize: 13),
        ),
        if (trailing != null) ...[
          const SizedBox(width: 3),
          Text(trailing, style: AppTypography.caption),
        ],
      ],
    );
  }
}

/// Read-only row of 5 stars.
class StarRatingDisplay extends StatelessWidget {
  const StarRatingDisplay({
    required this.rating,
    this.size = 13,
    this.spacing = 1,
    super.key,
  });

  final int rating;
  final double size;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: context.l10n.a11yStarRating(context.fmt.number(rating)),
      excludeSemantics: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 1; i <= 5; i++) ...[
            if (i > 1) SizedBox(width: spacing),
            AppIcon(
              AppAssets.iconStarFilled,
              size: size,
              color: i <= rating ? AppColors.rating : AppColors.divider,
            ),
          ],
        ],
      ),
    );
  }
}

/// Tappable stars. The newly chosen star pops so the selection feels
/// tactile; stars fill from the start edge (right in Arabic).
class StarRatingInput extends StatelessWidget {
  const StarRatingInput({
    required this.value,
    required this.onChanged,
    this.size = 40,
    this.spacing = 9,
    super.key,
  });

  final int value;
  final ValueChanged<int> onChanged;
  final double size;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 1; i <= 5; i++) ...[
          if (i > 1) SizedBox(width: spacing),
          AppPressable(
            onTap: () => onChanged(i),
            pressedScale: 0.85,
            semanticLabel: context.l10n.a11yStarRating(context.fmt.number(i)),
            child: TweenAnimationBuilder<double>(
              key: ValueKey(i <= value),
              tween: Tween(begin: i <= value ? 0.7 : 1, end: 1),
              duration: Duration(milliseconds: 260 + i * 30),
              curve: AppMotion.emphasized,
              builder: (_, scale, child) =>
                  Transform.scale(scale: scale, child: child),
              child: AppIcon(
                AppAssets.iconStarFilled,
                size: size,
                color: i <= value ? AppColors.rating : AppColors.divider,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

/// Horizontal score bar for rating breakdown ("جودة القصة ▬▬▬ 4.9").
class RatingBar extends StatelessWidget {
  const RatingBar({
    required this.label,
    required this.value,
    this.labelWidth = 60,
    super.key,
  });

  /// 0..5
  final double value;
  final String label;
  final double labelWidth;

  @override
  Widget build(BuildContext context) {
    final fraction = (value / 5).clamp(0.0, 1.0);
    final color = value < 4.5 ? AppColors.warning : AppColors.primary;
    return Row(
      children: [
        SizedBox(
          width: labelWidth,
          child: Text(label, style: AppTypography.caption, maxLines: 1),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Container(
            height: 5,
            decoration: BoxDecoration(
              color: AppColors.divider,
              borderRadius: BorderRadius.circular(3),
            ),
            alignment: AlignmentDirectional.centerStart,
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: fraction),
              duration: AppMotion.slow,
              curve: AppMotion.standard,
              builder: (_, f, _) => FractionallySizedBox(
                widthFactor: f,
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(context.fmt.rating(value), style: AppTypography.badge),
      ],
    );
  }
}
