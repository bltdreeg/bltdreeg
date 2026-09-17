import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/app_illustration.dart';

const _viewBox = Size(280, 240);

/// Base for onboarding art: a one-shot [entrance] played the first time the
/// slide becomes [active], and a [loop] that only runs while it's active.
/// With reduce-motion on, the final frame is shown statically.
abstract class _AnimatedIllustration extends StatefulWidget {
  const _AnimatedIllustration({required this.active, super.key});

  final bool active;
}

abstract class _AnimatedIllustrationState<T extends _AnimatedIllustration>
    extends State<T>
    with TickerProviderStateMixin {
  Duration get entranceDuration;
  Duration get loopDuration;

  late final AnimationController entrance = AnimationController(
    vsync: this,
    duration: entranceDuration,
  );
  late final AnimationController loop = AnimationController(
    vsync: this,
    duration: loopDuration,
  );

  bool reduceMotion = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    reduceMotion = MediaQuery.disableAnimationsOf(context);
    _sync();
  }

  @override
  void didUpdateWidget(covariant T oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.active != widget.active) _sync();
  }

  void _sync() {
    if (reduceMotion) {
      entrance.value = 1;
      loop.stop();
      onActiveChanged(active: widget.active, animate: false);
      return;
    }
    if (widget.active) {
      if (entrance.isDismissed) {
        unawaited(entrance.forward().whenComplete(onEntranceDone));
      }
      if (!loop.isAnimating) unawaited(loop.repeat());
    } else {
      loop.stop();
    }
    onActiveChanged(active: widget.active, animate: true);
  }

  void onEntranceDone() {}

  void onActiveChanged({required bool active, required bool animate}) {}

  /// Progress of [entrance] within [begin, end], eased by [curve].
  /// Overshooting curves (back / elastic) may exceed 1 on purpose.
  double phase(double begin, double end, [Curve curve = Curves.easeOutCubic]) {
    final t = ((entrance.value - begin) / (end - begin)).clamp(0.0, 1.0);
    return curve.transform(t);
  }

  double get loopSin => math.sin(loop.value * 2 * math.pi);

  @override
  void dispose() {
    entrance.dispose();
    loop.dispose();
    super.dispose();
  }

  Widget buildFrame(BuildContext context);

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([entrance, loop]),
      builder: (context, _) => IllustrationCanvas(
        viewBox: _viewBox,
        children: [buildFrame(context)],
      ),
    );
  }
}

/// Wraps a list of layers so [buildFrame] can return a single widget.
class _Layers extends StatelessWidget {
  const _Layers(this.children);

  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Positioned.fill(
    child: Stack(clipBehavior: Clip.none, children: children),
  );
}

// ---------------------------------------------------------------------------
// Slide 1 — salons near you: the map pin drops onto the neighbourhood.
// ---------------------------------------------------------------------------

class FindSalonsIllustration extends _AnimatedIllustration {
  const FindSalonsIllustration({required super.active, super.key});

  @override
  State<FindSalonsIllustration> createState() => _FindSalonsState();
}

class _FindSalonsState
    extends _AnimatedIllustrationState<FindSalonsIllustration> {
  @override
  Duration get entranceDuration => const Duration(milliseconds: 1300);

  @override
  Duration get loopDuration => const Duration(milliseconds: 2600);

  @override
  Widget buildFrame(BuildContext context) {
    final drop = phase(0.25, 0.8, Curves.bounceOut);
    final float = entrance.isCompleted ? loopSin * 3 : 0.0;
    return _Layers([
      IllustrationLayer(
        AppAssets.illustrationOnboardingFindSalonsScene,
        opacity: phase(0, 0.35),
        scale: 0.94 + 0.06 * phase(0, 0.45),
        pivot: const Offset(140, 170),
      ),
      IllustrationLayer(
        AppAssets.illustrationOnboardingFindSalonsPin,
        opacity: phase(0.25, 0.4),
        offset: Offset(0, -56 * (1 - drop) + float),
      ),
    ]);
  }
}

