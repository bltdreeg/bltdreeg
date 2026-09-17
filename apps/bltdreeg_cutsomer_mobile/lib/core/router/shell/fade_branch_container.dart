import 'package:flutter/material.dart';

/// Hosts the bottom-nav branch navigators and cross-fades between them.
///
/// Every branch stays mounted, so each tab keeps its own navigation stack and
/// scroll/bloc state. Inactive branches have tickers muted, ignore pointers,
/// are excluded from semantics, and go fully offstage once faded out, so
/// hidden tabs cost nothing to paint.
class FadeBranchContainer extends StatelessWidget {
  const FadeBranchContainer({
    required this.currentIndex,
    required this.children,
    super.key,
  });

  final int currentIndex;
  final List<Widget> children;

  static const duration = Duration(milliseconds: 220);

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        for (var i = 0; i < children.length; i++)
          _FadeBranch(
            key: ValueKey<int>(i),
            active: i == currentIndex,
            child: children[i],
          ),
      ],
    );
  }
}

class _FadeBranch extends StatefulWidget {
  const _FadeBranch({required this.active, required this.child, super.key});

  final bool active;
  final Widget child;

  @override
  State<_FadeBranch> createState() => _FadeBranchState();
}

class _FadeBranchState extends State<_FadeBranch>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: FadeBranchContainer.duration,
    value: widget.active ? 1 : 0,
  )..addStatusListener((_) => setState(() {}));

  late final Animation<double> _opacity = CurvedAnimation(
    parent: _controller,
    curve: Curves.easeOut,
    reverseCurve: Curves.easeIn,
  );

  @override
  void didUpdateWidget(covariant _FadeBranch oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active == oldWidget.active) return;
    if (MediaQuery.disableAnimationsOf(context)) {
      _controller.value = widget.active ? 1 : 0;
    } else if (widget.active) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hidden = !widget.active && _controller.isDismissed;
    return Offstage(
      offstage: hidden,
      child: TickerMode(
        enabled: widget.active,
        child: IgnorePointer(
          ignoring: !widget.active,
          child: ExcludeSemantics(
            excluding: !widget.active,
            child: FadeTransition(opacity: _opacity, child: widget.child),
          ),
        ),
      ),
    );
  }
}
