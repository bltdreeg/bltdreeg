import 'package:bltdreeg_cutsomer_mobile/core/utils/digits.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';

void main() {
  group('Digits.toLatin', () {
    test('converts Arabic-Indic digits', () {
      expect(Digits.toLatin('٠١٢٣٤٥٦٧٨٩'), '0123456789');
    });

    test('converts Eastern Arabic-Indic (Persian) digits', () {
      expect(Digits.toLatin('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
    });

    test('converts Arabic decimal and thousands separators', () {
      expect(Digits.toLatin('٤٫٨'), '4.8');
      expect(Digits.toLatin('١٬٢٠٠'), '1,200');
    });

    test('leaves Arabic letters and Latin text untouched', () {
      expect(Digits.toLatin('٧٠ ج.م'), '70 ج.م');
      expect(Digits.toLatin('Barber Point 2'), 'Barber Point 2');
    });

    test('onlyDigits strips spaces and prefixes from phone input', () {
      expect(Digits.onlyDigits('٠١٠٢ ٣٤٥ ٦٧٨٩'), '01023456789');
    });
  });

  group('digit policy with intl', () {
    setUpAll(() async {
      await initializeDateFormatting('ar');
      await initializeDateFormatting('ar_EG');
    });

    test('ar_EG native formatting would leak Arabic-Indic digits', () {
      final raw = NumberFormat.decimalPattern('ar_EG').format(1234);
      // Guard: proves normalization is necessary, not decorative.
      expect(Digits.containsNonLatinDigits(raw), isTrue);
      expect(Digits.toLatin(raw), isNot(contains(RegExp('[٠-٩]'))));
    });

    test('DateFormat never uses native digits for Arabic', () {
      DateFormat.useNativeDigitsByDefaultFor('ar', false);
      DateFormat.useNativeDigitsByDefaultFor('ar_EG', false);
      final date = DateTime(2026, 9, 17, 21, 41);
      for (final locale in ['ar', 'ar_EG']) {
        final text = DateFormat.yMMMd(locale).add_jm().format(date);
        expect(Digits.containsNonLatinDigits(text), isFalse, reason: text);
      }
    });
  });
}
