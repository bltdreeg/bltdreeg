import 'package:flutter/material.dart';

import '../../../../core/router/app_navigation.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/entities/salon_summary.dart';
import 'salon_labels.dart';

/// [SalonListTile] bound to a [SalonSummary].
class SalonListItem extends StatelessWidget {
  const SalonListItem({
    required this.salon,
    required this.now,
    this.live = true,
    this.priceService,
    this.showDivider = true,
    super.key,
  });

  final SalonSummary salon;
  final DateTime now;
  final bool live;

  /// When a single service filter is active, show its price instead of
  /// "from" (frame 13: "قصة شعر 90 ج.م").
  final ServiceCategory? priceService;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return SalonListTile(
      name: salon.name,
      imageUrl: salon.imageUrl,
      rating: salon.rating,
      reviewsCount: salon.rating == null ? null : salon.reviewsCount,
      closedTag: salon.isOpen ? null : l10n.closedTag,
      showDivider: showDivider,
      onTap: () => context.pushSalon(salon.id),
      meta: MetaRow(
        items: [
          salon.areaName.of(context.l10n.localeName),
          SalonLabels.distance(context, salon.distanceKm),
          PriceMeta(
            prefix: priceService == null
                ? l10n.priceFrom('').trim()
                : priceService!.label(l10n),
            amount: SalonLabels.price(context, salon.priceFor(priceService)),
          ),
        ],
      ),
      status: SalonWaitPill(salon: salon, now: now, live: live),
    );
  }
}

/// [SalonRailCard] bound to a [SalonSummary].
class SalonRailItem extends StatelessWidget {
  const SalonRailItem({
    required this.salon,
    required this.now,
    this.showNewBadge = false,
    super.key,
  });

  final SalonSummary salon;
  final DateTime now;
  final bool showNewBadge;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return SalonRailCard(
      name: salon.name,
      imageUrl: salon.imageUrl,
      onTap: () => context.pushSalon(salon.id),
      pin: SalonAvailabilityPin(salon: salon),
      meta: MetaRow(
        items: [
          salon.areaName.of(l10n.localeName),
          SalonLabels.distance(context, salon.distanceKm),
        ],
      ),
      bottom: Row(
        children: [
          // Shrinks instead of overflowing with long labels / large fonts.
          Flexible(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: AlignmentDirectional.centerStart,
              child: showNewBadge
                  ? AppBadge(
                      label: SalonLabels.openedAgo(salon.openedOn, now, l10n),
                      height: 24,
                      fontSize: 11.5,
                    )
                  : salon.rating != null
                  ? RatingLabel(
                      rating: salon.rating!,
                      reviewsCount: salon.reviewsCount,
                    )
                  : const SizedBox.shrink(),
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: AlignmentDirectional.centerEnd,
              child: PriceMeta(
                prefix: l10n.priceFrom('').trim(),
                amount: SalonLabels.price(context, salon.priceFrom),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
