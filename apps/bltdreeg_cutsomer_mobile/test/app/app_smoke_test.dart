import 'dart:async';

import 'package:bltdreeg_cutsomer_mobile/app/app.dart';
import 'package:bltdreeg_cutsomer_mobile/core/di/injection.dart';
import 'package:bltdreeg_cutsomer_mobile/core/localization/locale_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/core/router/app_router.dart';
import 'package:bltdreeg_cutsomer_mobile/core/router/app_routes.dart';
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
      // Onboarding art loops, so pump a fixed time instead of settling.
      await tester.pump(const Duration(seconds: 2));
      expect(find.text('تخطّي'), findsOneWidget);
      expect(find.text('يلا نبدأ'), findsOneWidget);
    });
  });

  group('returning user', () {
    setUp(bootstrapForTest);

    testWidgets('shell keeps each tab stack when switching tabs', (
      tester,
    ) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      // Arabic by default, RTL, real home content.
      expect(find.text('تقدر تدخل دلوقتي'), findsOneWidget);
      final homeContext = tester.element(find.text('تقدر تدخل دلوقتي'));
      expect(Directionality.of(homeContext), TextDirection.rtl);

      // Push notifications inside the home branch.
      unawaited(sl<AppRouter>().config.pushNamed(AppRoutes.notifications.name));
      await tester.pumpAndSettle();
      expect(find.text('Notifications'), findsOneWidget);

      // Switch to search, then back to home: notifications is still on top.
      await tester.tap(find.text('البحث'));
      await tester.pumpAndSettle();
      expect(find.text('قريب منك دلوقتي'), findsOneWidget);
      await tester.tap(find.text('الرئيسية'));
      await tester.pumpAndSettle();
      expect(find.text('Notifications'), findsOneWidget);
    });

    testWidgets('full-screen routes cover the bottom nav', (tester) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      unawaited(
        sl<AppRouter>().config.pushNamed(
          AppRoutes.salon.name,
          pathParameters: {RouteParams.salonId: '1'},
        ),
      );
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

      final context = tester.element(find.text('Walk in now'));
      expect(Directionality.of(context), TextDirection.ltr);
      expect(find.text('Home'), findsWidgets);
    });
  });
}
