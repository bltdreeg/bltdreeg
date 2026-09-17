import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
  ];

  /// Brand name
  ///
  /// In ar, this message translates to:
  /// **'بالتدريج'**
  String get appName;

  /// No description provided for @navHome.
  ///
  /// In ar, this message translates to:
  /// **'الرئيسية'**
  String get navHome;

  /// No description provided for @navBookings.
  ///
  /// In ar, this message translates to:
  /// **'حجوزاتي'**
  String get navBookings;

  /// No description provided for @navSearch.
  ///
  /// In ar, this message translates to:
  /// **'البحث'**
  String get navSearch;

  /// No description provided for @navAccount.
  ///
  /// In ar, this message translates to:
  /// **'حسابي'**
  String get navAccount;

  /// No description provided for @actionBack.
  ///
  /// In ar, this message translates to:
  /// **'رجوع'**
  String get actionBack;

  /// No description provided for @actionClose.
  ///
  /// In ar, this message translates to:
  /// **'إغلاق'**
  String get actionClose;

  /// No description provided for @actionRetry.
  ///
  /// In ar, this message translates to:
  /// **'جرّب تاني'**
  String get actionRetry;

  /// No description provided for @actionCancel.
  ///
  /// In ar, this message translates to:
  /// **'إلغاء'**
  String get actionCancel;

  /// No description provided for @actionSeeAll.
  ///
  /// In ar, this message translates to:
  /// **'شوف الكل'**
  String get actionSeeAll;

  /// No description provided for @actionClearAll.
  ///
  /// In ar, this message translates to:
  /// **'امسح الكل'**
  String get actionClearAll;

  /// No description provided for @actionChange.
  ///
  /// In ar, this message translates to:
  /// **'غيّر'**
  String get actionChange;

  /// No description provided for @actionEdit.
  ///
  /// In ar, this message translates to:
  /// **'عدّل'**
  String get actionEdit;

  /// No description provided for @offlineBanner.
  ///
  /// In ar, this message translates to:
  /// **'مفيش نت — الأرقام دي آخر تحديث الساعة {time}'**
  String offlineBanner(String time);

  /// No description provided for @offlineTitle.
  ///
  /// In ar, this message translates to:
  /// **'النت فاصل'**
  String get offlineTitle;

  /// No description provided for @offlineBody.
  ///
  /// In ar, this message translates to:
  /// **'مش قادرين نجيب الصالونات وأرقام الانتظار دلوقتي. اطمن — لو انت داخل طابور، دورك متسجّل عند الصالون وما اتغيرش.'**
  String get offlineBody;

  /// No description provided for @errorGeneric.
  ///
  /// In ar, this message translates to:
  /// **'حصلت مشكلة. جرّب تاني بعد شوية.'**
  String get errorGeneric;

  /// No description provided for @errorNetwork.
  ///
  /// In ar, this message translates to:
  /// **'مفيش اتصال بالنت.'**
  String get errorNetwork;

  /// No description provided for @comingSoonTitle.
  ///
  /// In ar, this message translates to:
  /// **'الشاشة دي لسه بتتبني'**
  String get comingSoonTitle;

  /// No description provided for @debugRouteLabel.
  ///
  /// In ar, this message translates to:
  /// **'المسار: {route}'**
  String debugRouteLabel(String route);

  /// No description provided for @optionalSuffix.
  ///
  /// In ar, this message translates to:
  /// **'(اختياري)'**
  String get optionalSuffix;

  /// No description provided for @stepOf.
  ///
  /// In ar, this message translates to:
  /// **'الخطوة {current} من {total}'**
  String stepOf(String current, String total);

  /// No description provided for @liveLabel.
  ///
  /// In ar, this message translates to:
  /// **'لايف'**
  String get liveLabel;

  /// No description provided for @closedTag.
  ///
  /// In ar, this message translates to:
  /// **'مقفول'**
  String get closedTag;

  /// No description provided for @a11yClearSearch.
  ///
  /// In ar, this message translates to:
  /// **'امسح البحث'**
  String get a11yClearSearch;

  /// No description provided for @a11yShowPassword.
  ///
  /// In ar, this message translates to:
  /// **'اظهر كلمة السر'**
  String get a11yShowPassword;

  /// No description provided for @a11yHidePassword.
  ///
  /// In ar, this message translates to:
  /// **'اخفي كلمة السر'**
  String get a11yHidePassword;

  /// No description provided for @a11yNotifications.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get a11yNotifications;

  /// No description provided for @a11yFilter.
  ///
  /// In ar, this message translates to:
  /// **'فلترة وترتيب'**
  String get a11yFilter;

  /// No description provided for @a11yRemove.
  ///
  /// In ar, this message translates to:
  /// **'شيل {label}'**
  String a11yRemove(String label);

  /// No description provided for @a11yStarRating.
  ///
  /// In ar, this message translates to:
  /// **'{stars} من 5 نجوم'**
  String a11yStarRating(String stars);

  /// No description provided for @validationRequired.
  ///
  /// In ar, this message translates to:
  /// **'الحقل ده مطلوب'**
  String get validationRequired;

  /// No description provided for @validationEmail.
  ///
  /// In ar, this message translates to:
  /// **'اكتب بريد إلكتروني صحيح'**
  String get validationEmail;

  /// No description provided for @validationPhone.
  ///
  /// In ar, this message translates to:
  /// **'الرقم لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015'**
  String get validationPhone;

  /// No description provided for @validationPasswordShort.
  ///
  /// In ar, this message translates to:
  /// **'كلمة السر لازم تكون 8 حروف على الأقل'**
  String get validationPasswordShort;

  /// No description provided for @validationPasswordDigit.
  ///
  /// In ar, this message translates to:
  /// **'كلمة السر لازم يكون فيها رقم واحد على الأقل'**
  String get validationPasswordDigit;

  /// No description provided for @validationOtp.
  ///
  /// In ar, this message translates to:
  /// **'اكتب الكود كامل'**
  String get validationOtp;

  /// No description provided for @validationNameShort.
  ///
  /// In ar, this message translates to:
  /// **'الاسم قصير أوي'**
  String get validationNameShort;

  /// No description provided for @errorServer.
  ///
  /// In ar, this message translates to:
  /// **'السيرفر مش بيرد دلوقتي. جرّب تاني كمان شوية.'**
  String get errorServer;

  /// No description provided for @errorUnauthorized.
  ///
  /// In ar, this message translates to:
  /// **'جلستك انتهت. سجّل دخولك تاني.'**
  String get errorUnauthorized;

  /// No description provided for @offlineSearchDisabled.
  ///
  /// In ar, this message translates to:
  /// **'البحث محتاج نت'**
  String get offlineSearchDisabled;

  /// No description provided for @offlineWaitStale.
  ///
  /// In ar, this message translates to:
  /// **'الانتظار مش متحدّث'**
  String get offlineWaitStale;

  /// No description provided for @offlineQueueBlocked.
  ///
  /// In ar, this message translates to:
  /// **'مش هينفع تدخل الطابور وانت من غير نت — استنى ما الشبكة ترجع.'**
  String get offlineQueueBlocked;

  /// No description provided for @offlineOpenLastBooking.
  ///
  /// In ar, this message translates to:
  /// **'افتح آخر حجز شوفته'**
  String get offlineOpenLastBooking;

  /// No description provided for @offlineTipsTitle.
  ///
  /// In ar, this message translates to:
  /// **'جرّب الحاجات دي:'**
  String get offlineTipsTitle;

  /// No description provided for @offlineTipData.
  ///
  /// In ar, this message translates to:
  /// **'اتأكد إن بيانات الموبايل أو الواي فاي شغّالين'**
  String get offlineTipData;

  /// No description provided for @offlineTipAirplane.
  ///
  /// In ar, this message translates to:
  /// **'قفل وضع الطيران لو مفتوح'**
  String get offlineTipAirplane;

  /// No description provided for @ratingLabel1.
  ///
  /// In ar, this message translates to:
  /// **'وحش'**
  String get ratingLabel1;

  /// No description provided for @ratingLabel2.
  ///
  /// In ar, this message translates to:
  /// **'مش أحسن حاجة'**
  String get ratingLabel2;

  /// No description provided for @ratingLabel3.
  ///
  /// In ar, this message translates to:
  /// **'كويس'**
  String get ratingLabel3;

  /// No description provided for @ratingLabel4.
  ///
  /// In ar, this message translates to:
  /// **'حلو جداً'**
  String get ratingLabel4;

  /// No description provided for @ratingLabel5.
  ///
  /// In ar, this message translates to:
  /// **'ممتاز'**
  String get ratingLabel5;

  /// No description provided for @priceEgp.
  ///
  /// In ar, this message translates to:
  /// **'{amount} ج.م'**
  String priceEgp(String amount);

  /// No description provided for @priceFrom.
  ///
  /// In ar, this message translates to:
  /// **'من {price}'**
  String priceFrom(String price);

  /// No description provided for @distanceKm.
  ///
  /// In ar, this message translates to:
  /// **'{distance} كم'**
  String distanceKm(String distance);

  /// No description provided for @minutesShort.
  ///
  /// In ar, this message translates to:
  /// **'{minutes} د'**
  String minutesShort(String minutes);

  /// No description provided for @reviewsCount.
  ///
  /// In ar, this message translates to:
  /// **'({count})'**
  String reviewsCount(String count);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
