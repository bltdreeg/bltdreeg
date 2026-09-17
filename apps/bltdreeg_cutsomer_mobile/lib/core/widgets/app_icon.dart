import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';

/// Renders an icon from `AppAssets.icon*`.
///
/// Icons are single-color SVGs tinted with [color] (or the ambient
/// `IconTheme` color). Brand marks like Google keep their own colors via
/// [multicolor]. Directional icons (chevrons, back) set
/// [matchTextDirection] so they mirror in RTL.
class AppIcon extends StatelessWidget {
  const AppIcon(
    this.asset, {
    this.size = AppSizes.icon,
    this.color,
    this.multicolor = false,
    this.matchTextDirection = false,
    this.semanticLabel,
    super.key,
  });

  final String asset;
  final double size;
  final Color? color;
  final bool multicolor;
  final bool matchTextDirection;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final tint = color ?? IconTheme.of(context).color ?? AppColors.textPrimary;
    return SvgPicture.asset(
      asset,
      width: size,
      height: size,
      matchTextDirection: matchTextDirection,
      colorFilter: multicolor ? null : ColorFilter.mode(tint, BlendMode.srcIn),
      semanticsLabel: semanticLabel,
      excludeFromSemantics: semanticLabel == null,
    );
  }
}
