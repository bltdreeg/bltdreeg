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

  @override
  String get homeNearCaption => 'Showing salons near';

  @override
  String areaWithCity(String area, String city) {
    return '$area, $city';
  }

  @override
  String get homeSearchHint => 'Search by salon or service';

  @override
  String get homeAvailableNow => 'Walk in now';

  @override
  String get homeRecommended => 'Recommended for you';

  @override
  String get homeNewInArea => 'New in your area';

  @override
  String get homeLastSeen => 'Salons you viewed recently';

  @override
  String get homeAreaEmptyTitle => 'No salons here yet';

  @override
  String homeAreaEmptyBody(String area) {
    return 'We\'re adding salons in $area soon. Try a nearby area.';
  }

  @override
  String get homeChangeArea => 'Change area';

  @override
  String get loadErrorTitle => 'We couldn\'t load salons';

  @override
  String get sortLeastWait => 'Shortest wait now';

  @override
  String get sortNearest => 'Nearest';

  @override
  String get sortTopRated => 'Top rated';

  @override
  String get sortCheapest => 'Lowest price';

  @override
  String get sortNewest => 'Newest salons';

  @override
  String get serviceHaircut => 'Haircut';

  @override
  String get serviceBeard => 'Beard trim';

  @override
  String get serviceKids => 'Kids haircut';

  @override
  String get serviceColor => 'Hair color';

  @override
  String get serviceSkincare => 'Skin care';

  @override
  String get waitFreeNow => 'Free now';

  @override
  String get waitFreeWalkIn => 'Free now — walk right in';

  @override
  String pinPeopleLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count ahead',
      one: 'Only 1 ahead',
    );
    return '$_temp0';
  }

  @override
  String waitPeopleMinutes(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count ahead — ~$minutes min wait',
      one: '1 ahead — ~$minutes min wait',
    );
    return '$_temp0';
  }

  @override
  String waitPeopleHour(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count ahead — ~1 hr wait',
      one: '1 ahead — ~1 hr wait',
    );
    return '$_temp0';
  }

  @override
  String get waitNotUpdated => 'Wait time not updated';

  @override
  String opensTodayAt(String time) {
    return 'Opens at $time';
  }

  @override
  String opensTomorrowAt(String time) {
    return 'Opens tomorrow $time';
  }

  @override
  String opensOnDayAt(String day, String time) {
    return 'Opens $day $time';
  }

  @override
  String openedDaysAgo(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'Opened $days days ago',
      one: 'Opened yesterday',
      zero: 'Opened today',
    );
    return '$_temp0';
  }

  @override
  String openedWeeksAgo(int weeks) {
    String _temp0 = intl.Intl.pluralLogic(
      weeks,
      locale: localeName,
      other: 'Opened $weeks weeks ago',
      one: 'Opened a week ago',
    );
    return '$_temp0';
  }

  @override
  String get searchHint => 'Search by salon name';

  @override
  String get searchRecent => 'Recent searches';

  @override
  String get searchNearbyNow => 'Near you now';

  @override
  String searchResultsForQuery(int count, String query) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count salons matching \"$query\"',
      one: '1 salon matching \"$query\"',
    );
    return '$_temp0';
  }

  @override
  String searchResultsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count salons',
      one: '1 salon',
    );
    return '$_temp0';
  }

  @override
  String withinKm(String km) {
    return 'Within $km km';
  }

  @override
  String get searchNoResultsTitle => 'No salon with that name';

  @override
  String searchNoResultsBody(String query, String area) {
    return 'We couldn\'t find \"$query\" in $area. Try removing filters or searching another name.';
  }

  @override
  String get searchNoFilterResultsTitle => 'No salons match these filters';

  @override
  String get searchNoFilterResultsBody =>
      'Try removing a filter or widening the search area.';

  @override
  String get searchClearFiltersShowAll => 'Clear filters and show all salons';

  @override
  String searchExpandRadius(String km) {
    return 'Widen search to $km km';
  }

  @override
  String get searchDidYouMean => 'Did you mean';

  @override
  String get filterTitle => 'Filter & sort';

  @override
  String get filterSortBy => 'Sort results by';

  @override
  String get filterService => 'Service you want';

  @override
  String get filterAvailableOn => 'Available on';

  @override
  String get filterPrice => 'Price';

  @override
  String get filterOpenNow => 'Open now only';

  @override
  String get filterOpenNowHint => 'Hide closed salons';

  @override
  String filterShowResults(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'Show $count results',
      one: 'Show 1 result',
      zero: 'No results',
    );
    return '$_temp0';
  }

  @override
  String get dayToday => 'Today';

  @override
  String get dayTomorrow => 'Tomorrow';

  @override
  String dayChipLabel(String day, String date) {
    return '$day $date';
  }

  @override
  String priceRangeLabel(String min, String max) {
    return '$min – $max';
  }

  @override
  String get areaSheetTitle => 'Choose area';

  @override
  String get areaSearchHint => 'Search for an area';

  @override
  String get areaUseLocation => 'Use my current location';

  @override
  String get areaUseLocationHint => 'We\'ll ask for location permission once';

  @override
  String get areaNearby => 'Areas near you';

  @override
  String areaOthers(String city) {
    return 'Other areas in $city';
  }

  @override
  String areaSalonsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count salons',
      one: '1 salon',
    );
    return '$_temp0';
  }

  @override
  String get areaConfirm => 'Confirm area';

  @override
  String areaLocated(String area) {
    return 'We found your area: $area';
  }

  @override
  String salonReviewsWithCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '($count reviews)',
      one: '(1 review)',
    );
    return '$_temp0';
  }

  @override
  String get statusFreeNoQueue => 'Free now — no queue';

  @override
  String get statusClosedNow => 'Closed now';

  @override
  String chairsActive(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count chairs active',
      one: '1 chair active',
    );
    return '$_temp0';
  }

  @override
  String barbersOnShift(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count barbers on shift',
      one: '1 barber on shift',
      zero: 'No barbers on shift',
    );
    return '$_temp0';
  }

  @override
  String dotSeparated(String a, String b) {
    return '$a · $b';
  }

  @override
  String get actionDirections => 'Directions';

  @override
  String get actionCall => 'Call';

  @override
  String get a11yShare => 'Share salon';

  @override
  String get a11yAddFavorite => 'Add to favorites';

  @override
  String get a11yRemoveFavorite => 'Remove from favorites';

  @override
  String photosCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count photos',
      one: '1 photo',
    );
    return '$_temp0';
  }

  @override
  String videosCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count videos',
      one: '1 video',
    );
    return '$_temp0';
  }

  @override
  String get videoChip => 'Video';

  @override
  String get tabServices => 'Services';

  @override
  String get tabBarbers => 'Barbers';

  @override
  String get tabOffers => 'Offers';

  @override
  String get tabReviews => 'Reviews';

  @override
  String get tabHours => 'Hours';

  @override
  String a11yAddService(String service) {
    return 'Add $service';
  }

  @override
  String a11yRemoveService(String service) {
    return 'Remove $service';
  }

  @override
  String barberQueueAhead(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count ahead — ~$minutes min',
      one: '1 ahead — ~$minutes min',
    );
    return '$_temp0';
  }

  @override
  String barberOffReturns(String day) {
    return 'Off today — back $day';
  }

  @override
  String yearsExperience(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count years experience',
      one: '1 year experience',
    );
    return '$_temp0';
  }

  @override
  String get barberNamedNote =>
      'If you choose a barber by name you\'ll wait in their own queue. The fastest option is \"any available barber\".';

  @override
  String get offersHeader => 'Offers running now';

  @override
  String offerExpiresIn(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'Ends in $days days',
      one: 'Ends tomorrow',
      zero: 'Ends today',
    );
    return '$_temp0';
  }

  @override
  String offerBundleSaving(String original, String saving) {
    return 'Instead of $original — save $saving';
  }

  @override
  String offerLoyaltyProgress(int done, int target) {
    return 'You have $done of $target visits';
  }

  @override
  String reviewsTotal(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count reviews',
      one: '1 review',
    );
    return '$_temp0';
  }

  @override
  String get breakdownQuality => 'Cut quality';

  @override
  String get breakdownCleanliness => 'Cleanliness';

  @override
  String get breakdownTimeAccuracy => 'Time accuracy';

  @override
  String get reviewFilterAll => 'All';

  @override
  String get reviewFilterFiveStars => '5 stars';

  @override
  String get reviewFilterWithPhotos => 'With photos';

  @override
  String get salonReply => 'Salon\'s reply';

  @override
  String get reviewsEmpty => 'No reviews for this salon yet.';

  @override
  String get reviewsFilterEmpty => 'No reviews match this filter.';

  @override
  String timeAgoMinutes(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count min ago',
      one: '1 min ago',
      zero: 'just now',
    );
    return '$_temp0';
  }

  @override
  String timeAgoHours(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count hours ago',
      one: '1 hour ago',
    );
    return '$_temp0';
  }

  @override
  String timeAgoDays(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count days ago',
      one: '1 day ago',
    );
    return '$_temp0';
  }

  @override
  String timeAgoWeeks(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count weeks ago',
      one: '1 week ago',
    );
    return '$_temp0';
  }

  @override
  String timeAgoMonths(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count months ago',
      one: '1 month ago',
    );
    return '$_temp0';
  }

  @override
  String get hoursHeader => 'Opening hours';

  @override
  String get openNowBadge => 'Open now';

  @override
  String todayWithDay(String day) {
    return 'Today — $day';
  }

  @override
  String get dayOff => 'Closed';

  @override
  String hoursRange(String from, String to) {
    return '$from – $to';
  }

  @override
  String selectionCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count services',
      one: '1 service',
      zero: 'Pick a service',
    );
    return '$_temp0';
  }

  @override
  String get joinQueue => 'Join the queue';

  @override
  String get pickServiceFirst => 'Pick at least one service to join the queue';

  @override
  String get salonNotFoundTitle => 'Salon not found';

  @override
  String get salonNotFoundBody => 'It may have closed or the link is wrong.';

  @override
  String get backToHome => 'Back to home';

  @override
  String shareSalonText(String salon, String link) {
    return 'Check out $salon on Beltadreeg: $link';
  }

  @override
  String get cantOpenApp => 'Couldn\'t open that on your phone';

  @override
  String galleryTitle(String salon) {
    return '$salon photos';
  }

  @override
  String galleryFilterAll(int count) {
    return 'All $count';
  }

  @override
  String galleryFilterWork(int count) {
    return 'Barbers\' work $count';
  }

  @override
  String galleryFilterPlace(int count) {
    return 'The place $count';
  }

  @override
  String galleryFilterVideo(int count) {
    return 'Video $count';
  }

  @override
  String galleryMore(int count) {
    return '+$count';
  }

  @override
  String get galleryReviewPhotos => 'Photos from customer reviews';

  @override
  String photoCounter(int index, int total) {
    return '$index / $total';
  }

  @override
  String get bookingWhenTitle => 'When do you want to come?';

  @override
  String get bookingNowTitle => 'Now — join the queue';

  @override
  String bookingNowWait(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count ahead of you · ~$minutes min',
      one: '1 ahead of you · ~$minutes min',
      zero: 'No queue — walk right in',
    );
    return '$_temp0';
  }

  @override
  String get bookingNowClosed => 'The salon is closed now — book a time';

  @override
  String get bookingScheduleTitle => 'Book a time';

  @override
  String get bookingScheduleSubtitle => 'Pick a day and time that suits you';

  @override
  String bookingDurationNote(int minutes) {
    return 'Your services take $minutes min';
  }

  @override
  String get slotPeriodMorning => 'Morning';

  @override
  String get slotPeriodAfternoon => 'Afternoon';

  @override
  String get slotPeriodEvening => 'Evening';

  @override
  String get slotsDayClosed =>
      'The salon is closed that day — pick another day.';

  @override
  String get slotsDayFull => 'No free times that day — try another day.';

  @override
  String get slotsLoadFailed => 'Couldn\'t load the times.';

  @override
  String a11ySlotUnavailable(String time) {
    return '$time, booked';
  }

  @override
  String get bookingContinueToBarber => 'Continue — choose a barber';

  @override
  String get bookingBarberTitle => 'Choose a barber';

  @override
  String get barberAnyTitle => 'Any available barber';

  @override
  String get barberFastestBadge => 'Fastest';

  @override
  String get barberAnySubtitle => 'The first barber to finish takes you';

  @override
  String get barberAnySlotSubtitle => 'We\'ll assign a barber who\'s free then';

  @override
  String get barberPickByName => 'Or choose a barber by name';

  @override
  String get waitImmediate => 'Right away';

  @override
  String get waitNoQueue => 'No queue';

  @override
  String get barberFree => 'Free';

  @override
  String waitApproxShort(String value) {
    return '$value min';
  }

  @override
  String waitExtraMinutes(String value) {
    return '$value min';
  }

  @override
  String peopleAheadOfYou(int count) {
    return '$count ahead of you';
  }

  @override
  String peopleAheadOfBarber(int count) {
    return '$count ahead';
  }

  @override
  String get barberNotInToday => 'Not in today';

  @override
  String get barberBusyAtSlot => 'Not free at that time';

  @override
  String get bookingContinueToReview => 'Continue — review booking';

  @override
  String get bookingReviewTitle => 'Review booking';

  @override
  String driveDistance(String km, int minutes) {
    return '$km km — $minutes min drive';
  }

  @override
  String get reviewServicesHeader => 'Services';

  @override
  String get reviewBarberLabel => 'Barber';

  @override
  String get reviewTimeLabel => 'Time';

  @override
  String get timingNowLabel => 'Now — in the queue';

  @override
  String slotDateTime(String day, String time) {
    return '$day · $time';
  }

  @override
  String waitRangeTitle(int min, int max) {
    return 'Your turn in $min–$max min';
  }

  @override
  String get waitRightInTitle => 'You\'ll go right in';

  @override
  String waitAheadAndDuration(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count ahead',
      one: 'Only 1 ahead',
      zero: 'No one ahead',
    );
    return '$_temp0 · your services take $minutes min';
  }

  @override
  String get waitLiveNote =>
      'The time is an estimate and updates live with the active chairs.';

  @override
  String slotAppointmentTitle(String day, String time) {
    return 'Your appointment: $day at $time';
  }

  @override
  String get slotArriveNote =>
      'Arrive 5 minutes early so you don\'t miss your turn.';

  @override
  String get policyQueue =>
      'When it\'s your turn you have 5 minutes to show up. If you don\'t, you move back one place, then the booking is cancelled.';

  @override
  String get policySlot =>
      'If you\'re more than 10 minutes late, the booking is cancelled.';

  @override
  String get servicesSubtotal => 'Services subtotal';

  @override
  String get bundleDiscount => 'Bundle discount';

  @override
  String get totalLabel => 'Total';

  @override
  String get payCashNote => 'Pay cash at the salon after your service';

  @override
  String get confirmJoinQueue => 'Confirm and join the queue';

  @override
  String get confirmSlotBooking => 'Confirm booking';

  @override
  String get bookingErrorSlotTaken =>
      'That time was just booked — pick another.';

  @override
  String get bookingErrorBarberUnavailable =>
      'That barber isn\'t available — pick another.';

  @override
  String get bookingErrorSalonClosed =>
      'The salon just closed — book a time instead.';

  @override
  String get bookingErrorAlreadyInQueue =>
      'You\'re already in a queue. Follow that turn first.';

  @override
  String get actionPickTime => 'Pick a time';

  @override
  String get actionPickBarber => 'Pick a barber';

  @override
  String get actionTrackTurn => 'Track your turn';

  @override
  String get bookingIncompleteTitle => 'This booking isn\'t complete';

  @override
  String get bookingIncompleteBody =>
      'Choose your services and time on the salon page first.';

  @override
  String get actionBackToSalon => 'Back to the salon';

  @override
  String get confirmedQueueTitle => 'Done — you\'re in the queue';

  @override
  String get confirmedSlotTitle => 'Done — your booking is confirmed';

  @override
  String get ticketNumberLabel => 'Your number';

  @override
  String get aheadOfYouLabel => 'Ahead of you';

  @override
  String aheadCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count people',
      one: '1 person',
      zero: 'No one',
    );
    return '$_temp0';
  }

  @override
  String get expectedTimeLabel => 'Expected wait';

  @override
  String get appointmentLabel => 'Your appointment';

  @override
  String get confirmedQueueNote =>
      'We\'ll notify you when one person is left ahead of you, then when it\'s your turn.';

  @override
  String get confirmedSlotNote => 'We\'ll remind you an hour before.';

  @override
  String get bookingLoadFailed => 'Couldn\'t load the booking.';
}
