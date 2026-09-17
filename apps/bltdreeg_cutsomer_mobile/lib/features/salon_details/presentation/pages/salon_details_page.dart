import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/utils/external_links.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../favorites/presentation/widgets/favorite_button.dart';
import '../../../salons/domain/entities/salon_summary.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../../domain/salon_details.dart';
import '../salon_details_cubit.dart';
import '../widgets/barbers_section.dart';
import '../widgets/offers_section.dart';
import '../widgets/reviews_hours_sections.dart';
import '../widgets/services_section.dart';

/// Frames 21–23: one scrolling page whose tabs jump to sections and follow
/// the scroll position.
class SalonDetailsPage extends StatelessWidget {
  const SalonDetailsPage({required this.salonId, super.key});

  final String salonId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<SalonDetailsCubit>(param1: salonId),
      child: const _SalonDetailsView(),
    );
  }
}

class _SalonDetailsView extends StatelessWidget {
  const _SalonDetailsView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final snapshot = context.select((SalonDetailsCubit c) => c.state.snapshot);
    final cubit = context.read<SalonDetailsCubit>();

    final Widget body;
    if (snapshot.details case final details?) {
      body = _Loaded(details: details, live: snapshot.isLive);
    } else {
      body = Scaffold(
        appBar: const AppTopBar(),
        body: switch (snapshot.failure) {
          null => const _DetailsSkeleton(),
          NetworkFailure() => NoConnectionView(onRetry: cubit.refresh),
          NotFoundFailure() => Center(
            child: EmptyStateView(
              illustration: const AppIllustration(
                AppAssets.illustrationSearchNoResults,
                width: 170,
              ),
              title: l10n.salonNotFoundTitle,
              message: l10n.salonNotFoundBody,
              primaryLabel: l10n.backToHome,
              onPrimary: context.goHome,
            ),
          ),
          final failure => Center(
            child: EmptyStateView(
              illustration: const AppIllustration(
                AppAssets.illustrationSearchNoResults,
                width: 170,
              ),
              title: l10n.loadErrorTitle,
              message: failure.message(l10n),
              primaryLabel: l10n.actionRetry,
              onPrimary: cubit.refresh,
            ),
          ),
        },
      );
    }
    return AnimatedSwitcher(
      duration: AppMotion.medium,
      child: KeyedSubtree(key: ValueKey(snapshot.hasData), child: body),
    );
  }
}

enum _Section { services, barbers, offers, reviews, hours }

class _Loaded extends StatefulWidget {
  const _Loaded({required this.details, required this.live});

  final SalonDetails details;
  final bool live;

  @override
  State<_Loaded> createState() => _LoadedState();
}

class _LoadedState extends State<_Loaded> {
  static const _tabsHeight = 49.0;

  final _scroll = ScrollController();
  final _keys = {for (final s in _Section.values) s: GlobalKey()};
  _Section _active = _Section.services;
  bool _jumping = false;

