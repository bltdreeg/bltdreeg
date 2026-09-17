import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_tone.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_icon.dart';

enum AppBadgeStyle {
  /// Solid teal (`.badge.live`).
  live,

  /// Warn tint (`.badge.soon`).
  soon,

  /// Surface + border (`.badge.done`).
  done,

  /// Error tint (`.badge.miss`).
  missed,

  /// Success tint ("مفتوح دلوقتي", "متأكّد").
  success,
}

class AppBadge extends StatelessWidget {
  const AppBadge({
    required this.label,
    this.style = AppBadgeStyle.done,
    this.icon,
    this.iconColor,
    this.height = 26,
    this.fontSize = 12,
    super.key,
  });

  final String label;
  final AppBadgeStyle style;
  final String? icon;
  final Color? iconColor;
  final double height;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    final (bg, fg, border) = switch (style) {
      AppBadgeStyle.live => (AppColors.primary, AppColors.onPrimary, null),
      AppBadgeStyle.soon => (AppColors.warnTint, AppColors.warnText, null),
      AppBadgeStyle.done => (
        AppColors.surf,
        AppColors.textSecondary,
        AppColors.border,
      ),
      AppBadgeStyle.missed => (AppColors.errTint, AppColors.errText, null),
      AppBadgeStyle.success => (AppColors.okTint, AppColors.okDark, null),
    };
    return Container(
      height: height,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(7),
        border: border == null ? null : Border.all(color: border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            AppIcon(icon!, size: fontSize + 1, color: iconColor ?? fg),
            const SizedBox(width: 5),
          ],
          Text(
            label,
            style: AppTypography.badge.copyWith(color: fg, fontSize: fontSize),
          ),
        ],
      ),
    );
  }
}

/// Queue-load level shared by list pills and photo pins.
enum WaitLevel {
  free(AppTone.success),
  moderate(AppTone.warning),
  busy(AppTone.danger),
  closed(AppTone.neutral);

  const WaitLevel(this.tone);

  final AppTone tone;
}

/// `.wait` pill under salon names ("فاضل ٢ أنفار — استنى ~١٥ د").
class WaitStatusPill extends StatelessWidget {
  const WaitStatusPill({
    required this.label,
    required this.level,
    required this.icon,
    super.key,
  });

  final String label;
  final WaitLevel level;
  final String icon;

  @override
  Widget build(BuildContext context) {
    final tone = level.tone;
    final fg = level == WaitLevel.closed
        ? AppColors.textSecondary
        : tone.foreground;
    return Container(
      height: 27,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: tone.background,
        borderRadius: AppRadius.smAll,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AppIcon(icon, size: 14, color: fg),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.metaStrong.copyWith(color: fg),
            ),
          ),
        ],
      ),
    );
  }
}

/// White status pin floating on salon photos (`.pin`).
class AvailabilityPin extends StatelessWidget {
  const AvailabilityPin({required this.label, required this.level, super.key});

  final String label;
  final WaitLevel level;

  @override
  Widget build(BuildContext context) {
    final tone = level.tone;
    return Container(
      height: 26,
      padding: const EdgeInsets.symmetric(horizontal: 9),
      decoration: const BoxDecoration(
        color: Color(0xF0FFFFFF),
        borderRadius: AppRadius.pillAll,
        boxShadow: AppShadows.pin,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(
              color: tone.solid,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: AppTypography.tag.copyWith(color: tone.foreground),
          ),
        ],
      ),
    );
  }
}

/// Green "لايف" pill with a pulsing dot: the queue screens update in real
/// time and this makes that visible without being noisy.
class LiveIndicator extends StatefulWidget {
  const LiveIndicator({this.active = true, super.key});

  /// False freezes the pulse and greys the pill (e.g. while offline).
  final bool active;

  @override
  State<LiveIndicator> createState() => _LiveIndicatorState();
}

class _LiveIndicatorState extends State<LiveIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _sync();
  }

  @override
  void didUpdateWidget(covariant LiveIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    _sync();
  }

  void _sync() {
    if (widget.active && !context.reduceMotion) {
      if (!_pulse.isAnimating) _pulse.repeat();
    } else {
      _pulse.stop();
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tone = widget.active ? AppTone.success : AppTone.neutral;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: tone.background,
        borderRadius: AppRadius.pillAll,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox.square(
            dimension: 7,
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                if (widget.active)
                  AnimatedBuilder(
                    animation: _pulse,
                    builder: (context, _) => Transform.scale(
                      scale: 1 + _pulse.value * 1.6,
                      child: Opacity(
                        opacity: (1 - _pulse.value) * 0.5,
                        child: Container(
                          decoration: BoxDecoration(
                            color: tone.solid,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                Container(
                  decoration: BoxDecoration(
                    color: tone.solid,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 6),
          Text(
            context.l10n.liveLabel,
            style: AppTypography.tag.copyWith(
              color: tone.foreground,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

/// Small solid status dot (support online, active booking).
class StatusDot extends StatelessWidget {
  const StatusDot({this.color = AppColors.success, this.size = 8, super.key});

  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(color: color, shape: BoxShape.circle),
  );
}
