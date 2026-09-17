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
}
