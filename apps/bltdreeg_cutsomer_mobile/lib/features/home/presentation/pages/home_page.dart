import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/dev/dev_menu.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salons/domain/entities/search_criteria.dart';
import '../../../salons/presentation/widgets/area_picker_sheet.dart';
import '../../../salons/presentation/widgets/salon_items.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../home_cubit.dart';

/// Frames 07 (discover), 08 (offline with cache) and 18 (offline, no cache).
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<HomeCubit>(),
      child: const _HomeView(),
    );
  }
}

class _HomeView extends StatelessWidget {
  const _HomeView();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<HomeCubit>().state;
    final online = context.watchIsOnline;
    final snapshot = state.snapshot;
    final cubit = context.read<HomeCubit>();

    final Widget body;
    if (!snapshot.hasData) {
      body = switch (snapshot.failure) {
        null => const _HomeSkeleton(),
        NetworkFailure() => NoConnectionView(
          onRetry: cubit.refresh,
          isRetrying: snapshot.isRefreshing,
          onOpenLastBooking: context.goBookings,
        ),
        final failure => _HomeError(failure: failure, onRetry: cubit.refresh),
      };
    } else {
      body = RefreshIndicator(
        color: AppColors.primary,
        onRefresh: cubit.refresh,
        child: _HomeContent(state: state, online: online && snapshot.isLive),
      );
    }

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            OfflineBanner(
              visible: !online && snapshot.hasData,
              lastUpdated: snapshot.updatedAt,
              onRetry: cubit.refresh,
            ),
            Expanded(
              child: AnimatedSwitcher(
                duration: AppMotion.medium,
                child: KeyedSubtree(
                  key: ValueKey(body.runtimeType),
                  child: body,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.state, required this.online});

  final HomeState state;
  final bool online;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final lang = l10n.localeName;
    final area = state.area;
    final areaLabel = area == null
        ? ''
        : l10n.areaWithCity(area.name.of(lang), area.city.of(lang));

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 6, 20, 14),
      child: Row(
        children: [
          Expanded(
            child: AppPressable(
              onTap: () => showAreaPicker(context),
              semanticLabel: '${l10n.homeNearCaption} $areaLabel',
              pressedScale: 0.98,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.homeNearCaption, style: AppTypography.caption),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const AppIcon(
                        AppAssets.iconMapPin,
                        size: AppSizes.iconSm,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 5),
                      Flexible(
                        child: AnimatedSwitcher(
                          duration: AppMotion.fast,
                          child: Text(
                            areaLabel,
                            key: ValueKey(areaLabel),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.topBarTitle,
                          ),
                        ),
                      ),
                      const SizedBox(width: 5),
                      const AppIcon(
                        AppAssets.iconChevronDown,
                        size: AppSizes.iconSm,
                        color: AppColors.textSecondary,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          AppIconButton(
            icon: AppAssets.iconBell,
            size: 42,
            semanticLabel: l10n.a11yNotifications,
            onPressed: context.pushNotifications,
            onLongPress: () => showDevMenu(context),
          ),
        ],
      ),
    );
  }
}

class _SortChips extends StatelessWidget {
  const _SortChips({required this.state, required this.enabled});

  final HomeState state;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    const sorts = [
      SalonSort.leastWait,
      SalonSort.nearest,
      SalonSort.topRated,
      SalonSort.cheapest,
    ];
    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: IgnorePointer(
        ignoring: !enabled,
        child: ChipRail(
          children: [
            for (final sort in sorts)
              AppChip(
                label: sort.label(l10n),
                icon: sort == SalonSort.leastWait ? AppAssets.iconClock : null,
                selected: enabled && state.sort == sort,
                onTap: () => context.read<HomeCubit>().sortChanged(sort),
              ),
          ],
        ),
      ),
    );
  }
}

class _HomeContent extends StatelessWidget {
  const _HomeContent({required this.state, required this.online});

  final HomeState state;

  /// Online and receiving live queue data.
  final bool online;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final now = DateTime.now();
    final salons = state.snapshot.salons!;

    final search = Padding(
      padding: AppSpacing.pageH,
      child: AppSearchField(
        hint: online ? l10n.homeSearchHint : l10n.offlineSearchDisabled,
        height: 50,
        readOnly: true,
        enabled: online,
        onTap: online ? context.goSearch : null,
      ),
    );

