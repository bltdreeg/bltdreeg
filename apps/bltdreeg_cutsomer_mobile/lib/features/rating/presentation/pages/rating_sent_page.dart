import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../rating_cubits.dart';
import '../widgets/rating_sent_illustration.dart';

/// Frame 41: says where the rating went and when it shows up, and uses the
/// moment to suggest favoriting the salon.
class RatingSentPage extends StatelessWidget {
  const RatingSentPage({required this.bookingId, super.key});

  final String bookingId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<RatingSentCubit>(param1: bookingId),
      child: const _RatingSentView(),
    );
  }
}

class _RatingSentView extends StatelessWidget {
  const _RatingSentView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<RatingSentCubit>().state;
    final rating = state.rating;
    final salonName = state.booking?.salonName;

    // The rating form sits underneath in the route stack; going back to it
    // would offer to rate again, so every exit goes home.
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.goHome();
      },
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              Positioned.fill(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.gutter,
                      56,
                      AppSpacing.gutter,
                      30,
                    ),
                    child: Column(
                      children: [
                        const RatingSentIllustration(),
                        const SizedBox(height: 14),
                        FadeSlideIn(
                          delay: const Duration(milliseconds: 700),
                          child: Column(
                            children: [
                              Semantics(
                                header: true,
                                liveRegion: true,
                                child: Text(
                                  l10n.ratingSentTitle,
                                  textAlign: TextAlign.center,
                                  style: AppTypography.emptyTitle.copyWith(
                                    fontSize: 21,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                l10n.ratingSentBody,
                                textAlign: TextAlign.center,
                                style: AppTypography.bodyLong.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              // Only meaningful while actually offline: a
                              // queued rating goes out within moments once
                              // there's a connection.
                              if (state.isPending &&
                                  !context.watchIsOnline) ...[
                                const SizedBox(height: 12),
                                AppNotice(
                                  tone: AppTone.warning,
                                  icon: AppAssets.iconWifiOff,
                                  message: l10n.ratingSentOfflineNote,
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),
                        if (salonName != null && rating != null)
                          FadeSlideIn(
                            delay: const Duration(milliseconds: 850),
                            child: _RatedSalonCard(
                              salonName: salonName,
                              stars: rating.overall,
                            ),
                          ),
                        if (state.loaded && salonName != null)
                          FadeSlideIn(
                            delay: const Duration(milliseconds: 1000),
                            child: Padding(
                              padding: const EdgeInsets.only(top: 12),
                              child: _FavoriteSuggestion(
                                isFavorite: state.isFavorite,
                              ),
                            ),
                          ),
                        const SizedBox(height: 14),
                        FadeSlideIn(
                          delay: const Duration(milliseconds: 1100),
                          child: AppButton(
                            label: l10n.backToHomeDone,
                            variant: AppButtonVariant.secondary,
                            height: 50,
                            fontSize: 15,
                            onPressed: context.goHome,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              PositionedDirectional(
                top: 6,
                start: AppSpacing.gutter,
                child: AppIconButton(
                  icon: AppAssets.iconClose,
                  semanticLabel: l10n.actionClose,
                  onPressed: context.goHome,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RatedSalonCard extends StatelessWidget {
  const _RatedSalonCard({required this.salonName, required this.stars});

  final String salonName;
  final int stars;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          const SalonThumbnail(size: 48, radius: 10, iconSize: AppSizes.iconSm),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  salonName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.bodyStrong.copyWith(fontSize: 14.5),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    StarRatingDisplay(rating: stars, size: 14),
                    const SizedBox(width: 5),
                    Text(
                      context.l10n.yourRatingCaption,
                      style: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FavoriteSuggestion extends StatelessWidget {
  const _FavoriteSuggestion({required this.isFavorite});

  final bool isFavorite;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.tealTint,
        borderRadius: AppRadius.cardAll,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              AppIcon(
                isFavorite ? AppAssets.iconHeartFilled : AppAssets.iconHeart,
                color: AppColors.error,
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFavorite
                          ? l10n.addedToFavorites
                          : l10n.addToFavoritesTitle,
                      style: AppTypography.bodyStrong.copyWith(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.tealDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      l10n.addToFavoritesBody,
                      style: AppTypography.metaStrong.copyWith(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.tealDark,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          AnimatedSize(
            duration: AppMotion.medium,
            child: isFavorite
                ? const SizedBox(width: double.infinity)
                : Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: AppButton(
                      label: l10n.addToFavoritesAction,
                      variant: AppButtonVariant.onTint,
                      height: 44,
                      fontSize: 14,
                      onPressed: context.read<RatingSentCubit>().addToFavorites,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
