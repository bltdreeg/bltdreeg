import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' show lerpDouble;

import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/app_illustration.dart';

/// Frame 26 "entered the queue": the halo grows, the green disc pops in,
/// the check draws itself, then a ripple and a burst of confetti dots.
///
/// Painted rather than layered SVGs because the check needs a stroke
/// draw-on. Geometry matches `queue_joined.svg` (160×160 viewBox); with
/// reduce-motion on, that static SVG is shown instead.
class QueueJoinedIllustration extends StatefulWidget {
  const QueueJoinedIllustration({
    this.width = 146,
    this.onCheckDrawn,
    super.key,
  });

  final double width;

  /// Fires once the check mark completes (success haptic).
  final VoidCallback? onCheckDrawn;

  @override
  State<QueueJoinedIllustration> createState() =>
      _QueueJoinedIllustrationState();
}

/// Timeline point (0..1) where the check mark is fully drawn.
const checkDoneAt = 0.62;

class _QueueJoinedIllustrationState extends State<QueueJoinedIllustration>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1500),
  );
  bool _reduceMotion = false;
  bool _notified = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_maybeNotify);
  }

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

  void _maybeNotify() {
    if (_notified || _controller.value < checkDoneAt) return;
    _notified = true;
    widget.onCheckDrawn?.call();
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
        AppAssets.illustrationQueueJoined,
        width: widget.width,
      );
    }
    return ExcludeSemantics(
      child: RepaintBoundary(
        child: SizedBox.square(
          dimension: widget.width,
          child: CustomPaint(painter: _QueueJoinedPainter(_controller)),
        ),
      ),
    );
  }
}

class _QueueJoinedPainter extends CustomPainter {
  _QueueJoinedPainter(this.progress) : super(repaint: progress);

  final Animation<double> progress;

  static const _viewBox = 160.0;
  static const _center = Offset(80, 80);
  static const _confetti = [
    AppColors.ok,
    AppColors.teal,
    AppColors.warn,
    AppColors.ok,
    AppColors.teal,
    AppColors.warn,
    AppColors.ok,
    AppColors.teal,
  ];

  /// Progress of the timeline within [begin, end], eased by [curve].
  double _phase(double begin, double end, [Curve curve = Curves.easeOutCubic]) {
    final t = ((progress.value - begin) / (end - begin)).clamp(0.0, 1.0);
    return curve.transform(t);
  }

  @override
  void paint(Canvas canvas, Size size) {
    canvas
      ..save()
      ..scale(size.width / _viewBox);

    // Halo (r 62).
    final halo = _phase(0, 0.35, Curves.easeOutBack);
    if (halo > 0) {
      canvas.drawCircle(_center, 62 * halo, Paint()..color = AppColors.okTint);
    }

    // Ripple after the check lands.
    final ripple = _phase(0.6, 1, Curves.easeOutQuad);
    if (ripple > 0 && ripple < 1) {
      canvas.drawCircle(
        _center,
        lerpDouble(46, 78, ripple)!,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = lerpDouble(5, 1, ripple)!
          ..color = AppColors.ok.withValues(alpha: 0.35 * (1 - ripple)),
      );
    }

    // Disc (r 44) pops with a slight overshoot.
    final disc = _phase(0.15, 0.5, Curves.elasticOut);
    if (disc > 0) {
      canvas.drawCircle(_center, 44 * disc, Paint()..color = AppColors.ok);
    }

    // Check mark draws on: M61 81 l13 13 25-27.
    final check = _phase(0.38, checkDoneAt);
    if (check > 0) {
      final path = Path()
        ..moveTo(61, 81)
        ..relativeLineTo(13, 13)
        ..relativeLineTo(25, -27);
      final metric = path.computeMetrics().first;
      canvas.drawPath(
        metric.extractPath(0, metric.length * check),
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = 7
          ..strokeCap = StrokeCap.round
          ..strokeJoin = StrokeJoin.round
          ..color = AppColors.onPrimary,
      );
    }

    // Confetti dots burst outwards and fade.
    final burst = _phase(0.58, 1);
    if (burst > 0 && burst < 1) {
      for (var i = 0; i < _confetti.length; i++) {
        final angle = -math.pi / 2 + i * math.pi / 4 + math.pi / 8;
        final distance = lerpDouble(50, 74, burst)!;
        final radius = (i.isEven ? 3.2 : 2.4) * (1 - burst * 0.5);
        canvas.drawCircle(
          _center + Offset(math.cos(angle), math.sin(angle)) * distance,
          radius,
          Paint()
            ..color = _confetti[i].withValues(
              alpha: (burst < 0.7 ? 1.0 : (1 - burst) / 0.3).clamp(0, 1),
            ),
        );
      }
    }

    canvas.restore();
  }

  @override
  bool shouldRepaint(_QueueJoinedPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
