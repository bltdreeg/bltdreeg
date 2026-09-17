import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/utils/external_links.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/booking.dart';
import '../../domain/booking_draft.dart';
import '../booking_flow_cubits.dart';
import '../widgets/booking_widgets.dart';
import '../widgets/queue_joined_illustration.dart';

/// Frame 26: the queue number right away and a direct way to follow it, so
/// the customer never has to look for their turn. Scheduled bookings show
/// the appointment instead.
class BookingConfirmedPage extends StatelessWidget {
  const BookingConfirmedPage({required this.bookingId, super.key});

  final String bookingId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<BookingConfirmedCubit>(param1: bookingId),
      child: const _BookingConfirmedView(),
    );
  }
}

class _BookingConfirmedView extends StatelessWidget {
  const _BookingConfirmedView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<BookingConfirmedCubit>().state;
    final cubit = context.read<BookingConfirmedCubit>();

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            Positioned.fill(
              child: switch (state) {
                BookingConfirmedState(:final booking?) => _Confirmed(
                  booking: booking,
                ),
                BookingConfirmedState(:final failure?) => Center(
                  child: EmptyStateView(
                    illustration: const AppIllustration(
                      AppAssets.illustrationEmptyBookings,
                      width: 170,
                    ),
                    title: l10n.bookingLoadFailed,
                    message: failure.message(l10n),
                    primaryLabel: l10n.actionRetry,
                    onPrimary: cubit.load,
                    secondaryLabel: l10n.backToHome,
                    onSecondary: context.goHome,
                  ),
                ),
                _ => const Center(child: CircularProgressIndicator()),
              },
            ),
            // The flow was replaced by this screen, so "close" goes home.
            PositionedDirectional(
              top: 6,
              start: AppSpacing.gutter,
              child: AppIconButton(
                icon: AppAssets.iconClose,
                semanticLabel: l10n.actionClose,
                onPressed: context.goHome,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Confirmed extends StatelessWidget {
  const _Confirmed({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isQueue = booking.isQueue;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.gutter,
          56,
          AppSpacing.gutter,
          40,
        ),
        child: Column(
          children: [
            QueueJoinedIllustration(
              onCheckDrawn: () => unawaited(AppHaptics.success()),
            ),
            const SizedBox(height: 14),
            FadeSlideIn(
              delay: const Duration(milliseconds: 650),
              child: Column(
                children: [
                  Semantics(
                    header: true,
                    liveRegion: true,
                    child: Text(
                      isQueue
                          ? l10n.confirmedQueueTitle
                          : l10n.confirmedSlotTitle,
                      textAlign: TextAlign.center,
                      style: AppTypography.emptyTitle.copyWith(fontSize: 22),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    l10n.dotSeparated(
                      booking.salonName,
                      booking.salonArea.of(l10n.localeName),
                    ),
                    textAlign: TextAlign.center,
                    style: AppTypography.body.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            FadeSlideIn(
              delay: const Duration(milliseconds: 800),
              scaleFrom: 0.96,
              child: isQueue
                  ? _TicketCard(booking: booking)
                  : _AppointmentCard(booking: booking),
            ),
            const SizedBox(height: 16),
            FadeSlideIn(
              delay: const Duration(milliseconds: 950),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          label: isQueue
                              ? l10n.actionTrackTurn
                              : l10n.navBookings,
                          height: 50,
                          onPressed: isQueue
                              ? () => context.goQueue(booking.id)
                              : context.goBookings,
                        ),
                      ),
                      const SizedBox(width: 10),
                      SizedBox(
                        width: 130,
                        child: AppButton(
                          label: l10n.actionDirections,
                          variant: AppButtonVariant.secondary,
                          icon: AppAssets.iconNavigation,
                          height: 50,
                          fontSize: 14,
                          onPressed: () => ExternalLinks.directions(
                            context,
                            latitude: booking.latitude,
                            longitude: booking.longitude,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    isQueue ? l10n.confirmedQueueNote : l10n.confirmedSlotNote,
                    textAlign: TextAlign.center,
                    style: AppTypography.metaStrong.copyWith(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                      height: 1.7,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    return _TealCard(
      child: Column(
        children: [
          Text(
            l10n.ticketNumberLabel,
            style: AppTypography.metaStrong.copyWith(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: AppColors.tealDark,
            ),
          ),
          const SizedBox(height: 4),
          Semantics(
            label: '${l10n.ticketNumberLabel} ${booking.ticketNumber}',
            excludeSemantics: true,
            child: Text(
              fmt.number(booking.ticketNumber ?? 0),
              style: AppTypography.displayLg.copyWith(color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 14),
          _Stats(
            children: [
              _Stat(
                label: l10n.aheadOfYouLabel,
                value: l10n.aheadCount(booking.peopleAhead),
              ),
              _Stat(
                label: l10n.expectedTimeLabel,
                value: booking.waitMinutes == 0
                    ? l10n.waitImmediate
                    : l10n.approxMinutes(booking.waitMinutes),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AppointmentCard extends StatelessWidget {
  const _AppointmentCard({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final start = (booking.timing as ScheduledSlot).start;
    return _TealCard(
      child: Column(
        children: [
          Text(
            l10n.appointmentLabel,
            style: AppTypography.metaStrong.copyWith(
              fontSize: 12.5,
              fontWeight: FontWeight.w800,
              color: AppColors.tealDark,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            fmt.time(start),
            style: AppTypography.displaySm.copyWith(color: AppColors.primary),
          ),
          const SizedBox(height: 2),
          Text(
            BookingLabels.day(context, start),
            style: AppTypography.bodyStrong.copyWith(color: AppColors.tealDark),
          ),
          const SizedBox(height: 14),
          _Stats(
            children: [
              _Stat(
                label: l10n.reviewBarberLabel,
                value: booking.barberName ?? const AnyBarber().label(l10n),
              ),
              _Stat(
                label: l10n.totalLabel,
                value: l10n.priceEgp(fmt.number(booking.quote.total)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TealCard extends StatelessWidget {
  const _TealCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.tealTint,
        borderRadius: AppRadius.cardAll,
        border: Border.all(color: AppColors.tealTint2),
      ),
      child: child,
    );
  }
}

/// Two stats split by a vertical hairline, under a top hairline.
class _Stats extends StatelessWidget {
  const _Stats({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(top: 14),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.tealTint2)),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            for (var i = 0; i < children.length; i++) ...[
              if (i > 0)
                const VerticalDivider(width: 32, color: AppColors.tealTint2),
              Expanded(child: children[i]),
            ],
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: AppTypography.caption.copyWith(
            fontSize: 11.5,
            color: AppColors.tealDark,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          textAlign: TextAlign.center,
          style: AppTypography.titleMd.copyWith(
            fontSize: 16,
            color: AppColors.tealDark,
          ),
        ),
      ],
    );
  }
}
