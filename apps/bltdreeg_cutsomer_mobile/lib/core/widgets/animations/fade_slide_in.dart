import 'dart:async';

import 'package:flutter/widgets.dart';

import '../../theme/app_dimens.dart';

/// One-shot entrance: fade in while rising a few pixels, after [delay].
/// Stagger siblings by passing increasing delays. Skipped entirely when the
/// OS asks for reduced motion.
class FadeSlideIn extends StatefulWidget {
  const FadeSlideIn({
    required this.child,
    this.delay = Duration.zero,
    this.duration = AppMotion.slow,
    this.offset = 12,
    this.scaleFrom = 1,
    super.key,
  });

  final Widget child;
  final Duration delay;
  final Duration duration;

  /// Vertical travel in logical pixels.
  final double offset;

  /// Starting scale (e.g. 0.92 for illustrations).
  final double scaleFrom;

  @override
  State<FadeSlideIn> createState() => _FadeSlideInState();
}

class _FadeSlideInState extends State<FadeSlideIn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: widget.duration,
  );
  late final Animation<double> _curve = CurvedAnimation(
    parent: _controller,
    curve: AppMotion.standard,
  );
  Timer? _timer;
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (MediaQuery.disableAnimationsOf(context)) {
      _controller.value = 1;
    } else if (widget.delay == Duration.zero) {
      _controller.forward();
    } else {
      _timer = Timer(widget.delay, () {
        if (mounted) _controller.forward();
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _curve,
      child: widget.child,
      builder: (context, child) {
        final t = _curve.value;
        return Opacity(
          opacity: t,
          child: Transform.translate(
            offset: Offset(0, widget.offset * (1 - t)),
            child: Transform.scale(
              scale: widget.scaleFrom + (1 - widget.scaleFrom) * t,
              child: child,
            ),
          ),
        );
      },
    );
  }
}
