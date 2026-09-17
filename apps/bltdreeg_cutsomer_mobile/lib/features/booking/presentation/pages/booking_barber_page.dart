import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salon_details/domain/salon_details.dart';
import '../../domain/booking_draft.dart';
import '../booking_flow_cubits.dart';
import '../widgets/booking_widgets.dart';

/// Frame 24: "any available barber" is preselected and marked fastest; each
/// named barber shows what picking them really costs in extra minutes.
class BookingBarberPage extends StatelessWidget {
  const BookingBarberPage({required this.salonId, super.key});

  final String salonId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<BookingBarberCubit>(param1: salonId),
      child: const _BookingBarberView(),
    );
  }
}

class _BookingBarberView extends StatelessWidget {
  const _BookingBarberView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final flow = context.watch<BookingBarberCubit>().state;
    final cubit = context.read<BookingBarberCubit>();
    final draft = flow.draft;

    return BookingStepScaffold(
      title: l10n.bookingBarberTitle,
      step: 2,
      flow: flow,
      isStepReachable: draft.isReadyForBarber,
      onRetry: cubit.retryDetails,
      bodyBuilder: (context, details) {
        final timing = draft.timing!;
        return ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.gutter,
            18,
            AppSpacing.gutter,
            24,
          ),
          children: [
            _AnyBarberOption(
              details: details,
              timing: timing,
              selected: draft.barber is AnyBarber,
            ),
            GroupLabel(
              l10n.barberPickByName,
              padding: const EdgeInsetsDirectional.only(top: 6, bottom: 8),
            ),
            for (final barber in details.barbers)
              _NamedBarberOption(
                barber: barber,
                timing: timing,
                salonWaitMinutes: details.summary.queue.waitMinutes,
                selected: switch (draft.barber) {
                  NamedBarber(:final id) => id == barber.id,
                  AnyBarber() => false,
                },
              ),
            if (timing is JoinNow) ...[
              const SizedBox(height: 6),
              AppNotice(message: l10n.barberNamedNote),
            ],
          ],
        );
      },
      footer: AppButton(
        label: l10n.bookingContinueToReview,
        onPressed: () => context.pushBookingReview(draft.salonId),
      ),
    );
  }
}

class _AnyBarberOption extends StatelessWidget {
  const _AnyBarberOption({
    required this.details,
    required this.timing,
    required this.selected,
  });

  final SalonDetails details;
  final BookingTiming timing;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final queue = details.summary.queue;
    final isNow = timing is JoinNow;
    final titleColor = selected ? AppColors.tealDark : AppColors.textPrimary;

    return SelectableOptionCard(
      selected: selected,
      onTap: context.read<BookingBarberCubit>().selectAny,
      semanticLabel: l10n.barberAnyTitle,
      trailing: !isNow
          ? null
          : queue.peopleAhead == 0
          ? OptionTrailing(
              value: l10n.waitImmediate,
              caption: l10n.waitNoQueue,
              color: AppColors.okDark,
              captionColor: AppColors.okText2,
            )
          : OptionTrailing(
              value: l10n.waitApproxShort(
                BookingLabels.approx(queue.waitMinutes),
              ),
              caption: l10n.peopleAheadOfYou(queue.peopleAhead),
            ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                l10n.barberAnyTitle,
                style: AppTypography.bodyStrong.copyWith(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: titleColor,
                ),
              ),
              if (isNow)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 7,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    l10n.barberFastestBadge,
                    style: AppTypography.badge.copyWith(
                      fontSize: 10.5,
                      color: AppColors.onPrimary,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 3),
          Text(
            isNow ? l10n.barberAnySubtitle : l10n.barberAnySlotSubtitle,
            style: AppTypography.metaStrong.copyWith(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: selected ? AppColors.tealDark : AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _NamedBarberOption extends StatelessWidget {
  const _NamedBarberOption({
    required this.barber,
    required this.timing,
    required this.salonWaitMinutes,
    required this.selected,
  });

  final Barber barber;
  final BookingTiming timing;
  final int salonWaitMinutes;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    final (bool enabled, String? note, Widget? trailing) = switch (timing) {
      JoinNow() => switch (barber.availability) {
        BarberOff() => (false, l10n.barberNotInToday, null),
        BarberWorking(:final queue) when queue.peopleAhead == 0 => (
          true,
          null,
          OptionTrailing(
            value: l10n.waitImmediate,
            caption: l10n.barberFree,
            color: AppColors.okDark,
          ),
        ),
        BarberWorking(:final queue) => (
          true,
          null,
          OptionTrailing(
            value: queue.waitMinutes > salonWaitMinutes
                ? l10n.waitExtraMinutes(
                    BookingLabels.extra(queue.waitMinutes - salonWaitMinutes),
                  )
                : l10n.waitApproxShort(BookingLabels.approx(queue.waitMinutes)),
            caption: l10n.peopleAheadOfBarber(queue.peopleAhead),
            color: queue.waitMinutes > salonWaitMinutes
                ? AppColors.warnText
                : AppColors.textPrimary,
          ),
        ),
      },
      ScheduledSlot(:final start, :final freeBarberIds) =>
        freeBarberIds.contains(barber.id)
            ? (
                true,
                null,
                OptionTrailing(
                  value: l10n.barberFree,
                  caption: context.fmt.time(start),
                  color: AppColors.okDark,
                ),
              )
            : (false, l10n.barberBusyAtSlot, null),
    };

    return SelectableOptionCard(
      selected: selected,
      enabled: enabled,
      onTap: () => context.read<BookingBarberCubit>().selectBarber(barber),
      semanticLabel: barber.name,
      leading: AppAvatar(
        name: barber.name,
        size: 42,
        imageUrl: barber.imageUrl,
        tone: AppAvatarTone.neutral,
      ),
      trailing: trailing,
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
                  style: AppTypography.bodyStrong.copyWith(fontSize: 14.5),
                ),
              ),
              if (barber.rating != null && enabled) ...[
                const SizedBox(width: 7),
                RatingLabel(rating: barber.rating!),
              ],
            ],
          ),
          const SizedBox(height: 2),
          Text(
            note ?? barber.specialty,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.meta,
          ),
        ],
      ),
    );
  }
}
