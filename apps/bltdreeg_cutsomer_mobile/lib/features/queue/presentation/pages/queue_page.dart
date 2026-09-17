import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/localization/generated/app_localizations.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/utils/external_links.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../booking/domain/booking.dart';
import '../../../booking/domain/booking_draft.dart';
import '../../../booking/presentation/widgets/booking_widgets.dart';
import '../../../booking/presentation/widgets/queue_joined_illustration.dart';
import '../../../salon_details/domain/salon_details.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../queue_bloc.dart';
import '../widgets/your_turn_illustration.dart';

/// Frames 27-30: the live queue. Stays open and updates as the queue moves;
/// only the card, the stage bar and the banner change color, the page stays
/// white.
class QueuePage extends StatelessWidget {
  const QueuePage({required this.bookingId, super.key});

  final String bookingId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          sl<QueueBloc>(param1: bookingId)..add(const QueueStarted()),
      child: const _QueueView(),
    );
  }
}

class _QueueView extends StatelessWidget {
  const _QueueView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<QueueBloc>().state;
    final bloc = context.read<QueueBloc>();
    final booking = state.booking;
    final stage = state.stage;

    final Widget body = switch ((booking, state.snapshot.failure)) {
      (final Booking b, _) => switch (b.stage) {
        QueueStage.waiting ||
        QueueStage.approaching => _TrackingView(state: state, booking: b),
        QueueStage.yourTurn => _YourTurnView(state: state, booking: b),
        QueueStage.inService => _InServiceView(state: state, booking: b),
        QueueStage.upcoming => _UpcomingView(state: state, booking: b),
        QueueStage.completed ||
        QueueStage.cancelled ||
        QueueStage.missed => _EndedView(booking: b),
      },
      (null, NetworkFailure()) => NoConnectionView(
        onRetry: () => bloc.add(const QueueRetryPressed()),
      ),
      (null, final Failure failure) => Center(
        child: EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationEmptyBookings,
            width: 170,
          ),
          title: l10n.bookingLoadFailed,
          message: failure.message(l10n),
          primaryLabel: l10n.actionRetry,
          onPrimary: () => bloc.add(const QueueRetryPressed()),
          secondaryLabel: l10n.backToHome,
          onSecondary: context.goHome,
        ),
      ),
      (null, null) => const Center(child: CircularProgressIndicator()),
    };

    final ongoing = switch (stage) {
      QueueStage.waiting ||
      QueueStage.approaching ||
      QueueStage.yourTurn ||
      QueueStage.inService => true,
      _ => false,
    };

    return _QueueEffects(
      child: Scaffold(
        appBar: AppTopBar(
          title: stage == QueueStage.yourTurn ? null : l10n.queueTitle,
          // At the front the customer should act, not browse away.
          leading: stage == QueueStage.yourTurn
              ? TopBarLeading.none
              : TopBarLeading.back,
          onLeadingPressed: context.popOrGoHome,
          actions: [if (ongoing) LiveIndicator(active: state.snapshot.isLive)],
        ),
        body: AnimatedSwitcher(
          duration: AppMotion.medium,
          switchInCurve: AppMotion.standard,
          child: KeyedSubtree(
            // Waiting and approaching share a layout that animates in place.
            key: ValueKey(switch (stage) {
              QueueStage.approaching => QueueStage.waiting,
              final s => s,
            }),
            child: body,
          ),
        ),
      ),
    );
  }
}

