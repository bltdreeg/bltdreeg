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

  @override
  String get optionalSuffix => '(optional)';

  @override
  String stepOf(String current, String total) {
    return 'Step $current of $total';
  }

  @override
  String get liveLabel => 'Live';

  @override
  String get closedTag => 'Closed';

  @override
  String get a11yClearSearch => 'Clear search';

  @override
  String get a11yShowPassword => 'Show password';

  @override
  String get a11yHidePassword => 'Hide password';

  @override
  String get a11yNotifications => 'Notifications';

  @override
  String get a11yFilter => 'Filter and sort';

  @override
  String a11yRemove(String label) {
    return 'Remove $label';
  }

  @override
  String a11yStarRating(String stars) {
    return '$stars of 5 stars';
  }

  @override
  String get validationRequired => 'This field is required';

  @override
  String get validationEmail => 'Enter a valid email address';

  @override
  String get validationPhone =>
      'The number must be 11 digits and start with 010, 011, 012 or 015';

  @override
  String get validationPasswordShort =>
      'Password must be at least 8 characters';

  @override
  String get validationPasswordDigit =>
      'Password must include at least one number';

  @override
  String get validationOtp => 'Enter the full code';

  @override
  String get validationNameShort => 'Name is too short';

  @override
  String get errorServer =>
      'The server isn\'t responding right now. Try again in a bit.';

  @override
  String get errorUnauthorized =>
      'Your session has expired. Please sign in again.';

  @override
  String get offlineSearchDisabled => 'Search needs internet';

  @override
  String get offlineWaitStale => 'Wait time not updated';

  @override
  String get offlineQueueBlocked =>
      'You can\'t join a queue while offline — wait until you\'re back online.';

  @override
  String get offlineOpenLastBooking => 'Open my last viewed booking';

  @override
  String get offlineTipsTitle => 'Try these:';

  @override
  String get offlineTipData => 'Make sure mobile data or Wi-Fi is on';

  @override
  String get offlineTipAirplane => 'Turn off airplane mode if it\'s on';

  @override
  String get ratingLabel1 => 'Poor';

  @override
  String get ratingLabel2 => 'Fair';

  @override
  String get ratingLabel3 => 'Good';

  @override
  String get ratingLabel4 => 'Very good';

  @override
  String get ratingLabel5 => 'Excellent';

  @override
  String priceEgp(String amount) {
    return 'EGP $amount';
  }

  @override
  String priceFrom(String price) {
    return 'From $price';
  }

  @override
  String distanceKm(String distance) {
    return '$distance km';
  }

  @override
  String minutesShort(String minutes) {
    return '$minutes min';
  }

  @override
  String reviewsCount(String count) {
    return '($count)';
  }
}
