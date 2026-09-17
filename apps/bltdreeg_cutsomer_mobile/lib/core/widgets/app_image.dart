import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'app_icon.dart';
import 'skeleton.dart';

/// Placeholder strategy for photos (salon covers, gallery, avatars).
///
/// There are no real photos yet, so fake data ships `null` URLs and every
/// image slot renders the board's placeholder: surface fill + muted icon.
/// When the backend provides URLs, the same widget loads them with a
/// shimmer while loading, a fade-in on first frame, and falls back to the
/// placeholder on error or offline. Swapping to a disk-caching loader later
/// (e.g. `cached_network_image`) only touches this file.
class AppNetworkImage extends StatelessWidget {
  const AppNetworkImage({
    required this.url,
    this.fit = BoxFit.cover,
    this.fallback,
    this.placeholderIcon = AppAssets.iconStore,
    this.placeholderIconSize = 26,
    super.key,
  });

  final String? url;
  final BoxFit fit;

  /// Overrides the default icon placeholder.
  final Widget? fallback;
  final String placeholderIcon;
  final double placeholderIconSize;

  @override
  Widget build(BuildContext context) {
    final placeholder =
        fallback ??
        ColoredBox(
          color: AppColors.surf,
          child: Center(
            child: AppIcon(
              placeholderIcon,
              size: placeholderIconSize,
              color: AppColors.placeholderIcon,
            ),
          ),
        );

    final src = url;
    if (src == null || src.isEmpty) return placeholder;

    return Image.network(
      src,
      fit: fit,
      width: double.infinity,
      height: double.infinity,
      gaplessPlayback: true,
      frameBuilder: (context, child, frame, sync) => sync
          ? child
          : AnimatedOpacity(
              opacity: frame == null ? 0 : 1,
              duration: AppMotion.medium,
              child: child,
            ),
      loadingBuilder: (context, child, progress) => progress == null
          ? child
          : const Shimmer(child: SkeletonBox(radius: 0)),
      errorBuilder: (_, _, _) => placeholder,
    );
  }
}

/// Rounded salon thumbnail with optional corner tag ("مقفول").
class SalonThumbnail extends StatelessWidget {
  const SalonThumbnail({
    this.imageUrl,
    this.size = 86,
    this.radius = AppRadius.md,
    this.tag,
    this.iconSize,
    super.key,
  });

  final String? imageUrl;
  final double size;
  final double radius;
  final String? tag;
  final double? iconSize;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.surf,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          AppNetworkImage(
            url: imageUrl,
            placeholderIconSize: iconSize ?? (size >= 80 ? 26 : 15),
          ),
          if (tag != null)
            PositionedDirectional(
              top: 0,
              start: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: const BoxDecoration(
                  color: AppColors.textPrimary,
                  borderRadius: BorderRadiusDirectional.only(
                    bottomEnd: Radius.circular(8),
                  ),
                ),
                child: Text(
                  tag!,
                  style: AppTypography.micro.copyWith(
                    fontSize: 10,
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