  double get _pinnedHeight =>
      MediaQuery.viewPaddingOf(context).top +
      _HeaderDelegate.collapsedBar +
      _tabsHeight;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_syncTab);
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  double? _offsetOf(_Section section) {
    final box = _keys[section]!.currentContext?.findRenderObject();
    if (box == null || !box.attached) return null;
    final viewport = RenderAbstractViewport.maybeOf(box);
    if (viewport == null) return null;
    return viewport.getOffsetToReveal(box, 0).offset - _pinnedHeight;
  }

  /// Scroll-spy: the active tab is the last section whose top has passed
  /// under the pinned tabs.
  void _syncTab() {
    if (_jumping) return;
    var active = _Section.services;
    for (final section in _Section.values) {
      final offset = _offsetOf(section);
      if (offset != null && offset <= _scroll.offset + 8) active = section;
    }
    if (active != _active) setState(() => _active = active);
  }

  Future<void> _jumpTo(_Section section) async {
    final target = _offsetOf(section);
    if (target == null) return;
    setState(() => _active = section);
    _jumping = true;
    await _scroll.animateTo(
      target.clamp(0, _scroll.position.maxScrollExtent),
      duration: context.reduceMotion ? Duration.zero : AppMotion.slow,
      curve: Curves.easeInOutCubic,
    );
    _jumping = false;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final details = widget.details;
    final tabs = {
      _Section.services: l10n.tabServices,
      _Section.barbers: l10n.tabBarbers,
      _Section.offers: l10n.tabOffers,
      _Section.reviews: l10n.tabReviews,
      _Section.hours: l10n.tabHours,
    };

    Widget section(_Section s, Widget child) => SliverToBoxAdapter(
      child: KeyedSubtree(key: _keys[s], child: child),
    );

    return Scaffold(
      body: RefreshIndicator(
        color: AppColors.primary,
        edgeOffset: _pinnedHeight,
        onRefresh: context.read<SalonDetailsCubit>().refresh,
        child: CustomScrollView(
          controller: _scroll,
          slivers: [
            SliverPersistentHeader(
              pinned: true,
              delegate: _HeaderDelegate(
                details: details,
                live: widget.live,
                isFavorite: context.select(
                  (SalonDetailsCubit c) => c.state.isFavorite,
                ),
                topPadding: MediaQuery.viewPaddingOf(context).top,
              ),
            ),
            SliverToBoxAdapter(
              child: _InfoBlock(details: details, live: widget.live),
            ),
            SliverPersistentHeader(
              pinned: true,
              delegate: _TabsDelegate(
                height: _tabsHeight,
                child: UnderlineTabs(
                  labels: tabs.values.toList(),
                  selectedIndex: _active.index,
                  onChanged: (i) => _jumpTo(_Section.values[i]),
                ),
              ),
            ),
            section(_Section.services, ServicesSection(details: details)),
            section(
              _Section.barbers,
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: BarbersSection(details: details, live: widget.live),
              ),
            ),
            section(_Section.offers, OffersSection(details: details)),
            section(
              _Section.reviews,
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: ReviewsSection(details: details),
              ),
            ),
            section(_Section.hours, HoursSection(details: details)),
            // Lets the last section scroll up under the tabs.
            SliverToBoxAdapter(
              child: SizedBox(height: MediaQuery.sizeOf(context).height * 0.3),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _BookingFooter(live: widget.live),
    );
  }
}

// ---- collapsing header ----------------------------------------------------------

class _HeaderDelegate extends SliverPersistentHeaderDelegate {
  _HeaderDelegate({
    required this.details,
    required this.live,
    required this.isFavorite,
    required this.topPadding,
  });

  static const collapsedBar = 60.0;
  static const _heroBelowStatusBar = 170.0;

  final SalonDetails details;
  final bool live;

  /// Passed in: delegate `build` runs during layout, where
  /// `context.select` / `watch` aren't allowed.
  final bool isFavorite;
  final double topPadding;

  @override
  double get minExtent => topPadding + collapsedBar;

  @override
  double get maxExtent => topPadding + _heroBelowStatusBar;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlaps) {
    final t = (shrinkOffset / (maxExtent - minExtent)).clamp(0.0, 1.0);
    final collapsed = Curves.easeIn.transform(((t - 0.6) / 0.4).clamp(0, 1));
    final l10n = context.l10n;
    final cubit = context.read<SalonDetailsCubit>();
    final summary = details.summary;
    final lang = l10n.localeName;
    final statusShort = summary.isOpen
        ? (summary.queue.peopleAhead == 0
              ? l10n.waitFreeNow
              : l10n.pinPeopleLeft(summary.queue.peopleAhead))
        : l10n.statusClosedNow;

    return Stack(
      fit: StackFit.expand,
      children: [
        Opacity(
          opacity: 1 - t,
          child: _HeroGallery(details: details),
        ),
        IgnorePointer(
          child: Opacity(
            opacity: collapsed,
            child: const DecoratedBox(
              decoration: BoxDecoration(
                color: AppColors.bg,
                border: Border(bottom: BorderSide(color: AppColors.divider)),
              ),
            ),
          ),
        ),
        Positioned(
          top: topPadding + 11,
          left: 16,
          right: 16,
          child: Row(
            children: [
              AppIconButton(
                icon: AppAssets.iconChevronLeft,
                matchTextDirection: true,
                semanticLabel: l10n.actionBack,
                onPressed: context.popOrGoHome,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Opacity(
                  opacity: collapsed,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        summary.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.itemTitle.copyWith(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        l10n.dotSeparated(
                          summary.areaName.of(lang),
                          statusShort,
                        ),
                        maxLines: 1,
                        style: AppTypography.caption,
                      ),
                    ],
                  ),
                ),
              ),
              AppIconButton(
                icon: AppAssets.iconShare,
                semanticLabel: l10n.a11yShare,
                onPressed: () => _share(context),
              ),
              const SizedBox(width: 8),
              FavoriteButton(
                isFavorite: isFavorite,
                onChanged: (v) => cubit.setFavorite(favorite: v),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _share(BuildContext context) => SharePlus.instance.share(
    ShareParams(
      text: context.l10n.shareSalonText(
        details.summary.name,
        'https://beltadreeg.app/salon/${details.id}',
      ),
    ),
  );

  @override
  bool shouldRebuild(_HeaderDelegate oldDelegate) =>
      oldDelegate.details != details ||
      oldDelegate.live != live ||
      oldDelegate.isFavorite != isFavorite ||
      oldDelegate.topPadding != topPadding;
}

class _HeroGallery extends StatefulWidget {
  const _HeroGallery({required this.details});

  final SalonDetails details;

  @override
  State<_HeroGallery> createState() => _HeroGalleryState();
}

class _HeroGalleryState extends State<_HeroGallery> {
  int _page = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final photos = [
      for (final g in widget.details.gallery)
        if (g.kind != GalleryKind.video) g,
    ];
    final videos = widget.details.gallery.length - photos.length;
    final pages = photos.take(5).toList();

    return DecoratedBox(
      decoration: const BoxDecoration(
        color: AppColors.surf,
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          PageView.builder(
            itemCount: pages.length,
            onPageChanged: (i) => setState(() => _page = i),
            itemBuilder: (context, i) => AppPressable(
              pressedScale: 1,
              onTap: () => context.pushSalonGallery(widget.details.id),
              semanticLabel: l10n.photosCount(photos.length),
              child: Hero(
                tag: 'gallery-${pages[i].id}',
                child: AppNetworkImage(
                  url: pages[i].url,
                  placeholderIcon: AppAssets.iconCamera,
                  placeholderIconSize: 42,
                ),
              ),
            ),
          ),
          PositionedDirectional(
            bottom: 12,
            start: 16,
            child: Row(
              children: [
                _HeroChip(
                  icon: AppAssets.iconCamera,
                  label: l10n.photosCount(photos.length),
                  onTap: () => context.pushSalonGallery(widget.details.id),
                ),
                if (videos > 0) ...[
                  const SizedBox(width: 8),
                  _HeroChip(
                    icon: AppAssets.iconPlay,
                    label: l10n.videoChip,
                    onTap: () => context.pushSalonGallery(widget.details.id),
                  ),
                ],
              ],
            ),
          ),
          PositionedDirectional(
            bottom: 24,
            end: 16,
            child: Row(
              children: [
                for (var i = 0; i < pages.length; i++) ...[
                  if (i > 0) const SizedBox(width: 4),
                  AnimatedContainer(
                    duration: AppMotion.fast,
                    width: i == _page ? 16 : 4,
                    height: 4,
                    decoration: BoxDecoration(
                      color: i == _page
                          ? AppColors.textSecondary
                          : AppColors.divider,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroChip extends StatelessWidget {
  const _HeroChip({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final String icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppPressable(
      onTap: onTap,
      semanticLabel: label,
      child: Container(
        height: 28,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: AppColors.bg,
          borderRadius: AppRadius.smAll,
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            AppIcon(
              icon,
              size: AppSizes.iconSm,
              color: AppColors.textSecondary,
            ),
            const SizedBox(width: 5),
            Text(
              label,
              style: AppTypography.badge.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabsDelegate extends SliverPersistentHeaderDelegate {
  const _TabsDelegate({required this.height, required this.child});

  final double height;
  final Widget child;

  @override
  double get minExtent => height;

  @override
  double get maxExtent => height;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlaps) =>
      // The child must fill exactly [height]: a pinned header whose child is
      // shorter than its extent produces invalid sliver geometry.
      SizedBox.expand(
        child: ColoredBox(
          color: AppColors.bg,
          child: Align(alignment: Alignment.bottomCenter, child: child),
        ),
      );

  @override
  bool shouldRebuild(_TabsDelegate oldDelegate) => true;
}

// ---- info block --------------------------------------------------------------

class _InfoBlock extends StatelessWidget {
  const _InfoBlock({required this.details, required this.live});

  final SalonDetails details;
  final bool live;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final summary = details.summary;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Semantics(
            header: true,
            child: Text(summary.name, style: AppTypography.titleXl),
          ),
          const SizedBox(height: 8),
          MetaRow(
            items: [
              if (summary.rating != null)
                RatingLabel(
                  rating: summary.rating!,
                  suffix: l10n.salonReviewsWithCount(summary.reviewsCount),
                ),
              summary.areaName.of(l10n.localeName),
              SalonLabels.distance(context, summary.distanceKm),
            ],
          ),
          const SizedBox(height: 14),
          _LiveStatusBanner(details: details, live: live),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: l10n.actionDirections,
                  variant: AppButtonVariant.secondary,
                  size: AppButtonSize.sm,
                  fontSize: 13.5,
                  icon: AppAssets.iconNavigation,
                  onPressed: () => ExternalLinks.directions(
                    context,
                    latitude: details.latitude,
                    longitude: details.longitude,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: AppButton(
                  label: l10n.actionCall,
                  variant: AppButtonVariant.secondary,
                  size: AppButtonSize.sm,
                  fontSize: 13.5,
                  icon: AppAssets.iconPhone,
                  onPressed: () => ExternalLinks.open(
                    context,
                    Uri(scheme: 'tel', path: details.phone),
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

/// Live queue state pinned under the name (frame 21).
class _LiveStatusBanner extends StatelessWidget {
  const _LiveStatusBanner({required this.details, required this.live});

  final SalonDetails details;
  final bool live;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final summary = details.summary;
    final queue = summary.queue;

    final (AppTone tone, String title) = switch (summary) {
      _ when !live => (AppTone.neutral, l10n.waitNotUpdated),
      SalonSummary(opensAt: final opensAt?) => (
        AppTone.neutral,
        '${l10n.statusClosedNow} — '
            '${SalonLabels.opens(opensAt, DateTime.now(), l10n, context.fmt)}',
      ),
      _ when queue.peopleAhead == 0 => (
        AppTone.success,
        l10n.statusFreeNoQueue,
      ),
      _ when queue.waitMinutes >= 55 => (
        AppTone.danger,
        l10n.waitPeopleHour(queue.peopleAhead),
      ),
      _ => (
        summary.level == QueueLevel.busy ? AppTone.danger : AppTone.warning,
        l10n.waitPeopleMinutes(queue.peopleAhead, queue.waitMinutes),
      ),
    };
    final subtitle = summary.isOpen
        ? l10n.dotSeparated(
            l10n.chairsActive(details.chairsActive),
            l10n.barbersOnShift(details.barbersOnShift.length),
          )
        : null;
    final fg = tone == AppTone.neutral
        ? AppColors.textSecondary
        : tone.foreground;

    return AnimatedContainer(
      duration: AppMotion.medium,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        color: tone.background,
        borderRadius: AppRadius.mdAll,
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(
              color: tone.solid,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Semantics(
              liveRegion: true,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AnimatedSwitcher(
                    duration: AppMotion.medium,
                    child: Text(
                      title,
                      key: ValueKey(title),
                      style: AppTypography.bodyStrong.copyWith(
                        color: fg,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle,
                      style: AppTypography.metaStrong.copyWith(
                        color: fg,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ),
          ),
          if (live && summary.isOpen) const LiveIndicator(),
        ],
      ),
    );
  }
}

// ---- footer ---------------------------------------------------------------------

class _BookingFooter extends StatelessWidget {
  const _BookingFooter({required this.live});

  final bool live;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final draft = context.select((SalonDetailsCubit c) => c.state.draft);
    final online = context.watchIsOnline;
    final count = draft.services.length;

    return StickyBottomBar(
      child: Row(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.selectionCount(count),
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              AnimatedSwitcher(
                duration: AppMotion.fast,
                transitionBuilder: (child, a) => FadeTransition(
                  opacity: a,
                  child: ScaleTransition(scale: a, child: child),
                ),
                child: Text(
                  count == 0
                      ? '—'
                      : SalonLabels.price(context, draft.totalPrice),
                  key: ValueKey(draft.totalPrice),
                  style: AppTypography.titleMd,
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: AppButton(
              label: l10n.joinQueue,
              // Needs at least one service and a connection (board 08).
              onPressed: count > 0 && online
                  ? () => context.pushBookingSlot(draft.salonId)
                  : null,
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailsSkeleton extends StatelessWidget {
  const _DetailsSkeleton();

  @override
  Widget build(BuildContext context) {
    return const Shimmer(
      child: SingleChildScrollView(
        physics: NeverScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SkeletonBox(height: 170, radius: 0),
            Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonBox(width: 200, height: 20),
                  SizedBox(height: 10),
                  SkeletonBox(width: 240, height: 12),
                  SizedBox(height: 16),
                  SkeletonBox(height: 60, radius: AppRadius.md),
                  SizedBox(height: 24),
                  SkeletonBox(height: 44),
                  SizedBox(height: 12),
                  SkeletonBox(height: 44),
                  SizedBox(height: 12),
                  SkeletonBox(height: 44),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
