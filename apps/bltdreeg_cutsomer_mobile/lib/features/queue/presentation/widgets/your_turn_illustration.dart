import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_illustration.dart';

/// Frame 29 "your turn": the disc pops in, then the halo breathes, ripples
/// pulse outward and the scissors snip twice before a short pause, until the
/// customer checks in. It signals urgency without a full-screen color.
///
/// Painted from `your_turn.svg` (120×120 viewBox) so the blades can pivot;
/// with reduce-motion on, the static SVG is shown.
class YourTurnIllustration extends StatefulWidget {
  const YourTurnIllustration({this.width = 104, super.key});

  final double width;

  @override
  State<YourTurnIllustration> createState() => _YourTurnIllustrationState();
}

class _YourTurnIllustrationState extends State<YourTurnIllustration>
    with TickerProviderStateMixin {
  late final AnimationController _entrance = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 700),
  );
  late final AnimationController _loop = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1800),
  );
  bool _reduceMotion = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reduceMotion = MediaQuery.disableAnimationsOf(context);
    if (_reduceMotion) {
      _entrance.value = 1;
      _loop.stop();
    } else {
      if (_entrance.isDismissed) unawaited(_entrance.forward());
      if (!_loop.isAnimating) unawaited(_loop.repeat());
    }
  }

  @override
  void dispose() {
    _entrance.dispose();
    _loop.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_reduceMotion) {
      return AppIllustration(
        AppAssets.illustrationYourTurn,
        width: widget.width,
      );
    }
    return ExcludeSemantics(
      child: RepaintBoundary(
        child: SizedBox.square(
          dimension: widget.width,
          child: CustomPaint(
            painter: _YourTurnPainter(entrance: _entrance, loop: _loop),
          ),
        ),
      ),
    );
  }
}

class _YourTurnPainter extends CustomPainter {
  _YourTurnPainter({required this.entrance, required this.loop})
    : super(repaint: Listenable.merge([entrance, loop]));

  final Animation<double> entrance;
  final Animation<double> loop;

  static const _viewBox = 120.0;
  static const _center = Offset(60, 60);

  /// Where the blades cross.
  static const _pivot = Offset(65.75, 60);

  double _entrancePhase(double begin, double end, Curve curve) => curve
      .transform(((entrance.value - begin) / (end - begin)).clamp(0.0, 1.0));

  /// Blade opening in radians: two quick snips in the first half of the
  /// loop, closed for the rest.
  double get _snip {
    final t = loop.value;
    if (t > 0.5) return 0;
    return math.sin(t / 0.5 * 2 * math.pi * 2).abs() * 0.22;
  }

  @override
  void paint(Canvas canvas, Size size) {
    canvas
      ..save()
      ..scale(size.width / _viewBox);

    final appear = _entrancePhase(0, 1, Curves.easeOutBack);
    final breathe = 1 + 0.04 * math.sin(loop.value * 2 * math.pi);

    // Ripples: two rings a half-loop apart.
    for (final offset in const [0.0, 0.5]) {
      final t = (loop.value + offset) % 1;
      canvas.drawCircle(
        _center,
        lerpDouble(40, 60, t)!,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2
          ..color = AppColors.ok.withValues(alpha: 0.28 * (1 - t) * appear),
      );
    }

    canvas.drawCircle(
      _center,
      56 * appear * breathe,
      Paint()..color = AppColors.okTint,
    );
    final disc = _entrancePhase(0.2, 1, Curves.elasticOut);
    canvas.drawCircle(_center, 40 * disc, Paint()..color = AppColors.ok);

    if (disc > 0.6) {
      final stroke = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 4.6
        ..strokeCap = StrokeCap.round
        ..color = AppColors.onPrimary.withValues(
          alpha: ((disc - 0.6) / 0.4).clamp(0, 1),
        );
      // Upper handle drives the blade ending bottom-right, and vice versa;
      // each half rotates around the crossing point.
      _half(
        canvas,
        stroke,
        handle: const Offset(49, 48),
        from: const Offset(54.36, 51.84),
        to: const Offset(79, 69.5),
        // Clockwise (y points down) opens this blade's tip downwards.
        angle: _snip,
      );
      _half(
        canvas,
        stroke,
        handle: const Offset(49, 72),
        from: const Offset(54.36, 68.16),
        to: const Offset(79, 50.5),
        angle: -_snip,
      );
    }
    canvas.restore();
  }

  void _half(
    Canvas canvas,
    Paint stroke, {
    required Offset handle,
    required Offset from,
    required Offset to,
    required double angle,
  }) {
    canvas
      ..save()
      ..translate(_pivot.dx, _pivot.dy)
      ..rotate(angle)
      ..translate(-_pivot.dx, -_pivot.dy)
      ..drawCircle(handle, 6.6, stroke)
      ..drawLine(from, to, stroke)
      ..restore();
  }

  @override
  bool shouldRepaint(_YourTurnPainter oldDelegate) =>
      oldDelegate.entrance != entrance || oldDelegate.loop != loop;
}
