import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/localization/time_ago.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/salon_details.dart';
import '../salon_details_cubit.dart';

/// Frame 23 reviews: summary, breakdown, filters, list.
class ReviewsSection extends StatelessWidget {
  const ReviewsSection({required this.details, super.key});

  final SalonDetails details;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final state = context.watch<SalonDetailsCubit>().state;
    final cubit = context.read<SalonDetailsCubit>();
    final summary = details.summary;
    final breakdown = details.ratingBreakdown;

    if (summary.rating == null || details.reviews.isEmpty) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
        child: AppNotice(message: l10n.reviewsEmpty),
      );
    }

    final barbers = <String, String>{
      for (final r in details.reviews)
        if (r.barberId != null && r.barberName != null)
          r.barberId!: r.barberName!,
    };
    final filters = <(ReviewFilter, String)>[
      (const ReviewFilterAll(), l10n.reviewFilterAll),
      (const ReviewFilterFiveStars(), l10n.reviewFilterFiveStars),
      (const ReviewFilterWithPhotos(), l10n.reviewFilterWithPhotos),
      for (final e in barbers.entries) (ReviewFilterBarber(e.key), e.value),
    ];
    final reviews = state.filteredReviews;
    final now = DateTime.now();

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.only(bottom: 16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.divider)),
            ),
            child: Row(
              children: [
                Column(
                  children: [
                    Text(
                      fmt.rating(summary.rating!),
                      style: AppTypography.displayXs.copyWith(height: 1.1),
                    ),
                    const SizedBox(height: 5),
                    StarRatingDisplay(rating: summary.rating!.round()),
                    const SizedBox(height: 3),
                    Text(
                      l10n.reviewsTotal(summary.reviewsCount),
                      style: AppTypography.caption,
                    ),
                  ],
                ),
                const SizedBox(width: 18),
                if (breakdown != null)
                  Expanded(
                    child: Column(
                      children: [
                        RatingBar(
                          label: l10n.breakdownQuality,
                          value: breakdown.quality,
                        ),
                        const SizedBox(height: 6),
                        RatingBar(
                          label: l10n.breakdownCleanliness,
                          value: breakdown.cleanliness,
                        ),
                        const SizedBox(height: 6),
                        RatingBar(
                          label: l10n.breakdownTimeAccuracy,
                          value: breakdown.timeAccuracy,
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final (filter, label) in filters) ...[
                  AppChip(
                    label: label,
                    height: 32,
                    fontSize: 12.5,
                    selected: state.reviewFilter == filter,
                    onTap: () => cubit.filterReviews(filter),
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
          const SizedBox(height: 14),
          AnimatedSize(
            duration: AppMotion.medium,
            alignment: Alignment.topCenter,
            child: reviews.isEmpty
                ? Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      l10n.reviewsFilterEmpty,
                      textAlign: TextAlign.center,
                      style: AppTypography.caption,
                    ),
                  )
                : Column(
                    children: [
                      for (final r in reviews)
                        _ReviewItem(key: ValueKey(r.id), review: r, now: now),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _ReviewItem extends StatelessWidget {
  const _ReviewItem({required this.review, required this.now, super.key});

  final Review review;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AppAvatar(
                name: review.authorName,
                size: 36,
                tone: AppAvatarTone.neutral,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review.authorName,
                      style: AppTypography.bodyStrong.copyWith(fontSize: 14),
                    ),
                    const SizedBox(height: 2),
                    StarRatingDisplay(rating: review.stars, size: 12),
                  ],
                ),
              ),
              Text(
                l10n.timeAgo(review.createdAt, now),
                style: AppTypography.caption,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(review.text, style: AppTypography.bodySm),
          if (review.serviceName != null || review.barberName != null) ...[
            const SizedBox(height: 8),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                if (review.serviceName != null)
                  AppBadge(
                    label: review.serviceName!,
                    height: 24,
                    fontSize: 11.5,
                  ),
                if (review.barberName != null)
                  AppBadge(
                    label: review.barberName!,
                    height: 24,
                    fontSize: 11.5,
                  ),
              ],
            ),
          ],
          if (review.salonReply != null) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: const BoxDecoration(
                color: AppColors.surf,
                border: BorderDirectional(
                  start: BorderSide(color: AppColors.primary, width: 2.5),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.salonReply,
                    style: AppTypography.metaStrong.copyWith(
                      color: AppColors.tealDark,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    review.salonReply!,
                    style: AppTypography.note.copyWith(fontSize: 12.5),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Frame 23 opening hours, listed from today.
class HoursSection extends StatelessWidget {
  const HoursSection({required this.details, super.key});

  final SalonDetails details;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    DayHours hoursFor(int weekday) => details.hours.firstWhere(
      (h) => h.weekday == weekday,
      orElse: () => DayHours.closed(weekday),
    );
    String time(int minutes) => fmt.hour(today.add(Duration(minutes: minutes)));

    return Padding(
      padding: AppSpacing.pageH,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SectionDivider(),
          SectionHeader(
            title: l10n.hoursHeader,
            padding: const EdgeInsets.only(bottom: 12),
            trailing: details.summary.isOpen
                ? AppBadge(
                    label: l10n.openNowBadge,
                    style: AppBadgeStyle.success,
                  )
                : AppBadge(
                    label: l10n.statusClosedNow,
                    style: AppBadgeStyle.missed,
                  ),
          ),
          SettingsGroup(
            children: [
              for (var i = 0; i < 7; i++)
                _HoursRow(
                  day: today.add(Duration(days: i)),
                  hours: hoursFor(today.add(Duration(days: i)).weekday),
                  isToday: i == 0,
                  time: time,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HoursRow extends StatelessWidget {
  const _HoursRow({
    required this.day,
    required this.hours,
    required this.isToday,
    required this.time,
  });

  final DateTime day;
  final DayHours hours;
  final bool isToday;
  final String Function(int minutes) time;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final name = context.fmt.weekday(day);
    return SettingsRow(
      title: isToday ? l10n.todayWithDay(name) : name,
      titleStyle: isToday
          ? AppTypography.body.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w800,
            )
          : hours.isClosed
          ? AppTypography.body.copyWith(color: AppColors.textSecondary)
          : null,
      trailing: Text(
        hours.isClosed
            ? l10n.dayOff
            : l10n.hoursRange(time(hours.opensAt!), time(hours.closesAt!)),
        style: AppTypography.meta.copyWith(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: hours.isClosed
              ? AppColors.error
              : isToday
              ? AppColors.textPrimary
              : AppColors.textSecondary,
        ),
      ),
    );
  }
}
