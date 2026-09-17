import 'package:bltdreeg_cutsomer_mobile/core/widgets/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/pump_app.dart';

void main() {
  group('AppButton', () {
    testWidgets('disabled and loading buttons ignore taps', (tester) async {
      var taps = 0;
      await tester.pumpComponent(
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const AppButton(label: 'disabled', onPressed: null),
            AppButton(
              label: 'loading',
              isLoading: true,
              onPressed: () => taps++,
            ),
          ],
        ),
      );
      await tester.tap(find.text('disabled'), warnIfMissed: false);
      await tester.tap(find.byType(CircularProgressIndicator));
      await tester.pump(const Duration(milliseconds: 400));
      expect(taps, 0);
      expect(find.text('loading'), findsNothing);
    });
  });

  group('AppOtpInput', () {
    testWidgets('normalizes Arabic-Indic digits and reports completion', (
      tester,
    ) async {
      String? completed;
      await tester.pumpComponent(
        SizedBox(
          width: 320,
          child: AppOtpInput(onCompleted: (code) => completed = code),
        ),
      );
      await tester.enterText(find.byType(TextField), '٧٣١٩');
      await tester.pump(const Duration(milliseconds: 300));
      expect(completed, '7319');
      for (final d in ['7', '3', '1', '9']) {
        expect(find.text(d), findsOneWidget);
      }
    });
  });

  group('AppPhoneField', () {
    testWidgets('keeps digits only, max 11, Western digits', (tester) async {
      final controller = TextEditingController();
      addTearDown(controller.dispose);
      await tester.pumpComponent(
        SizedBox(width: 340, child: AppPhoneField(controller: controller)),
      );
      await tester.enterText(find.byType(TextField), '٠١٠٢ ٣٤٥ ٦٧٨٩ ١٢');
      expect(controller.text, '01023456789');
    });
  });

  group('showAppConfirmDialog', () {
    Future<bool?> open(WidgetTester tester, {required String tapLabel}) async {
      bool? result;
      await tester.pumpComponent(
        Builder(
          builder: (context) => AppButton(
            label: 'open',
            expand: false,
            onPressed: () async {
              result = await showAppConfirmDialog(
                context,
                title: 'تسجيل الخروج؟',
                message: 'msg',
                confirmLabel: 'اخرج من الحساب',
                cancelLabel: 'خليني فاضل',
              );
            },
          ),
        ),
      );
      await tester.tap(find.text('open'));
      await tester.pumpAndSettle();
      expect(find.text('تسجيل الخروج؟'), findsOneWidget);
      await tester.tap(find.text(tapLabel));
      await tester.pumpAndSettle();
      return result;
    }

    testWidgets('confirm returns true', (tester) async {
      expect(await open(tester, tapLabel: 'اخرج من الحساب'), isTrue);
    });

    testWidgets('cancel returns false', (tester) async {
      expect(await open(tester, tapLabel: 'خليني فاضل'), isFalse);
    });
  });

  group('showAppBottomSheet', () {
    testWidgets('has a close button that dismisses it', (tester) async {
      await tester.pumpComponent(
        Builder(
          builder: (context) => AppButton(
            label: 'sheet',
            expand: false,
            onPressed: () => showAppBottomSheet<void>(
              context,
              title: 'فلترة وترتيب',
              bodyBuilder: (_) => const Text('body'),
            ),
          ),
        ),
      );
      await tester.tap(find.text('sheet'));
      await tester.pumpAndSettle();
      expect(find.text('body'), findsOneWidget);

      await tester.tap(find.bySemanticsLabel('إغلاق'));
      await tester.pumpAndSettle();
      expect(find.text('body'), findsNothing);
    });
  });

  group('SegmentedTabs', () {
    testWidgets('reports the tapped index', (tester) async {
      var index = 0;
      await tester.pumpComponent(
        SizedBox(
          width: 340,
          child: StatefulBuilder(
            builder: (context, setState) => SegmentedTabs(
              labels: const ['الحالية', 'السابقة'],
              selectedIndex: index,
              onChanged: (i) => setState(() => index = i),
            ),
          ),
        ),
      );
      await tester.tap(find.text('السابقة'));
      await tester.pumpAndSettle();
      expect(index, 1);
    });
  });

  group('StepProgress', () {
    testWidgets('shows Western digits in Arabic', (tester) async {
      await tester.pumpComponent(
        const SizedBox(width: 300, child: StepProgress(current: 1, total: 3)),
      );
      expect(find.text('الخطوة 1 من 3'), findsOneWidget);
    });
  });
}
