import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_button.dart';

enum TopBarLeading {
  /// Back if the route can pop (default for pushed screens).
  auto,
  back,

  /// ✕ for modal-style screens (rating, gallery).
  close,
  none,
}

/// Top bar for every screen that isn't a root tab (spec 7: visible back
/// affordance). Matches the board: 38px outlined button, 16/800 title,
/// optional subtitle and trailing actions.
class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({
    this.title,
    this.subtitle,
    this.titleWidget,
    this.leading = TopBarLeading.auto,
    this.onLeadingPressed,
    this.actions = const [],
    this.showDivider = false,
    this.large = false,
    this.backgroundColor = AppColors.bg,
    super.key,
  });

  final String? title;
  final String? subtitle;
  final Widget? titleWidget;
  final TopBarLeading leading;

  /// Defaults to popping the route.
  final VoidCallback? onLeadingPressed;
  final List<Widget> actions;
  final bool showDivider;

  /// 18px title for list screens (notifications, favorites).
  final bool large;
  final Color backgroundColor;

  @override
  Size get preferredSize => Size.fromHeight(subtitle != null ? 64 : 56);

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final canPop =
        GoRouter.maybeOf(context)?.canPop() ?? Navigator.of(context).canPop();
    final resolved = switch (leading) {
      TopBarLeading.auto => canPop ? TopBarLeading.back : TopBarLeading.none,
      _ => leading,
    };
    final onLeading =
        onLeadingPressed ?? () => Navigator.of(context).maybePop();

    return Material(
      color: backgroundColor,
      child: SafeArea(
        bottom: false,
        child: Container(
          height: preferredSize.height,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.gutter),
          decoration: BoxDecoration(
            border: showDivider
                ? const Border(bottom: BorderSide(color: AppColors.divider))
                : null,
          ),
          child: Row(
            children: [
              if (resolved != TopBarLeading.none) ...[
                AppIconButton(
                  icon: resolved == TopBarLeading.close
                      ? AppAssets.iconClose
                      : AppAssets.iconChevronLeft,
                  matchTextDirection: resolved == TopBarLeading.back,
                  onPressed: onLeading,
                  semanticLabel: resolved == TopBarLeading.close
                      ? l10n.actionClose
                      : l10n.actionBack,
                ),
                const SizedBox(width: AppSpacing.md),
              ],
              Expanded(
                child:
                    titleWidget ??
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (title != null)
                          Semantics(
                            header: true,
                            child: Text(
                              title!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: large
                                  ? AppTypography.topBarTitle.copyWith(
                                      fontSize: 18,
                                    )
                                  : AppTypography.topBarTitle,
                            ),
                          ),
                        if (subtitle != null)
                          Text(
                            subtitle!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption,
                          ),
                      ],
                    ),
              ),
              for (final action in actions) ...[
                const SizedBox(width: AppSpacing.sm),
                action,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
