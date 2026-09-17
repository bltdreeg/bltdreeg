import 'dart:async';

import 'package:flutter/material.dart';

import '../theme/app_dimens.dart';

/// The single press-feedback primitive of the app (spec 6.4).
///
/// On press-down the child scales to [AppMotion.pressedScale] quickly; on
/// release or cancel it springs back to 1.0. A tap that finishes before the
/// press-in completes still plays a visible press. Buttons, chips, cards,
/// rows and nav items all build on this instead of ink ripples.
///
/// Respects the OS reduce-motion setting (no scaling, taps still work).
class AppPressable extends StatefulWidget {
  const AppPressable({
    required this.child,
    this.onTap,
    this.onLongPress,
    this.enabled = true,
    this.pressedScale = AppMotion.pressedScale,
    this.semanticLabel,
    this.isButton = true,
    this.behavior = HitTestBehavior.opaque,
    super.key,
  });

  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final bool enabled;
  final double pressedScale;
  final String? semanticLabel;
  final bool isButton;
  final HitTestBehavior behavior;

  @override
  State<AppPressable> createState() => _AppPressableState();
}

class _AppPressableState extends State<AppPressable>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: AppMotion.press,
    reverseDuration: AppMotion.release,
  );

  late final Animation<double> _scale =
      Tween<double>(begin: 1, end: widget.pressedScale).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Curves.easeOut,
          reverseCurve: Curves.easeOutBack,
        ),
      );

  bool get _interactive =>
      widget.enabled && (widget.onTap != null || widget.onLongPress != null);

  bool get _animate => !MediaQuery.disableAnimationsOf(context);

  void _down(TapDownDetails _) {
    if (_animate) _controller.forward();
  }

  Future<void> _up(TapUpDetails _) async {
    if (!_animate) return;
    // Let very quick taps still show the press before springing back.
    if (_controller.value < 1) {
      await _controller.forward();
    }
    if (mounted) unawaited(_controller.reverse());
  }

  void _cancel() {
    if (_animate) _controller.reverse();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final interactive = _interactive;
    return Semantics(
      button: widget.isButton,
      enabled: widget.enabled,
      label: widget.semanticLabel,
      child: MouseRegion(
        cursor: interactive ? SystemMouseCursors.click : MouseCursor.defer,
        child: GestureDetector(
          behavior: widget.behavior,
          onTapDown: interactive ? _down : null,
          onTapUp: interactive ? _up : null,
          onTapCancel: interactive ? _cancel : null,
          onTap: interactive ? widget.onTap : null,
          onLongPress: interactive ? widget.onLongPress : null,
          child: ScaleTransition(scale: _scale, child: widget.child),
        ),
      ),
    );
  }
}
