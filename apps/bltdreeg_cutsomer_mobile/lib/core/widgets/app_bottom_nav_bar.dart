import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

final class AppNavItem {
  const AppNavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.showDot = false,
  });

  final String icon;

  /// Heavier-stroke variant for the selected tab (board: stroke 2.1).
  final String activeIcon;
  final String label;
  final bool showDot;
}

/// Bottom navigation (`.nav`): translucent white, top hairline, upward
/// float shadow, teal active item with bold icon.
class AppBottomNavBar extends StatelessWidget {
  const AppBottomNavBar({
    required this.items,
    required this.currentIndex,
    required this.onTap,
    this.enabled = true,
    super.key,
  });

  final List<AppNavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;

  /// Dimmed while the full-screen offline view is shown (frame 18).
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      duration: AppMotion.fast,
      opacity: enabled ? 1 : 0.45,
      child: DecoratedBox(
        decoration: const BoxDecoration(
          color: AppColors.navBackground,
          border: Border(top: BorderSide(color: AppColors.divider)),
          boxShadow: AppShadows.float,
        ),
        child: SafeArea(
          top: false,
          minimum: const EdgeInsets.only(bottom: 10),
          child: SizedBox(
            height: AppSizes.bottomNavHeight - 10,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(6, 10, 6, 0),
              child: Row(
                children: [
                  for (var i = 0; i < items.length; i++)
                    Expanded(
                      child: _NavButton(
                        item: items[i],
                        selected: i == currentIndex,
                        onTap: enabled ? () => onTap(i) : null,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final AppNavItem item;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? AppColors.primary : AppColors.textSecondary;
    return AppPressable(
      onTap: onTap,
      pressedScale: 0.92,
      semanticLabel: item.label,
      child: Semantics(
        selected: selected,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                TweenAnimationBuilder<Color?>(
                  tween: ColorTween(end: color),
                  duration: AppMotion.fast,
                  builder: (_, c, _) =>
                      AppIcon(selected ? item.activeIcon : item.icon, color: c),
                ),
                if (item.showDot)
                  PositionedDirectional(
                    top: -1,
                    end: -2,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: AppColors.error,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.bg, width: 1.5),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            AnimatedDefaultTextStyle(
              duration: AppMotion.fast,
              style: AppTypography.navLabel.copyWith(
                color: color,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
              ),
              child: Text(item.label, maxLines: 1),
            ),
          ],
        ),
      ),
    );
  }
}