// ---------------------------------------------------------------------------
// Slide 2 — live queue: the number ticks down while the clock keeps moving.
// ---------------------------------------------------------------------------

class LiveQueueIllustration extends _AnimatedIllustration {
  const LiveQueueIllustration({required super.active, super.key});

  @override
  State<LiveQueueIllustration> createState() => _LiveQueueState();
}

class _LiveQueueState
    extends _AnimatedIllustrationState<LiveQueueIllustration> {
  static const _start = 6;
  static const _end = 4;

  int _number = _start;
  Timer? _ticker;

  @override
  Duration get entranceDuration => const Duration(milliseconds: 700);

  @override
  Duration get loopDuration => const Duration(seconds: 6);

  @override
  void onActiveChanged({required bool active, required bool animate}) {
    _ticker?.cancel();
    if (!animate) {
      _number = _end;
      return;
    }
    if (active && _number > _end) {
      _ticker = Timer.periodic(const Duration(milliseconds: 1100), (t) {
        if (!mounted) return t.cancel();
        setState(() => _number--);
        if (_number <= _end) t.cancel();
      });
    }
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  /// Odometer-style swap: the new value rises in from below while the old
  /// one exits upward, clipped to its slot.
  Widget _swap(String text, TextStyle style) => ClipRect(
    child: AnimatedSwitcher(
      duration: const Duration(milliseconds: 360),
      switchInCurve: Curves.easeOutCubic,
      switchOutCurve: Curves.easeInCubic,
      transitionBuilder: (child, animation) {
        final incoming = child.key == ValueKey(text);
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween(
              begin: Offset(0, incoming ? 0.8 : -0.8),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: FittedBox(
        key: ValueKey(text),
        fit: BoxFit.scaleDown,
        child: Text(text, maxLines: 1, style: style),
      ),
    ),
  );

  @override
  Widget buildFrame(BuildContext context) {
    final l10n = context.l10n;
    final ahead = _number - 2;
    final fade = phase(0, 1);
    return _Layers([
      IllustrationLayer(
        AppAssets.illustrationOnboardingLiveQueueScene,
        opacity: fade,
        scale: 0.95 + 0.05 * fade,
        pivot: const Offset(140, 120),
      ),
      IllustrationLayer(
        AppAssets.illustrationOnboardingLiveQueueClockHands,
        opacity: fade,
        rotation: reduceMotion ? 0 : loop.value * 2 * math.pi,
        pivot: const Offset(234, 170),
      ),
      IllustrationLabel(
        center: const Offset(140, 73),
        maxWidth: 64,
        child: _swap(
          '$_number',
          AppTypography.displayXs.copyWith(
            fontSize: 26,
            color: AppColors.onPrimary,
            height: 1.1,
          ),
        ),
      ),
      IllustrationLabel(
        center: const Offset(140, 110),
        maxWidth: 80,
        child: Text(
          l10n.queueNumberCaption,
          maxLines: 1,
          style: AppTypography.caption.copyWith(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            height: 1.2,
          ),
        ),
      ),
      IllustrationLabel(
        center: const Offset(140, 134),
        maxWidth: 64,
        child: _swap(
          l10n.peopleLeft(ahead),
          AppTypography.tag.copyWith(
            fontSize: 10.5,
            color: AppColors.okDark,
            height: 1.2,
          ),
        ),
      ),
      IllustrationLabel(
        center: const Offset(140, 160),
        maxWidth: 64,
        child: _swap(
          l10n.approxMinutes(ahead * 10),
          AppTypography.tag.copyWith(
            fontSize: 10.5,
            color: AppColors.textSecondary,
            height: 1.2,
          ),
        ),
      ),
    ]);
  }
}

// ---------------------------------------------------------------------------
// Slide 3 — pick your barber (required animation, frame 03): the scene
// assembles in sequence, stars twinkle, scissors snip, prices pop in.
// ---------------------------------------------------------------------------

class ChooseBarberIllustration extends _AnimatedIllustration {
  const ChooseBarberIllustration({required super.active, super.key});

  @override
  State<ChooseBarberIllustration> createState() => _ChooseBarberState();
}

class _ChooseBarberState
    extends _AnimatedIllustrationState<ChooseBarberIllustration> {
  /// Where the two blades cross, in viewBox units.
  static const _scissorsPivot = Offset(202.9, 168);

  @override
  Duration get entranceDuration => const Duration(milliseconds: 1500);

  @override
  Duration get loopDuration => const Duration(milliseconds: 2400);

  @override
  Widget buildFrame(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final settled = entrance.isCompleted && !reduceMotion;

    // Loop-driven motion, only after the entrance settles.
    final twinkleL = settled ? 1 + 0.12 * loopSin : 1.0;
    final twinkleR = settled ? 1 - 0.12 * loopSin : 1.0;
    // Two quick snips per loop, then rest.
    final snipWave = math.sin(loop.value * 4 * math.pi);
    final snip = settled && loop.value < 0.5 ? 0.2 * snipWave.abs() : 0.0;

    final chairIn = phase(0.12, 0.5);
    final scissorsIn = phase(0.45, 0.7);

    return _Layers([
      IllustrationLayer(
        AppAssets.illustrationOnboardingChooseBarberBackground,
        opacity: phase(0, 0.2),
        scale: phase(0, 0.4, Curves.easeOutBack) * 0.15 + 0.85,
        pivot: const Offset(140, 118),
      ),
      IllustrationLayer(
        AppAssets.illustrationOnboardingChooseBarberChair,
        opacity: chairIn,
        offset: Offset(0, 22 * (1 - chairIn)),
      ),
      IllustrationLayer(
        AppAssets.illustrationOnboardingChooseBarberStarLeft,
        scale: phase(0.42, 0.72, Curves.elasticOut) * twinkleL,
        pivot: const Offset(78, 53),
      ),
      IllustrationLayer(
        AppAssets.illustrationOnboardingChooseBarberStarRight,
        scale: phase(0.52, 0.82, Curves.elasticOut) * twinkleR,
        pivot: const Offset(202, 53),
      ),
      IllustrationLayer(
        AppAssets.illustrationOnboardingChooseBarberScissorsBladeTop,
        opacity: scissorsIn,
        rotation: -snip,
        pivot: _scissorsPivot,
      ),
      IllustrationLayer(
        AppAssets.illustrationOnboardingChooseBarberScissorsBladeBottom,
        opacity: scissorsIn,
        rotation: snip,
        pivot: _scissorsPivot,
      ),
      IllustrationLabel(
        center: const Offset(56, 155),
        maxWidth: 90,
        child: Transform.scale(
          scale: phase(0.68, 0.9, Curves.easeOutBack),
          child: _PricePill(
            label: l10n.priceEgp(fmt.number(85)),
            color: AppColors.okDark,
            border: AppColors.success,
          ),
        ),
      ),
      IllustrationLabel(
        center: const Offset(56, 183),
        maxWidth: 90,
        child: Transform.scale(
          scale: phase(0.78, 1, Curves.easeOutBack),
          child: _PricePill(
            label: l10n.durationMinutes(25),
            color: AppColors.textSecondary,
            border: AppColors.textSecondary,
          ),
        ),
      ),
    ]);
  }
}

class _PricePill extends StatelessWidget {
  const _PricePill({
    required this.label,
    required this.color,
    required this.border,
  });

  final String label;
  final Color color;
  final Color border;

  @override
  Widget build(BuildContext context) {
    // No alignment: the pill must hug its label, not fill the slot.
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
      decoration: BoxDecoration(
        color: AppColors.bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: border, width: 2.2),
      ),
      child: Text(
        label,
        maxLines: 1,
        style: AppTypography.tag.copyWith(
          fontSize: 10.5,
          fontWeight: FontWeight.w800,
          color: color,
          height: 1.1,
        ),
      ),
    );
  }
}
