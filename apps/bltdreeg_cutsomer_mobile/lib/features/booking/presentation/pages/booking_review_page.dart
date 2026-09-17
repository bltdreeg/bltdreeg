import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salon_details/domain/salon_details.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../../domain/booking.dart';
import '../../domain/booking_draft.dart';
import '../booking_flow_cubits.dart';
import '../widgets/booking_widgets.dart';

/// Frame 25: everything that will be booked, the wait as a range (never a
/// single promise), the no-show policy before confirming, and the total.
class BookingReviewPage extends StatelessWidget {
  const BookingReviewPage({required this.salonId, super.key});

  final String salonId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<BookingReviewCubit>(param1: salonId),
      child: const _BookingReviewView(),
    );
  }
}

class _BookingReviewView extends StatelessWidget {
  const _BookingReviewView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<BookingReviewCubit>().state;
    final cubit = context.read<BookingReviewCubit>();
    final draft = state.flow.draft;

    return BlocListener<BookingReviewCubit, BookingReviewState>(
      listenWhen: (a, b) => a.status != b.status,
      listener: (context, state) {
        switch (state.status) {
          case ConfirmDone(:final booking):
            unawaited(AppHaptics.success());
            context.goBookingConfirmed(booking.id);
          case ConfirmFailed():
            unawaited(AppHaptics.alert());
          case ConfirmIdle() || ConfirmSubmitting():
            break;
        }
      },
      child: BookingStepScaffold(
        title: l10n.bookingReviewTitle,
        step: 3,
        flow: state.flow,
        isStepReachable: draft.isReadyForBarber,
        onRetry: cubit.retryDetails,
        bodyBuilder: (context, details) => ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.gutter,
            18,
            AppSpacing.gutter,
            18,
          ),
          children: [
            _SalonHeader(details: details),
            GroupLabel(
              l10n.reviewServicesHeader,
              padding: const EdgeInsetsDirectional.only(top: 16, bottom: 4),
            ),
            for (final service in draft.services) _ServiceRow(service: service),
            _ChoiceRow(
              icon: AppAssets.iconUser,
              label: l10n.reviewBarberLabel,
              value: draft.barber.label(l10n),
              onChange: () => context.backToBookingBarber(draft.salonId),
            ),
            _ChoiceRow(
              icon: AppAssets.iconCalendar,
              label: l10n.reviewTimeLabel,
              value: draft.timing!.label(context),
              onChange: () => context.goBookingSlot(draft.salonId),
              last: true,
            ),
            const SizedBox(height: 16),
            _WaitCard(state: state),
            const SizedBox(height: 12),
            AppNotice(
              tone: AppTone.warning,
              emphasized: true,
              message: draft.timing is JoinNow
                  ? l10n.policyQueue
                  : l10n.policySlot,
            ),
            const SizedBox(height: 18),
            _Totals(quote: state.quote),
          ],
        ),
        footer: const _ConfirmFooter(),
      ),
    );
  }
}

class _SalonHeader extends StatelessWidget {
  const _SalonHeader({required this.details});

  final SalonDetails details;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final summary = details.summary;
    return Container(
      padding: const EdgeInsets.only(bottom: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: Row(
        children: [
          SalonThumbnail(
            imageUrl: summary.imageUrl,
            size: 58,
            radius: 11,
            iconSize: AppSizes.iconSm,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  summary.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.itemTitle,
                ),
                const SizedBox(height: 4),
                Text(
                  details.address.of(l10n.localeName),
                  style: AppTypography.meta,
                ),
                const SizedBox(height: 2),
                Text(
                  l10n.driveDistance(
                    context.fmt.distanceKm(summary.distanceKm),
                    // City driving at roughly 12 km/h door to door.
                    (summary.distanceKm * 5).ceil().clamp(1, 999),
                  ),
                  style: AppTypography.meta,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ServiceRow extends StatelessWidget {
  const _ServiceRow({required this.service});

  final SelectedService service;

  @override
  Widget build(BuildContext context) {
    return _RowFrame(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service.name,
                  style: AppTypography.bodyStrong.copyWith(fontSize: 14.5),
                ),
                const SizedBox(height: 2),
                Text(
                  context.l10n.durationMinutes(service.durationMinutes),
                  style: AppTypography.meta,
                ),
              ],
            ),
          ),
          Text(
            SalonLabels.price(context, service.price),
            style: AppTypography.bodyStrong.copyWith(fontSize: 14.5),
          ),
        ],
      ),
    );
  }
}

class _ChoiceRow extends StatelessWidget {
  const _ChoiceRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.onChange,
    this.last = false,
  });

  final String icon;
  final String label;
  final String value;
  final VoidCallback onChange;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return _RowFrame(
      last: last,
      child: Row(
        children: [
          AppIcon(icon, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Text(
            label,
            style: AppTypography.body.copyWith(
              fontSize: 14.5,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTypography.bodyStrong.copyWith(fontSize: 14),
            ),
          ),
          const SizedBox(width: 12),
          AppLinkButton(label: context.l10n.actionChange, onPressed: onChange),
        ],
      ),
    );
  }
}

/// `.row-item`: 15px vertical padding with a hairline under all but the last.
class _RowFrame extends StatelessWidget {
  const _RowFrame({required this.child, this.last = false});

  final Widget child;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 15),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: child,
    );
  }
}

class _WaitCard extends StatelessWidget {
  const _WaitCard({required this.state});

  final BookingReviewState state;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final draft = state.flow.draft;
    final minutes = draft.totalMinutes;

