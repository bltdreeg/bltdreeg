import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salons/domain/entities/salon_summary.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../favorites_cubit.dart';
import '../widgets/favorite_button.dart';

/// Frames 34-35: favorites sorted by who can take you soonest, not by when
/// you saved them.
class FavoritesPage extends StatelessWidget {
  const FavoritesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<FavoritesCubit>(),
      child: const _FavoritesView(),
    );
  }
}

class _FavoritesView extends StatelessWidget {
  const _FavoritesView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<FavoritesCubit>().state;
    final cubit = context.read<FavoritesCubit>();
    final salons = state.salons;
    final now = DateTime.now();

    final Widget body;
    if (state.isEmpty) {
      body = Center(
        child: EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationFavoritesEmpty,
            width: 170,
          ),
          title: l10n.favoritesEmptyTitle,
          message: l10n.favoritesEmptyBody,
          primaryLabel: l10n.favoritesEmptyCta,
          onPrimary: context.goSearch,
        ),
      );
    } else if (salons.isEmpty && state.failure != null) {
      body = Center(
        child: EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationNoInternet,
            width: 170,
          ),
          title: l10n.favoritesLoadFailed,
          message: state.failure!.message(l10n),
          primaryLabel: l10n.actionRetry,
          onPrimary: cubit.refresh,
        ),
      );
    } else if (state.isLoading) {
      body = const Shimmer(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
          child: Column(
            children: [
              SalonListTileSkeleton(),
              SalonListTileSkeleton(),
              SalonListTileSkeleton(),
            ],
          ),
        ),
      );
    } else {
      body = RefreshIndicator.adaptive(
        onRefresh: cubit.refresh,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.gutter,
            0,
            AppSpacing.gutter,
            24,
          ),
          children: [
            for (final salon in salons)
              _FavoriteRow(
                key: ValueKey(salon.id),
                salon: salon,
                now: now,
                live: state.isLive,
              ),
            const SizedBox(height: 20),
            AppNotice(message: l10n.favoritesNotifyNote),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppTopBar(
        title: l10n.favoritesTitle,
        subtitle: salons.isEmpty ? null : l10n.favoritesSubtitle(salons.length),
        large: true,
      ),
      body: AnimatedSwitcher(duration: AppMotion.medium, child: body),
    );
  }
}

class _FavoriteRow extends StatelessWidget {
  const _FavoriteRow({
    required this.salon,
    required this.now,
    required this.live,
    super.key,
  });

  final SalonSummary salon;
  final DateTime now;
  final bool live;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<FavoritesCubit>();
    final open = salon.isOpen;
    final free = open && salon.queue.peopleAhead == 0;

    return SalonListTile(
      name: salon.name,
      imageUrl: salon.imageUrl,
      closedTag: open ? null : l10n.closedTag,
      onTap: () => context.pushSalon(salon.id),
      trailing: FavoriteButton(
        isFavorite: true,
        boxed: false,
        size: AppSizes.icon,
        onChanged: (_) => cubit.remove(salon.id),
      ),
      meta: MetaRow(
        items: [
          if (salon.rating != null)
            RatingLabel(rating: salon.rating!, muted: !open),
          SalonLabels.distance(context, salon.distanceKm),
          PriceMeta(
            prefix: l10n.priceFrom('').trim(),
            amount: SalonLabels.price(context, salon.priceFrom),
          ),
        ],
      ),
      status: SalonWaitPill(salon: salon, now: now, live: live),
      footer: SizedBox(
        height: 38,
        child: open
            ? AppButton(
                label: l10n.joinQueue,
                variant: free
                    ? AppButtonVariant.ghost
                    : AppButtonVariant.secondary,
                fontSize: 13.5,
                onPressed: () => context.pushSalon(salon.id),
              )
            : AppButton(
                label: l10n.viewSalon,
                variant: AppButtonVariant.secondary,
                fontSize: 13.5,
                onPressed: () => context.pushSalon(salon.id),
              ),
      ),
    );
  }
}