    final slivers = <Widget>[
      SliverToBoxAdapter(
        child: _HomeHeader(state: state, online: online),
      ),
      SliverToBoxAdapter(child: search),
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.only(top: 14, bottom: 4),
          child: _SortChips(state: state, enabled: online),
        ),
      ),
    ];

    if (salons.isEmpty) {
      final areaName = state.area?.name.of(l10n.localeName) ?? '';
      slivers.add(
        SliverFillRemaining(
          hasScrollBody: false,
          child: EmptyStateView(
            illustration: const AppIllustration(
              AppAssets.illustrationSearchNoResults,
              width: 170,
            ),
            title: l10n.homeAreaEmptyTitle,
            message: l10n.homeAreaEmptyBody(areaName),
            primaryLabel: l10n.homeChangeArea,
            onPrimary: () => showAreaPicker(context),
          ),
        ),
      );
    } else if (!online) {
      slivers.addAll(_offlineSlivers(context, now));
    } else {
      slivers.addAll(_liveSlivers(context, now));
    }
    slivers.add(const SliverToBoxAdapter(child: SizedBox(height: 22)));

    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: slivers,
    );
  }

  List<Widget> _liveSlivers(BuildContext context, DateTime now) {
    final l10n = context.l10n;
    final available = state.availableNow(now);
    final recommended = state.recommended(now);
    final fresh = state.newInArea(now);

    return [
      if (available.isNotEmpty) ...[
        SliverToBoxAdapter(
          child: Padding(
            padding: AppSpacing.pageH,
            child: SectionHeader(
              title: l10n.homeAvailableNow,
              actionLabel: l10n.actionSeeAll,
              padding: const EdgeInsets.only(top: 22, bottom: 10),
              onAction: () => context.goSearch(
                sort: SalonSort.leastWait,
                openNowOnly: true,
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: HorizontalRail(
            itemCount: available.length,
            itemBuilder: (_, i) => SalonRailItem(salon: available[i], now: now),
          ),
        ),
        const SliverToBoxAdapter(child: SectionDivider()),
      ],
      SliverPadding(
        padding: AppSpacing.pageH,
        sliver: SliverList.list(
          children: [
            SectionHeader(
              title: l10n.homeRecommended,
              actionLabel: l10n.actionSeeAll,
              padding: const EdgeInsets.only(bottom: 12),
              onAction: () => context.goSearch(sort: state.sort),
            ),
            for (var i = 0; i < recommended.length; i++)
              SalonListItem(
                key: ValueKey(recommended[i].id),
                salon: recommended[i],
                now: now,
                showDivider: i < recommended.length - 1,
              ),
          ],
        ),
      ),
      if (fresh.isNotEmpty) ...[
        const SliverToBoxAdapter(child: SectionDivider()),
        SliverToBoxAdapter(
          child: Padding(
            padding: AppSpacing.pageH,
            child: SectionHeader(
              title: l10n.homeNewInArea,
              actionLabel: l10n.actionSeeAll,
              padding: const EdgeInsets.only(bottom: 12),
              onAction: () => context.goSearch(sort: SalonSort.newest),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: HorizontalRail(
            itemCount: fresh.length,
            itemBuilder: (_, i) =>
                SalonRailItem(salon: fresh[i], now: now, showNewBadge: true),
          ),
        ),
      ],
    ];
  }

  List<Widget> _offlineSlivers(BuildContext context, DateTime now) {
    final l10n = context.l10n;
    final lastSeen = state.lastSeen;
    return [
      SliverPadding(
        padding: AppSpacing.pageH,
        sliver: SliverList.list(
          children: [
            SectionHeader(title: l10n.homeLastSeen),
            for (var i = 0; i < lastSeen.length; i++)
              SalonListItem(
                salon: lastSeen[i],
                now: now,
                live: false,
                showDivider: i < lastSeen.length - 1,
              ),
            const SizedBox(height: 18),
            AppNotice(message: l10n.offlineQueueBlocked),
          ],
        ),
      ),
    ];
  }
}

class _HomeSkeleton extends StatelessWidget {
  const _HomeSkeleton();

  @override
  Widget build(BuildContext context) {
    return const Shimmer(
      child: SingleChildScrollView(
        physics: NeverScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(20, 12, 20, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SkeletonBox(width: 110, height: 10),
            SizedBox(height: 8),
            SkeletonBox(width: 170, height: 16),
            SizedBox(height: 18),
            SkeletonBox(height: 50, radius: AppRadius.field),
            SizedBox(height: 14),
            Row(
              children: [
                SkeletonBox(width: 120, height: 36, radius: AppRadius.pill),
                SizedBox(width: 8),
                SkeletonBox(width: 90, height: 36, radius: AppRadius.pill),
              ],
            ),
            SizedBox(height: 26),
            Row(
              children: [
                SalonRailCardSkeleton(),
                SizedBox(width: 12),
                Expanded(child: SalonRailCardSkeleton()),
              ],
            ),
            SizedBox(height: 24),
            SalonListTileSkeleton(),
            SalonListTileSkeleton(),
          ],
        ),
      ),
    );
  }
}

class _HomeError extends StatelessWidget {
  const _HomeError({required this.failure, required this.onRetry});

  final Failure failure;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Center(
      child: EmptyStateView(
        illustration: const AppIllustration(
          AppAssets.illustrationSearchNoResults,
          width: 170,
        ),
        title: l10n.loadErrorTitle,
        message: failure.message(l10n),
        primaryLabel: l10n.actionRetry,
        primaryIcon: AppAssets.iconRefresh,
        onPrimary: onRetry,
      ),
    );
  }
}
