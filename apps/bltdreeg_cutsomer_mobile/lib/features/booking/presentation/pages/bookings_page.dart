import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../rating/domain/rating.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../../domain/booking.dart';
import '../bookings_cubit.dart';
import '../widgets/booking_widgets.dart';

/// Frames 09-11: current bookings (the live queue card stands apart from
/// every other card) and past visits to rate or rebook.
class BookingsPage extends StatelessWidget {
  const BookingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<BookingsCubit>(),
      child: const _BookingsView(),
    );
  }
}

class _BookingsView extends StatelessWidget {
  const _BookingsView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<BookingsCubit>().state;
    final cubit = context.read<BookingsCubit>();
    final bookings = state.visible;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator.adaptive(
          onRefresh: cubit.refresh,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.gutter,
                    8,
                    AppSpacing.gutter,
                    14,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      PageTitle(l10n.bookingsTitle),
                      const SizedBox(height: 14),
                      SegmentedTabs(
                        labels: [l10n.bookingsTabCurrent, l10n.bookingsTabPast],
                        selectedIndex: state.tab.index,
                        onChanged: (i) =>
                            cubit.selectTab(BookingsTab.values[i]),
                      ),
                    ],
                  ),
                ),
              ),
              if (!state.snapshot.isLoaded)
                const SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (bookings.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _Empty(state: state),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.gutter,
                    4,
                    AppSpacing.gutter,
                    24,
                  ),
                  sliver: SliverList.separated(
                    itemCount: bookings.length + 1,
                    separatorBuilder: (_, _) => const SizedBox(height: 12),
                    itemBuilder: (context, i) {
                      if (i == bookings.length) {
                        return state.tab == BookingsTab.current
                            ? Padding(
                                padding: const EdgeInsets.only(top: 6),
                                child: AppNotice(
                                  tone: AppTone.primary,
                                  icon: AppAssets.iconBell,
                                  emphasized: true,
                                  message: l10n.bookingsNotifyNote,
                                ),
                              )
                            : const SizedBox.shrink();
                      }
                      final booking = bookings[i];
                      return switch (booking.stage) {
                        QueueStage.waiting ||
                        QueueStage.approaching ||
                        QueueStage.yourTurn ||
                        QueueStage.inService => _ActiveQueueCard(
                          booking: booking,
                        ),
                        QueueStage.upcoming => _UpcomingCard(booking: booking),
                        _ => _PastCard(
                          booking: booking,
                          rating: state.ratings[booking.id],
                        ),
                      };
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The live queue card: teal, a number readable from across the room, and
/// one big action.
class _ActiveQueueCard extends StatelessWidget {
  const _ActiveQueueCard({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.tealTint,
        borderRadius: AppRadius.cardAll,
        border: Border.all(color: AppColors.tealTint2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const StatusDot(),
              const SizedBox(width: 8),
              Text(
                l10n.bookingsActiveNow,
                style: AppTypography.metaStrong.copyWith(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppColors.tealDark,
                ),
              ),
              const Spacer(),
              Flexible(
                child: Text(
                  booking.salonName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.end,
                  style: AppTypography.metaStrong.copyWith(
                    fontSize: 13,
                    color: AppColors.tealDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.yourNumberLabel,
                    style: AppTypography.caption.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.tealDark,
                    ),
                  ),
                  Text(
                    fmt.number(booking.ticketNumber ?? 0),
                    style: AppTypography.displayMd.copyWith(
                      fontSize: 52,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 22),
              Container(
                width: 1,
                height: 52,
                color: AppColors.tealTint2,
                margin: const EdgeInsets.only(bottom: 2),
              ),
              const SizedBox(width: 22),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        l10n.timeLeftLabel,
                        style: AppTypography.caption.copyWith(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.tealDark,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        booking.stage == QueueStage.yourTurn
                            ? l10n.yourTurnTitle
                            : booking.stage == QueueStage.inService
                            ? l10n.inServiceTitle
                            : '${l10n.aheadCount(booking.peopleAhead)} '
                                  '${l10n.approxMinutes(booking.waitMinutes)}',
                        maxLines: 2,
                        style: AppTypography.bodyStrong.copyWith(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.tealDark,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _BookingMeta(booking: booking, color: AppColors.tealDark),
          const SizedBox(height: 16),
          AppButton(
            label: l10n.actionTrackTurn,
            height: 50,
            onPressed: () => context.pushQueue(booking.id),
          ),
        ],
      ),
    );
  }
}

class _UpcomingCard extends StatelessWidget {
  const _UpcomingCard({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return _OutlinedBookingCard(
      badge: AppBadge(
        label: l10n.bookingsUpcomingBadge,
        style: AppBadgeStyle.soon,
        icon: AppAssets.iconClock,
      ),
      caption: booking.timing.label(context),
      booking: booking,
      actions: [
        Expanded(
          child: AppButton(
            label: l10n.bookingsDetails,
            variant: AppButtonVariant.secondary,
            height: 44,
            fontSize: 14,
            onPressed: () => context.pushQueue(booking.id),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: AppButton(
            label: l10n.actionCancel,
            variant: AppButtonVariant.dangerOutline,
            height: 44,
            fontSize: 14,
            // Cancelling spells out the consequence, so it happens on the
            // booking's own screen.
            onPressed: () => context.pushQueue(booking.id),
          ),
        ),
      ],
    );
  }
}

class _PastCard extends StatelessWidget {
  const _PastCard({required this.booking, this.rating});

  final Booking booking;
  final VisitRating? rating;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final completed = booking.status == BookingStatus.completed;
    final missed = booking.status == BookingStatus.missed;
    final needsRating = completed && rating == null;

    return _OutlinedBookingCard(
      badge: completed
          ? AppBadge(
              label: l10n.bookingDone,
              icon: AppAssets.iconCheck,
              iconColor: AppColors.okDark,
            )
          : AppBadge(
              label: missed
                  ? l10n.bookingMissedBadge
                  : l10n.bookingCancelledBadge,
              style: AppBadgeStyle.missed,
              icon: AppAssets.iconClose,
            ),
      // Day and time only: the weekday pushes the badge off the row.
      caption: context.l10n.slotDateTime(
        context.fmt.dayMonth(booking.reference),
        context.fmt.time(booking.reference),
      ),
      booking: booking,
      extraMeta: missed ? l10n.bookingMissedReason : null,
      rating: rating,
      extras: [
        if (needsRating)
          Padding(
            padding: const EdgeInsets.only(top: 14),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
              decoration: BoxDecoration(
                color: AppColors.warnTint,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const AppIcon(
                    AppAssets.iconStarFilled,
                    size: AppSizes.iconSm,
                    color: AppColors.warnText,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      switch (booking.barberName) {
                        final name? => l10n.rateBarberAndSalon(name),
                        null => l10n.rateSalonPrompt,
                      },
                      style: AppTypography.metaStrong.copyWith(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.warnText,
                      ),
                    ),
                  ),
                  AppLinkButton(
                    label: l10n.rateNowAction,
                    color: AppColors.warnText,
                    underline: true,
                    fontSize: 13,
                    onPressed: () => context.pushRateVisit(booking.id),
                  ),
                ],
              ),
            ),
          ),
      ],
      actions: [
        Expanded(
          child: AppButton(
            label: l10n.rebookSameChoices,
            variant: missed
                ? AppButtonVariant.secondary
                : AppButtonVariant.ghost,
            icon: AppAssets.iconRepeat,
            height: 44,
            fontSize: 14,
            onPressed: () {
              context.read<BookingsCubit>().rebook(booking);
              context.pushBookingSlot(booking.salonId);
            },
          ),
        ),
      ],
    );
  }
}

/// Shared bordered card: badge + date, salon row, optional extras, actions.
class _OutlinedBookingCard extends StatelessWidget {
  const _OutlinedBookingCard({
    required this.badge,
    required this.caption,
    required this.booking,
    required this.actions,
    this.extraMeta,
    this.rating,
    this.extras = const [],
  });

  final Widget badge;
  final String caption;
  final Booking booking;
  final List<Widget> actions;
  final String? extraMeta;
  final VisitRating? rating;

  /// Extra blocks between the salon row and the actions.
  final List<Widget> extras;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              badge,
              const Spacer(),
              Flexible(
                child: Text(
                  caption,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.end,
                  style: AppTypography.caption,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const SalonThumbnail(
                size: 56,
                radius: 10,
                iconSize: AppSizes.iconSm,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      booking.salonName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.itemTitle,
                    ),
                    const SizedBox(height: 5),
                    _BookingMeta(booking: booking),
                    const SizedBox(height: 3),
                    MetaRow(
                      items: [
                        if (extraMeta != null)
                          extraMeta!
                        else ...[
                          Text(
                            SalonLabels.price(context, booking.quote.total),
                            style: AppTypography.metaStrong.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (rating != null)
                            Row(
                              children: [
                                StarRatingDisplay(rating: rating!.overall),
                                const SizedBox(width: 4),
                                Text(
                                  context.l10n.yourRatingCaption,
                                  style: AppTypography.caption.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          ...extras,
          if (actions.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 14),
              child: Row(children: actions),
            ),
        ],
      ),
    );
  }
}

class _BookingMeta extends StatelessWidget {
  const _BookingMeta({required this.booking, this.color});

  final Booking booking;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final services = booking.services
        .map((s) => s.name)
        .join(l10n.servicesJoiner);
    final barber = switch (booking.barberName) {
      final name? => color == null ? name : l10n.withBarber(name),
      null => l10n.barberAnyTitle,
    };
    if (color == null) return MetaRow(items: [services, barber]);
    final style = AppTypography.metaStrong.copyWith(
      fontSize: 12.5,
      fontWeight: FontWeight.w600,
      color: color,
    );
    return Text(
      [
        services,
        barber,
        SalonLabels.price(context, booking.quote.total),
      ].join('  ·  '),
      maxLines: 2,
      style: style,
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty({required this.state});

  final BookingsState state;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    if (state.snapshot.failure case final failure? when state.isEmpty) {
      return Center(
        child: EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationNoInternet,
            width: 170,
          ),
          title: l10n.bookingsLoadFailed,
          message: failure.message(l10n),
          primaryLabel: l10n.actionRetry,
          onPrimary: context.read<BookingsCubit>().refresh,
        ),
      );
    }
    final past = state.tab == BookingsTab.past;
    return Center(
      child: EmptyStateView(
        illustration: const AppIllustration(
          AppAssets.illustrationEmptyBookings,
          width: 190,
        ),
        title: past ? l10n.bookingsPastEmptyTitle : l10n.bookingsEmptyTitle,
        message: past ? l10n.bookingsPastEmptyBody : l10n.bookingsEmptyBody,
        primaryLabel: past ? null : l10n.bookingsEmptyCta,
        onPrimary: past ? null : context.goSearch,
      ),
    );
  }
}
