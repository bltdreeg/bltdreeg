import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/salon_details.dart';

/// Frame 22 barbers: each shows their own sub-queue.
class BarbersSection extends StatelessWidget {
  const BarbersSection({required this.details, required this.live, super.key});

  final SalonDetails details;
  final bool live;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final (i, barber) in details.barbers.indexed)
            BarberRow(
              barber: barber,
              live: live,
              showDivider: i < details.barbers.length - 1,
            ),
          const SizedBox(height: 16),
          AppNotice(message: l10n.barberNamedNote),
        ],
      ),
    );
  }
}

class BarberRow extends StatelessWidget {
  const BarberRow({
    required this.barber,
    required this.live,
    this.showDivider = true,
    super.key,
  });

  final Barber barber;
  final bool live;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final off = !barber.isWorking;
    return Opacity(
      opacity: off ? 0.6 : 1,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          border: showDivider
              ? const Border(bottom: BorderSide(color: AppColors.divider))
              : null,
        ),
        child: Row(
          children: [
            AppAvatar(
              name: barber.name,
              imageUrl: barber.imageUrl,
              tone: off ? AppAvatarTone.disabled : AppAvatarTone.brand,
              bordered: false,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          barber.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.itemTitle.copyWith(fontSize: 15),
                        ),
                      ),
                      if (barber.rating != null) ...[
                        const SizedBox(width: 8),
                        RatingLabel(
                          rating: barber.rating!,
                          reviewsCount: barber.reviewsCount,
                          muted: off,
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 3),
                  MetaRow(
                    items: [
                      barber.specialty,
                      if (barber.yearsExperience != null && !off)
                        l10n.yearsExperience(barber.yearsExperience!),
                    ],
                  ),
                  const SizedBox(height: 6),
                  _BarberStatus(barber: barber, live: live),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BarberStatus extends StatelessWidget {
  const _BarberStatus({required this.barber, required this.live});

  final Barber barber;
  final bool live;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final pill = switch (barber.availability) {
      BarberOff(:final returnsOn) => WaitStatusPill(
        label: l10n.barberOffReturns(_returnDay(context, returnsOn)),
        level: WaitLevel.closed,
        icon: AppAssets.iconClock,
      ),
      BarberWorking() when !live => WaitStatusPill(
        label: l10n.waitNotUpdated,
        level: WaitLevel.closed,
        icon: AppAssets.iconWifiOff,
      ),
      BarberWorking(:final queue) when queue.peopleAhead == 0 => WaitStatusPill(
        label: l10n.waitFreeNow,
        level: WaitLevel.free,
        icon: AppAssets.iconCheck,
      ),
      BarberWorking(:final queue) => WaitStatusPill(
        label: l10n.barberQueueAhead(queue.peopleAhead, queue.waitMinutes),
        level: queue.peopleAhead <= 3 ? WaitLevel.moderate : WaitLevel.busy,
        icon: AppAssets.iconUsers,
      ),
    };
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 280),
      child: KeyedSubtree(key: ValueKey(pill.label), child: pill),
    );
  }

  String _returnDay(BuildContext context, DateTime day) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(day.year, day.month, day.day);
    return target.difference(today).inDays == 1
        ? context.l10n.dayTomorrow
        : context.fmt.weekday(day);
  }
}
