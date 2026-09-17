import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/salon_details.dart';

final class SalonGalleryState extends Equatable {
  const SalonGalleryState({
    this.snapshot = const SalonDetailsSnapshot(),
    this.filter,
    this.expanded = false,
  });

  final SalonDetailsSnapshot snapshot;

  /// Null shows everything.
  final GalleryKind? filter;

  /// Grid shows 4 tiles with "+N" until expanded.
  final bool expanded;

  List<GalleryItem> get items => [
    for (final g in snapshot.details?.gallery ?? const <GalleryItem>[])
      if (filter == null || g.kind == filter) g,
  ];

  int count(GalleryKind? kind) => [
    for (final g in snapshot.details?.gallery ?? const <GalleryItem>[])
      if (kind == null || g.kind == kind) g,
  ].length;

  @override
  List<Object?> get props => [snapshot, filter, expanded];
}

class SalonGalleryCubit extends Cubit<SalonGalleryState> {
  SalonGalleryCubit({
    required String salonId,
    required SalonDetailsRepository repository,
  }) : super(const SalonGalleryState()) {
    _sub = repository
        .watch(salonId)
        .listen(
          (s) => emit(
            SalonGalleryState(
              snapshot: s,
              filter: state.filter,
              expanded: state.expanded,
            ),
          ),
        );
  }

  late final StreamSubscription<SalonDetailsSnapshot> _sub;

  void setFilter(GalleryKind? kind) =>
      emit(SalonGalleryState(snapshot: state.snapshot, filter: kind));

  void expand() => emit(
    SalonGalleryState(
      snapshot: state.snapshot,
      filter: state.filter,
      expanded: true,
    ),
  );

  @override
  Future<void> close() async {
    await _sub.cancel();
    return super.close();
  }
}

/// Frame 39: photos grouped by purpose, not upload date.
class SalonGalleryPage extends StatelessWidget {
  const SalonGalleryPage({required this.salonId, super.key});

  final String salonId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<SalonGalleryCubit>(param1: salonId),
      child: const _GalleryView(),
    );
  }
}

class _GalleryView extends StatelessWidget {
  const _GalleryView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<SalonGalleryCubit>().state;
    final details = state.snapshot.details;

    if (details == null) {
      return Scaffold(
        appBar: const AppTopBar(leading: TopBarLeading.close),
        body: state.snapshot.failure is NetworkFailure
            ? NoConnectionView(onRetry: () {})
            : const Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
      );
    }

    final photos = details.gallery.length - state.count(GalleryKind.video);
    final videos = state.count(GalleryKind.video);

