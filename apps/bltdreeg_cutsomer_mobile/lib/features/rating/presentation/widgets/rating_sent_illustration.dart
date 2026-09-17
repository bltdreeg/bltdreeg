import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_illustration.dart';

/// Frame 41 "rating sent": the halo grows, the star spins in and settles,
/// the check draws on it, and small stars twinkle out from the edges.
///
/// Painted from `rating_sent.svg` (160×160 viewBox); with reduce-motion on,
/// the static SVG is shown.
class RatingSentIllustration extends StatefulWidget {
  const RatingSentIllustration({this.width = 142, super.key});

  final double width;

  @override
  State<RatingSentIllustration> createState() => _RatingSentIllustrationState();
}

class _RatingSentIllustrationState extends State<RatingSentIllustration>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1600),
  );
  bool _reduceMotion = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reduceMotion = MediaQuery.disableAnimationsOf(context);
    if (_reduceMotion) {
      _controller.value = 1;
    } else if (_controller.isDismissed) {
      unawaited(_controller.forward());
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_reduceMotion) {
      return AppIllustration(
        AppAssets.illustrationRatingSent,
        width: widget.width,
      );
    }
    return ExcludeSemantics(
      child: RepaintBoundary(
        child: SizedBox.square(
          dimension: widget.width,
          child: CustomPaint(painter: _RatingSentPainter(_controller)),
        ),
      ),
    );
  }
}

class _RatingSentPainter extends CustomPainter {
  _RatingSentPainter(this.progress) : super(repaint: progress);

  final Animation<double> progress;

  static const _viewBox = 160.0;
  static const _center = Offset(80, 80);

  /// Star centroid, the pivot for its spin.
  static const _starCenter = Offset(80, 84);

  static final Path _star = Path()
    ..moveTo(80, 44)
    ..lineTo(90.46, 69.6)
    ..lineTo(118.04, 71.64)
    ..lineTo(96.93, 89.5)
    ..lineTo(103.51, 116.36)
    ..lineTo(80, 101.8)
    ..lineTo(56.49, 116.36)
    ..lineTo(63.07, 89.5)
    ..lineTo(41.96, 71.64)
    ..lineTo(69.54, 69.6)
    ..close();

  static const _twinkles = [
    (Offset(28, 42), 0.62, AppColors.warn),
    (Offset(134, 36), 0.68, AppColors.ok),
    (Offset(142, 112), 0.74, AppColors.warn),
    (Offset(20, 118), 0.8, AppColors.teal),
  ];

  double _phase(double begin, double end, [Curve curve = Curves.easeOutCubic]) {
    final t = ((progress.value - begin) / (end - begin)).clamp(0.0, 1.0);
    return curve.transform(t);
  }

  @override
  void paint(Canvas canvas, Size size) {
    canvas
      ..save()
      ..scale(size.width / _viewBox);

    final halo = _phase(0, 0.35, Curves.easeOutBack);
    if (halo > 0) {
      canvas.drawCircle(_center, 60 * halo, Paint()..color = AppColors.okTint);
    }

    final pop = _phase(0.12, 0.62, Curves.elasticOut);
    if (pop > 0) {
      final spin = lerpDouble(-0.6, 0, _phase(0.12, 0.5))!;
      canvas
        ..save()
        ..translate(_starCenter.dx, _starCenter.dy)
        ..rotate(spin)
        ..scale(pop)
        ..translate(-_starCenter.dx, -_starCenter.dy)
        ..drawPath(_star, Paint()..color = AppColors.ok)
        ..drawPath(
          _star,
          Paint()
            ..style = PaintingStyle.stroke
            ..strokeWidth = 4
            ..strokeJoin = StrokeJoin.round
            ..color = AppColors.ok,
        )
        ..restore();
    }

    final check = _phase(0.5, 0.72);
    if (check > 0) {
      final path = Path()
        ..moveTo(68, 85)
        ..relativeLineTo(8, 8)
        ..relativeLineTo(15, -16);
      final metric = path.computeMetrics().first;
      canvas.drawPath(
        metric.extractPath(0, metric.length * check),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 5
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round
          ..color = AppColors.onPrimary,
      );
    }

    // Small four-point stars flash on and fade.
    for (final (at, start, color) in _twinkles) {
      final t = _phase(start, start + 0.3, Curves.linear);
      if (t <= 0 || t >= 1) continue;
      final scale = math.sin(t * math.pi);
      _sparkle(canvas, at, 7 * scale, color.withValues(alpha: scale));
    }

    canvas.restore();
  }

  void _sparkle(Canvas canvas, Offset at, double r, Color color) {
    final path = Path()
      ..moveTo(at.dx, at.dy - r)
      ..quadraticBezierTo(at.dx, at.dy, at.dx + r, at.dy)
      ..quadraticBezierTo(at.dx, at.dy, at.dx, at.dy + r)
      ..quadraticBezierTo(at.dx, at.dy, at.dx - r, at.dy)
      ..quadraticBezierTo(at.dx, at.dy, at.dx, at.dy - r)
      ..close();
    canvas.drawPath(path, Paint()..color = color);
  }

  @override
  bool shouldRepaint(_RatingSentPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
