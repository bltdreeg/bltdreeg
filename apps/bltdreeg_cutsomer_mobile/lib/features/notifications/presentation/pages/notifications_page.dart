import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/generated/app_localizations.dart';
import '../../../../core/localization/time_ago.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/app_notification.dart';
import '../notifications_cubit.dart';

/// Frames 32-33. Queue notifications get a colored side bar so they read
/// differently from offers at a glance.
class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<NotificationsCubit>(),
      child: const _NotificationsView(),
    );
  }
}

class _NotificationsView extends StatelessWidget {
  const _NotificationsView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<NotificationsCubit>().state;
    final cubit = context.read<NotificationsCubit>();
    final now = DateTime.now();
    final groups = state.groupedBy(now);

    return Scaffold(
      appBar: AppTopBar(
        title: l10n.notificationsTitle,
        large: true,
        actions: [
          if (state.unread > 0)
            AppLinkButton(
              label: l10n.markAllRead,
              fontSize: 13,
              onPressed: cubit.markAllRead,
            ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: AppMotion.medium,
        child: state.isEmpty
            ? Center(
                child: EmptyStateView(
                  illustration: const AppIllustration(
                    AppAssets.illustrationNotificationsEmpty,
                    width: 170,
                  ),
                  title: l10n.notificationsEmptyTitle,
                  message: l10n.notificationsEmptyBody,
                  primaryLabel: l10n.notificationsEmptyCta,
                  onPrimary: context.goSearch,
                ),
              )
            : RefreshIndicator.adaptive(
                onRefresh: cubit.refresh,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.gutter,
                    0,
                    AppSpacing.gutter,
                    24,
                  ),
                  children: [
                    for (final group in NotificationGroup.values)
                      if (groups[group] case final items?) ...[
                        GroupLabel(
                          _groupLabel(l10n, group),
                          padding: const EdgeInsetsDirectional.only(
                            top: 8,
                            bottom: 8,
                          ),
                        ),
                        for (final item in items)
                          _NotificationRow(
                            key: ValueKey(item.id),
                            item: item,
                            now: now,
                          ),
                        const SizedBox(height: 10),
                      ],
                  ],
                ),
              ),
      ),
    );
  }

  static String _groupLabel(AppLocalizations l10n, NotificationGroup group) =>
      switch (group) {
        NotificationGroup.today => l10n.groupToday,
        NotificationGroup.thisWeek => l10n.groupThisWeek,
        NotificationGroup.earlier => l10n.groupEarlier,
      };
}

class _NotificationRow extends StatelessWidget {
  const _NotificationRow({required this.item, required this.now, super.key});

  final AppNotification item;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    // Only the two act-now kinds get the colored side bar (frame 32);
    // everything else, including read ones, is a plain row.
    final highlighted =
        !item.isRead &&
        (item.kind == NotificationKind.yourTurn ||
            item.kind == NotificationKind.almostUp);
    final tone = switch (item.kind) {
      NotificationKind.yourTurn => AppTone.primary,
      NotificationKind.almostUp => AppTone.warning,
      _ => AppTone.neutral,
    };
    final fg = highlighted ? tone.foreground : AppColors.textPrimary;
    final bodyColor = highlighted ? tone.foreground : AppColors.textSecondary;
    final iconColor = switch (item.kind) {
      NotificationKind.yourTurn => AppColors.tealDark,
      NotificationKind.almostUp => AppColors.warnText,
      NotificationKind.offer => AppColors.primary,
      NotificationKind.rateReminder => AppColors.rating,
      NotificationKind.cancelled => AppColors.error,
      NotificationKind.queueMoved => AppColors.textSecondary,
    };

    return AppPressable(
      onTap: () {
        context.read<NotificationsCubit>().markRead(item.id);
        _open(context);
      },
      pressedScale: 0.99,
      child: Container(
        margin: EdgeInsets.only(bottom: highlighted ? 9 : 0),
        padding: const EdgeInsets.all(13),
        decoration: BoxDecoration(
          color: highlighted ? tone.background : null,
          borderRadius: highlighted ? BorderRadius.circular(12) : null,
          border: highlighted
              ? BorderDirectional(
                  start: BorderSide(color: tone.solid, width: 3),
                )
              : const Border(bottom: BorderSide(color: AppColors.divider)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: AppIcon(_icon(item.kind), color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: AppTypography.bodyStrong.copyWith(
                      fontSize: 14.5,
                      fontWeight: highlighted
                          ? FontWeight.w800
                          : FontWeight.w700,
                      color: fg,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    item.body,
                    style: AppTypography.bodySm.copyWith(
                      color: bodyColor,
                      fontWeight: highlighted
                          ? FontWeight.w600
                          : FontWeight.w400,
                      height: 1.7,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    l10n.timeAgo(item.createdAt, now),
                    style: AppTypography.caption.copyWith(
                      color: highlighted ? bodyColor : null,
                    ),
                  ),
                ],
              ),
            ),
            if (!item.isRead)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Semantics(
                  label: l10n.a11yUnread,
                  child: StatusDot(
                    color: item.kind.isQueue ? tone.solid : AppColors.primary,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _open(BuildContext context) {
    switch (item.kind) {
      case NotificationKind.yourTurn:
      case NotificationKind.almostUp:
      case NotificationKind.queueMoved:
      case NotificationKind.cancelled:
        if (item.bookingId case final id?) context.pushQueue(id);
      case NotificationKind.rateReminder:
        if (item.bookingId case final id?) context.pushRateVisit(id);
      case NotificationKind.offer:
        if (item.salonId case final id?) context.pushSalon(id);
    }
  }

  static String _icon(NotificationKind kind) => switch (kind) {
    NotificationKind.yourTurn ||
    NotificationKind.queueMoved => AppAssets.iconUsers,
    NotificationKind.almostUp => AppAssets.iconNavigation,
    NotificationKind.offer => AppAssets.iconGift,
    NotificationKind.rateReminder => AppAssets.iconStarFilled,
    NotificationKind.cancelled => AppAssets.iconClose,
  };
}
