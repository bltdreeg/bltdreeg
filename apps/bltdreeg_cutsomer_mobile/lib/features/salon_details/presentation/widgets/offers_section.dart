import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../../domain/salon_details.dart';

/// Frame 22 offers.
class OffersSection extends StatelessWidget {
  const OffersSection({required this.details, super.key});

  final SalonDetails details;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    if (details.offers.isEmpty) return const SizedBox(width: double.infinity);
    return Padding(
      padding: AppSpacing.pageH,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SectionDivider(),
          SectionHeader(
            title: l10n.offersHeader,
            padding: const EdgeInsets.only(bottom: 12),
          ),
          for (final offer in details.offers) ...[
            _OfferCard(offer: offer),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _OfferCard extends StatelessWidget {
  const _OfferCard({required this.offer});

  final SalonOffer offer;

  /// Whole days left, rounding a partial day up ("ends in 6 days").
  static int _daysLeft(DateTime expiresAt) {
    final hours = expiresAt.difference(DateTime.now()).inHours;
    return hours <= 0 ? 0 : (hours / 24).ceil();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final highlighted = offer.highlighted;
    final fg = highlighted ? AppColors.tealDark : AppColors.textPrimary;
    final sub = highlighted ? AppColors.tealDark : AppColors.textSecondary;
    final subStyle = AppTypography.metaStrong.copyWith(
      color: sub,
      fontWeight: FontWeight.w600,
      height: 1.6,
    );

    final body = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppIcon(
          AppAssets.iconGift,
          size: AppSizes.iconLg,
          color: highlighted ? AppColors.tealDark : AppColors.textSecondary,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                offer.title,
                style: AppTypography.bodyStrong.copyWith(
                  color: fg,
                  fontWeight: FontWeight.w800,
                ),
              ),
              if (offer.description != null) ...[
                const SizedBox(height: 3),
                Text(offer.description!, style: subStyle),
              ],
              if (offer.kind == OfferKind.bundle &&
                  offer.originalPrice != null &&
                  offer.price != null) ...[
                const SizedBox(height: 3),
                _BundleSaving(offer: offer, style: subStyle),
              ],
              if (offer.kind == OfferKind.loyalty &&
                  offer.visitsDone != null &&
                  offer.visitsTarget != null) ...[
                const SizedBox(height: 3),
                Text(
                  l10n.offerLoyaltyProgress(
                    offer.visitsDone!,
                    offer.visitsTarget!,
                  ),
                  style: subStyle,
                ),
                const SizedBox(height: 9),
                SegmentedProgressBar(
                  height: 6,
                  gap: 5,
                  colors: [
                    for (var i = 0; i < offer.visitsTarget!; i++)
                      i < offer.visitsDone!
                          ? AppColors.primary
                          : AppColors.divider,
                  ],
                ),
              ],
              if (offer.expiresAt != null) ...[
                const SizedBox(height: 6),
                Text(
                  l10n.offerExpiresIn(_daysLeft(offer.expiresAt!)),
                  style: AppTypography.caption.copyWith(color: sub),
                ),
              ],
            ],
          ),
        ),
      ],
    );

    const padding = EdgeInsets.all(14);
    if (!highlighted) return AppCard(padding: padding, child: body);
    return CustomPaint(
      foregroundPainter: const DashedRRectPainter(
        color: AppColors.primary,
        radius: AppRadius.card,
      ),
      child: Container(
        padding: padding,
        decoration: const BoxDecoration(
          color: AppColors.tealTint,
          borderRadius: AppRadius.cardAll,
        ),
        child: body,
      ),
    );
  }
}

/// "بدل ~~120 ج.م~~ — توفّر 20 ج.م" with the original price struck through.
class _BundleSaving extends StatelessWidget {
  const _BundleSaving({required this.offer, required this.style});

  final SalonOffer offer;
  final TextStyle style;

  static const _marker = '[[original]]';

  @override
  Widget build(BuildContext context) {
    final original = SalonLabels.price(context, offer.originalPrice!);
    final saving = SalonLabels.price(
      context,
      offer.originalPrice! - offer.price!,
    );
    final parts = context.l10n
        .offerBundleSaving(_marker, saving)
        .split(_marker);
    return Text.rich(
      TextSpan(
        style: style,
        children: [
          TextSpan(text: parts.first),
          TextSpan(
            text: original,
            style: style.copyWith(
              decoration: TextDecoration.lineThrough,
              decorationColor: style.color,
            ),
          ),
          if (parts.length > 1) TextSpan(text: parts.last),
        ],
      ),
    );
  }
}

/// Dashed rounded-rect outline (the highlighted offer card).
class DashedRRectPainter extends CustomPainter {
  const DashedRRectPainter({
    required this.color,
    required this.radius,
    this.strokeWidth = 1.5,
    this.dash = 5,
    this.gap = 4,
  });

  final Color color;
  final double radius;
  final double strokeWidth;
  final double dash;
  final double gap;

  @override
  void paint(Canvas canvas, Size size) {
    final inset = strokeWidth / 2;
    final path = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(
            inset,
            inset,
            size.width - strokeWidth,
            size.height - strokeWidth,
          ),
          Radius.circular(radius),
        ),
      );
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;
    for (final metric in path.computeMetrics()) {
      for (var d = 0.0; d < metric.length; d += dash + gap) {
        canvas.drawPath(metric.extractPath(d, d + dash), paint);
      }
    }
  }

  @override
  bool shouldRepaint(DashedRRectPainter oldDelegate) =>
      oldDelegate.color != color || oldDelegate.radius != radius;
}
