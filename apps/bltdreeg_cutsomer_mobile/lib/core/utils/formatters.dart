import 'package:intl/intl.dart';

import 'digits.dart';

/// Locale-aware formatting that always yields Western digits (0-9).
///
/// Numbers are formatted with `en` digit patterns; dates use the active
/// locale for month/day names; every output passes through
/// [Digits.toLatin] as a final guard. Obtain the instance for the current
/// locale with `context.fmt`.
final class AppFormatters {
  AppFormatters(this.localeCode);

  final String localeCode;

  bool get _ar => localeCode == 'ar';

  String _latin(String s) => Digits.toLatin(s);

  /// Integer or decimal with grouping: `1,200`, `4.8`.
  String number(num value, {int decimals = 0}) => _latin(
    NumberFormat.decimalPatternDigits(
      locale: 'en',
      decimalDigits: decimals,
    ).format(value),
  );

  /// Rating with one decimal: `4.8`.
  String rating(double value) => number(value, decimals: 1);

  /// Distance in km, one decimal under 10 km: `0.8`, `12`.
  String distanceKm(double km) =>
      km < 10 ? number(km, decimals: 1) : number(km.round());

  /// Clock time: `9:41 م` / `9:41 PM`.
  String time(DateTime t) => _latin(DateFormat('h:mm a', localeCode).format(t));

  /// Hour only, for opening hours: `11 ص` / `11 AM`.
  String hour(DateTime t) => _latin(DateFormat('h a', localeCode).format(t));

  /// `الخميس 11 سبتمبر` / `Thu, 11 Sep`.
  String weekdayDayMonth(DateTime d) => _latin(
    DateFormat(_ar ? 'EEEE d MMMM' : 'EEE, d MMM', localeCode).format(d),
  );

  /// `14 مارس 1996` / `14 Mar 1996`.
  String fullDate(DateTime d) =>
      _latin(DateFormat(_ar ? 'd MMMM y' : 'd MMM y', localeCode).format(d));

  /// Weekday name: `الخميس` / `Thursday`.
  String weekday(DateTime d) => _latin(DateFormat.EEEE(localeCode).format(d));

  /// `18 سبتمبر` / `18 Sep`.
  String dayMonth(DateTime d) =>
      _latin(DateFormat(_ar ? 'd MMMM' : 'd MMM', localeCode).format(d));

  /// Weekday for compact chips: `الخميس` / `Thu`.
  String weekdayShort(DateTime d) =>
      _latin(DateFormat(_ar ? 'EEEE' : 'EEE', localeCode).format(d));

  /// Day of month: `15`.
  String dayOfMonth(DateTime d) => _latin(DateFormat.d(localeCode).format(d));

  /// Countdown `m:ss` (`4:32`), or `h:mm:ss` beyond an hour.
  String countdown(Duration d) {
    final safe = d.isNegative ? Duration.zero : d;
    final h = safe.inHours;
    final m = safe.inMinutes.remainder(60);
    final s = safe.inSeconds.remainder(60).toString().padLeft(2, '0');
    return h > 0 ? '$h:${m.toString().padLeft(2, '0')}:$s' : '$m:$s';
  }

  /// Timer `mm:ss` (`00:38`) for OTP resend.
  String mmss(Duration d) {
    final safe = d.isNegative ? Duration.zero : d;
    final m = safe.inMinutes.toString().padLeft(2, '0');
    final s = safe.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  /// Local Egyptian mobile grouped as on the board: `0102 345 6789`.
  ///
  /// Wrapped in a left-to-right isolate: inside RTL text the bidi algorithm
  /// would otherwise reorder the space-separated groups (`6789 345 0102`).
  String phone(String localDigits) {
    final d = Digits.onlyDigits(localDigits);
    final grouped = d.length == 11
        ? '${d.substring(0, 4)} ${d.substring(4, 7)} ${d.substring(7)}'
        : d;
    return '\u2066$grouped\u2069';
  }
}
