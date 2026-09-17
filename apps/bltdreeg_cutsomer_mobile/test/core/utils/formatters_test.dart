import 'package:bltdreeg_cutsomer_mobile/core/utils/context_extensions.dart';
import 'package:bltdreeg_cutsomer_mobile/core/utils/digits.dart';
import 'package:bltdreeg_cutsomer_mobile/core/utils/formatters.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';

/// Digit policy (spec 5): every formatter must emit 0-9 in both locales.
void main() {
  setUpAll(() async {
    await initializeDateFormatting('ar');
    await initializeDateFormatting('en');
  });

  final date = DateTime(2026, 9, 11, 19, 20);

  for (final code in ['ar', 'en']) {
    test('[$code] never emits Arabic-Indic digits', () {
      final fmt = AppFormatters(code);
      final outputs = {
        'number': fmt.number(1200),
        'rating': fmt.rating(4.8),
        'distance': fmt.distanceKm(0.8),
        'time': fmt.time(date),
        'hour': fmt.hour(date),
        'weekdayDayMonth': fmt.weekdayDayMonth(date),
        'fullDate': fmt.fullDate(DateTime(1996, 3, 14)),
        'dayOfMonth': fmt.dayOfMonth(date),
        'countdown': fmt.countdown(const Duration(minutes: 4, seconds: 32)),
        'mmss': fmt.mmss(const Duration(seconds: 38)),
        'phone': fmt.phone('٠١٠٢٣٤٥٦٧٨٩'),
      };
      outputs.forEach((name, value) {
        expect(
          Digits.containsNonLatinDigits(value),
          isFalse,
          reason: '$name: $value',
        );
      });
    });
  }

  test('values', () {
    final fmt = AppFormatters('ar');
    expect(fmt.number(1200), '1,200');
    expect(fmt.rating(4.8), '4.8');
    expect(fmt.distanceKm(0.8), '0.8');
    expect(fmt.distanceKm(12.4), '12');
    expect(fmt.countdown(const Duration(minutes: 4, seconds: 32)), '4:32');
    expect(fmt.mmss(const Duration(seconds: 38)), '00:38');
    expect(fmt.weekdayDayMonth(date), 'الجمعة 11 سبتمبر');
    expect(fmt.time(date), contains('7:20'));
  });

  test('phone is grouped and isolated as LTR for RTL paragraphs', () {
    final phone = AppFormatters('ar').phone('01023456789');
    expect(phone, '\u20660102 345 6789\u2069');
  });

  test('initials follow the board style', () {
    expect('كريم عبد الرحمن'.initials, 'ك ع');
    expect('أحمد مجدي'.initials, 'أ م');
    expect('Karim'.initials, 'K');
  });
}
