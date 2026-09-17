import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'app/app.dart';
import 'core/di/injection.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Digit policy: DateFormat must never emit Arabic-Indic digits.
  // AppFormatters additionally normalizes every formatted string.
  DateFormat.useNativeDigitsByDefaultFor('ar', false);
  DateFormat.useNativeDigitsByDefaultFor('ar_EG', false);
  await configureDependencies();
  runApp(const BeltadreegApp());
}
