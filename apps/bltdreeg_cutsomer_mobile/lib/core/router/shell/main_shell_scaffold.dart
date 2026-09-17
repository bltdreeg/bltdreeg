import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../assets/app_assets.dart';
import '../../utils/context_extensions.dart';
import '../../widgets/app_bottom_nav_bar.dart';

/// Scaffold for the four bottom-nav tabs.
class MainShellScaffold extends StatelessWidget {
  const MainShellScaffold({
    required this.navigationShell,
    required this.body,
    super.key,
  });

  final StatefulNavigationShell navigationShell;
  final Widget body;

  void _onTap(int index) => navigationShell.goBranch(
    index,
    // Re-tapping the active tab pops it back to its root.
    initialLocation: index == navigationShell.currentIndex,
  );

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: body,
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: navigationShell.currentIndex,
        onTap: _onTap,
        items: [
          AppNavItem(
            icon: AppAssets.iconHome,
            activeIcon: AppAssets.iconHomeBold,
            label: l10n.navHome,
          ),
          AppNavItem(
            icon: AppAssets.iconCalendar,
            activeIcon: AppAssets.iconCalendarBold,
            label: l10n.navBookings,
          ),
          AppNavItem(
            icon: AppAssets.iconSearch,
            activeIcon: AppAssets.iconSearchBold,
            label: l10n.navSearch,
          ),
          AppNavItem(
            icon: AppAssets.iconUser,
            activeIcon: AppAssets.iconUserBold,
            label: l10n.navAccount,
          ),
        ],
      ),
    );
  }
}
