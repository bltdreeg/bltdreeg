// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Beltadreeg';

  @override
  String get navHome => 'Home';

  @override
  String get navBookings => 'Bookings';

  @override
  String get navSearch => 'Search';

  @override
  String get navAccount => 'Account';

  @override
  String get actionBack => 'Back';

  @override
  String get actionClose => 'Close';

  @override
  String get actionRetry => 'Try again';

  @override
  String get actionCancel => 'Cancel';

  @override
  String get actionSeeAll => 'See all';

  @override
  String get actionClearAll => 'Clear all';

  @override
  String get actionChange => 'Change';

  @override
  String get actionEdit => 'Edit';

  @override
  String offlineBanner(String time) {
    return 'No internet — numbers last updated at $time';
  }

  @override
  String get offlineTitle => 'You\'re offline';

  @override
  String get offlineBody =>
      'We can\'t load salons and wait times right now. Don\'t worry — if you\'re in a queue, your spot is saved at the salon and hasn\'t changed.';

  @override
  String get errorGeneric => 'Something went wrong. Please try again shortly.';

  @override
  String get errorNetwork => 'No internet connection.';

  @override
  String get comingSoonTitle => 'This screen is under construction';

  @override
  String debugRouteLabel(String route) {
    return 'Route: $route';
  }
}
