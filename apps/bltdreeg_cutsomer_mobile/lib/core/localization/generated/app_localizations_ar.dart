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
}
