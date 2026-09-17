import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/presentation/session/auth_session_cubit.dart';

/// Heart toggle with a pop on favorite. Favorites need an account, so a
/// guest is sent to login and returned here afterwards.
class FavoriteButton extends StatefulWidget {
  const FavoriteButton({
    required this.isFavorite,
    required this.onChanged,
    this.size = AppSizes.topBarButton,
    this.boxed = true,
    super.key,
  });

  final bool isFavorite;
  final ValueChanged<bool> onChanged;
  final double size;

  /// Outlined square (top bars) vs bare icon (list rows).
  final bool boxed;

  @override
  State<FavoriteButton> createState() => _FavoriteButtonState();
}

class _FavoriteButtonState extends State<FavoriteButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pop = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 420),
  );

  late final Animation<double> _scale = TweenSequence([
    TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.35), weight: 35),
    TweenSequenceItem(
      tween: Tween(
        begin: 1.35,
        end: 1.0,
      ).chain(CurveTween(curve: Curves.elasticOut)),
      weight: 65,
    ),
  ]).animate(_pop);

  @override
  void dispose() {
    _pop.dispose();
    super.dispose();
  }

  void _toggle() {
    if (!context.read<AuthSessionCubit>().state.isAuthenticated) {
      unawaited(
        context.pushLogin(from: GoRouterState.of(context).uri.toString()),
      );
      return;
    }
    final next = !widget.isFavorite;
    if (next && !context.reduceMotion) unawaited(_pop.forward(from: 0));
    unawaited(AppHaptics.tap());
    widget.onChanged(next);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final icon = ScaleTransition(
      scale: _scale,
      child: AnimatedSwitcher(
        duration: AppMotion.fast,
        child: AppIcon(
          widget.isFavorite ? AppAssets.iconHeartFilled : AppAssets.iconHeart,
          key: ValueKey(widget.isFavorite),
          size: widget.boxed ? AppSizes.icon : AppSizes.iconSm + 3,
          color: widget.isFavorite ? AppColors.error : AppColors.textPrimary,
        ),
      ),
    );
    final label = widget.isFavorite
        ? l10n.a11yRemoveFavorite
        : l10n.a11yAddFavorite;

    return AppPressable(
      onTap: _toggle,
      semanticLabel: label,
      child: widget.boxed
          ? Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                color: AppColors.bg,
                borderRadius: AppRadius.fieldAll,
                border: Border.all(color: AppColors.border),
              ),
              alignment: Alignment.center,
              child: icon,
            )
          : Padding(padding: const EdgeInsets.all(4), child: icon),
    );
  }
}
