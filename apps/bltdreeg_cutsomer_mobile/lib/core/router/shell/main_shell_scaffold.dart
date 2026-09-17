import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../utils/context_extensions.dart';

/// Scaffold for the four bottom-nav tabs. The navigation bar is replaced by
/// the design-system `AppBottomNavBar` in phase 2.
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
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: _onTap,
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.home_outlined),
            label: l10n.navHome,
          ),
          NavigationDestination(
            icon: const Icon(Icons.calendar_month_outlined),
            label: l10n.navBookings,
          ),
          NavigationDestination(
            icon: const Icon(Icons.search),
            label: l10n.navSearch,
          ),
          NavigationDestination(
            icon: const Icon(Icons.person_outline),
            label: l10n.navAccount,
          ),
        ],
      ),
    );
  }
}
