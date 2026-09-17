import 'package:bltdreeg_cutsomer_mobile/core/theme/app_dimens.dart';
import 'package:bltdreeg_cutsomer_mobile/core/widgets/app_button.dart';
import 'package:bltdreeg_cutsomer_mobile/core/widgets/app_pressable.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/pump_app.dart';

double _scaleOf(WidgetTester tester, Finder pressable) {
  final transition = tester.widget<ScaleTransition>(
    find.descendant(of: pressable, matching: find.byType(ScaleTransition)),
  );
  return transition.scale.value;
}

void main() {
  const box = SizedBox(width: 120, height: 48, child: Text('press'));

  testWidgets('scales down on press and back to 1.0 on release', (
    tester,
  ) async {
    var taps = 0;
    await tester.pumpComponent(AppPressable(onTap: () => taps++, child: box));
    final pressable = find.byType(AppPressable);

    expect(_scaleOf(tester, pressable), 1);

    final gesture = await tester.startGesture(tester.getCenter(pressable));
    await tester.pump(kPressTimeout);
    await tester.pumpAndSettle();
    expect(_scaleOf(tester, pressable), closeTo(AppMotion.pressedScale, 1e-6));

    await gesture.up();
    await tester.pumpAndSettle();
    expect(_scaleOf(tester, pressable), 1);
    expect(taps, 1);
  });

  testWidgets('cancel (drag away) springs back without tapping', (
    tester,
  ) async {
    var taps = 0;
    await tester.pumpComponent(AppPressable(onTap: () => taps++, child: box));
    final pressable = find.byType(AppPressable);

    final gesture = await tester.startGesture(tester.getCenter(pressable));
    await tester.pump(kPressTimeout);
    await tester.pumpAndSettle();
    expect(_scaleOf(tester, pressable), lessThan(1));

    await gesture.moveBy(const Offset(0, 300));
    await gesture.up();
    await tester.pumpAndSettle();
    expect(_scaleOf(tester, pressable), 1);
    expect(taps, 0);
  });

  testWidgets('a quick tap still plays a visible press', (tester) async {
    await tester.pumpComponent(AppPressable(onTap: () {}, child: box));
    final pressable = find.byType(AppPressable);

    await tester.tap(pressable);
    // First frame only records the ticker start time.
    await tester.pump();
    await tester.pump(AppMotion.press ~/ 2);
    expect(_scaleOf(tester, pressable), lessThan(1));
    await tester.pumpAndSettle();
    expect(_scaleOf(tester, pressable), 1);
  });

  testWidgets('disabled pressable neither scales nor taps', (tester) async {
    var taps = 0;
    await tester.pumpComponent(
      AppPressable(onTap: () => taps++, enabled: false, child: box),
    );
    final pressable = find.byType(AppPressable);

    final gesture = await tester.startGesture(tester.getCenter(pressable));
    await tester.pump(kPressTimeout);
    await tester.pumpAndSettle();
    expect(_scaleOf(tester, pressable), 1);
    await gesture.up();
    await tester.pumpAndSettle();
    expect(taps, 0);
  });

  testWidgets('reduce motion keeps taps but skips scaling', (tester) async {
    var taps = 0;
    await tester.pumpComponent(
      MediaQuery(
        data: const MediaQueryData(disableAnimations: true),
        child: AppPressable(onTap: () => taps++, child: box),
      ),
    );
    final pressable = find.byType(AppPressable);
    final gesture = await tester.startGesture(tester.getCenter(pressable));
    await tester.pump(kPressTimeout);
    await tester.pumpAndSettle();
    expect(_scaleOf(tester, pressable), 1);
    await gesture.up();
    await tester.pumpAndSettle();
    expect(taps, 1);
  });

  testWidgets('AppButton is built on AppPressable', (tester) async {
    await tester.pumpComponent(AppButton(label: 'ادخل', onPressed: () {}));
    expect(
      find.descendant(
        of: find.byType(AppButton),
        matching: find.byType(AppPressable),
      ),
      findsOneWidget,
    );
  });
}
