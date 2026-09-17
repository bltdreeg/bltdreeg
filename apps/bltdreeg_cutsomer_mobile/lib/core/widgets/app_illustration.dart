import 'package:flutter/widgets.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Static illustration from `AppAssets.illustration*`, isolated in its own
/// repaint layer.
class AppIllustration extends StatelessWidget {
  const AppIllustration(this.asset, {required this.width, super.key});

  final String asset;
  final double width;

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: SvgPicture.asset(asset, width: width, excludeFromSemantics: true),
    );
  }
}

/// Lays out illustration layers and localized labels in the SVG's own
/// coordinate space (its viewBox), then scales the whole composition to
/// [width].
///
/// Illustrations ship without text, so numbers and captions stay
/// translatable and always use Western digits. Animated illustrations
/// transform individual layers in viewBox units.
class IllustrationCanvas extends StatelessWidget {
  const IllustrationCanvas({
    required this.viewBox,
    required this.children,
    this.width,
    super.key,
  });

  final Size viewBox;
  final List<Widget> children;

  /// Null expands to the available width, capped at the viewBox width x1.1.
  final double? width;

  @override
  Widget build(BuildContext context) {
    final appDirection = Directionality.of(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final w =
            width ??
            (constraints.maxWidth.isFinite
                ? constraints.maxWidth.clamp(0, viewBox.width * 1.1).toDouble()
                : viewBox.width);
        return RepaintBoundary(
          child: SizedBox(
            width: w,
            height: w * viewBox.height / viewBox.width,
            child: FittedBox(
              child: SizedBox.fromSize(
                size: viewBox,
                child: _AppDirection(
                  direction: appDirection,
                  child: Directionality(
                    // Artwork coordinates are absolute; never mirror them.
                    textDirection: TextDirection.ltr,
                    child: Stack(clipBehavior: Clip.none, children: children),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// Full-canvas SVG layer inside an [IllustrationCanvas].
///
/// Transforms are expressed in viewBox units: [offset] translates, and
/// [scale] / [rotation] (radians) pivot around [pivot] (defaults to the
/// canvas origin). Layers never mirror in RTL.
class IllustrationLayer extends StatelessWidget {
  const IllustrationLayer(
    this.asset, {
    this.opacity = 1,
    this.offset = Offset.zero,
    this.scale = 1,
    this.rotation = 0,
    this.pivot = Offset.zero,
    super.key,
  });

  final String asset;
  final double opacity;
  final Offset offset;
  final double scale;
  final double rotation;
  final Offset pivot;

  @override
  Widget build(BuildContext context) {
    Widget child = SvgPicture.asset(asset, excludeFromSemantics: true);
    if (scale != 1 || rotation != 0) {
      child = Transform(
        alignment: Alignment.topLeft,
        origin: pivot,
        transform: Matrix4.identity()
          ..rotateZ(rotation)
          ..scaleByDouble(scale, scale, 1, 1),
        child: child,
      );
    }
    if (offset != Offset.zero) {
      child = Transform.translate(offset: offset, child: child);
    }
    if (opacity < 1) {
      child = Opacity(opacity: opacity.clamp(0, 1), child: child);
    }
    return Positioned.fill(child: child);
  }
}

/// Widget centered on a point given in viewBox coordinates.
class IllustrationLabel extends StatelessWidget {
  const IllustrationLabel({
    required this.center,
    required this.child,
    this.maxWidth = 120,
    super.key,
  });

  final Offset center;
  final Widget child;
  final double maxWidth;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: center.dx - maxWidth / 2,
      top: center.dy - 40,
      width: maxWidth,
      height: 80,
      child: Center(
        child: Directionality(
          // Labels use the app's direction so mixed Arabic + digits shape
          // correctly.
          textDirection: _AppDirection.of(context),
          child: child,
        ),
      ),
    );
  }
}

class _AppDirection extends InheritedWidget {
  const _AppDirection({required this.direction, required super.child});

  final TextDirection direction;

  static TextDirection of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_AppDirection>()?.direction ??
      Directionality.of(context);

  @override
  bool updateShouldNotify(_AppDirection oldWidget) =>
      direction != oldWidget.direction;
}
