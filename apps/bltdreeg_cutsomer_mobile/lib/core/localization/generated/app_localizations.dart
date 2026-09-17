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

  /// No description provided for @onboardingSkip.
  ///
  /// In ar, this message translates to:
  /// **'تخطّي'**
  String get onboardingSkip;

  /// No description provided for @onboarding1Title.
  ///
  /// In ar, this message translates to:
  /// **'الحلاقين اللي جنبك\nكلهم في مكان واحد'**
  String get onboarding1Title;

  /// No description provided for @onboarding1Body.
  ///
  /// In ar, this message translates to:
  /// **'دوّر على أقرب صالون لبيتك أو لشغلك، وشوف أسعاره وخدماته وتقييم الزباين قبل ما تتحرك.'**
  String get onboarding1Body;

  /// No description provided for @onboarding1Cta.
  ///
  /// In ar, this message translates to:
  /// **'يلا نبدأ'**
  String get onboarding1Cta;

  /// No description provided for @onboarding2Title.
  ///
  /// In ar, this message translates to:
  /// **'استنى دورك\nوانت في مكانك'**
  String get onboarding2Title;

  /// No description provided for @onboarding2Body.
  ///
  /// In ar, this message translates to:
  /// **'ادخل الطابور من موبايلك، وشوف فاضلك كام واحد والوقت المتوقع لحظة بلحظة. هنبعتلك إشعار وانت لسه فاضلك اتنين.'**
  String get onboarding2Body;

  /// No description provided for @onboarding2Cta.
  ///
  /// In ar, this message translates to:
  /// **'كمّل'**
  String get onboarding2Cta;

  /// No description provided for @onboarding3Title.
  ///
  /// In ar, this message translates to:
  /// **'اختار الصنايعي\nواعرف الحساب من الأول'**
  String get onboarding3Title;

  /// No description provided for @onboarding3Body.
  ///
  /// In ar, this message translates to:
  /// **'كل خدمة سعرها ومدتها واضحين، وتقدر تختار الحلاق اللي بتحبه بالاسم. من غير مفاجآت آخر الحلاقة.'**
  String get onboarding3Body;

  /// No description provided for @onboarding3Cta.
  ///
  /// In ar, this message translates to:
  /// **'ادخل على الصالونات'**
  String get onboarding3Cta;

  /// No description provided for @onboarding3Login.
  ///
  /// In ar, this message translates to:
  /// **'عندي حساب — تسجيل الدخول'**
  String get onboarding3Login;

  /// No description provided for @queueNumberCaption.
  ///
  /// In ar, this message translates to:
  /// **'دورك رقم'**
  String get queueNumberCaption;

  /// No description provided for @peopleLeft.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{مفيش حد قدامك} =1{فاضلك واحد بس} other{فاضلك {count} أنفار}}'**
  String peopleLeft(int count);

  /// No description provided for @approxMinutes.
  ///
  /// In ar, this message translates to:
  /// **'~ {minutes} دقيقة'**
  String approxMinutes(int minutes);

  /// No description provided for @durationMinutes.
  ///
  /// In ar, this message translates to:
  /// **'{minutes} دقيقة'**
  String durationMinutes(int minutes);

  /// No description provided for @authBrowseAsGuest.
  ///
  /// In ar, this message translates to:
  /// **'تصفّح من غير حساب'**
  String get authBrowseAsGuest;

  /// No description provided for @loginTitle.
  ///
  /// In ar, this message translates to:
  /// **'أهلاً بيك تاني'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'سجّل دخولك عشان تتابع دورك وحجوزاتك.'**
  String get loginSubtitle;

  /// No description provided for @loginTabEmail.
  ///
  /// In ar, this message translates to:
  /// **'بالبريد الإلكتروني'**
  String get loginTabEmail;

  /// No description provided for @loginTabPhone.
  ///
  /// In ar, this message translates to:
  /// **'برقم الموبايل'**
  String get loginTabPhone;

  /// No description provided for @fieldEmail.
  ///
  /// In ar, this message translates to:
  /// **'البريد الإلكتروني'**
  String get fieldEmail;

  /// No description provided for @fieldPassword.
  ///
  /// In ar, this message translates to:
  /// **'كلمة السر'**
  String get fieldPassword;

  /// No description provided for @fieldPhone.
  ///
  /// In ar, this message translates to:
  /// **'رقم الموبايل'**
  String get fieldPhone;

  /// No description provided for @fieldFirstName.
  ///
  /// In ar, this message translates to:
  /// **'الاسم الأول'**
  String get fieldFirstName;

  /// No description provided for @fieldLastName.
  ///
  /// In ar, this message translates to:
  /// **'اسم العيلة'**
  String get fieldLastName;

  /// No description provided for @loginForgotPassword.
  ///
  /// In ar, this message translates to:
  /// **'نسيت كلمة السر؟'**
  String get loginForgotPassword;

  /// No description provided for @loginSubmit.
  ///
  /// In ar, this message translates to:
  /// **'دخول'**
  String get loginSubmit;

  /// No description provided for @orDivider.
  ///
  /// In ar, this message translates to:
  /// **'أو'**
  String get orDivider;

  /// No description provided for @continueWithGoogle.
  ///
  /// In ar, this message translates to:
  /// **'المتابعة بحساب Google'**
  String get continueWithGoogle;

  /// No description provided for @continueWithApple.
  ///
  /// In ar, this message translates to:
  /// **'المتابعة بحساب Apple'**
  String get continueWithApple;

  /// No description provided for @loginNoAccount.
  ///
  /// In ar, this message translates to:
  /// **'لسه معندكش حساب؟'**
  String get loginNoAccount;

  /// No description provided for @loginCreateAccount.
  ///
  /// In ar, this message translates to:
  /// **'اعمل واحد دلوقتي'**
  String get loginCreateAccount;

  /// No description provided for @loginOtpNotice.
  ///
  /// In ar, this message translates to:
  /// **'هنبعتلك كود تأكيد في رسالة على نفس الرقم.'**
  String get loginOtpNotice;

  /// No description provided for @loginSendOtp.
  ///
  /// In ar, this message translates to:
  /// **'ابعت كود التأكيد'**
  String get loginSendOtp;

  /// No description provided for @registerTitle.
  ///
  /// In ar, this message translates to:
  /// **'اعمل حسابك في دقيقة'**
  String get registerTitle;

  /// No description provided for @registerSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'الحساب بيخليك تدخل الطابور وتتابع دورك وتقيّم الخدمة.'**
  String get registerSubtitle;

  /// No description provided for @passwordRuleLength.
  ///
  /// In ar, this message translates to:
  /// **'{count} حروف على الأقل'**
  String passwordRuleLength(int count);

  /// No description provided for @passwordRuleDigit.
  ///
  /// In ar, this message translates to:
  /// **'رقم واحد على الأقل'**
  String get passwordRuleDigit;

  /// No description provided for @registerTerms.
  ///
  /// In ar, this message translates to:
  /// **'موافق على {terms} و{privacy} بتاعة بالتدريج.'**
  String registerTerms(String terms, String privacy);

  /// No description provided for @termsOfUse.
  ///
  /// In ar, this message translates to:
  /// **'شروط الاستخدام'**
  String get termsOfUse;

  /// No description provided for @privacyPolicy.
  ///
  /// In ar, this message translates to:
  /// **'سياسة الخصوصية'**
  String get privacyPolicy;

  /// No description provided for @registerTermsRequired.
  ///
  /// In ar, this message translates to:
  /// **'لازم توافق على الشروط عشان تكمل'**
  String get registerTermsRequired;

  /// No description provided for @registerSubmit.
  ///
  /// In ar, this message translates to:
  /// **'اعمل الحساب'**
  String get registerSubmit;

  /// No description provided for @registerOrSocial.
  ///
  /// In ar, this message translates to:
  /// **'أو سجّل بـ'**
  String get registerOrSocial;

  /// No description provided for @registerHaveAccount.
  ///
  /// In ar, this message translates to:
  /// **'عندك حساب قبل كده؟'**
  String get registerHaveAccount;

  /// No description provided for @registerSignIn.
  ///
  /// In ar, this message translates to:
  /// **'سجّل دخولك'**
  String get registerSignIn;

  /// No description provided for @otpTitle.
  ///
  /// In ar, this message translates to:
  /// **'اكتب كود التأكيد'**
  String get otpTitle;

  /// No description provided for @otpSentTo.
  ///
  /// In ar, this message translates to:
  /// **'بعتنالك كود من {length} أرقام في رسالة على الرقم'**
  String otpSentTo(int length);

  /// No description provided for @otpChangeNumber.
  ///
  /// In ar, this message translates to:
  /// **'غيّر الرقم'**
  String get otpChangeNumber;

  /// No description provided for @otpResendIn.
  ///
  /// In ar, this message translates to:
  /// **'تقدر تطلب كود جديد بعد {time}'**
  String otpResendIn(String time);

  /// No description provided for @otpConfirm.
  ///
  /// In ar, this message translates to:
  /// **'تأكيد'**
  String get otpConfirm;

  /// No description provided for @otpHelp.
  ///
  /// In ar, this message translates to:
  /// **'ما وصلكش الكود؟ اتأكد إن الرقم مظبوط وإن الشبكة شغّالة.'**
  String get otpHelp;

  /// No description provided for @otpWrongTitle.
  ///
  /// In ar, this message translates to:
  /// **'الكود مش مظبوط'**
  String get otpWrongTitle;

  /// No description provided for @otpWrongSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'راجع الأرقام تاني، أو اطلب كود جديد على'**
  String get otpWrongSubtitle;

  /// No description provided for @otpAttemptsLeft.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{فاضلك محاولة واحدة قبل ما نقفل الطلب مؤقتاً} =2{فاضلك محاولتين قبل ما نقفل الطلب مؤقتاً} other{فاضلك {count} محاولات قبل ما نقفل الطلب مؤقتاً}}'**
  String otpAttemptsLeft(int count);

  /// No description provided for @otpLocked.
  ///
  /// In ar, this message translates to:
  /// **'وقفنا المحاولات مؤقتاً. جرّب تاني بعد {minutes} دقايق.'**
  String otpLocked(int minutes);

  /// No description provided for @otpResend.
  ///
  /// In ar, this message translates to:
  /// **'ابعتلي كود جديد'**
  String get otpResend;

  /// No description provided for @otpResent.
  ///
  /// In ar, this message translates to:
  /// **'بعتنالك كود جديد'**
  String get otpResent;

  /// No description provided for @authInvalidCredentials.
  ///
  /// In ar, this message translates to:
  /// **'البريد الإلكتروني أو كلمة السر مش مظبوطين'**
  String get authInvalidCredentials;

  /// No description provided for @authPhoneNotRegistered.
  ///
  /// In ar, this message translates to:
  /// **'الرقم ده مش متسجّل. اعمل حساب جديد في دقيقة.'**
  String get authPhoneNotRegistered;

  /// No description provided for @authPhoneTaken.
  ///
  /// In ar, this message translates to:
  /// **'الرقم ده عليه حساب بالفعل. سجّل دخولك بيه.'**
  String get authPhoneTaken;

  /// No description provided for @homeNearCaption.
  ///
  /// In ar, this message translates to:
  /// **'بنعرضلك اللي قريب من'**
  String get homeNearCaption;

  /// No description provided for @areaWithCity.
  ///
  /// In ar, this message translates to:
  /// **'{area}، {city}'**
  String areaWithCity(String area, String city);

  /// No description provided for @homeSearchHint.
  ///
  /// In ar, this message translates to:
  /// **'دوّر باسم الصالون أو الخدمة'**
  String get homeSearchHint;

  /// No description provided for @homeAvailableNow.
  ///
  /// In ar, this message translates to:
  /// **'تقدر تدخل دلوقتي'**
  String get homeAvailableNow;

  /// No description provided for @homeRecommended.
  ///
  /// In ar, this message translates to:
  /// **'مرشّح ليك'**
  String get homeRecommended;

  /// No description provided for @homeNewInArea.
  ///
  /// In ar, this message translates to:
  /// **'جديد في منطقتك'**
  String get homeNewInArea;

  /// No description provided for @homeLastSeen.
  ///
  /// In ar, this message translates to:
  /// **'آخر صالونات شوفتها'**
  String get homeLastSeen;

  /// No description provided for @homeAreaEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لسه مفيش صالونات هنا'**
  String get homeAreaEmptyTitle;

  /// No description provided for @homeAreaEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'بنضيف صالونات جديدة في {area} قريب. جرّب منطقة قريبة منك.'**
  String homeAreaEmptyBody(String area);

  /// No description provided for @homeChangeArea.
  ///
  /// In ar, this message translates to:
  /// **'غيّر المنطقة'**
  String get homeChangeArea;

  /// No description provided for @loadErrorTitle.
  ///
  /// In ar, this message translates to:
  /// **'مش قادرين نحمّل الصالونات'**
  String get loadErrorTitle;

  /// No description provided for @sortLeastWait.
  ///
  /// In ar, this message translates to:
  /// **'أقل انتظار دلوقتي'**
  String get sortLeastWait;

  /// No description provided for @sortNearest.
  ///
  /// In ar, this message translates to:
  /// **'الأقرب ليك'**
  String get sortNearest;

  /// No description provided for @sortTopRated.
  ///
  /// In ar, this message translates to:
  /// **'الأعلى تقييماً'**
  String get sortTopRated;

  /// No description provided for @sortCheapest.
  ///
  /// In ar, this message translates to:
  /// **'أرخص سعر'**
  String get sortCheapest;

  /// No description provided for @sortNewest.
  ///
  /// In ar, this message translates to:
  /// **'أحدث الصالونات'**
  String get sortNewest;

  /// No description provided for @serviceHaircut.
  ///
  /// In ar, this message translates to:
  /// **'قصة شعر'**
  String get serviceHaircut;

  /// No description provided for @serviceBeard.
  ///
  /// In ar, this message translates to:
  /// **'حلاقة دقن'**
  String get serviceBeard;

  /// No description provided for @serviceKids.
  ///
  /// In ar, this message translates to:
  /// **'حلاقة أطفال'**
  String get serviceKids;

  /// No description provided for @serviceColor.
  ///
  /// In ar, this message translates to:
  /// **'صبغة'**
  String get serviceColor;

  /// No description provided for @serviceSkincare.
  ///
  /// In ar, this message translates to:
  /// **'عناية بالبشرة'**
  String get serviceSkincare;

  /// No description provided for @waitFreeNow.
  ///
  /// In ar, this message translates to:
  /// **'فاضي دلوقتي'**
  String get waitFreeNow;

  /// No description provided for @waitFreeWalkIn.
  ///
  /// In ar, this message translates to:
  /// **'فاضي دلوقتي — ادخل على طول'**
  String get waitFreeWalkIn;

  /// No description provided for @pinPeopleLeft.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{فاضل 1 بس} other{فاضل {count}}}'**
  String pinPeopleLeft(int count);

  /// No description provided for @waitPeopleMinutes.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{فاضل 1 — استنى ~{minutes} د} other{فاضل {count} أنفار — استنى ~{minutes} د}}'**
  String waitPeopleMinutes(int count, int minutes);

  /// No description provided for @waitPeopleHour.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{فاضل 1 — استنى ~ساعة} other{فاضل {count} أنفار — استنى ~ساعة}}'**
  String waitPeopleHour(int count);

  /// No description provided for @waitNotUpdated.
  ///
  /// In ar, this message translates to:
  /// **'الانتظار مش متحدّث'**
  String get waitNotUpdated;

  /// No description provided for @opensTodayAt.
  ///
  /// In ar, this message translates to:
  /// **'بيفتح الساعة {time}'**
  String opensTodayAt(String time);

  /// No description provided for @opensTomorrowAt.
  ///
  /// In ar, this message translates to:
  /// **'بيفتح بكرة {time}'**
  String opensTomorrowAt(String time);

  /// No description provided for @opensOnDayAt.
  ///
  /// In ar, this message translates to:
  /// **'بيفتح {day} {time}'**
  String opensOnDayAt(String day, String time);

  /// No description provided for @openedDaysAgo.
  ///
  /// In ar, this message translates to:
  /// **'{days, plural, =0{فتح النهارده} =1{فتح امبارح} =2{فتح من يومين} other{فتح من {days} أيام}}'**
  String openedDaysAgo(int days);

  /// No description provided for @openedWeeksAgo.
  ///
  /// In ar, this message translates to:
  /// **'{weeks, plural, =1{فتح من أسبوع} =2{فتح من أسبوعين} other{فتح من {weeks} أسابيع}}'**
  String openedWeeksAgo(int weeks);

  /// No description provided for @searchHint.
  ///
  /// In ar, this message translates to:
  /// **'دوّر باسم الصالون'**
  String get searchHint;

  /// No description provided for @searchRecent.
  ///
  /// In ar, this message translates to:
  /// **'آخر ما دوّرت عليه'**
  String get searchRecent;

  /// No description provided for @searchNearbyNow.
  ///
  /// In ar, this message translates to:
  /// **'قريب منك دلوقتي'**
  String get searchNearbyNow;

  /// No description provided for @searchResultsForQuery.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{صالون واحد فيه \"{query}\"} other{{count} صالونات فيها \"{query}\"}}'**
  String searchResultsForQuery(int count, String query);

  /// No description provided for @searchResultsCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{صالون واحد} other{{count} صالونات}}'**
  String searchResultsCount(int count);

  /// No description provided for @withinKm.
  ///
  /// In ar, this message translates to:
  /// **'داخل {km} كم'**
  String withinKm(String km);

  /// No description provided for @searchNoResultsTitle.
  ///
  /// In ar, this message translates to:
  /// **'مفيش صالون بالاسم ده'**
  String get searchNoResultsTitle;

  /// No description provided for @searchNoResultsBody.
  ///
  /// In ar, this message translates to:
  /// **'ما لقيناش \"{query}\" في {area}. جرّب تشيل الفلاتر أو تدوّر باسم تاني.'**
  String searchNoResultsBody(String query, String area);

  /// No description provided for @searchNoFilterResultsTitle.
  ///
  /// In ar, this message translates to:
  /// **'مفيش صالونات بالفلاتر دي'**
  String get searchNoFilterResultsTitle;

  /// No description provided for @searchNoFilterResultsBody.
  ///
  /// In ar, this message translates to:
  /// **'جرّب تشيل فلتر أو توسّع نطاق البحث.'**
  String get searchNoFilterResultsBody;

  /// No description provided for @searchClearFiltersShowAll.
  ///
  /// In ar, this message translates to:
  /// **'امسح الفلاتر واعرض كل الصالونات'**
  String get searchClearFiltersShowAll;

  /// No description provided for @searchExpandRadius.
  ///
  /// In ar, this message translates to:
  /// **'وسّع نطاق البحث لـ {km} كم'**
  String searchExpandRadius(String km);

  /// No description provided for @searchDidYouMean.
  ///
  /// In ar, this message translates to:
  /// **'يمكن تكون بتقصد'**
  String get searchDidYouMean;

  /// No description provided for @filterTitle.
  ///
  /// In ar, this message translates to:
  /// **'فلترة وترتيب'**
  String get filterTitle;

  /// No description provided for @filterSortBy.
  ///
  /// In ar, this message translates to:
  /// **'رتّب النتايج بـ'**
  String get filterSortBy;

  /// No description provided for @filterService.
  ///
  /// In ar, this message translates to:
  /// **'الخدمة اللي عايزها'**
  String get filterService;

  /// No description provided for @filterAvailableOn.
  ///
  /// In ar, this message translates to:
  /// **'متاح في يوم'**
  String get filterAvailableOn;

  /// No description provided for @filterPrice.
  ///
  /// In ar, this message translates to:
  /// **'السعر'**
  String get filterPrice;

  /// No description provided for @filterOpenNow.
  ///
  /// In ar, this message translates to:
  /// **'مفتوح دلوقتي بس'**
  String get filterOpenNow;

  /// No description provided for @filterOpenNowHint.
  ///
  /// In ar, this message translates to:
  /// **'اخفي الصالونات المقفولة'**
  String get filterOpenNowHint;

  /// No description provided for @filterShowResults.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{مفيش نتايج} =1{اعرض نتيجة واحدة} other{اعرض {count} نتايج}}'**
  String filterShowResults(int count);

  /// No description provided for @dayToday.
  ///
  /// In ar, this message translates to:
  /// **'النهارده'**
  String get dayToday;

  /// No description provided for @dayTomorrow.
  ///
  /// In ar, this message translates to:
  /// **'بكرة'**
  String get dayTomorrow;

  /// No description provided for @dayChipLabel.
  ///
  /// In ar, this message translates to:
  /// **'{day} {date}'**
  String dayChipLabel(String day, String date);

  /// No description provided for @priceRangeLabel.
  ///
  /// In ar, this message translates to:
  /// **'{min} – {max}'**
  String priceRangeLabel(String min, String max);

  /// No description provided for @areaSheetTitle.
  ///
  /// In ar, this message translates to:
  /// **'اختار المنطقة'**
  String get areaSheetTitle;

  /// No description provided for @areaSearchHint.
  ///
  /// In ar, this message translates to:
  /// **'دوّر على منطقة'**
  String get areaSearchHint;

  /// No description provided for @areaUseLocation.
  ///
  /// In ar, this message translates to:
  /// **'استخدم موقعي الحالي'**
  String get areaUseLocation;

  /// No description provided for @areaUseLocationHint.
  ///
  /// In ar, this message translates to:
  /// **'هنطلب إذن الموقع مرة واحدة'**
  String get areaUseLocationHint;

  /// No description provided for @areaNearby.
  ///
  /// In ar, this message translates to:
  /// **'مناطق قريبة منك'**
  String get areaNearby;

  /// No description provided for @areaOthers.
  ///
  /// In ar, this message translates to:
  /// **'مناطق تانية في {city}'**
  String areaOthers(String city);

  /// No description provided for @areaSalonsCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{صالون واحد} =2{صالونين} few{{count} صالونات} other{{count} صالون}}'**
  String areaSalonsCount(int count);

  /// No description provided for @areaConfirm.
  ///
  /// In ar, this message translates to:
  /// **'أكّد المنطقة'**
  String get areaConfirm;

  /// No description provided for @areaLocated.
  ///
  /// In ar, this message translates to:
  /// **'حددنا منطقتك: {area}'**
  String areaLocated(String area);
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
