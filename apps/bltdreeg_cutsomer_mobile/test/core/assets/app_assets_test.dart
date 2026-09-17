import 'dart:io';

import 'package:bltdreeg_cutsomer_mobile/core/assets/app_assets.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final all = [...AppAssets.allIcons, ...AppAssets.allIllustrations];

  test('every AppAssets constant is bundled', () async {
    for (final path in all) {
      final data = await rootBundle.loadString(path);
      expect(data, startsWith('<svg'), reason: path);
    }
  });

  test('AppAssets is in sync with the assets folder', () {
    final onDisk = [
      ...Directory('assets/icons').listSync(recursive: true),
      ...Directory('assets/illustrations').listSync(recursive: true),
    ].whereType<File>().where((f) => f.path.endsWith('.svg')).length;
    expect(
      all.length,
      onDisk,
      reason: 'Run: dart run tool/generate_app_assets.dart',
    );
  });

  test('SVGs are text-free and use a viewBox', () {
    // Text inside artwork can't be localized and would bypass the
    // Western-digit policy; labels are overlaid in Flutter instead.
    for (final path in all) {
      final svg = File(path).readAsStringSync();
      expect(svg.contains('<text'), isFalse, reason: path);
      expect(svg.contains('viewBox='), isTrue, reason: path);
    }
  });
}
