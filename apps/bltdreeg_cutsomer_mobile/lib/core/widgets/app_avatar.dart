import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_image.dart';

enum AppAvatarTone { brand, neutral, disabled }

/// Circular avatar with an initials fallback (`ك ع`).
class AppAvatar extends StatelessWidget {
  const AppAvatar({
    required this.name,
    this.size = 52,
    this.imageUrl,
    this.tone = AppAvatarTone.brand,
    this.bordered = true,
    super.key,
  });

  final String name;
  final double size;
  final String? imageUrl;
  final AppAvatarTone tone;
  final bool bordered;

  @override
  Widget build(BuildContext context) {
    final (bg, border, fg) = switch (tone) {
      AppAvatarTone.brand => (
        AppColors.tealTint,
        AppColors.tealTint2,
        AppColors.tealDark,
      ),
      AppAvatarTone.neutral => (
        AppColors.surf,
        AppColors.border,
        AppColors.textSecondary,
      ),
      AppAvatarTone.disabled => (
        AppColors.surf,
        AppColors.surf,
        AppColors.textDisabled,
      ),
    };

    final initials = Text(
      name.initials,
      maxLines: 1,
      style: AppTypography.titleMd.copyWith(
        fontSize: size * 0.32,
        color: fg,
        height: 1,
      ),
    );

    return Container(
      width: size,
      height: size,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: bg,
        shape: BoxShape.circle,
        border: bordered ? Border.all(color: border) : null,
      ),
      alignment: Alignment.center,
      child: imageUrl == null
          ? initials
          : AppNetworkImage(
              url: imageUrl,
              fallback: Center(child: initials),
            ),
    );
  }
}
