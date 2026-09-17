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

  @override
  String get onboardingSkip => 'Skip';

  @override
  String get onboarding1Title => 'Every barber near you,\nall in one place';

  @override
  String get onboarding1Body =>
      'Find the closest salon to home or work, and check its prices, services and customer ratings before you head out.';

  @override
  String get onboarding1Cta => 'Let\'s start';

  @override
  String get onboarding2Title => 'Wait for your turn\nfrom wherever you are';

  @override
  String get onboarding2Body =>
      'Join the queue from your phone and see how many people are ahead and the expected time, live. We\'ll notify you when there are two left.';

  @override
  String get onboarding2Cta => 'Continue';

  @override
  String get onboarding3Title => 'Pick your barber,\nknow the price upfront';

  @override
  String get onboarding3Body =>
      'Every service shows its price and duration, and you can choose your favorite barber by name. No surprises at the end.';

  @override
  String get onboarding3Cta => 'Browse salons';

  @override
  String get onboarding3Login => 'I have an account — Sign in';

  @override
  String get queueNumberCaption => 'Your number';

  @override
  String peopleLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count people left',
      one: 'Only 1 left',
      zero: 'No one ahead',
    );
    return '$_temp0';
  }

  @override
  String approxMinutes(int minutes) {
    return '~$minutes min';
  }

  @override
  String durationMinutes(int minutes) {
    return '$minutes min';
  }

  @override
  String get authBrowseAsGuest => 'Browse without an account';

  @override
  String get loginTitle => 'Welcome back';

  @override
  String get loginSubtitle => 'Sign in to track your turn and your bookings.';

  @override
  String get loginTabEmail => 'Email';

  @override
  String get loginTabPhone => 'Mobile number';

  @override
  String get fieldEmail => 'Email';

  @override
  String get fieldPassword => 'Password';

  @override
  String get fieldPhone => 'Mobile number';

  @override
  String get fieldFirstName => 'First name';

  @override
  String get fieldLastName => 'Last name';

  @override
  String get loginForgotPassword => 'Forgot password?';

  @override
  String get loginSubmit => 'Sign in';

  @override
  String get orDivider => 'or';

  @override
  String get continueWithGoogle => 'Continue with Google';

  @override
  String get continueWithApple => 'Continue with Apple';

  @override
  String get loginNoAccount => 'Don\'t have an account yet?';

  @override
  String get loginCreateAccount => 'Create one now';

  @override
  String get loginOtpNotice =>
      'We\'ll text a confirmation code to this number.';

  @override
  String get loginSendOtp => 'Send confirmation code';

  @override
  String get registerTitle => 'Create your account in a minute';

  @override
  String get registerSubtitle =>
      'An account lets you join queues, track your turn and rate the service.';

  @override
  String passwordRuleLength(int count) {
    return 'At least $count characters';
  }

  @override
  String get passwordRuleDigit => 'At least one number';

  @override
  String registerTerms(String terms, String privacy) {
    return 'I agree to Beltadreeg\'s $terms and $privacy.';
  }

  @override
  String get termsOfUse => 'Terms of Use';

  @override
  String get privacyPolicy => 'Privacy Policy';

  @override
  String get registerTermsRequired =>
      'You need to accept the terms to continue';

  @override
  String get registerSubmit => 'Create account';

  @override
  String get registerOrSocial => 'or sign up with';

  @override
  String get registerHaveAccount => 'Already have an account?';

  @override
  String get registerSignIn => 'Sign in';

  @override
  String get otpTitle => 'Enter the confirmation code';

  @override
  String otpSentTo(int length) {
    return 'We texted a $length-digit code to';
  }

  @override
  String get otpChangeNumber => 'Change number';

  @override
  String otpResendIn(String time) {
    return 'You can request a new code in $time';
  }

  @override
  String get otpConfirm => 'Confirm';

  @override
  String get otpHelp =>
      'Didn\'t get the code? Make sure the number is right and you have signal.';

  @override
  String get otpWrongTitle => 'That code isn\'t right';

  @override
  String get otpWrongSubtitle =>
      'Check the digits again, or request a new code to';

  @override
  String otpAttemptsLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count attempts left before we pause requests',
      one: '1 attempt left before we pause requests',
    );
    return '$_temp0';
  }

  @override
  String otpLocked(int minutes) {
    return 'Too many attempts. Try again in $minutes minutes.';
  }

  @override
  String get otpResend => 'Send me a new code';

  @override
  String get otpResent => 'We sent you a new code';

  @override
  String get authInvalidCredentials => 'Email or password is incorrect';

  @override
  String get authPhoneNotRegistered =>
      'This number isn\'t registered. Create an account in a minute.';

  @override
  String get authPhoneTaken =>
      'This number already has an account. Sign in instead.';
}