/// Haptics on stage changes and toasts for action results.
class _QueueEffects extends StatelessWidget {
  const _QueueEffects({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return MultiBlocListener(
      listeners: [
        BlocListener<QueueBloc, QueueState>(
          listenWhen: (a, b) =>
              a.stage != null && b.stage != null && a.stage != b.stage,
          listener: (context, state) {
            switch (state.stage) {
              case QueueStage.yourTurn:
                unawaited(AppHaptics.alert());
              case QueueStage.approaching || QueueStage.completed:
                unawaited(AppHaptics.success());
              case QueueStage.waiting when state.booking!.postponeUsed:
                context.showToast(l10n.postponedToast);
              case _:
                break;
            }
          },
        ),
        BlocListener<QueueBloc, QueueState>(
          listenWhen: (a, b) =>
              b.actionFailure != null && a.actionFailure != b.actionFailure,
          listener: (context, state) {
            context.showToast(_actionError(l10n, state.actionFailure!));
            context.read<QueueBloc>().add(const QueueErrorDismissed());
          },
        ),
      ],
      child: child,
    );
  }

  static String _actionError(AppLocalizations l10n, Failure failure) =>
      switch (failure) {
        NetworkFailure() => l10n.queueActionOffline,
        RuleFailure(code: BookingRuleCodes.notYourTurn) =>
          l10n.queueErrorNotYourTurn,
        RuleFailure(code: BookingRuleCodes.postponeUsed) =>
          l10n.queueErrorPostponeUsed,
        RuleFailure(code: BookingRuleCodes.bookingFinished) =>
          l10n.queueErrorFinished,
        _ => failure.message(l10n),
      };
}

// ---- frames 27 / 28 ------------------------------------------------------------------

class _TrackingView extends StatelessWidget {
  const _TrackingView({required this.state, required this.booking});

  final QueueState state;
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final approaching = booking.stage == QueueStage.approaching;
    final salon = state.salon;
    final travel = salon == null
        ? null
        : _travelMinutes(salon.summary.distanceKm);

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.gutter,
        0,
        AppSpacing.gutter,
        24,
      ),
      children: [
        AnimatedSize(
          duration: AppMotion.medium,
          curve: AppMotion.standard,
          child: approaching
              ? Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: _MoveNowBanner(
                    travelMinutes: travel,
                    waitMinutes: booking.waitMinutes,
                  ),
                )
              : const SizedBox(width: double.infinity),
        ),
        SizedBox(height: approaching ? 14 : 18),
        _TicketCard(booking: booking, approaching: approaching),
        const SizedBox(height: 20),
        _StageBar(stage: booking.stage),
        const SizedBox(height: 20),
        _StatsCard(
          stats: [
            (
              l10n.expectedTimeLabel,
              l10n.waitApproxSpaced(booking.waitMinutes),
            ),
            if (approaching)
              (
                l10n.distanceLabel,
                salon == null
                    ? '—'
                    : l10n.distanceKm(fmt.distanceKm(salon.summary.distanceKm)),
              )
            else
              (
                l10n.leaveAtLabel,
                switch (travel) {
                  null => '—',
                  final t => _leaveAt(
                    context,
                    state.now.add(Duration(minutes: booking.waitMinutes - t)),
                    state.now,
                  ),
                },
              ),
          ],
        ),
        if (approaching) ...[
          const SizedBox(height: 16),
          AppButton(
            label: l10n.openDirectionsToSalon,
            icon: AppAssets.iconNavigation,
            height: 52,
            onPressed: () => ExternalLinks.directions(
              context,
              latitude: booking.latitude,
              longitude: booking.longitude,
            ),
          ),
        ] else ...[
          if (salon != null) ...[
            const SizedBox(height: 10),
            _LiveNowCard(salon: salon),
          ],
          const SizedBox(height: 10),
          _SalonCard(booking: booking, salon: salon),
        ],
        const SizedBox(height: 14),
        _LeaveButton(state: state, booking: booking),
      ],
    );
  }

  static String _leaveAt(BuildContext context, DateTime at, DateTime now) =>
      at.isAfter(now) ? context.fmt.time(at) : context.l10n.leaveAtNow;
}

/// City driving at roughly 12 km/h door to door (same as the review step).
int _travelMinutes(double km) => (km * 5).ceil().clamp(1, 999);

class _MoveNowBanner extends StatelessWidget {
  const _MoveNowBanner({
    required this.travelMinutes,
    required this.waitMinutes,
  });