    final (
      String title,
      String subtitle,
      String note,
    ) = switch (draft.timing!) {
      JoinNow() => () {
        final queue = state.queue;
        final estimate = queue.estimate;
        return (
          estimate.isImmediate
              ? l10n.waitRightInTitle
              : l10n.waitRangeTitle(estimate.minMinutes, estimate.maxMinutes),
          l10n.waitAheadAndDuration(queue.peopleAhead, minutes),
          l10n.waitLiveNote,
        );
      }(),
      ScheduledSlot(:final start) => (
        l10n.slotAppointmentTitle(
          BookingLabels.day(context, start),
          fmt.time(start),
        ),
        l10n.bookingDurationNote(minutes),
        l10n.slotArriveNote,
      ),
    };
    const fg = AppColors.tealDark;

    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.tealTint,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const AppIcon(AppAssets.iconClock, color: fg),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AnimatedSwitcher(
                        duration: AppMotion.fast,
                        child: Text(
                          title,
                          key: ValueKey(title),
                          style: AppTypography.bodyStrong.copyWith(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w800,
                            color: fg,
                          ),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: AppTypography.metaStrong.copyWith(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: fg,
                        ),
                      ),
                    ],
                  ),
                ),
                if (draft.timing is JoinNow && state.flow.snapshot.isLive)
                  const LiveIndicator(),
              ],
            ),
            Container(
              margin: const EdgeInsets.only(top: 10),
              padding: const EdgeInsets.only(top: 10),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: AppColors.tealDivider)),
              ),
              child: Text(
                note,
                style: AppTypography.metaStrong.copyWith(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  color: fg,
                  height: 1.7,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Totals extends StatelessWidget {
  const _Totals({required this.quote});

  final BookingQuote quote;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    String price(int amount) => SalonLabels.price(context, amount);
    final line = AppTypography.metaStrong.copyWith(fontSize: 13.5);

    return Container(
      padding: const EdgeInsets.only(top: 14),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _AmountLine(
            label: l10n.servicesSubtotal,
            amount: price(quote.subtotal),
            style: line,
          ),
          for (final discount in quote.discounts) ...[
            const SizedBox(height: 7),
            _AmountLine(
              label: l10n.bundleDiscount,
              // Isolated so the minus stays before the digits in RTL.
              amount: l10n.priceEgp(
                '−${context.fmt.number(discount.amount)}'.ltrIsolate,
              ),
              style: line.copyWith(
                color: AppColors.okDark,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          Container(
            margin: const EdgeInsets.only(top: 9),
            padding: const EdgeInsets.only(top: 9),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.divider)),
            ),
            child: _AmountLine(
              label: l10n.totalLabel,
              amount: price(quote.total),
              style: AppTypography.titleMd.copyWith(fontSize: 17),
            ),
          ),
          const SizedBox(height: 6),
          Text(l10n.payCashNote, style: AppTypography.caption),
        ],
      ),
    );
  }
}

class _AmountLine extends StatelessWidget {
  const _AmountLine({
    required this.label,
    required this.amount,
    required this.style,
  });

  final String label;
  final String amount;
  final TextStyle style;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: style),
        Text(amount, style: style),
      ],
    );
  }
}

class _ConfirmFooter extends StatelessWidget {
  const _ConfirmFooter();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<BookingReviewCubit>().state;
    final cubit = context.read<BookingReviewCubit>();
    final online = context.watchIsOnline;
    final draft = state.flow.draft;
    final status = state.status;
    final submitting = status is ConfirmSubmitting;
    final blocked = switch (status) {
      ConfirmFailed(
        failure: RuleFailure(code: BookingRuleCodes.alreadyInQueue),
      ) =>
        true,
      _ => false,
    };

    final Widget? notice = switch (status) {
      ConfirmFailed(:final failure) => AppNotice(
        tone: AppTone.danger,
        message: BookingLabels.failure(l10n, failure),
        action: switch (failure) {
          RuleFailure(code: BookingRuleCodes.alreadyInQueue, :final data)
              when data['bookingId'] is String =>
            AppLinkButton(
              label: l10n.actionTrackTurn,
              onPressed: () => context.goQueue(data['bookingId']! as String),
            ),
          RuleFailure(
            code: BookingRuleCodes.slotTaken || BookingRuleCodes.salonClosed,
          ) =>
            AppLinkButton(
              label: l10n.actionPickTime,
              onPressed: () => context.goBookingSlot(draft.salonId),
            ),
          RuleFailure(code: BookingRuleCodes.barberUnavailable) =>
            AppLinkButton(
              label: l10n.actionPickBarber,
              onPressed: () => context.backToBookingBarber(draft.salonId),
            ),
          _ => null,
        },
      ),
      _ when !online => AppNotice(
        tone: AppTone.warning,
        icon: AppAssets.iconWifiOff,
        message: l10n.offlineQueueBlocked,
      ),
      _ => null,
    };

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AnimatedSize(
          duration: AppMotion.fast,
          alignment: Alignment.bottomCenter,
          child: notice == null
              ? const SizedBox(width: double.infinity)
              : Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: notice,
                ),
        ),
        AppButton(
          label: draft.timing is ScheduledSlot
              ? l10n.confirmSlotBooking
              : l10n.confirmJoinQueue,
          height: 54,
          fontSize: 17,
          isLoading: submitting,
          // Retrying can't succeed while another queue booking is active.
          onPressed: online && !submitting && !blocked ? cubit.confirm : null,
        ),
      ],
    );
  }
}
