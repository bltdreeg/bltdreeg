import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';

/// Animated sheen over skeleton placeholders. Wrap a whole skeleton layout
/// once; the individual [SkeletonBox]es are plain shapes so a list of
/// placeholders costs a single animation.
class Shimmer extends StatefulWidget {
  const Shimmer({required this.child, super.key});

  final Widget child;

  @override
  State<Shimmer> createState() => _ShimmerState();
}

class _ShimmerState extends State<Shimmer> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1300),
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      _controller.stop();
    } else if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: AnimatedBuilder(
        animation: _controller,
        child: widget.child,
        builder: (context, child) {
          final t = _controller.value;
          return ShaderMask(
            blendMode: BlendMode.srcATop,
            shaderCallback: (rect) => LinearGradient(
              begin: Alignment(-1 + 3 * t - 1, 0),
              end: Alignment(3 * t - 1, 0),
              colors: const [AppColors.surf, Color(0xFFEDEFF2), AppColors.surf],
            ).createShader(rect),
            child: child,
          );
        },
      ),
    );
  }
}

class SkeletonBox extends StatelessWidget {
  const SkeletonBox({
    this.width,
    this.height,
    this.radius = AppRadius.sm,
    super.key,
  });

  final double? width;
  final double? height;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppColors.surf,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

/// Placeholder for `SalonListTile` while the first page loads.
class SalonListTileSkeleton extends StatelessWidget {
  const SalonListTileSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonBox(width: 86, height: 86, radius: AppRadius.md),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 4),
                SkeletonBox(width: 150, height: 14),
                SizedBox(height: 10),
                SkeletonBox(width: 200, height: 10),
                SizedBox(height: 12),
                SkeletonBox(width: 130, height: 24),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SalonRailCardSkeleton extends StatelessWidget {
  const SalonRailCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 218,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonBox(height: 104, radius: AppRadius.card),
          SizedBox(height: 10),
          SkeletonBox(width: 140, height: 13),
          SizedBox(height: 8),
          SkeletonBox(width: 100, height: 10),
        ],
      ),
    );
  }
}
