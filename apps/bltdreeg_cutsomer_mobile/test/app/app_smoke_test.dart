import 'package:bltdreeg_cutsomer_mobile/app/app.dart';
import 'package:bltdreeg_cutsomer_mobile/core/di/injection.dart';
import 'package:bltdreeg_cutsomer_mobile/core/localization/locale_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/core/widgets/app_bottom_nav_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_bootstrap.dart';

void main() {
  // DI setup runs in setUp, outside the widget test's fake-async zone.
  // Cubits created during pumping live in that zone, so their close()
  // futures never complete after the body ends: reset without disposing.
  tearDown(() => sl.reset(dispose: false));

  group('first launch', () {
    setUp(() => bootstrapForTest(onboardingSeen: false));

    testWidgets('redirects to onboarding', (tester) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();
      expect(find.text('Onboarding'), findsOneWidget);
    });
  });

  group('returning user', () {
    setUp(bootstrapForTest);

    testWidgets('shell keeps each tab stack when switching tabs', (
      tester,
    ) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      // Arabic by default, RTL.
      expect(find.text('الرئيسية'), findsOneWidget);
      final homeContext = tester.element(find.text('Home'));
      expect(Directionality.of(homeContext), TextDirection.rtl);

      // Push notifications inside the home branch.
      await tester.tap(find.text('→ notifications'));
      await tester.pumpAndSettle();
      expect(find.text('Notifications'), findsOneWidget);

      // Switch to search, then back to home: notifications is still on top.
      await tester.tap(find.text('البحث'));
      await tester.pumpAndSettle();
      expect(find.text('Search'), findsOneWidget);
      await tester.tap(find.text('الرئيسية'));
      await tester.pumpAndSettle();
      expect(find.text('Notifications'), findsOneWidget);
    });

    testWidgets('full-screen routes cover the bottom nav', (tester) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      await tester.tap(find.text('→ salon 1'));
      await tester.pumpAndSettle();
      expect(find.text('Salon 1'), findsOneWidget);
      expect(find.byType(AppBottomNavBar), findsNothing);
      expect(find.byType(BackButton), findsOneWidget);
    });

    testWidgets('switching locale flips direction live', (tester) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      sl<LocaleCubit>().emit(const Locale('en'));
      await tester.pumpAndSettle();

      final context = tester.element(find.text('Search'));
      expect(Directionality.of(context), TextDirection.ltr);
      expect(find.text('Home'), findsWidgets);
    });
  });
}
