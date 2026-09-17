/// Digit policy: the app always shows Western digits (0-9), in Arabic too.
///
/// `intl` picks native digits for some Arabic locales (e.g. `ar_EG` uses
/// `٠١٢٣`), and Arabic keyboards type Arabic-Indic digits into text fields.
/// Every formatter in `AppFormatters` passes its output through [toLatin],
/// and input parsers (phone, OTP) normalize user input with it.
abstract final class Digits {
  static const _arabicIndicZero = 0x0660; // ٠
  static const _easternArabicZero = 0x06F0; // ۰ (Persian/Urdu)

  static final _nonLatinDigit = RegExp('[٠-٩۰-۹]');

  /// Replaces Arabic-Indic and Eastern Arabic-Indic digits with 0-9.
  /// Also turns the Arabic decimal separator `٫` into `.` and the Arabic
  /// thousands separator `٬` into `,`.
  static String toLatin(String input) {
    if (!_nonLatinDigit.hasMatch(input) &&
        !input.contains('٫') &&
        !input.contains('٬')) {
      return input;
    }
    final buffer = StringBuffer();
    for (final rune in input.runes) {
      if (rune >= _arabicIndicZero && rune <= _arabicIndicZero + 9) {
        buffer.writeCharCode(0x30 + rune - _arabicIndicZero);
      } else if (rune >= _easternArabicZero && rune <= _easternArabicZero + 9) {
        buffer.writeCharCode(0x30 + rune - _easternArabicZero);
      } else if (rune == 0x066B) {
        buffer.write('.');
      } else if (rune == 0x066C) {
        buffer.write(',');
      } else {
        buffer.writeCharCode(rune);
      }
    }
    return buffer.toString();
  }

  /// True if [input] contains any non-Latin digit. Used by tests and debug
  /// assertions to enforce the policy.
  static bool containsNonLatinDigits(String input) =>
      _nonLatinDigit.hasMatch(input);

  /// Keeps only 0-9 after normalizing. For phone and OTP input.
  static String onlyDigits(String input) =>
      toLatin(input).replaceAll(RegExp('[^0-9]'), '');
}
