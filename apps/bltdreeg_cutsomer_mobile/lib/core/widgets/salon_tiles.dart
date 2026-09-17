import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'app_image.dart';
import 'app_pressable.dart';
import 'rating.dart';
import 'status_badges.dart';

/// `.meta` row: items separated by thin vertical bars.
class MetaRow extends StatelessWidget {
  const MetaRow({required this.items, super.key});

  /// Strings render as meta text; widgets are inserted as-is.
  final List<Object> items;

  @override
  Widget build(BuildContext context) {
    final children = <Widget>[];
    for (var i = 0; i < items.length; i++) {
      if (i > 0) {
        children.add(
          Container(
            width: 1,
            height: 11,
            margin: const EdgeInsets.symmetric(horizontal: 8),
            color: AppColors.divider,
          ),
        );
      }
      final item = items[i];
      children.add(
        item is Widget
            ? item
            : Flexible(
                child: Text(
                  '$item',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.meta,
                ),
              ),
      );
    }
    return DefaultTextStyle.merge(
      style: AppTypography.meta,
      child: Row(children: children),
    );
  }
}

/// "من **70 ج.م**": muted prefix with a bold amount.
class PriceMeta extends StatelessWidget {
  const PriceMeta({required this.amount, this.prefix, super.key});

  final String amount;
  final String? prefix;

  @override
  Widget build(BuildContext context) {
    return Text.rich(
      TextSpan(
        children: [
          if (prefix != null) TextSpan(text: '$prefix '),
          TextSpan(
            text: amount,
            style: AppTypography.metaStrong.copyWith(
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
      maxLines: 1,
      style: AppTypography.meta,
    );
  }
}

/// Vertical salon row (`.shop`): thumb, name + rating, meta, wait pill.
class SalonListTile extends StatelessWidget {
  const SalonListTile({
    required this.name,
    required this.meta,
    this.imageUrl,
    this.rating,
    this.reviewsCount,
    this.trailing,
    this.status,
    this.footer,
    this.closedTag,
    this.onTap,
    this.showDivider = true,
    super.key,
  });

  final String name;
  final String? imageUrl;
  final double? rating;
  final int? reviewsCount;

  /// Replaces the rating on the name row (e.g. favorite heart).
  final Widget? trailing;
  final Widget meta;

  /// Usually a [WaitStatusPill].
  final Widget? status;

  /// Extra action under the status (favorites "ادخل الطابور").
  final Widget? footer;
  final String? closedTag;
  final VoidCallback? onTap;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final content = Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        border: showDivider
            ? const Border(bottom: BorderSide(color: AppColors.divider))
            : null,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SalonThumbnail(imageUrl: imageUrl, tag: closedTag),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.itemTitle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    ?trailing,
                    if (trailing == null && rating != null)
                      RatingLabel(rating: rating!, reviewsCount: reviewsCount),
                  ],
                ),
                const SizedBox(height: 3),
                meta,
                if (status != null) ...[const SizedBox(height: 6), status!],
                if (footer != null) ...[const SizedBox(height: 8), footer!],
              ],
            ),
          ),
        ],
      ),
    );
    if (onTap == null) return content;
    return AppPressable(
      onTap: onTap,
      pressedScale: 0.985,
      semanticLabel: name,
      child: content,
    );
  }
}

/// Horizontal rail card (`.hcard`): photo with status pin, then details.
class SalonRailCard extends StatelessWidget {
  const SalonRailCard({
    required this.name,
    required this.meta,
    this.imageUrl,
    this.pin,
    this.bottom,
    this.onTap,
    this.width = 218,
    super.key,
  });

  final String name;
  final Widget meta;
  final String? imageUrl;

  /// Usually an [AvailabilityPin].
  final Widget? pin;

  /// Rating / price row.
  final Widget? bottom;
  final VoidCallback? onTap;
  final double width;

  @override
  Widget build(BuildContext context) {
    return AppPressable(
      onTap: onTap,
      semanticLabel: name,
      child: Container(
        width: width,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: AppColors.bg,
          borderRadius: AppRadius.cardAll,
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 104,
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.divider)),
              ),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  AppNetworkImage(url: imageUrl, placeholderIconSize: 28),
                  if (pin != null)
                    PositionedDirectional(top: 8, start: 8, child: pin!),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.itemTitle.copyWith(fontSize: 14.5),
                  ),
                  const SizedBox(height: 4),
                  meta,
                  if (bottom != null) ...[const SizedBox(height: 6), bottom!],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Horizontal list with gutters (`.rail`), lazily built.
class HorizontalRail extends StatelessWidget {
  const HorizontalRail({
    required this.itemCount,
    required this.itemBuilder,
    required this.height,
    this.spacing = AppSpacing.md,
    super.key,
  });

  final int itemCount;
  final IndexedWidgetBuilder itemBuilder;
  final double height;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
        itemCount: itemCount,
        separatorBuilder: (_, _) => SizedBox(width: spacing),
        itemBuilder: itemBuilder,
      ),
    );
  }
}
