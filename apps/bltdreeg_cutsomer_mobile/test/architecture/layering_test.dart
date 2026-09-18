import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// Clean Architecture is only worth the folders if the dependencies actually
/// point inwards, so the rules are asserted rather than documented.
void main() {
  final features = Directory('lib/features')
      .listSync()
      .whereType<Directory>()
      .toList();

  Iterable<File> dartFilesIn(Directory dir) => dir
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.dart'));

  test('features exist', () => expect(features, isNotEmpty));

  test('presentation never imports data', () {
    final offenders = <String>[];
    for (final feature in features) {
      final presentation = Directory('${feature.path}/presentation');
      if (!presentation.existsSync()) continue;
      for (final file in dartFilesIn(presentation)) {
        for (final line in file.readAsLinesSync()) {
          if (!line.startsWith('import ')) continue;
          if (RegExp(r"""import '(\.\./)+data/""").hasMatch(line) ||
              line.contains('/data/')) {
            offenders.add('${file.path}: $line');
          }
        }
      }
    }
    expect(
      offenders,
      isEmpty,
      reason: 'presentation may only depend on domain',
    );
  });

  test('domain never imports data, presentation or Flutter', () {
    final offenders = <String>[];
    for (final feature in features) {
      final domain = Directory('${feature.path}/domain');
      if (!domain.existsSync()) continue;
      for (final file in dartFilesIn(domain)) {
        for (final line in file.readAsLinesSync()) {
          if (!line.startsWith('import ')) continue;
          if (line.contains('/data/') ||
              line.contains('/presentation/') ||
              line.contains('package:flutter/') ||
              line.contains('package:flutter_bloc/') ||
              line.contains('package:dio/') ||
              line.contains('package:drift/')) {
            offenders.add('${file.path}: $line');
          }
        }
      }
    }
    expect(offenders, isEmpty, reason: 'domain stays pure Dart');
  });
}
