import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../utils/context_extensions.dart';

/// Temporary stand-in for screens not built yet. Lets the full route table
/// be navigated and tested before each feature phase lands.
class RoutePlaceholderPage extends StatelessWidget {
  const RoutePlaceholderPage({
    required this.title,
    this.links = const [],
    super.key,
  });

  final String title;
  final List<(String label, VoidCallback onTap)> links;

  @override
  Widget build(BuildContext context) {
    final state = GoRouterState.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        automaticallyImplyLeading: context.canPop(),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            context.l10n.comingSoonTitle,
            style: context.textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(context.l10n.debugRouteLabel(state.uri.toString())),
          const SizedBox(height: 20),
          for (final (label, onTap) in links)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: OutlinedButton(onPressed: onTap, child: Text(label)),
            ),
        ],
      ),
    );
  }
}
