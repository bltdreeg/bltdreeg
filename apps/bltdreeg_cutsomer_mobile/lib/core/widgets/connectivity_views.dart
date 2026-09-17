import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_card.dart';
import 'app_icon.dart';
import 'app_illustration.dart';
import 'app_pressable.dart';
import 'empty_state_view.dart';

/// Top banner shown when offline but cached data is on screen (frame 08).
/// Slides in/out with its own size animation when [visible] changes.
class OfflineBanner extends StatelessWidget {
  const OfflineBanner({
    required this.visible,
    required this.onRetry,
    this.lastUpdated,
    super.key,
  });

  final bool visible;
  final VoidCallback onRetry;

  /// Time of the cached data; the banner says the numbers may be stale.
  final DateTime? lastUpdated;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final message = lastUpdated == null
        ? l10n.errorNetwork
        : l10n.offlineBanner(context.fmt.time(lastUpdated!));

    return AnimatedSize(
      duration: AppMotion.medium,
      curve: AppMotion.standard,
      alignment: Alignment.topCenter,
      child: !visible
          ? const SizedBox(width: double.infinity)
          : Semantics(
              liveRegion: true,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.gutter,
                  vertical: 9,
                ),
                decoration: const BoxDecoration(
                  color: AppColors.warnTint,
                  border: Border(
                    bottom: BorderSide(color: AppColors.warnBorder),
                  ),
                ),
                child: Row(
                  children: [
                    const AppIcon(
                      AppAssets.iconWifiOff,
                      size: AppSizes.iconSm,
                      color: AppColors.warnText,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        message,
                        style: AppTypography.metaStrong.copyWith(
                          color: AppColors.warnText,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    AppPressable(
                      onTap: onRetry,
                      semanticLabel: l10n.actionRetry,
                      child: Text(
                        l10n.actionRetry,
                        style: AppTypography.metaStrong.copyWith(
                          color: AppColors.warnText,
                          fontWeight: FontWeight.w800,
                          decoration: TextDecoration.underline,
                          decorationColor: AppColors.warnText,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

/// Full-screen offline state when nothing is cached (frame 18).
class NoConnectionView extends StatelessWidget {
  const NoConnectionView({
    required this.onRetry,
    this.onOpenLastBooking,
    this.isRetrying = false,
    super.key,
  });

  final VoidCallback onRetry;
  final VoidCallback? onOpenLastBooking;
  final bool isRetrying;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Center(
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            EmptyStateView(
              padding: const EdgeInsets.fromLTRB(34, 36, 34, 0),
              expandActions: true,
              illustration: const AppIllustration(
                AppAssets.illustrationNoInternet,
                width: 190,
              ),
              title: l10n.offlineTitle,
              message: l10n.offlineBody,
              primaryLabel: l10n.actionRetry,
              primaryIcon: AppAssets.iconRefresh,
              onPrimary: isRetrying ? null : onRetry,
              secondaryLabel: onOpenLastBooking == null
                  ? null
                  : l10n.offlineOpenLastBooking,
              onSecondary: onOpenLastBooking,
            ),
            const SizedBox(height: 28),
            Padding(
              padding: AppSpacing.pageH,
              child: AppCard(
                color: AppColors.surf,
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.offlineTipsTitle,
                      style: AppTypography.label.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _Tip(l10n.offlineTipData),
                    const SizedBox(height: 8),
                    _Tip(l10n.offlineTipAirplane),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _Tip extends StatelessWidget {
  const _Tip(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 5,
          height: 5,
          decoration: const BoxDecoration(
            color: AppColors.textSecondary,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 9),
        Expanded(
          child: Text(text, style: AppTypography.note.copyWith(height: 1.5)),
        ),
      ],
    );
  }
}
