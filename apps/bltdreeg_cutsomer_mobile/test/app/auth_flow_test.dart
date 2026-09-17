import 'package:bltdreeg_cutsomer_mobile/app/app.dart';
import 'package:bltdreeg_cutsomer_mobile/core/di/injection.dart';
import 'package:bltdreeg_cutsomer_mobile/core/router/app_router.dart';
import 'package:bltdreeg_cutsomer_mobile/core/router/app_routes.dart';
import 'package:bltdreeg_cutsomer_mobile/core/storage/app_preferences.dart';
import 'package:bltdreeg_cutsomer_mobile/features/auth/data/datasources/fake_auth_remote_data_source.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../helpers/test_bootstrap.dart';

void main() {
  tearDown(() => sl.reset(dispose: false));

  test('protected route patterns', () {
    expect(AppRouter.isProtected('/queue/:bookingId'), isTrue);
    expect(AppRouter.isProtected('/salon/:salonId/book/slot'), isTrue);
    expect(AppRouter.isProtected('/booking/:bookingId/rate/sent'), isTrue);
    expect(AppRouter.isProtected('/account/favorites'), isTrue);
    expect(AppRouter.isProtected('/salon/:salonId'), isFalse);
    expect(AppRouter.isProtected('/home'), isFalse);
    expect(AppRouter.isProtected('/account'), isFalse);
  });

  group('guarded deep link', () {
    setUp(bootstrapForTest);

    testWidgets('signed-out user is sent to login, then back after OTP', (
      tester,
    ) async {
      await tester.pumpWidget(const BeltadreegApp());
      await tester.pumpAndSettle();

      sl<AppRouter>().config.go('/queue/b1');
      await tester.pumpAndSettle();
      expect(find.text('أهلاً بيك تاني'), findsOneWidget);

      // Phone tab → enter number → send code.
      await tester.tap(find.text('برقم الموبايل'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byType(TextField),
        FakeAuthRemoteDataSource.demoPhone,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('ابعت كود التأكيد'));
      // The OTP caret blinks forever, so pump fixed frames from here on.
      await _pumpFor(tester, const Duration(seconds: 1));
      expect(find.text('اكتب كود التأكيد'), findsOneWidget);

      // Correct code verifies automatically and returns to the queue.
      await tester.enterText(
        find.byType(TextField),
        FakeAuthRemoteDataSource.demoOtp,
      );
      await _pumpFor(tester, const Duration(seconds: 2));
      final location = sl<AppRouter>()
          .config
          .routerDelegate
          .currentConfiguration
          .uri
          .toString();
      expect(location, '/queue/b1');
    });
  });

  group('onboarding', () {
    late AppPreferences prefs;
    setUp(() async => prefs = await bootstrapForTest(onboardingSeen: false));

    testWidgets('skip jumps to the last slide; browse marks it seen', (
      tester,
    ) async {
      await tester.pumpWidget(const BeltadreegApp());
      await _pumpFor(tester, const Duration(seconds: 1));

      await tester.tap(find.text('تخطّي'));
      await _pumpFor(tester, const Duration(seconds: 2));
      expect(find.text('ادخل على الصالونات'), findsOneWidget);
      expect(find.text('عندي حساب — تسجيل الدخول'), findsOneWidget);

      await tester.tap(find.text('ادخل على الصالونات'));
      await _pumpFor(tester, const Duration(seconds: 1));
      expect(prefs.onboardingSeen, isTrue);
      expect(
        sl<AppRouter>().config.routerDelegate.currentConfiguration.uri.path,
        AppRoutes.home.path,
      );
    });
  });
}

/// Pumps frames every 50ms (for screens with looping animations).
Future<void> _pumpFor(WidgetTester tester, Duration total) async {
  const step = Duration(milliseconds: 50);
  for (var t = Duration.zero; t < total; t += step) {
    await tester.pump(step);
  }
}
