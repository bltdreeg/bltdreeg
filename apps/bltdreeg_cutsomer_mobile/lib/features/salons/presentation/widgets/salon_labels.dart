import 'package:flutter/widgets.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/localization/generated/app_localizations.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/status_badges.dart';
import '../../domain/entities/salon_summary.dart';
import '../../domain/entities/search_criteria.dart';

/// Localized labels for salon data. Kept in one place so home, search and
/// favorites word statuses identically.
extension ServiceCategoryL10n on ServiceCategory {
  String label(AppLocalizations l10n) => switch (this) {
    ServiceCategory.haircut => l10n.serviceHaircut,
    ServiceCategory.beard => l10n.serviceBeard,
    ServiceCategory.kids => l10n.serviceKids,
    ServiceCategory.color => l10n.serviceColor,
    ServiceCategory.skincare => l10n.serviceSkincare,
  };
}

extension SalonSortL10n on SalonSort {
  String label(AppLocalizations l10n) => switch (this) {
    SalonSort.leastWait => l10n.sortLeastWait,
    SalonSort.nearest => l10n.sortNearest,
    SalonSort.topRated => l10n.sortTopRated,
    SalonSort.cheapest => l10n.sortCheapest,
    SalonSort.newest => l10n.sortNewest,
  };
}

extension QueueLevelX on QueueLevel {
  WaitLevel get waitLevel => switch (this) {
    QueueLevel.free => WaitLevel.free,
    QueueLevel.moderate => WaitLevel.moderate,
    QueueLevel.busy => WaitLevel.busy,
    QueueLevel.closed => WaitLevel.closed,
  };
}

abstract final class SalonLabels {
  static String opens(
    DateTime opensAt,
    DateTime now,
    AppLocalizations l10n,
    AppFormatters fmt,
  ) {
    final today = DateTime(now.year, now.month, now.day);
    final day = DateTime(opensAt.year, opensAt.month, opensAt.day);
    final time = fmt.hour(opensAt);
    return switch (day.difference(today).inDays) {
      0 => l10n.opensTodayAt(time),
      1 => l10n.opensTomorrowAt(time),
      _ => l10n.opensOnDayAt(fmt.weekday(opensAt), time),
    };
  }

  static String openedAgo(
    DateTime openedOn,
    DateTime now,
    AppLocalizations l10n,
  ) {
    final days = now.difference(openedOn).inDays;
    return days < 7
        ? l10n.openedDaysAgo(days)
        : l10n.openedWeeksAgo((days / 7).round());
  }

  static String price(BuildContext context, int amount) =>
      context.l10n.priceEgp(context.fmt.number(amount));

  static String distance(BuildContext context, double km) =>
      context.l10n.distanceKm(context.fmt.distanceKm(km));
}

/// `.wait` pill under a salon name. With [live] false the numbers are
/// hidden, because stale wait times mislead (board frame 08).
class SalonWaitPill extends StatelessWidget {
  const SalonWaitPill({
    required this.salon,
    required this.now,
    this.live = true,
    super.key,
  });

  final SalonSummary salon;
  final DateTime now;
  final bool live;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    if (!live) {
      return WaitStatusPill(
        label: l10n.waitNotUpdated,
        level: WaitLevel.closed,
        icon: AppAssets.iconWifiOff,
      );
    }
    final opensAt = salon.opensAt;
    if (opensAt != null) {
      return WaitStatusPill(
        label: SalonLabels.opens(opensAt, now, l10n, context.fmt),
        level: WaitLevel.closed,
        icon: AppAssets.iconClock,
      );
    }
    final q = salon.queue;
    final label = switch (q.peopleAhead) {
      0 => l10n.waitFreeWalkIn,
      _ when q.waitMinutes >= 55 => l10n.waitPeopleHour(q.peopleAhead),
      _ => l10n.waitPeopleMinutes(q.peopleAhead, q.waitMinutes),
    };
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 280),
      child: WaitStatusPill(
        key: ValueKey(label),
        label: label,
        level: salon.level.waitLevel,
        icon: q.peopleAhead == 0 ? AppAssets.iconCheck : AppAssets.iconUsers,
      ),
    );
  }
}

/// Status pin on rail card photos ("فاضي دلوقتي", "فاضل 2").
class SalonAvailabilityPin extends StatelessWidget {
  const SalonAvailabilityPin({required this.salon, super.key});

  final SalonSummary salon;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final ahead = salon.queue.peopleAhead;
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 280),
      child: AvailabilityPin(
        key: ValueKey(ahead),
        label: ahead == 0 ? l10n.waitFreeNow : l10n.pinPeopleLeft(ahead),
        level: salon.level.waitLevel,
      ),
    );
  }
}
