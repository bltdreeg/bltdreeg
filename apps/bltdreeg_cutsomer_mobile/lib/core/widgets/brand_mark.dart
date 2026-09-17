import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_icon.dart';

/// Teal rounded square with scissors: the app mark.
class BrandMark extends StatelessWidget {
  const BrandMark({this.size = 30, this.tinted = false, super.key});

  final double size;

  /// Teal-tint background with dark icon (OTP header style).
  final bool tinted;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: tinted ? AppColors.tealTint : AppColors.primary,
        borderRadius: BorderRadius.circular(size * 0.27),
      ),
      alignment: Alignment.center,
      child: AppIcon(
        AppAssets.iconScissors,
        size: size * 0.5,
        color: tinted ? AppColors.tealDark : AppColors.onPrimary,
      ),
    );
  }
}

/// Brand mark + wordmark ("بالتدريج") used in onboarding headers.
class BrandLockup extends StatelessWidget {
  const BrandLockup({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const BrandMark(),
        const SizedBox(width: 8),
        Text(
          context.l10n.appName,
          style: AppTypography.itemTitle.copyWith(
            fontSize: 15,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}