  final int? travelMinutes;
  final int waitMinutes;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.warning,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            const AppIcon(AppAssets.iconNavigation, color: AppColors.onWarn),
            const SizedBox(width: 11),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.moveNowTitle,
                    style: AppTypography.bodyStrong.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.onWarn,
                    ),
                  ),
                  if (travelMinutes != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      l10n.moveNowBody(travelMinutes!, waitMinutes),
                      style: AppTypography.metaStrong.copyWith(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onWarn,
                      ),
                    ),
                  ],
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
  const _TicketCard({required this.booking, required this.approaching});

  final Booking booking;
  final bool approaching;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final tone = approaching ? AppTone.warning : AppTone.primary;
    final fg = approaching ? AppColors.warnText : AppColors.tealDark;
    final number = approaching ? AppColors.warnText : AppColors.primary;
    final ahead = l10n.queueAheadPeople(booking.peopleAhead);

    return Semantics(
      liveRegion: true,
      label: '${l10n.ticketNumberLabel} ${booking.ticketNumber}، $ahead',
      excludeSemantics: true,
      child: AnimatedContainer(
        duration: AppMotion.medium,
        padding: const EdgeInsets.fromLTRB(18, 22, 18, 22),
        decoration: BoxDecoration(
          color: tone.background,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: tone.border),
        ),
        child: Column(
          children: [
            Text(
              l10n.ticketNumberLabel,
              style: AppTypography.metaStrong.copyWith(
                fontSize: 12.5,
                fontWeight: FontWeight.w800,
                color: fg,
              ),
            ),
            const SizedBox(height: 2),
            AnimatedDefaultTextStyle(
              duration: AppMotion.medium,
              style: AppTypography.queueNumber.copyWith(color: number),
              child: Text(context.fmt.number(booking.ticketNumber ?? 0)),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: const BoxDecoration(
                color: AppColors.bg,
                borderRadius: AppRadius.pillAll,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppIcon(
                    AppAssets.iconUsers,
                    size: AppSizes.iconSm,
                    color: fg,
                  ),
                  const SizedBox(width: 7),
                  AnimatedSwitcher(
                    duration: AppMotion.medium,
                    transitionBuilder: (child, animation) => FadeTransition(
                      opacity: animation,
                      child: SlideTransition(
                        position: Tween(
                          begin: const Offset(0, 0.4),
                          end: Offset.zero,
                        ).animate(animation),
                        child: child,
                      ),
                    ),
                    child: Text(
                      ahead,
                      key: ValueKey(booking.peopleAhead),
                      style: AppTypography.bodyStrong.copyWith(
                        fontWeight: FontWeight.w800,
                        color: fg,
                      ),
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

/// Four segments under three labels: joined, almost up, your turn.
class _StageBar extends StatelessWidget {
  const _StageBar({required this.stage});

  final QueueStage stage;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    const line = AppColors.divider;
    const teal = AppColors.primary;
    final colors = switch (stage) {
      QueueStage.waiting => const [teal, line, line, line],
      QueueStage.approaching => const [teal, teal, AppColors.warning, line],
      _ => const [teal, teal, teal, AppColors.success],
    };
    final active = switch (stage) {
      QueueStage.waiting => 0,
      QueueStage.approaching => 1,
      _ => 2,
    };
    final activeColor = stage == QueueStage.approaching
        ? AppColors.warnText
        : AppColors.primary;
    final labels = [
      l10n.stageJoined,
      l10n.stageApproaching,
      l10n.stageYourTurn,
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SegmentedProgressBar(colors: colors, height: 6),
        const SizedBox(height: 9),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            for (var i = 0; i < labels.length; i++)
              Text(
                labels[i],
                style: AppTypography.caption.copyWith(
                  fontSize: 11.5,
                  fontWeight: i == active ? FontWeight.w800 : FontWeight.w600,
                  color: i == active ? activeColor : AppColors.textSecondary,
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _StatsCard extends StatelessWidget {
  const _StatsCard({required this.stats});

  final List<(String label, String value)> stats;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surf,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            for (var i = 0; i < stats.length; i++) ...[
              if (i > 0)
                const VerticalDivider(
                  width: 32,
                  indent: 2,
                  endIndent: 2,
                  color: AppColors.border,
                ),
              Expanded(
                child: Column(
                  children: [
                    Text(
                      stats[i].$1,
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 3),
                    AnimatedSwitcher(
                      duration: AppMotion.fast,
                      child: Text(
                        stats[i].$2,
                        key: ValueKey(stats[i].$2),
                        style: AppTypography.titleMd.copyWith(fontSize: 21),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _LiveNowCard extends StatelessWidget {
  const _LiveNowCard({required this.salon});

  final SalonDetails salon;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final names = [for (final b in salon.barbersOnShift) b.name];
    Widget row(String icon, String text) => Row(
      children: [
        AppIcon(icon, size: AppSizes.iconSm, color: AppColors.success),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: AppTypography.body.copyWith(
              fontSize: 13.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );

    return _OutlinedCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GroupLabel(
            l10n.liveNowHeader,
            padding: const EdgeInsets.only(bottom: 12),
          ),
          row(AppAssets.iconChair, l10n.chairsActive(salon.chairsActive)),
          if (names.isNotEmpty) ...[
            const SizedBox(height: 11),
            row(
              AppAssets.iconUsers,
              l10n.barbersOnShiftNamed(_joinNames(l10n, names)),
            ),
          ],
        ],
      ),
    );
  }
}

String _joinNames(AppLocalizations l10n, List<String> names) => switch (names) {
  [final only] => only,
  [...final rest, final last] => l10n.listTwo(
    rest.join(l10n.listSeparator),
    last,
  ),
  [] => '',
};

class _SalonCard extends StatelessWidget {
  const _SalonCard({required this.booking, required this.salon});

  final Booking booking;
  final SalonDetails? salon;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return _OutlinedCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        children: [
          Row(
            children: [
              SalonThumbnail(
                imageUrl: salon?.summary.imageUrl,
                size: 48,
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
                      style: AppTypography.bodyStrong.copyWith(fontSize: 14.5),
                    ),
                    const SizedBox(height: 2),
                    MetaRow(
                      items: [
                        booking.services
                            .map((s) => s.name)
                            .join(l10n.servicesJoiner),
                        Text(
                          SalonLabels.price(context, booking.quote.total),
                          style: AppTypography.metaStrong.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 13),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: l10n.actionDirections,
                  variant: AppButtonVariant.secondary,
                  icon: AppAssets.iconNavigation,
                  height: 42,
                  fontSize: 13.5,
                  onPressed: () => ExternalLinks.directions(
                    context,
                    latitude: booking.latitude,
                    longitude: booking.longitude,
                  ),
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: AppButton(
                  label: l10n.actionCall,
                  variant: AppButtonVariant.secondary,
                  icon: AppAssets.iconPhone,
                  height: 42,
                  fontSize: 13.5,
                  onPressed: salon == null
                      ? null
                      : () => ExternalLinks.open(
                          context,
                          Uri(scheme: 'tel', path: salon!.phone),
                        ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _OutlinedCard extends StatelessWidget {
  const _OutlinedCard({
    required this.child,
    this.padding = const EdgeInsets.all(16),
  });

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}

/// Frame 30: the confirmation spells out what leaving really costs.
class _LeaveButton extends StatelessWidget {
  const _LeaveButton({
    required this.state,
    required this.booking,
    this.asLink = false,
  });

  final QueueState state;
  final Booking booking;

  /// Quiet text link instead of the outlined button.
  final bool asLink;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isQueue = booking.isQueue;
    final label = isQueue ? l10n.leaveQueue : l10n.cancelBooking;
    final VoidCallback? onPressed = state.isBusy
        ? null
        : () async {
            final bloc = context.read<QueueBloc>();
            final confirmed = isQueue
                ? await showAppConfirmDialog(
                    context,
                    title: l10n.leaveDialogTitle,
                    message: l10n.leaveDialogBody(booking.ticketNumber ?? 0),
                    note: l10n.leaveDialogNote,
                    icon: AppAssets.iconLogout,
                    confirmLabel: l10n.leaveDialogConfirm,
                    cancelLabel: l10n.leaveDialogStay,
                  )
                : await showAppConfirmDialog(
                    context,
                    title: l10n.cancelDialogTitle,
                    message: l10n.cancelDialogBody(
                      booking.timing.label(context),
                    ),
                    icon: AppAssets.iconCalendar,
                    confirmLabel: l10n.cancelDialogConfirm,
                    cancelLabel: l10n.cancelDialogKeep,
                  );
            if (confirmed) bloc.add(const QueueLeaveConfirmed());
          };
    if (asLink) {
      return AppLinkButton(
        label: label,
        color: AppColors.error,
        onPressed: onPressed,
      );
    }
    return AppButton(
      label: label,
      variant: AppButtonVariant.dangerOutline,
      height: 46,
      fontSize: 14,
      isLoading: state.pending == QueueAction.leave,
      onPressed: onPressed,
    );
  }
}

// ---- frame 29 --------------------------------------------------------------------------

class _YourTurnView extends StatelessWidget {
  const _YourTurnView({required this.state, required this.booking});

  final QueueState state;
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final bloc = context.read<QueueBloc>();
    const fg = AppColors.okDark;
    const caption = AppColors.okText2;
    final statLabel = AppTypography.caption.copyWith(
      fontSize: 12,
      fontWeight: FontWeight.w700,
      color: caption,
    );
    final statValue = AppTypography.displaySm.copyWith(color: fg);

    return Column(
      children: [
        Expanded(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const YourTurnIllustration(),
                  const SizedBox(height: 16),
                  Semantics(
                    header: true,
                    liveRegion: true,
                    child: Text(
                      l10n.yourTurnTitle,
                      style: AppTypography.displayXs.copyWith(color: fg),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    switch (booking.barberName) {
                      final name? => l10n.yourTurnBarberWaiting(name),
                      null => l10n.yourTurnAnyBarber,
                    },
                    textAlign: TextAlign.center,
                    style: AppTypography.body.copyWith(
                      fontSize: 15.5,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 22),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 26,
                      vertical: 16,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.okTint,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.okBorder),
                    ),
                    child: IntrinsicHeight(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Column(
                            children: [
                              Text(l10n.yourNumberLabel, style: statLabel),
                              Text(
                                fmt.number(booking.ticketNumber ?? 0),
                                style: statValue,
                              ),
                            ],
                          ),
                          const VerticalDivider(
                            width: 52,
                            color: AppColors.okBorder,
                          ),
                          Semantics(
                            label: l10n.timeLeftLabel,
                            value: fmt.countdown(state.turnTimeLeft),
                            child: Column(
                              children: [
                                Text(l10n.timeLeftLabel, style: statLabel),
                                ExcludeSemantics(
                                  child: Text(
                                    fmt.countdown(state.turnTimeLeft),
                                    style: statValue.copyWith(
                                      fontFeatures: const [
                                        FontFeature.tabularFigures(),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    booking.postponeUsed
                        ? l10n.yourTurnGraceNoteFinal
                        : l10n.yourTurnGraceNote,
                    textAlign: TextAlign.center,
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w600,
                      height: 1.7,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        SafeArea(
          top: false,
          minimum: const EdgeInsets.only(bottom: 28),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
            child: Column(
              children: [
                AppButton(
                  label: l10n.imAtSalon,
                  variant: AppButtonVariant.success,
                  height: 54,
                  fontSize: 17,
                  isLoading: state.pending == QueueAction.checkIn,
                  onPressed: state.isBusy
                      ? null
                      : () => bloc.add(const QueueCheckInPressed()),
                ),
                const SizedBox(height: 10),
                AppButton(
                  label: booking.postponeUsed
                      ? l10n.postponeUsedLabel
                      : l10n.postponeOne,
                  variant: AppButtonVariant.secondary,
                  height: 48,
                  fontSize: 14.5,
                  isLoading: state.pending == QueueAction.postpone,
                  onPressed: state.isBusy || booking.postponeUsed
                      ? null
                      : () => bloc.add(const QueuePostponePressed()),
                ),
                const SizedBox(height: 12),
                // Not on the board, but the back button is hidden here, so
                // this is the only way out for someone who can't make it.
                _LeaveButton(state: state, booking: booking, asLink: true),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ---- after the turn ------------------------------------------------------------------

class _InServiceView extends StatelessWidget {
  const _InServiceView({required this.state, required this.booking});

  final QueueState state;
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.gutter,
        48,
        AppSpacing.gutter,
        24,
      ),
      children: [
        Center(
          child: Container(
            width: 104,
            height: 104,
            decoration: const BoxDecoration(
              color: AppColors.okTint,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: const AppIcon(
              AppAssets.iconChair,
              size: 44,
              color: AppColors.okDark,
            ),
          ),
        ),
        const SizedBox(height: 18),
        Text(
          l10n.inServiceTitle,
          textAlign: TextAlign.center,
          style: AppTypography.emptyTitle.copyWith(fontSize: 24),
        ),
        const SizedBox(height: 8),
        Text(
          l10n.inServiceBody,
          textAlign: TextAlign.center,
          style: AppTypography.body.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 24),
        _SalonCard(booking: booking, salon: state.salon),
      ],
    );
  }
}

class _UpcomingView extends StatelessWidget {
  const _UpcomingView({required this.state, required this.booking});

  final QueueState state;
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final start = (booking.timing as ScheduledSlot).start;
    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.gutter,
        18,
        AppSpacing.gutter,
        24,
      ),
      children: [
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: AppColors.tealTint,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.tealTint2),
          ),
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
              const SizedBox(height: 4),
              Text(
                context.fmt.time(start),
                style: AppTypography.displayMd.copyWith(
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                BookingLabels.day(context, start),
                style: AppTypography.bodyStrong.copyWith(
                  color: AppColors.tealDark,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        _StatsCard(
          stats: [
            (
              l10n.reviewBarberLabel,
              booking.barberName ?? const AnyBarber().label(l10n),
            ),
            (l10n.durationLabel, l10n.durationMinutes(booking.totalMinutes)),
          ],
        ),
        const SizedBox(height: 10),
        _SalonCard(booking: booking, salon: state.salon),
        const SizedBox(height: 14),
        _LeaveButton(state: state, booking: booking),
      ],
    );
  }
}

class _EndedView extends StatelessWidget {
  const _EndedView({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Center(
      child: switch (booking.stage) {
        QueueStage.completed => EmptyStateView(
          illustration: const QueueJoinedIllustration(width: 130),
          title: l10n.completedTitle,
          message: l10n.completedBody(booking.salonName),
          primaryLabel: l10n.rateVisitAction,
          onPrimary: () => context.pushRateVisit(booking.id),
          secondaryLabel: l10n.backToHome,
          onSecondary: context.goHome,
          expandActions: true,
        ),
        QueueStage.missed => EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationEmptyBookings,
            width: 170,
          ),
          title: l10n.missedTitle,
          message: l10n.missedBody,
          primaryLabel: l10n.bookAgain,
          onPrimary: () => context.goSalon(booking.salonId),
          secondaryLabel: l10n.backToHome,
          onSecondary: context.goHome,
          expandActions: true,
        ),
        _ => EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationEmptyBookings,
            width: 170,
          ),
          title: booking.isQueue
              ? l10n.cancelledTitle
              : l10n.bookingCancelledTitle,
          message: booking.isQueue
              ? l10n.cancelledBody
              : l10n.bookingCancelledBody,
          primaryLabel: l10n.bookAgain,
          onPrimary: () => context.goSalon(booking.salonId),
          secondaryLabel: l10n.backToHome,
          onSecondary: context.goHome,
          expandActions: true,
        ),
      },
    );
  }
}
