// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appName => 'بالتدريج';

  @override
  String get navHome => 'الرئيسية';

  @override
  String get navBookings => 'حجوزاتي';

  @override
  String get navSearch => 'البحث';

  @override
  String get navAccount => 'حسابي';

  @override
  String get actionBack => 'رجوع';

  @override
  String get actionClose => 'إغلاق';

  @override
  String get actionRetry => 'جرّب تاني';

  @override
  String get actionCancel => 'إلغاء';

  @override
  String get actionSeeAll => 'شوف الكل';

  @override
  String get actionClearAll => 'امسح الكل';

  @override
  String get actionChange => 'غيّر';

  @override
  String get actionEdit => 'عدّل';

  @override
  String offlineBanner(String time) {
    return 'مفيش نت — الأرقام دي آخر تحديث الساعة $time';
  }

  @override
  String get offlineTitle => 'النت فاصل';

  @override
  String get offlineBody =>
      'مش قادرين نجيب الصالونات وأرقام الانتظار دلوقتي. اطمن — لو انت داخل طابور، دورك متسجّل عند الصالون وما اتغيرش.';

  @override
  String get errorGeneric => 'حصلت مشكلة. جرّب تاني بعد شوية.';

  @override
  String get errorNetwork => 'مفيش اتصال بالنت.';

  @override
  String get comingSoonTitle => 'الشاشة دي لسه بتتبني';

  @override
  String debugRouteLabel(String route) {
    return 'المسار: $route';
  }

  @override
  String get optionalSuffix => '(اختياري)';

  @override
  String stepOf(String current, String total) {
    return 'الخطوة $current من $total';
  }

  @override
  String get liveLabel => 'لايف';

  @override
  String get closedTag => 'مقفول';

  @override
  String get a11yClearSearch => 'امسح البحث';

  @override
  String get a11yShowPassword => 'اظهر كلمة السر';

  @override
  String get a11yHidePassword => 'اخفي كلمة السر';

  @override
  String get a11yNotifications => 'الإشعارات';

  @override
  String get a11yFilter => 'فلترة وترتيب';

  @override
  String a11yRemove(String label) {
    return 'شيل $label';
  }

  @override
  String a11yStarRating(String stars) {
    return '$stars من 5 نجوم';
  }

  @override
  String get validationRequired => 'الحقل ده مطلوب';

  @override
  String get validationEmail => 'اكتب بريد إلكتروني صحيح';

  @override
  String get validationPhone =>
      'الرقم لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015';

  @override
  String get validationPasswordShort => 'كلمة السر لازم تكون 8 حروف على الأقل';

  @override
  String get validationPasswordDigit =>
      'كلمة السر لازم يكون فيها رقم واحد على الأقل';

  @override
  String get validationOtp => 'اكتب الكود كامل';

  @override
  String get validationNameShort => 'الاسم قصير أوي';

  @override
  String get errorServer => 'السيرفر مش بيرد دلوقتي. جرّب تاني كمان شوية.';

  @override
  String get errorUnauthorized => 'جلستك انتهت. سجّل دخولك تاني.';

  @override
  String get offlineSearchDisabled => 'البحث محتاج نت';

  @override
  String get offlineWaitStale => 'الانتظار مش متحدّث';

  @override
  String get offlineQueueBlocked =>
      'مش هينفع تدخل الطابور وانت من غير نت — استنى ما الشبكة ترجع.';

  @override
  String get offlineOpenLastBooking => 'افتح آخر حجز شوفته';

  @override
  String get offlineTipsTitle => 'جرّب الحاجات دي:';

  @override
  String get offlineTipData => 'اتأكد إن بيانات الموبايل أو الواي فاي شغّالين';

  @override
  String get offlineTipAirplane => 'قفل وضع الطيران لو مفتوح';

  @override
  String get ratingLabel1 => 'وحش';

  @override
  String get ratingLabel2 => 'مش أحسن حاجة';

  @override
  String get ratingLabel3 => 'كويس';

  @override
  String get ratingLabel4 => 'حلو جداً';

  @override
  String get ratingLabel5 => 'ممتاز';

  @override
  String priceEgp(String amount) {
    return '$amount ج.م';
  }

  @override
  String priceFrom(String price) {
    return 'من $price';
  }

  @override
  String distanceKm(String distance) {
    return '$distance كم';
  }

  @override
  String minutesShort(String minutes) {
    return '$minutes د';
  }

  @override
  String reviewsCount(String count) {
    return '($count)';
  }

  @override
  String get onboardingSkip => 'تخطّي';

  @override
  String get onboarding1Title => 'الحلاقين اللي جنبك\nكلهم في مكان واحد';

  @override
  String get onboarding1Body =>
      'دوّر على أقرب صالون لبيتك أو لشغلك، وشوف أسعاره وخدماته وتقييم الزباين قبل ما تتحرك.';

  @override
  String get onboarding1Cta => 'يلا نبدأ';

  @override
  String get onboarding2Title => 'استنى دورك\nوانت في مكانك';

  @override
  String get onboarding2Body =>
      'ادخل الطابور من موبايلك، وشوف فاضلك كام واحد والوقت المتوقع لحظة بلحظة. هنبعتلك إشعار وانت لسه فاضلك اتنين.';

  @override
  String get onboarding2Cta => 'كمّل';

  @override
  String get onboarding3Title => 'اختار الصنايعي\nواعرف الحساب من الأول';

  @override
  String get onboarding3Body =>
      'كل خدمة سعرها ومدتها واضحين، وتقدر تختار الحلاق اللي بتحبه بالاسم. من غير مفاجآت آخر الحلاقة.';

  @override
  String get onboarding3Cta => 'ادخل على الصالونات';

  @override
  String get onboarding3Login => 'عندي حساب — تسجيل الدخول';

  @override
  String get queueNumberCaption => 'دورك رقم';

  @override
  String peopleLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'فاضلك $count أنفار',
      one: 'فاضلك واحد بس',
      zero: 'مفيش حد قدامك',
    );
    return '$_temp0';
  }

  @override
  String approxMinutes(int minutes) {
    return '~ $minutes دقيقة';
  }

  @override
  String durationMinutes(int minutes) {
    return '$minutes دقيقة';
  }

  @override
  String get authBrowseAsGuest => 'تصفّح من غير حساب';

  @override
  String get loginTitle => 'أهلاً بيك تاني';

  @override
  String get loginSubtitle => 'سجّل دخولك عشان تتابع دورك وحجوزاتك.';

  @override
  String get loginTabEmail => 'بالبريد الإلكتروني';

  @override
  String get loginTabPhone => 'برقم الموبايل';

  @override
  String get fieldEmail => 'البريد الإلكتروني';

  @override
  String get fieldPassword => 'كلمة السر';

  @override
  String get fieldPhone => 'رقم الموبايل';

  @override
  String get fieldFirstName => 'الاسم الأول';

  @override
  String get fieldLastName => 'اسم العيلة';

  @override
  String get loginForgotPassword => 'نسيت كلمة السر؟';

  @override
  String get loginSubmit => 'دخول';

  @override
  String get orDivider => 'أو';

  @override
  String get continueWithGoogle => 'المتابعة بحساب Google';

  @override
  String get continueWithApple => 'المتابعة بحساب Apple';

  @override
  String get loginNoAccount => 'لسه معندكش حساب؟';

  @override
  String get loginCreateAccount => 'اعمل واحد دلوقتي';

  @override
  String get loginOtpNotice => 'هنبعتلك كود تأكيد في رسالة على نفس الرقم.';

  @override
  String get loginSendOtp => 'ابعت كود التأكيد';

  @override
  String get registerTitle => 'اعمل حسابك في دقيقة';

  @override
  String get registerSubtitle =>
      'الحساب بيخليك تدخل الطابور وتتابع دورك وتقيّم الخدمة.';

  @override
  String passwordRuleLength(int count) {
    return '$count حروف على الأقل';
  }

  @override
  String get passwordRuleDigit => 'رقم واحد على الأقل';

  @override
  String registerTerms(String terms, String privacy) {
    return 'موافق على $terms و$privacy بتاعة بالتدريج.';
  }

  @override
  String get termsOfUse => 'شروط الاستخدام';

  @override
  String get privacyPolicy => 'سياسة الخصوصية';

  @override
  String get registerTermsRequired => 'لازم توافق على الشروط عشان تكمل';

  @override
  String get registerSubmit => 'اعمل الحساب';

  @override
  String get registerOrSocial => 'أو سجّل بـ';

  @override
  String get registerHaveAccount => 'عندك حساب قبل كده؟';

  @override
  String get registerSignIn => 'سجّل دخولك';

  @override
  String get otpTitle => 'اكتب كود التأكيد';

  @override
  String otpSentTo(int length) {
    return 'بعتنالك كود من $length أرقام في رسالة على الرقم';
  }

  @override
  String get otpChangeNumber => 'غيّر الرقم';

  @override
  String otpResendIn(String time) {
    return 'تقدر تطلب كود جديد بعد $time';
  }

  @override
  String get otpConfirm => 'تأكيد';

  @override
  String get otpHelp =>
      'ما وصلكش الكود؟ اتأكد إن الرقم مظبوط وإن الشبكة شغّالة.';

  @override
  String get otpWrongTitle => 'الكود مش مظبوط';

  @override
  String get otpWrongSubtitle => 'راجع الأرقام تاني، أو اطلب كود جديد على';

  @override
  String otpAttemptsLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'فاضلك $count محاولات قبل ما نقفل الطلب مؤقتاً',
      two: 'فاضلك محاولتين قبل ما نقفل الطلب مؤقتاً',
      one: 'فاضلك محاولة واحدة قبل ما نقفل الطلب مؤقتاً',
    );
    return '$_temp0';
  }

  @override
  String otpLocked(int minutes) {
    return 'وقفنا المحاولات مؤقتاً. جرّب تاني بعد $minutes دقايق.';
  }

  @override
  String get otpResend => 'ابعتلي كود جديد';

  @override
  String get otpResent => 'بعتنالك كود جديد';

  @override
  String get authInvalidCredentials =>
      'البريد الإلكتروني أو كلمة السر مش مظبوطين';

  @override
  String get authPhoneNotRegistered =>
      'الرقم ده مش متسجّل. اعمل حساب جديد في دقيقة.';

  @override
  String get authPhoneTaken => 'الرقم ده عليه حساب بالفعل. سجّل دخولك بيه.';

  @override
  String get homeNearCaption => 'بنعرضلك اللي قريب من';

  @override
  String areaWithCity(String area, String city) {
    return '$area، $city';
  }

  @override
  String get homeSearchHint => 'دوّر باسم الصالون أو الخدمة';

  @override
  String get homeAvailableNow => 'تقدر تدخل دلوقتي';

  @override
  String get homeRecommended => 'مرشّح ليك';

  @override
  String get homeNewInArea => 'جديد في منطقتك';

  @override
  String get homeLastSeen => 'آخر صالونات شوفتها';

  @override
  String get homeAreaEmptyTitle => 'لسه مفيش صالونات هنا';

  @override
  String homeAreaEmptyBody(String area) {
    return 'بنضيف صالونات جديدة في $area قريب. جرّب منطقة قريبة منك.';
  }

  @override
  String get homeChangeArea => 'غيّر المنطقة';

  @override
  String get loadErrorTitle => 'مش قادرين نحمّل الصالونات';

  @override
  String get sortLeastWait => 'أقل انتظار دلوقتي';

  @override
  String get sortNearest => 'الأقرب ليك';

  @override
  String get sortTopRated => 'الأعلى تقييماً';

  @override
  String get sortCheapest => 'أرخص سعر';

  @override
  String get sortNewest => 'أحدث الصالونات';

  @override
  String get serviceHaircut => 'قصة شعر';

  @override
  String get serviceBeard => 'حلاقة دقن';

  @override
  String get serviceKids => 'حلاقة أطفال';

  @override
  String get serviceColor => 'صبغة';

  @override
  String get serviceSkincare => 'عناية بالبشرة';

  @override
  String get waitFreeNow => 'فاضي دلوقتي';

  @override
  String get waitFreeWalkIn => 'فاضي دلوقتي — ادخل على طول';

  @override
  String pinPeopleLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'فاضل $count',
      one: 'فاضل 1 بس',
    );
    return '$_temp0';
  }

  @override
  String waitPeopleMinutes(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'فاضل $count أنفار — استنى ~$minutes د',
      one: 'فاضل 1 — استنى ~$minutes د',
    );
    return '$_temp0';
  }

  @override
  String waitPeopleHour(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'فاضل $count أنفار — استنى ~ساعة',
      one: 'فاضل 1 — استنى ~ساعة',
    );
    return '$_temp0';
  }

  @override
  String get waitNotUpdated => 'الانتظار مش متحدّث';

  @override
  String opensTodayAt(String time) {
    return 'بيفتح الساعة $time';
  }

  @override
  String opensTomorrowAt(String time) {
    return 'بيفتح بكرة $time';
  }

  @override
  String opensOnDayAt(String day, String time) {
    return 'بيفتح $day $time';
  }

  @override
  String openedDaysAgo(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'فتح من $days أيام',
      two: 'فتح من يومين',
      one: 'فتح امبارح',
      zero: 'فتح النهارده',
    );
    return '$_temp0';
  }

  @override
  String openedWeeksAgo(int weeks) {
    String _temp0 = intl.Intl.pluralLogic(
      weeks,
      locale: localeName,
      other: 'فتح من $weeks أسابيع',
      two: 'فتح من أسبوعين',
      one: 'فتح من أسبوع',
    );
    return '$_temp0';
  }

  @override
  String get searchHint => 'دوّر باسم الصالون';

  @override
  String get searchRecent => 'آخر ما دوّرت عليه';

  @override
  String get searchNearbyNow => 'قريب منك دلوقتي';

  @override
  String searchResultsForQuery(int count, String query) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count صالونات فيها \"$query\"',
      one: 'صالون واحد فيه \"$query\"',
    );
    return '$_temp0';
  }

  @override
  String searchResultsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count صالونات',
      one: 'صالون واحد',
    );
    return '$_temp0';
  }

  @override
  String withinKm(String km) {
    return 'داخل $km كم';
  }

  @override
  String get searchNoResultsTitle => 'مفيش صالون بالاسم ده';

  @override
  String searchNoResultsBody(String query, String area) {
    return 'ما لقيناش \"$query\" في $area. جرّب تشيل الفلاتر أو تدوّر باسم تاني.';
  }

  @override
  String get searchNoFilterResultsTitle => 'مفيش صالونات بالفلاتر دي';

  @override
  String get searchNoFilterResultsBody => 'جرّب تشيل فلتر أو توسّع نطاق البحث.';

  @override
  String get searchClearFiltersShowAll => 'امسح الفلاتر واعرض كل الصالونات';

  @override
  String searchExpandRadius(String km) {
    return 'وسّع نطاق البحث لـ $km كم';
  }

  @override
  String get searchDidYouMean => 'يمكن تكون بتقصد';

  @override
  String get filterTitle => 'فلترة وترتيب';

  @override
  String get filterSortBy => 'رتّب النتايج بـ';

  @override
  String get filterService => 'الخدمة اللي عايزها';

  @override
  String get filterAvailableOn => 'متاح في يوم';

  @override
  String get filterPrice => 'السعر';

  @override
  String get filterOpenNow => 'مفتوح دلوقتي بس';

  @override
  String get filterOpenNowHint => 'اخفي الصالونات المقفولة';

  @override
  String filterShowResults(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'اعرض $count نتايج',
      one: 'اعرض نتيجة واحدة',
      zero: 'مفيش نتايج',
    );
    return '$_temp0';
  }

  @override
  String get dayToday => 'النهارده';

  @override
  String get dayTomorrow => 'بكرة';

  @override
  String dayChipLabel(String day, String date) {
    return '$day $date';
  }

  @override
  String priceRangeLabel(String min, String max) {
    return '$min – $max';
  }

  @override
  String get areaSheetTitle => 'اختار المنطقة';

  @override
  String get areaSearchHint => 'دوّر على منطقة';

  @override
  String get areaUseLocation => 'استخدم موقعي الحالي';

  @override
  String get areaUseLocationHint => 'هنطلب إذن الموقع مرة واحدة';

  @override
  String get areaNearby => 'مناطق قريبة منك';

  @override
  String areaOthers(String city) {
    return 'مناطق تانية في $city';
  }

  @override
  String areaSalonsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count صالون',
      few: '$count صالونات',
      two: 'صالونين',
      one: 'صالون واحد',
    );
    return '$_temp0';
  }

  @override
  String get areaConfirm => 'أكّد المنطقة';

  @override
  String areaLocated(String area) {
    return 'حددنا منطقتك: $area';
  }

  @override
  String salonReviewsWithCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '($count تقييم)',
      one: '(تقييم واحد)',
    );
    return '$_temp0';
  }

  @override
  String get statusFreeNoQueue => 'فاضي دلوقتي — مفيش دور';

  @override
  String get statusClosedNow => 'مقفول دلوقتي';

  @override
  String chairsActive(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count كراسي شغّالة',
      two: 'كرسيين شغّالين',
      one: 'كرسي واحد شغّال',
    );
    return '$_temp0';
  }

  @override
  String barbersOnShift(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count حلاقين في الشيفت',
      one: 'حلاق واحد في الشيفت',
      zero: 'مفيش حلاقين في الشيفت',
    );
    return '$_temp0';
  }

  @override
  String dotSeparated(String a, String b) {
    return '$a · $b';
  }

  @override
  String get actionDirections => 'الاتجاهات';

  @override
  String get actionCall => 'اتصل';

  @override
  String get a11yShare => 'شارك الصالون';

  @override
  String get a11yAddFavorite => 'ضيف للمفضلة';

  @override
  String get a11yRemoveFavorite => 'شيل من المفضلة';

  @override
  String photosCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count صورة',
      few: '$count صور',
      two: 'صورتين',
      one: 'صورة واحدة',
    );
    return '$_temp0';
  }

  @override
  String videosCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count فيديو',
      two: 'فيديوهين',
      one: 'فيديو واحد',
    );
    return '$_temp0';
  }

  @override
  String get videoChip => 'فيديو';

  @override
  String get tabServices => 'الخدمات';

  @override
  String get tabBarbers => 'الحلاقين';

  @override
  String get tabOffers => 'العروض';

  @override
  String get tabReviews => 'التقييمات';

  @override
  String get tabHours => 'المواعيد';

  @override
  String a11yAddService(String service) {
    return 'ضيف $service';
  }

  @override
  String a11yRemoveService(String service) {
    return 'شيل $service';
  }

  @override
  String barberQueueAhead(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قدامه $count — ~$minutes د',
      one: 'قدامه 1 — ~$minutes د',
    );
    return '$_temp0';
  }

  @override
  String barberOffReturns(String day) {
    return 'إجازة النهارده — بيرجع $day';
  }

  @override
  String yearsExperience(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count سنة خبرة',
      few: '$count سنين خبرة',
      two: 'سنتين خبرة',
      one: 'سنة خبرة',
    );
    return '$_temp0';
  }

  @override
  String get barberNamedNote =>
      'لو اخترت حلاق بالاسم هتستنى في طابوره لوحده. أسرع حاجة إنك تسيبها \"أي حلاق متاح\".';

  @override
  String get offersHeader => 'عروض شغّالة دلوقتي';

  @override
  String offerExpiresIn(int days) {
    String _temp0 = intl.Intl.pluralLogic(
      days,
      locale: localeName,
      other: 'ينتهي بعد $days أيام',
      two: 'ينتهي بعد يومين',
      one: 'ينتهي بكرة',
      zero: 'ينتهي النهارده',
    );
    return '$_temp0';
  }

  @override
  String offerBundleSaving(String original, String saving) {
    return 'بدل $original — توفّر $saving';
  }

  @override
  String offerLoyaltyProgress(int done, int target) {
    return 'عندك $done من $target زيارات';
  }

  @override
  String reviewsTotal(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count تقييم',
      few: '$count تقييمات',
      two: 'تقييمين',
      one: 'تقييم واحد',
    );
    return '$_temp0';
  }

  @override
  String get breakdownQuality => 'جودة القصة';

  @override
  String get breakdownCleanliness => 'النظافة';

  @override
  String get breakdownTimeAccuracy => 'دقة الوقت';

  @override
  String get reviewFilterAll => 'الكل';

  @override
  String get reviewFilterFiveStars => '5 نجوم';

  @override
  String get reviewFilterWithPhotos => 'فيه صور';

  @override
  String get salonReply => 'رد الصالون';

  @override
  String get reviewsEmpty => 'لسه مفيش تقييمات على الصالون ده.';

  @override
  String get reviewsFilterEmpty => 'مفيش تقييمات بالفلتر ده.';

  @override
  String timeAgoMinutes(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'من $count دقيقة',
      few: 'من $count دقايق',
      two: 'من دقيقتين',
      one: 'من دقيقة',
      zero: 'دلوقتي',
    );
    return '$_temp0';
  }

  @override
  String timeAgoHours(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'من $count ساعة',
      few: 'من $count ساعات',
      two: 'من ساعتين',
      one: 'من ساعة',
    );
    return '$_temp0';
  }

  @override
  String timeAgoDays(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'من $count يوم',
      few: 'من $count أيام',
      two: 'من يومين',
      one: 'من يوم',
    );
    return '$_temp0';
  }

  @override
  String timeAgoWeeks(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'من $count أسابيع',
      two: 'من أسبوعين',
      one: 'من أسبوع',
    );
    return '$_temp0';
  }

  @override
  String timeAgoMonths(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'من $count شهر',
      few: 'من $count شهور',
      two: 'من شهرين',
      one: 'من شهر',
    );
    return '$_temp0';
  }

  @override
  String get hoursHeader => 'مواعيد العمل';

  @override
  String get openNowBadge => 'مفتوح دلوقتي';

  @override
  String todayWithDay(String day) {
    return 'النهارده — $day';
  }

  @override
  String get dayOff => 'إجازة';

  @override
  String hoursRange(String from, String to) {
    return '$from — $to';
  }

  @override
  String selectionCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count خدمة',
      few: '$count خدمات',
      two: 'خدمتين',
      one: 'خدمة واحدة',
      zero: 'اختار خدمة',
    );
    return '$_temp0';
  }

  @override
  String get joinQueue => 'ادخل الطابور';

  @override
  String get pickServiceFirst => 'اختار خدمة واحدة على الأقل عشان تدخل الطابور';

  @override
  String get salonNotFoundTitle => 'الصالون ده مش موجود';

  @override
  String get salonNotFoundBody => 'ممكن يكون اتقفل أو الرابط مش مظبوط.';

  @override
  String get backToHome => 'ارجع للرئيسية';

  @override
  String shareSalonText(String salon, String link) {
    return 'شوف $salon على بالتدريج: $link';
  }

  @override
  String get cantOpenApp => 'مش قادرين نفتح التطبيق ده على موبايلك';

  @override
  String galleryTitle(String salon) {
    return 'صور $salon';
  }

  @override
  String galleryFilterAll(int count) {
    return 'الكل $count';
  }

  @override
  String galleryFilterWork(int count) {
    return 'شغل الحلاقين $count';
  }

  @override
  String galleryFilterPlace(int count) {
    return 'المكان $count';
  }

  @override
  String galleryFilterVideo(int count) {
    return 'فيديو $count';
  }

  @override
  String galleryMore(int count) {
    return '+$count';
  }

  @override
  String get galleryReviewPhotos => 'صور من تقييمات الزباين';

  @override
  String photoCounter(int index, int total) {
    return '$index / $total';
  }
}
