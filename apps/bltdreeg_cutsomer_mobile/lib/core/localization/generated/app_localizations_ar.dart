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
}
