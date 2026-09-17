import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/localization/generated/app_localizations.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salon_details/domain/salon_details.dart';
import '../../domain/booking.dart';
import '../../domain/booking_draft.dart';
import '../booking_flow_cubits.dart';

/// Shared frame of the three booking steps: top bar with back, the
/// "الخطوة X من 3" indicator, the body and a sticky footer. Handles the
/// salon still loading or failing, and drafts that can't reach this step
/// (deep links, or a draft cleared by an earlier confirmation).
class BookingStepScaffold extends StatelessWidget {
  const BookingStepScaffold({
    required this.title,
    required this.step,
    required this.flow,
    required this.isStepReachable,
    required this.onRetry,
    required this.bodyBuilder,
    this.footer,
    super.key,
  });

  static const totalSteps = 3;

  final String title;

  /// 1-based.
  final int step;
  final BookingFlow flow;
  final bool isStepReachable;
  final VoidCallback onRetry;
  final Widget Function(BuildContext context, SalonDetails details) bodyBuilder;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final details = flow.details;

    final Widget body;
    if (!isStepReachable) {
      body = Center(
        child: EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationEmptyBookings,
            width: 170,
          ),
          title: l10n.bookingIncompleteTitle,
          message: l10n.bookingIncompleteBody,
          primaryLabel: l10n.actionBackToSalon,
          onPrimary: () => context.goSalon(flow.draft.salonId),
        ),
      );
    } else if (details == null) {
      body = switch (flow.snapshot.failure) {
        null => const Center(child: CircularProgressIndicator()),
        NetworkFailure() => NoConnectionView(onRetry: onRetry),
        final failure => Center(
          child: EmptyStateView(
            illustration: const AppIllustration(
              AppAssets.illustrationSearchNoResults,
              width: 170,
            ),
            title: l10n.loadErrorTitle,
            message: failure.message(l10n),
            primaryLabel: l10n.actionRetry,
            onPrimary: onRetry,
          ),
        ),
      };
    } else {
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.gutter,
              16,
              AppSpacing.gutter,
              0,
            ),
            child: StepProgress(current: step, total: totalSteps),
          ),
          Expanded(child: bodyBuilder(context, details)),
        ],
      );
    }

    final ready = isStepReachable && details != null;
    return Scaffold(
      appBar: AppTopBar(title: title),
      body: AnimatedSwitcher(
        duration: AppMotion.medium,
        child: KeyedSubtree(
          key: ValueKey((ready, isStepReachable)),
          child: body,
        ),
      ),
      bottomNavigationBar: ready && footer != null
          ? StickyBottomBar(child: footer!)
          : null,
    );
  }
}

/// Radio card from frame 24: bold teal frame when selected, faded when
/// unavailable.
class SelectableOptionCard extends StatelessWidget {
  const SelectableOptionCard({
    required this.selected,
    required this.onTap,
    required this.child,
    this.enabled = true,
    this.leading,
    this.trailing,
    this.semanticLabel,
    super.key,
  });

  final bool selected;
  final bool enabled;
  final VoidCallback onTap;
  final Widget child;

  /// Shown between the radio and [child] (barber avatar).
  final Widget? leading;
  final Widget? trailing;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final active = selected && enabled;
    return Semantics(
      selected: active,
      inMutuallyExclusiveGroup: true,
      child: AppPressable(
        onTap: enabled ? onTap : null,
        enabled: enabled,
        semanticLabel: semanticLabel,
        pressedScale: 0.98,
        child: AnimatedOpacity(
          duration: AppMotion.fast,
          opacity: enabled ? 1 : 0.55,
          child: AnimatedContainer(
            duration: AppMotion.fast,
            curve: AppMotion.standard,
            margin: const EdgeInsets.only(bottom: 10),
            // Keeps the content still when the border thickens.
            padding: EdgeInsets.all(active ? 13 : 14),
            decoration: BoxDecoration(
              color: active ? AppColors.tealTint : AppColors.bg,
              borderRadius: AppRadius.cardAll,
              border: Border.all(
                color: active ? AppColors.primary : AppColors.border,
                width: active ? 2 : 1,
              ),
            ),
            child: Row(
              children: [
                AppRadio(selected: active, enabled: enabled),
                const SizedBox(width: 12),
                if (leading != null) ...[leading!, const SizedBox(width: 12)],
                Expanded(child: child),
                if (trailing != null) ...[const SizedBox(width: 10), trailing!],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Two-line value on the end side of an option card ("فوراً" / "مفيش دور").
class OptionTrailing extends StatelessWidget {
  const OptionTrailing({
    required this.value,
    required this.caption,
    this.color = AppColors.textPrimary,
    this.captionColor,
    super.key,
  });

  final String value;
  final String caption;
  final Color color;
  final Color? captionColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: AppTypography.bodyStrong.copyWith(
            fontSize: 13.5,
            fontWeight: FontWeight.w800,
            color: color,
          ),
        ),
        Text(
          caption,
          style: AppTypography.caption.copyWith(color: captionColor),
        ),
      ],
    );
  }
}

extension BookingTimingL10n on BookingTiming {
  String label(BuildContext context) => switch (this) {
    JoinNow() => context.l10n.timingNowLabel,
    ScheduledSlot(:final start) => context.l10n.slotDateTime(
      BookingLabels.day(context, start),
      context.fmt.time(start),
    ),
  };
}

extension BarberChoiceL10n on BarberChoice {
  String label(AppLocalizations l10n) => switch (this) {
    AnyBarber() => l10n.barberAnyTitle,
    NamedBarber(:final name) => name,
  };
}

abstract final class BookingLabels {
  // Signs and "~" are bidi-neutral: without an LTR isolate an RTL line
  // renders "+20" as "20+".
  static String extra(int minutes) => '+$minutes'.ltrIsolate;

  static String approx(int minutes) => '~$minutes'.ltrIsolate;

  /// "النهارده" / "بكرة" / "الخميس 18 سبتمبر".
  static String day(BuildContext context, DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final day = DateTime(date.year, date.month, date.day);
    return switch (day.difference(today).inDays) {
      0 => context.l10n.dayToday,
      1 => context.l10n.dayTomorrow,
      _ => context.fmt.weekdayDayMonth(date),
    };
  }

  static String failure(AppLocalizations l10n, Failure failure) =>
      switch (failure) {
        RuleFailure(code: BookingRuleCodes.slotTaken) =>
          l10n.bookingErrorSlotTaken,
        RuleFailure(code: BookingRuleCodes.barberUnavailable) =>
          l10n.bookingErrorBarberUnavailable,
        RuleFailure(code: BookingRuleCodes.salonClosed) =>
          l10n.bookingErrorSalonClosed,
        RuleFailure(code: BookingRuleCodes.alreadyInQueue) =>
          l10n.bookingErrorAlreadyInQueue,
        _ => failure.message(l10n),
      };
}