    return Scaffold(
      appBar: AppTopBar(
        leading: TopBarLeading.close,
        title: l10n.galleryTitle(details.summary.name),
        subtitle: l10n.dotSeparated(
          l10n.photosCount(photos),
          l10n.videosCount(videos),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          const SizedBox(height: 14),
          _Filters(state: state),
          const SizedBox(height: 14),
          Padding(
            padding: AppSpacing.pageH,
            child: _Grid(details: details, state: state),
          ),
          if (details.reviewPhotos.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 10),
              child: GroupLabel(
                l10n.galleryReviewPhotos,
                padding: EdgeInsets.zero,
              ),
            ),
            SizedBox(
              height: 96,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: AppSpacing.pageH,
                itemCount: details.reviewPhotos.length,
                separatorBuilder: (_, _) => const SizedBox(width: 10),
                itemBuilder: (context, i) => SizedBox(
                  width: 96,
                  child: _Tile(item: details.reviewPhotos[i], iconSize: 15),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _Filters extends StatelessWidget {
  const _Filters({required this.state});

  final SalonGalleryState state;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<SalonGalleryCubit>();
    final options = <(GalleryKind?, String)>[
      (null, l10n.galleryFilterAll(state.count(null))),
      (GalleryKind.work, l10n.galleryFilterWork(state.count(GalleryKind.work))),
      (
        GalleryKind.place,
        l10n.galleryFilterPlace(state.count(GalleryKind.place)),
      ),
      (
        GalleryKind.video,
        l10n.galleryFilterVideo(state.count(GalleryKind.video)),
      ),
    ];
    return ChipRail(
      children: [
        for (final (kind, label) in options)
          if (kind == null || state.count(kind) > 0)
            AppChip(
              label: label,
              selected: state.filter == kind,
              onTap: () => cubit.setFilter(kind),
            ),
      ],
    );
  }
}

class _Grid extends StatelessWidget {
  const _Grid({required this.details, required this.state});

  final SalonDetails details;
  final SalonGalleryState state;

  static const _collapsedTiles = 4;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final items = state.items;
    final video = items.where((g) => g.kind == GalleryKind.video).firstOrNull;
    final tiles = [
      for (final g in items)
        if (g != video) g,
    ];
    final visible = state.expanded || tiles.length <= _collapsedTiles
        ? tiles
        : tiles.take(_collapsedTiles).toList();
    final hidden = tiles.length - visible.length;

    void open(GalleryItem item) => context.pushSalonPhoto(
      details.id,
      items.indexOf(item),
      kind: state.filter,
    );

    return AnimatedSize(
      duration: AppMotion.medium,
      alignment: Alignment.topCenter,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (video != null) ...[
            SizedBox(
              height: 196,
              child: _Tile(
                item: video,
                iconSize: 34,
                radius: AppRadius.card,
                onTap: () => open(video),
                badge: video.caption == null
                    ? null
                    : l10n.dotSeparated(
                        video.caption!,
                        context.fmt.countdown(
                          Duration(seconds: video.durationSeconds ?? 0),
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 10),
          ],
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: visible.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              mainAxisExtent: 130,
            ),
            itemBuilder: (context, i) {
              final item = visible[i];
              final isLast = i == visible.length - 1 && hidden > 0;
              return FadeSlideIn(
                key: ValueKey(item.id),
                offset: 6,
                duration: AppMotion.medium,
                delay: Duration(milliseconds: 30 * i.clamp(0, 8)),
                child: _Tile(
                  item: item,
                  onTap: isLast
                      ? context.read<SalonGalleryCubit>().expand
                      : () => open(item),
                  overlay: isLast ? l10n.galleryMore(hidden + 1) : null,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.item,
    this.onTap,
    this.overlay,
    this.badge,
    this.iconSize = AppSizes.icon,
    this.radius = AppRadius.md,
  });

  final GalleryItem item;
  final VoidCallback? onTap;
  final String? overlay;
  final String? badge;
  final double iconSize;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(radius);
    return AppPressable(
      onTap: onTap,
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(borderRadius: borderRadius),
        foregroundDecoration: BoxDecoration(
          borderRadius: borderRadius,
          border: Border.all(color: AppColors.border),
        ),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Hero(
              tag: 'gallery-${item.id}',
              child: AppNetworkImage(
                url: item.url,
                placeholderIcon: item.kind == GalleryKind.video
                    ? AppAssets.iconPlay
                    : AppAssets.iconCamera,
                placeholderIconSize: iconSize,
              ),
            ),
            if (overlay != null)
              ColoredBox(
                color: const Color(0x8C0E0F11),
                child: Center(
                  child: Text(
                    overlay!,
                    style: AppTypography.statValue.copyWith(
                      fontSize: 19,
                      color: AppColors.onPrimary,
                    ),
                  ),
                ),
              ),
            if (badge != null)
              PositionedDirectional(
                bottom: 10,
                start: 12,
                child: Container(
                  height: 26,
                  padding: const EdgeInsets.symmetric(horizontal: 9),
                  decoration: BoxDecoration(
                    color: AppColors.bg,
                    borderRadius: AppRadius.smAll,
                    border: Border.all(color: AppColors.border),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    badge!,
                    style: AppTypography.tag.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Full-screen swipeable viewer with pinch-zoom.
class SalonPhotoViewerPage extends StatefulWidget {
  const SalonPhotoViewerPage({
    required this.salonId,
    required this.initialIndex,
    this.kind,
    super.key,
  });

  final String salonId;
  final int initialIndex;
  final GalleryKind? kind;

  @override
  State<SalonPhotoViewerPage> createState() => _SalonPhotoViewerPageState();
}

class _SalonPhotoViewerPageState extends State<SalonPhotoViewerPage> {
  late final PageController _pages = PageController(
    initialPage: widget.initialIndex,
  );
  late int _index = widget.initialIndex;

  @override
  void dispose() {
    _pages.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return BlocProvider(
      create: (_) =>
          sl<SalonGalleryCubit>(param1: widget.salonId)..setFilter(widget.kind),
      child: BlocBuilder<SalonGalleryCubit, SalonGalleryState>(
        builder: (context, state) {
          final items = state.items;
          return AnnotatedRegion<SystemUiOverlayStyle>(
            value: SystemUiOverlayStyle.light,
            child: Scaffold(
              backgroundColor: AppColors.tx,
              body: SafeArea(
                child: Stack(
                  children: [
                    if (items.isNotEmpty)
                      PageView.builder(
                        controller: _pages,
                        itemCount: items.length,
                        onPageChanged: (i) => setState(() => _index = i),
                        itemBuilder: (context, i) => InteractiveViewer(
                          maxScale: 4,
                          child: Center(
                            child: AspectRatio(
                              aspectRatio: 3 / 4,
                              child: Hero(
                                tag: 'gallery-${items[i].id}',
                                child: AppNetworkImage(
                                  url: items[i].url,
                                  fit: BoxFit.contain,
                                  placeholderIcon:
                                      items[i].kind == GalleryKind.video
                                      ? AppAssets.iconPlay
                                      : AppAssets.iconCamera,
                                  placeholderIconSize: 56,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    PositionedDirectional(
                      top: 8,
                      start: 16,
                      child: AppIconButton(
                        icon: AppAssets.iconClose,
                        semanticLabel: l10n.actionClose,
                        style: AppIconButtonStyle.filled,
                        onPressed: context.popOrGoHome,
                      ),
                    ),
                    if (items.isNotEmpty)
                      Positioned(
                        bottom: 24,
                        left: 0,
                        right: 0,
                        child: Center(
                          // "2 / 13" reads left-to-right in both languages.
                          child: Text(
                            l10n.photoCounter(_index + 1, items.length),
                            textDirection: TextDirection.ltr,
                            style: AppTypography.label.copyWith(
                              color: AppColors.onPrimary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
