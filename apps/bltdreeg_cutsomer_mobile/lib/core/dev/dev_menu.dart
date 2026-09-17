// Debug-only QA shortcuts. Copy here is intentionally not localized.
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../assets/app_assets.dart';
import '../network/connectivity_cubit.dart';
import '../router/app_routes.dart';
import '../widgets/widgets.dart';

/// Opens with a long-press on the home bell in debug builds. Lets QA and
/// demos flip the simulated connection (frames 08 / 18) without touching
/// device settings.
Future<void> showDevMenu(BuildContext context) async {
  if (!kDebugMode) return;
  final connectivity = context.read<ConnectivityCubit>();
  await showAppBottomSheet<void>(
    context,
    title: 'Dev menu',
    bodyBuilder: (sheetContext) => BlocProvider.value(
      value: connectivity,
      child: BlocBuilder<ConnectivityCubit, ConnectivityState>(
        builder: (context, state) => SettingsGroup(
          children: [
            SettingsRow(
              icon: AppAssets.iconWifiOff,
              title: 'Simulate offline',
              subtitle: 'Forces the app offline (banner, cached data)',
              trailing: AppToggle(
                value: state.isForced,
                onChanged: (_) => connectivity.toggleSimulatedOffline(),
              ),
            ),
            SettingsRow(
              icon: AppAssets.iconSettings,
              title: 'Design system gallery',
              onTap: () {
                Navigator.of(sheetContext).pop();
                context.pushNamed(AppRoutes.devDesignSystem.name);
              },
            ),
          ],
        ),
      ),
    ),
  );
}
