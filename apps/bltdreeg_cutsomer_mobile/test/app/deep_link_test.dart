import 'dart:async';

import 'package:bltdreeg_cutsomer_mobile/app/app.dart';
import 'package:bltdreeg_cutsomer_mobile/core/di/injection.dart';
import 'package:bltdreeg_cutsomer_mobile/core/router/app_router.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_bootstrap.dart';

/// A `beltadreeg://` link has to land on the right screen, and landing on the
/// *same* route with a different id has to rebuild it — go_router reuses the
/// page element otherwise, so the old salon's cubit would stay alive.
void main() {
  tearDown(() => sl.reset(dispose: false));

  group('deep links', () {
    setUp(bootstrapForTest);

    Future<void> openLink(WidgetTester tester, String link) async {
      unawaited(
        sl<AppRouter>().config.routeInformationProvider.didPushRouteInformation(
          RouteInformation(uri: Uri.parse(link)),
        ),
      );
      // Salon details keeps a looping live indicator, so settle is never
      // reached — pump a fixed span instead.
      await pumpFor(tester, const Duration(seconds: 2));
    }

    testWidgets('a scheme link opens the salon it names', (tester) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      await openLink(tester, 'beltadreeg://salon/s2');
      expect(find.text('الدهّان للحلاقة'), findsWidgets);
    });

    testWidgets('a second link replaces the first salon', (tester) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      await openLink(tester, 'beltadreeg://salon/s2');
      expect(find.text('الدهّان للحلاقة'), findsWidgets);

      await openLink(tester, 'beltadreeg://salon/s9');
      expect(find.text('وردة بيوتي سنتر'), findsWidgets);
      expect(find.text('الدهّان للحلاقة'), findsNothing);
    });
  });
}

/// Pumps frames every 50ms (for screens with looping animations).
Future<void> pumpFor(WidgetTester tester, Duration total) async {
  const step = Duration(milliseconds: 50);
  for (var t = Duration.zero; t < total; t += step) {
    await tester.pump(step);
  }
}
