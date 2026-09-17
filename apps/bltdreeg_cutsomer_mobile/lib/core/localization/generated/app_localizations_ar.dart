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

  @override
  String get bookingWhenTitle => 'امتى تحب تيجي؟';

  @override
  String get bookingNowTitle => 'دلوقتي — ادخل الطابور';

  @override
  String bookingNowWait(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قدامك $count · ~$minutes د',
      one: 'قدامك 1 بس · ~$minutes د',
      zero: 'مفيش دور — هتدخل على طول',
    );
    return '$_temp0';
  }

  @override
  String get bookingNowClosed => 'الصالون مقفول دلوقتي — احجز معاد';

  @override
  String get bookingScheduleTitle => 'احجز معاد';

  @override
  String get bookingScheduleSubtitle => 'اختار اليوم والساعة اللي تناسبك';

  @override
  String bookingDurationNote(int minutes) {
    return 'مدة خدماتك $minutes دقيقة';
  }

  @override
  String get slotPeriodMorning => 'الصبح';

  @override
  String get slotPeriodAfternoon => 'بعد الضهر';

  @override
  String get slotPeriodEvening => 'بالليل';

  @override
  String get slotsDayClosed => 'الصالون أجازة اليوم ده — اختار يوم تاني.';

  @override
  String get slotsDayFull => 'مفيش مواعيد فاضية اليوم ده — جرّب يوم تاني.';

  @override
  String get slotsLoadFailed => 'معرفناش نجيب المواعيد.';

  @override
  String a11ySlotUnavailable(String time) {
    return '$time، محجوز';
  }

  @override
  String get bookingContinueToBarber => 'كمّل — اختار الحلاق';

  @override
  String get bookingBarberTitle => 'اختار الحلاق';

  @override
  String get barberAnyTitle => 'أي حلاق متاح';

  @override
  String get barberFastestBadge => 'الأسرع';

  @override
  String get barberAnySubtitle => 'أول واحد يخلّص هيستلمك';

  @override
  String get barberAnySlotSubtitle => 'هنختارلك حلاق فاضي في المعاد ده';

  @override
  String get barberPickByName => 'أو اختار حلاق بالاسم';

  @override
  String get waitImmediate => 'فوراً';

  @override
  String get waitNoQueue => 'مفيش دور';

  @override
  String get barberFree => 'فاضي';

  @override
  String waitApproxShort(String value) {
    return '$value د';
  }

  @override
  String waitExtraMinutes(String value) {
    return '$value د';
  }

  @override
  String peopleAheadOfYou(int count) {
    return 'قدامك $count';
  }

  @override
  String peopleAheadOfBarber(int count) {
    return 'قدامه $count';
  }

  @override
  String get barberNotInToday => 'مش موجود النهارده';

  @override
  String get barberBusyAtSlot => 'مش فاضي في المعاد ده';

  @override
  String get bookingContinueToReview => 'كمّل — راجع الحجز';

  @override
  String get bookingReviewTitle => 'راجع الحجز';

  @override
  String driveDistance(String km, int minutes) {
    return '$km كم — $minutes دقايق بالعربية';
  }

  @override
  String get reviewServicesHeader => 'الخدمات';

  @override
  String get reviewBarberLabel => 'الحلاق';

  @override
  String get reviewTimeLabel => 'المعاد';

  @override
  String get timingNowLabel => 'دلوقتي — في الطابور';

  @override
  String slotDateTime(String day, String time) {
    return '$day · $time';
  }

  @override
  String waitRangeTitle(int min, int max) {
    return 'دورك خلال $min لـ $max دقيقة';
  }

  @override
  String get waitRightInTitle => 'هتدخل على طول';

  @override
  String waitAheadAndDuration(int count, int minutes) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قدامك $count',
      one: 'قدامك 1 بس',
      zero: 'محدش قدامك',
    );
    return '$_temp0 · مدة خدمتك $minutes دقيقة';
  }

  @override
  String get waitLiveNote =>
      'الوقت تقديري وبيتحدّث لحظياً حسب الكراسي الشغّالة.';

  @override
  String slotAppointmentTitle(String day, String time) {
    return 'معادك $day الساعة $time';
  }

  @override
  String get slotArriveNote => 'تعالى قبل معادك بـ 5 دقايق عشان تلحق دورك.';

  @override
  String get policyQueue =>
      'لما يجي دورك عندك 5 دقايق تحضر. لو ما حضرتش، دورك بيتأخر مركز واحد وبعدها بيتلغى.';

  @override
  String get policySlot => 'لو اتأخرت أكتر من 10 دقايق عن معادك، الحجز بيتلغى.';

  @override
  String get servicesSubtotal => 'مجموع الخدمات';

  @override
  String get bundleDiscount => 'خصم الباقة';

  @override
  String get totalLabel => 'الإجمالي';

  @override
  String get payCashNote => 'الدفع كاش في الفرع بعد الخدمة';

  @override
  String get confirmJoinQueue => 'أكّد ودخّلني الطابور';

  @override
  String get confirmSlotBooking => 'أكّد الحجز';

  @override
  String get bookingErrorSlotTaken => 'المعاد ده لسه اتحجز — اختار معاد تاني.';

  @override
  String get bookingErrorBarberUnavailable =>
      'الحلاق ده مش متاح — اختار حلاق تاني.';

  @override
  String get bookingErrorSalonClosed => 'الصالون قفل — احجز معاد بدل الطابور.';

  @override
  String get bookingErrorAlreadyInQueue =>
      'انت في طابور دلوقتي. تابع دورك الأول.';

  @override
  String get actionPickTime => 'اختار معاد';

  @override
  String get actionPickBarber => 'اختار حلاق';

  @override
  String get actionTrackTurn => 'تابع دورك';

  @override
  String get bookingIncompleteTitle => 'الحجز لسه مش كامل';

  @override
  String get bookingIncompleteBody =>
      'اختار خدماتك ومعادك من صفحة الصالون الأول.';

  @override
  String get actionBackToSalon => 'ارجع للصالون';

  @override
  String get confirmedQueueTitle => 'تمام — انت في الطابور';

  @override
  String get confirmedSlotTitle => 'تمام — حجزك اتأكد';

  @override
  String get ticketNumberLabel => 'رقم دورك';

  @override
  String get aheadOfYouLabel => 'قدامك';

  @override
  String aheadCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count أنفار',
      one: '1 واحد',
      zero: 'محدش',
    );
    return '$_temp0';
  }

  @override
  String get expectedTimeLabel => 'الوقت المتوقع';

  @override
  String get appointmentLabel => 'معادك';

  @override
  String get confirmedQueueNote =>
      'هنبعتلك إشعار لما يفضل قدامك واحد، وبعدين لما يجي دورك.';

  @override
  String get confirmedSlotNote => 'هنفكّرك قبل معادك بساعة.';

  @override
  String get bookingLoadFailed => 'معرفناش نجيب الحجز.';

  @override
  String get queueTitle => 'دورك';

  @override
  String queueAheadPeople(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'قدامك $count أنفار',
      two: 'قدامك 2',
      one: 'فاضلك واحد بس',
      zero: 'محدش قدامك',
    );
    return '$_temp0';
  }

  @override
  String get stageJoined => 'دخلت الطابور';

  @override
  String get stageApproaching => 'قرّب دورك';

  @override
  String get stageYourTurn => 'دورك دلوقتي';

  @override
  String waitApproxSpaced(int minutes) {
    return '~ $minutes د';
  }

  @override
  String get leaveAtLabel => 'تتحرك الساعة';

  @override
  String get leaveAtNow => 'دلوقتي';

  @override
  String get distanceLabel => 'المسافة';

  @override
  String get liveNowHeader => 'اللي شغّال دلوقتي';

  @override
  String barbersOnShiftNamed(String names) {
    return '$names في الشيفت';
  }

  @override
  String listTwo(String a, String b) {
    return '$a و$b';
  }

  @override
  String get listSeparator => '، ';

  @override
  String get servicesJoiner => ' + ';

  @override
  String get moveNowTitle => 'اتحرّك دلوقتي';

  @override
  String moveNowBody(int travel, int wait) {
    return 'المشوار $travel دقايق — دورك بعد $wait دقايق';
  }

  @override
  String get openDirectionsToSalon => 'افتح الاتجاهات للصالون';

  @override
  String get leaveQueue => 'اطلع من الطابور';

  @override
  String get leaveDialogTitle => 'تطلع من الطابور؟';

  @override
  String leaveDialogBody(int number) {
    return 'دورك رقم $number هيروح لحد تاني ومش هينفع ترجعه. لو دخلت تاني هتبدأ من آخر الطابور.';
  }

  @override
  String get leaveDialogNote =>
      'الخروج المتكرر من الطوابير بيقلّل تقييم الالتزام بتاعك.';

  @override
  String get leaveDialogConfirm => 'أيوه، اطلعني';

  @override
  String get leaveDialogStay => 'خليني في الطابور';

  @override
  String get yourTurnTitle => 'حان دورك';

  @override
  String yourTurnBarberWaiting(String barber) {
    return 'ادخل على الكرسي — $barber مستنيك';
  }

  @override
  String get yourTurnAnyBarber => 'ادخل على الكرسي — الحلاق مستنيك';

  @override
  String get yourNumberLabel => 'رقمك';

  @override
  String get timeLeftLabel => 'فاضلك';

  @override
  String get yourTurnGraceNote =>
      'لو ما حضرتش خلال 5 دقايق، دورك هيتأخر مركز واحد';

  @override
  String get yourTurnGraceNoteFinal => 'لو ما حضرتش خلال 5 دقايق، الحجز هيتلغي';

  @override
  String get imAtSalon => 'أنا في المحل';

  @override
  String get postponeOne => 'أنا جاي — أجّلني واحد';

  @override
  String get postponeUsedLabel => 'استخدمت التأجيل قبل كده';

  @override
  String get postponedToast => 'أجّلناك مركز واحد — فاضلك واحد';

  @override
  String get inServiceTitle => 'انت على الكرسي';

  @override
  String get inServiceBody =>
      'نعيماً مقدماً! أول ما تخلص هنطلب منك تقيّم زيارتك.';

  @override
  String get completedTitle => 'نعيماً!';

  @override
  String completedBody(String salon) {
    return 'خلصت في $salon. رأيك بيساعد غيرك يختار صح.';
  }

  @override
  String get rateVisitAction => 'قيّم زيارتك';

  @override
  String get cancelledTitle => 'خرجت من الطابور';

  @override
  String get cancelledBody => 'دورك راح لحد تاني. تقدر تحجز تاني في أي وقت.';

  @override
  String get bookingCancelledTitle => 'الحجز اتلغى';

  @override
  String get bookingCancelledBody =>
      'المعاد اتفتح لغيرك. تقدر تحجز معاد تاني في أي وقت.';

  @override
  String get missedTitle => 'دورك فاتك';

  @override
  String get missedBody =>
      'ما حضرتش في الوقت فالحجز اتلغى. تقدر تدخل الطابور تاني.';

  @override
  String get bookAgain => 'احجز تاني';

  @override
  String get upcomingTitle => 'حجزك جاي';

  @override
  String get cancelBooking => 'الغي الحجز';

  @override
  String get cancelDialogTitle => 'تلغي الحجز؟';

  @override
  String cancelDialogBody(String time) {
    return 'معادك $time هيتفتح لغيرك.';
  }

  @override
  String get cancelDialogConfirm => 'أيوه، الغيه';

  @override
  String get cancelDialogKeep => 'خليه';

  @override
  String get queueErrorNotYourTurn => 'لسه مجاش دورك.';

  @override
  String get queueErrorPostponeUsed => 'استخدمت التأجيل مرة قبل كده.';

  @override
  String get queueErrorFinished => 'الحجز ده خلص خلاص.';

  @override
  String get queueActionOffline => 'محتاج نت عشان تعمل ده.';

  @override
  String get a11yLiveOffline => 'مش متحدّث';

  @override
  String get durationLabel => 'مدة الخدمة';

  @override
  String get rateVisitTitle => 'قيّم زيارتك';

  @override
  String get rateLater => 'بعدين';

  @override
  String get rateOverallQuestion => 'إيه رأيك في الخدمة؟';

  @override
  String get starLabel1 => 'وحش';

  @override
  String get starLabel2 => 'مش أحسن حاجة';

  @override
  String get starLabel3 => 'عادي';

  @override
  String get starLabel4 => 'حلو جداً';

  @override
  String get starLabel5 => 'ممتاز';

  @override
  String get rateDetailsHeader => 'قيّم التفاصيل';

  @override
  String get rateQuality => 'جودة القصة';

  @override
  String get rateCleanliness => 'نظافة المكان';

  @override
  String get rateTimeAccuracy => 'دقة الوقت المتوقع';

  @override
  String rateTimeAccuracyNote(int quoted, int actual) {
    return 'التطبيق قال $quoted د واستنيت $actual د';
  }

  @override
  String get rateTagsHeader => 'إيه اللي عجبك؟';

  @override
  String get tagLightHand => 'ايده خفيفة';

  @override
  String get tagCleanPlace => 'المكان نضيف';

  @override
  String get tagRespectful => 'معاملة محترمة';

  @override
  String get tagFairPrice => 'السعر مناسب';

  @override
  String get tagAccurateQueue => 'الدور كان دقيق';

  @override
  String get rateCommentLabel => 'تحب تضيف كلمة؟';

  @override
  String get rateCommentHint => 'اكتب رأيك عشان تساعد اللي بعدك…';

  @override
  String get rateAddPhoto => 'ضيف صورة للقصة';

  @override
  String get rateAddAnotherPhoto => 'ضيف صورة تانية';

  @override
  String get photoFromCamera => 'صوّر دلوقتي';

  @override
  String get photoFromGallery => 'اختار من الصور';

  @override
  String get a11yRemovePhoto => 'شيل الصورة';

  @override
  String get photoPickFailed => 'معرفناش نفتح الكاميرا أو الصور.';

  @override
  String get rateAnonymous => 'انشر التقييم باسم مستعار';

  @override
  String get rateSubmit => 'ابعت التقييم';

  @override
  String get rateNotAvailableTitle => 'التقييم لسه مش متاح';

  @override
  String get rateNotAvailableBody => 'تقدر تقيّم الزيارة بعد ما الخدمة تخلص.';

  @override
  String get ratingSentTitle => 'شكراً — تقييمك اتبعت';

  @override
  String get ratingSentBody =>
      'رأيك هيساعد ناس تانية تختار صح، وهيظهر على صفحة الصالون خلال ساعة.';

  @override
  String get ratingSentOfflineNote => 'متسجّل عندك وهيتبعت أول ما النت يرجع.';

  @override
  String get yourRatingCaption => 'تقييمك';

  @override
  String get addToFavoritesTitle => 'تضيفه للمفضلة؟';

  @override
  String get addToFavoritesBody => 'هنقولك لما يبقى فاضي في وقتك المعتاد';

  @override
  String get addToFavoritesAction => 'ضيفه للمفضلة';

  @override
  String get addedToFavorites => 'اتضاف للمفضلة';

  @override
  String get backToHomeDone => 'تمام، ارجعني للرئيسية';

  @override
  String get bookingsTitle => 'حجوزاتي';

  @override
  String get bookingsTabCurrent => 'الحالية';

  @override
  String get bookingsTabPast => 'السابقة';

  @override
  String get bookingsActiveNow => 'دورك شغّال دلوقتي';

  @override
  String get bookingsUpcomingBadge => 'معاد محجوز';

  @override
  String get bookingsDetails => 'تفاصيل الحجز';

  @override
  String get bookingsNotifyNote =>
      'هنبعتلك إشعار لما يفضل قدامك اتنين، وبعدين واحد، وبعدين لما يجي دورك.';

  @override
  String get bookingDone => 'خدمة تمّت';

  @override
  String get bookingMissedBadge => 'اتلغى — ما حضرتش';

  @override
  String get bookingCancelledBadge => 'اتلغى';

  @override
  String get bookingMissedReason => 'عدّى وقت الاستدعاء بـ 5 دقايق';

  @override
  String rateBarberAndSalon(String barber) {
    return 'قيّم $barber والصالون';
  }

  @override
  String get rateSalonPrompt => 'قيّم زيارتك';

  @override
  String get rateNowAction => 'قيّم دلوقتي';

  @override
  String get rebookSameChoices => 'احجز تاني بنفس الاختيارات';

  @override
  String get bookingsEmptyTitle => 'لسه ما حجزتش أي حاجة';

  @override
  String get bookingsEmptyBody =>
      'أول ما تدخل طابور صالون، هتلاقي دورك ورقمك والوقت المتوقع هنا على طول.';

  @override
  String get bookingsEmptyCta => 'دوّر على صالون قريب منك';

  @override
  String get bookingsPastEmptyTitle => 'مفيش زيارات سابقة';

  @override
  String get bookingsPastEmptyBody =>
      'زياراتك اللي خلصت هتظهر هنا، وتقدر تقيّمها أو تحجز تاني بضغطة.';

  @override
  String get bookingsLoadFailed => 'معرفناش نجيب حجوزاتك.';

  @override
  String withBarber(String barber) {
    return 'مع $barber';
  }

  @override
  String get favoritesTitle => 'الصالونات المفضّلة';

  @override
  String favoritesSubtitle(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count صالون',
      few: '$count صالونات',
      two: 'صالونين',
      one: 'صالون واحد',
    );
    return '$_temp0 · مرتّبة بأقل انتظار';
  }

  @override
  String get favoritesNotifyNote =>
      'بنبعتلك إشعار لما صالون مفضّل عندك يبقى فاضي في وقت بتروح فيه عادةً.';

  @override
  String get favoritesEmptyTitle => 'مفيش صالونات مفضّلة';

  @override
  String get favoritesEmptyBody =>
      'دوس على القلب في أي صالون عشان يتحفظ هنا، وتقدر تشوف دوره وتدخل بضغطة واحدة.';

  @override
  String get favoritesEmptyCta => 'اكتشف صالونات قريبة';

  @override
  String get favoritesLoadFailed => 'معرفناش نجيب المفضلة.';

  @override
  String get viewSalon => 'شوف الصالون';

  @override
  String get notificationsTitle => 'الإشعارات';

  @override
  String get markAllRead => 'علّم الكل كمقروء';

  @override
  String get groupToday => 'النهارده';

  @override
  String get groupThisWeek => 'الأسبوع ده';

  @override
  String get groupEarlier => 'أقدم';

  @override
  String get notificationsEmptyTitle => 'مفيش إشعارات لسه';

  @override
  String get notificationsEmptyBody =>
      'أول ما تدخل طابور، هنبعتلك هنا كل تحديث لدورك وأي عروض من الصالونات اللي بتحبها.';

  @override
  String get notificationsEmptyCta => 'دوّر على صالون';

  @override
  String get a11yUnread => 'غير مقروء';

  @override
  String get accountTitle => 'حسابي';

  @override
  String get accountEdit => 'عدّل';

  @override
  String get statCompletedCuts => 'حلاقة خلصتها';

  @override
  String get statFavoriteSalons => 'صالونات مفضّلة';

  @override
  String get groupAccount => 'حسابي';

  @override
  String get groupApp => 'التطبيق';

  @override
  String get groupHelp => 'مساعدة';

  @override
  String get rowProfile => 'بياناتي الشخصية';

  @override
  String get rowBookings => 'حجوزاتي';

  @override
  String get rowFavorites => 'الصالونات المفضّلة';

  @override
  String get rowLanguage => 'اللغة';

  @override
  String get rowNotifications => 'الإشعارات';

  @override
  String get rowHelp => 'المساعدة والدعم';

  @override
  String activeBookingsValue(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count نشطين',
      one: '1 نشط',
    );
    return '$_temp0';
  }

  @override
  String get signOut => 'تسجيل الخروج';

  @override
  String appVersionLine(String version) {
    return 'بالتدريج — نسخة $version';
  }

  @override
  String get signOutDialogTitle => 'تسجيل الخروج؟';

  @override
  String signOutDialogBodyInQueue(String salon) {
    return 'عندك دور شغّال في $salon. لو خرجت مش هتوصلك إشعارات الدور، بس الدور نفسه هيفضل محجوز باسمك.';
  }

  @override
  String get signOutDialogBody =>
      'هتحتاج تسجّل دخول تاني عشان تدخل طابور أو تشوف حجوزاتك.';

  @override
  String get signOutConfirm => 'اخرج من الحساب';

  @override
  String get signOutCancel => 'خليني فاضل';

  @override
  String get guestTitle => 'انت بتتصفّح كضيف';

  @override
  String get guestBody => 'سجّل دخولك عشان تدخل الطوابير وتتابع دورك';

  @override
  String get guestSignInCta => 'سجّل دخول أو اعمل حساب';

  @override
  String get guestLockedHeader => 'اللي محتاج حساب';

  @override
  String get guestAvailableHeader => 'متاح من غير حساب';

  @override
  String get guestLockedBadge => 'مقفول';

  @override
  String get guestLockedQueue => 'دخول الطابور ومتابعة دورك';

  @override
  String get guestLockedBookings => 'سجل حجوزاتك';

  @override
  String get guestLockedFavorites => 'الصالونات المفضّلة';

  @override
  String get guestLockedRating => 'تقييم الصالونات';

  @override
  String get guestAllowedBrowse => 'تصفّح الصالونات والأسعار';

  @override
  String get guestAllowedWait => 'شوف وقت الانتظار الحقيقي';

  @override
  String get profileTitle => 'بياناتي الشخصية';

  @override
  String get changePhoto => 'غيّر الصورة';

  @override
  String get firstNameLabel => 'الاسم الأول';

  @override
  String get lastNameLabel => 'اسم العيلة';

  @override
  String get phoneLabel => 'رقم الموبايل';

  @override
  String get phoneVerifiedBadge => 'متأكّد';

  @override
  String get phoneIsIdentity => 'الرقم هو هويتك في بالتدريج';

  @override
  String get changePhoneAction => 'غيّر الرقم';

  @override
  String get emailLabel => 'البريد الإلكتروني';

  @override
  String get birthDateLabel => 'تاريخ الميلاد';

  @override
  String get birthDateNote => 'بنستخدمه عشان نبعتلك عرض في عيد ميلادك';

  @override
  String get areaLabel => 'المنطقة';

  @override
  String get saveChanges => 'احفظ التعديلات';

  @override
  String get profileSaved => 'اتحفظت التعديلات';

  @override
  String get deleteAccount => 'امسح حسابي';

  @override
  String get deleteAccountTitle => 'تمسح حسابك؟';

  @override
  String get deleteAccountBody =>
      'هنمسح بياناتك وحجوزاتك وتقييماتك، ومش هينفع نرجّعها. لو عندك دور شغّال هيتلغى.';

  @override
  String get deleteAccountConfirm => 'أيوه، امسح حسابي';

  @override
  String get deleteAccountCancel => 'خليه';

  @override
  String get nameRequired => 'اكتب اسمك';

  @override
  String get photoNotSupportedYet => 'الصورة بتتغيّر من التقييمات دلوقتي';

  @override
  String get notificationSettingsTitle => 'الإشعارات';

  @override
  String get notifGroupQueue => 'إشعارات الدور';

  @override
  String get notifQueueUpdates => 'تحديثات الطابور';

  @override
  String get notifQueueUpdatesBody => 'فاضلك اتنين · فاضلك واحد · حان دورك';

  @override
  String get notifAlwaysOn => 'دايماً شغّالة';

  @override
  String get notifQueueLockedNote =>
      'مش هينفع تقفلها — من غيرها مش هتعرف إمتى جه دورك وهتخسره.';

  @override
  String get notifGroupOffers => 'العروض والتذكيرات';

  @override
  String get notifFavoriteOffers => 'عروض الصالونات المفضّلة';

  @override
  String get notifFavoriteOffersBody => 'خصومات وباقات جديدة';

  @override
  String get notifFavoriteFree => 'صالون مفضّل بقى فاضي';

  @override
  String get notifFavoriteFreeBody => 'في الأوقات اللي بتروح فيها عادةً';

  @override
  String get notifRateReminder => 'ذكّرني أقيّم الزيارة';

  @override
  String get notifNewSalons => 'عروض صالونات جديدة قريبة مني';

  @override
  String get notifGroupChannels => 'قنوات الإرسال';

  @override
  String get notifChannelPush => 'إشعارات التطبيق';

  @override
  String get notifChannelPushBody => 'الأسرع والأدق';

  @override
  String get notifChannelSms => 'رسايل نصية';

  @override
  String get notifChannelSmsBody => 'احتياطي لو التطبيق مقفول';

  @override
  String get languageTitle => 'اللغة';

  @override
  String get languageArabic => 'العربية';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageCurrent => 'اللغة الحالية';

  @override
  String get languageArabicDirection => 'من اليمين للشمال';

  @override
  String get languageEnglishDirection => 'Left to right';

  @override
  String languageDialogTitle(String language) {
    return 'تحوّل التطبيق لـ $language؟';
  }

  @override
  String get languageDialogBody =>
      'الواجهة هتتقلب من اليمين للشمال. أسماء الصالونات والخدمات هتفضل زي ما صاحب الصالون كتبها.';

  @override
  String languageDialogConfirm(String language) {
    return 'حوّل لـ $language';
  }

  @override
  String get languageDialogCancel => 'خليها زي ما هي';

  @override
  String get helpTitle => 'المساعدة والدعم';

  @override
  String get helpSearchHint => 'دوّر على مشكلتك';

  @override
  String get helpLiveTitle => 'عندك مشكلة في دور دلوقتي؟';

  @override
  String get helpLiveBody => 'بنرد خلال 5 دقايق من 10 ص لـ 12 ص';

  @override
  String get helpFaqHeader => 'أكتر أسئلة بتتسأل';

  @override
  String get helpContactHeader => 'كلّمنا';

  @override
  String get helpAboutHeader => 'عن التطبيق';

  @override
  String get helpCallUs => 'اتصل بينا';

  @override
  String helpCallUsValue(String number) {
    return '$number · من 10 ص لـ 12 ص';
  }

  @override
  String get helpTerms => 'شروط الاستخدام';

  @override
  String get helpPrivacy => 'سياسة الخصوصية';

  @override
  String get helpVersion => 'نسخة التطبيق';

  @override
  String get helpNoResults => 'مفيش نتيجة للي دوّرت عليه. كلّمنا وهنساعدك.';

  @override
  String get faqCancelledWhileThereQ => 'دوري اتلغى وأنا في المحل — أعمل إيه؟';

  @override
  String get faqCancelledWhileThereA =>
      'قول للريسيبشن يدوس \"حاضر\" من شاشة الصالون. لو الدور اتلغى فعلاً، كلّمنا من هنا وهندخّلك تاني في نفس المكان لو الصالون أكّد إنك كنت موجود.';

  @override
  String get faqWrongEstimateQ => 'الوقت المتوقع طلع غلط';

  @override
  String get faqWrongEstimateA =>
      'الوقت تقديري وبيتحدّث لحظياً حسب الكراسي الشغّالة. قيّم \"دقة الوقت المتوقع\" بعد الزيارة — ده اللي بيأثر على ترتيب الصالونات.';

  @override
  String get faqNoTurnAlertQ => 'ما وصلنيش إشعار \"حان دورك\"';

  @override
  String get faqNoTurnAlertA =>
      'اتأكد إن إشعارات التطبيق مفتوحة من إعدادات الموبايل، وإن شاشة الدور مفتوحة وقت ما تكون قريب. الرسايل النصية احتياطي لو التطبيق مقفول.';

  @override
  String get faqLeaveQueueQ => 'إزاي أطلع من الطابور؟';

  @override
  String get faqLeaveQueueA =>
      'من شاشة \"دورك\" دوس \"اطلع من الطابور\". دورك هيروح لحد تاني ومش هينفع ترجعه، ولو دخلت تاني هتبدأ من آخر الطابور.';

  @override
  String get faqPriceMismatchQ => 'الصالون حاسبني غير السعر المكتوب';

  @override
  String get faqPriceMismatchA =>
      'الأسعار اللي في التطبيق هي اللي الصالون كاتبها. لو حاسبك غير كده، ابعتلنا من هنا بصورة الفاتورة وإحنا بنراجع مع الصالون.';

  @override
  String get faqChangePhoneQ => 'إزاي أغيّر رقم موبايلي؟';

  @override
  String get faqChangePhoneA =>
      'الرقم هو هويتك في بالتدريج، فتغييره بيحتاج تأكيد برقم جديد. كلّمنا وهنعمله معاك، وحجوزاتك وتقييماتك هتنتقل زي ما هي.';
}
