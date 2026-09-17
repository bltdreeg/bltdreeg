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
import '../../../salon_details/domain/salon_details.dart';
import '../../domain/booking.dart';
import '../../domain/booking_draft.dart';
import '../booking_flow_cubits.dart';
import '../widgets/booking_widgets.dart';

/// Booking step 1 (added to the board): join the live queue now, or pick a
/// day and a time that fits the selected services.
class BookingSlotPage extends StatelessWidget {
  const BookingSlotPage({required this.salonId, super.key});

  final String salonId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<BookingSlotCubit>(param1: salonId),
      child: const _BookingSlotView(),
    );
  }
}

class _BookingSlotView extends StatelessWidget {
  const _BookingSlotView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<BookingSlotCubit>().state;
    final cubit = context.read<BookingSlotCubit>();

    return BookingStepScaffold(
      title: l10n.bookingWhenTitle,
      step: 1,
      flow: state.flow,
      isStepReachable: !state.flow.draft.isEmpty,
      onRetry: cubit.retryDetails,
      bodyBuilder: (context, details) => ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.gutter,
          18,
          AppSpacing.gutter,
          24,
        ),
        children: [
          _NowOption(details: details, state: state),
          SelectableOptionCard(
            selected: state.mode == TimingMode.schedule,
            onTap: cubit.selectSchedule,
            semanticLabel: l10n.bookingScheduleTitle,
            child: _OptionText(
              title: l10n.bookingScheduleTitle,
              subtitle: l10n.bookingScheduleSubtitle,
            ),
          ),
          AnimatedSize(
            duration: AppMotion.medium,
            curve: AppMotion.standard,
            alignment: Alignment.topCenter,
            child: state.mode == TimingMode.schedule
                ? _SchedulePicker(state: state)
                : const SizedBox(width: double.infinity),
          ),
        ],
      ),
      footer: AppButton(
        label: l10n.bookingContinueToBarber,
        onPressed: state.canContinue
            ? () => context.pushBookingBarber(state.flow.draft.salonId)
            : null,
      ),
    );
  }
}

class _NowOption extends StatelessWidget {
  const _NowOption({required this.details, required this.state});

  final SalonDetails details;
  final BookingSlotState state;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final queue = details.summary.queue;
    final live = state.flow.snapshot.isLive;
    return SelectableOptionCard(
      selected: state.mode == TimingMode.now,
      enabled: state.canJoinNow,
      onTap: context.read<BookingSlotCubit>().selectNow,
      semanticLabel: l10n.bookingNowTitle,
      trailing: live && state.canJoinNow ? const LiveIndicator() : null,
      child: _OptionText(
        title: l10n.bookingNowTitle,
        subtitle: !state.canJoinNow
            ? l10n.bookingNowClosed
            : live
            ? l10n.bookingNowWait(queue.peopleAhead, queue.waitMinutes)
            : l10n.waitNotUpdated,
      ),
    );
  }
}

class _OptionText extends StatelessWidget {
  const _OptionText({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: AppTypography.bodyStrong.copyWith(
            fontSize: 15,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 3),
        AnimatedSwitcher(
          duration: AppMotion.fast,
          child: Text(
            subtitle,
            key: ValueKey(subtitle),
            style: AppTypography.metaStrong.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _SchedulePicker extends StatelessWidget {
  const _SchedulePicker({required this.state});

  final BookingSlotState state;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final cubit = context.read<BookingSlotCubit>();
    final picked = switch (state.flow.draft.timing) {
      ScheduledSlot(:final start) => start,
      _ => null,
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 6),
        SizedBox(
          height: 56,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            itemCount: state.days.length,
            separatorBuilder: (_, _) => const SizedBox(width: 8),
            itemBuilder: (context, i) {
              final day = state.days[i];
              final top = switch (i) {
                0 => l10n.dayToday,
                1 => l10n.dayTomorrow,
                _ => fmt.weekdayShort(day),
              };
              return AppDateChip(
                topLabel: top,
                bottomLabel: fmt.dayMonth(day),
                selected: day == state.selectedDay,
                enabled: !state.isClosedOn(day),
                onTap: () => cubit.selectDay(day),
              );
            },
          ),
        ),
        const SizedBox(height: 18),
        AnimatedSwitcher(
          duration: AppMotion.medium,
          child: KeyedSubtree(
            key: ValueKey((
              state.selectedDay,
              state.selectedSchedule.runtimeType,
            )),
            child: switch (state.selectedSchedule) {
              null || ScheduleLoading() => const _SlotsSkeleton(),
              ScheduleFailed(:final failure) => AppNotice(
                tone: AppTone.danger,
                message: '${l10n.slotsLoadFailed} ${failure.message(l10n)}',
                action: AppLinkButton(
                  label: l10n.actionRetry,
                  onPressed: cubit.retrySchedule,
                ),
              ),
              ScheduleLoaded(:final schedule)
                  when schedule.slots.isEmpty &&
                      state.isClosedOn(schedule.day) =>
                AppNotice(message: l10n.slotsDayClosed),
              ScheduleLoaded(:final schedule) when !schedule.hasAvailability =>
                AppNotice(message: l10n.slotsDayFull),
              ScheduleLoaded(:final schedule) => _SlotGroups(
                schedule: schedule,
                picked: picked,
                onPick: cubit.selectSlot,
              ),
            },
          ),
        ),
        const SizedBox(height: 14),
        Text(
          l10n.bookingDurationNote(state.flow.draft.totalMinutes),
          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

enum _Period { morning, afternoon, evening }

class _SlotGroups extends StatelessWidget {
  const _SlotGroups({
    required this.schedule,
    required this.picked,
    required this.onPick,
  });

  final DaySchedule schedule;
  final DateTime? picked;
  final ValueChanged<TimeSlot> onPick;

  static _Period _periodOf(DaySchedule schedule, TimeSlot slot) {
    // Slots after midnight belong to the same working day's evening.
    if (slot.start.day != schedule.day.day) return _Period.evening;
    return switch (slot.start.hour) {
      < 12 => _Period.morning,
      < 17 => _Period.afternoon,
      _ => _Period.evening,
    };
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final groups = <_Period, List<TimeSlot>>{};
    for (final slot in schedule.slots) {
      groups.putIfAbsent(_periodOf(schedule, slot), () => []).add(slot);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final MapEntry(key: period, value: slots) in groups.entries) ...[
          Row(
            children: [
              AppIcon(
                switch (period) {
                  _Period.morning => AppAssets.iconSun,
                  _Period.afternoon => AppAssets.iconSunset,
                  _Period.evening => AppAssets.iconMoon,
                },
                size: AppSizes.iconSm,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(switch (period) {
                _Period.morning => l10n.slotPeriodMorning,
                _Period.afternoon => l10n.slotPeriodAfternoon,
                _Period.evening => l10n.slotPeriodEvening,
              }, style: AppTypography.groupLabel),
            ],
          ),
          const SizedBox(height: 8),
          LayoutBuilder(
            builder: (context, constraints) {
              const columns = 3;
              const gap = 8.0;
              final width =
                  (constraints.maxWidth - gap * (columns - 1)) / columns;
              return Wrap(
                spacing: gap,
                runSpacing: gap,
                children: [
                  for (final slot in slots)
                    SizedBox(
                      width: width,
                      child: _SlotChip(
                        label: fmt.time(slot.start),
                        selected: slot.start == picked,
                        available: slot.isAvailable,
                        onTap: () => onPick(slot),
                      ),
                    ),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
        ],
      ],
    );
  }
}

class _SlotChip extends StatelessWidget {
  const _SlotChip({
    required this.label,
    required this.selected,
    required this.available,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final bool available;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final fg = !available
        ? AppColors.textDisabled
        : selected
        ? AppColors.onPrimary
        : AppColors.textPrimary;
    return Semantics(
      selected: selected,
      child: AppPressable(
        onTap: available ? onTap : null,
        enabled: available,
        semanticLabel: available
            ? label
            : context.l10n.a11ySlotUnavailable(label),
        child: AnimatedContainer(
          duration: AppMotion.fast,
          height: 42,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: !available
                ? AppColors.surf
                : selected
                ? AppColors.primary
                : AppColors.bg,
            borderRadius: AppRadius.fieldAll,
            border: Border.all(
              color: selected ? AppColors.primary : AppColors.border,
            ),
          ),
          child: Text(
            label,
            style: AppTypography.label.copyWith(
              fontSize: 13.5,
              fontWeight: FontWeight.w700,
              color: fg,
              decoration: available ? null : TextDecoration.lineThrough,
              decorationColor: fg,
            ),
          ),
        ),
      ),
    );
  }
}

class _SlotsSkeleton extends StatelessWidget {
  const _SlotsSkeleton();

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width = (constraints.maxWidth - 16) / 3;
          return Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (var i = 0; i < 9; i++)
                SkeletonBox(width: width, height: 42, radius: AppRadius.field),
            ],
          );
        },
      ),
    );
  }
}
