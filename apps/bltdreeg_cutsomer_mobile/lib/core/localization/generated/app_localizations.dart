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

  /// No description provided for @salonReviewsWithCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{(تقييم واحد)} other{({count} تقييم)}}'**
  String salonReviewsWithCount(int count);

  /// No description provided for @statusFreeNoQueue.
  ///
  /// In ar, this message translates to:
  /// **'فاضي دلوقتي — مفيش دور'**
  String get statusFreeNoQueue;

  /// No description provided for @statusClosedNow.
  ///
  /// In ar, this message translates to:
  /// **'مقفول دلوقتي'**
  String get statusClosedNow;

  /// No description provided for @chairsActive.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{كرسي واحد شغّال} =2{كرسيين شغّالين} other{{count} كراسي شغّالة}}'**
  String chairsActive(int count);

  /// No description provided for @barbersOnShift.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{مفيش حلاقين في الشيفت} =1{حلاق واحد في الشيفت} other{{count} حلاقين في الشيفت}}'**
  String barbersOnShift(int count);

  /// No description provided for @dotSeparated.
  ///
  /// In ar, this message translates to:
  /// **'{a} · {b}'**
  String dotSeparated(String a, String b);

  /// No description provided for @actionDirections.
  ///
  /// In ar, this message translates to:
  /// **'الاتجاهات'**
  String get actionDirections;

  /// No description provided for @actionCall.
  ///
  /// In ar, this message translates to:
  /// **'اتصل'**
  String get actionCall;

  /// No description provided for @a11yShare.
  ///
  /// In ar, this message translates to:
  /// **'شارك الصالون'**
  String get a11yShare;

  /// No description provided for @a11yAddFavorite.
  ///
  /// In ar, this message translates to:
  /// **'ضيف للمفضلة'**
  String get a11yAddFavorite;

  /// No description provided for @a11yRemoveFavorite.
  ///
  /// In ar, this message translates to:
  /// **'شيل من المفضلة'**
  String get a11yRemoveFavorite;

  /// No description provided for @photosCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{صورة واحدة} =2{صورتين} few{{count} صور} other{{count} صورة}}'**
  String photosCount(int count);

  /// No description provided for @videosCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{فيديو واحد} =2{فيديوهين} other{{count} فيديو}}'**
  String videosCount(int count);

  /// No description provided for @videoChip.
  ///
  /// In ar, this message translates to:
  /// **'فيديو'**
  String get videoChip;

  /// No description provided for @tabServices.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات'**
  String get tabServices;

  /// No description provided for @tabBarbers.
  ///
  /// In ar, this message translates to:
  /// **'الحلاقين'**
  String get tabBarbers;

  /// No description provided for @tabOffers.
  ///
  /// In ar, this message translates to:
  /// **'العروض'**
  String get tabOffers;

  /// No description provided for @tabReviews.
  ///
  /// In ar, this message translates to:
  /// **'التقييمات'**
  String get tabReviews;

  /// No description provided for @tabHours.
  ///
  /// In ar, this message translates to:
  /// **'المواعيد'**
  String get tabHours;

  /// No description provided for @a11yAddService.
  ///
  /// In ar, this message translates to:
  /// **'ضيف {service}'**
  String a11yAddService(String service);

  /// No description provided for @a11yRemoveService.
  ///
  /// In ar, this message translates to:
  /// **'شيل {service}'**
  String a11yRemoveService(String service);

  /// No description provided for @barberQueueAhead.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{قدامه 1 — ~{minutes} د} other{قدامه {count} — ~{minutes} د}}'**
  String barberQueueAhead(int count, int minutes);

  /// No description provided for @barberOffReturns.
  ///
  /// In ar, this message translates to:
  /// **'إجازة النهارده — بيرجع {day}'**
  String barberOffReturns(String day);

  /// No description provided for @yearsExperience.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{سنة خبرة} =2{سنتين خبرة} few{{count} سنين خبرة} other{{count} سنة خبرة}}'**
  String yearsExperience(int count);

  /// No description provided for @barberNamedNote.
  ///
  /// In ar, this message translates to:
  /// **'لو اخترت حلاق بالاسم هتستنى في طابوره لوحده. أسرع حاجة إنك تسيبها \"أي حلاق متاح\".'**
  String get barberNamedNote;

  /// No description provided for @offersHeader.
  ///
  /// In ar, this message translates to:
  /// **'عروض شغّالة دلوقتي'**
  String get offersHeader;

  /// No description provided for @offerExpiresIn.
  ///
  /// In ar, this message translates to:
  /// **'{days, plural, =0{ينتهي النهارده} =1{ينتهي بكرة} =2{ينتهي بعد يومين} other{ينتهي بعد {days} أيام}}'**
  String offerExpiresIn(int days);

  /// No description provided for @offerBundleSaving.
  ///
  /// In ar, this message translates to:
  /// **'بدل {original} — توفّر {saving}'**
  String offerBundleSaving(String original, String saving);

  /// No description provided for @offerLoyaltyProgress.
  ///
  /// In ar, this message translates to:
  /// **'عندك {done} من {target} زيارات'**
  String offerLoyaltyProgress(int done, int target);

  /// No description provided for @reviewsTotal.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{تقييم واحد} =2{تقييمين} few{{count} تقييمات} other{{count} تقييم}}'**
  String reviewsTotal(int count);

  /// No description provided for @breakdownQuality.
  ///
  /// In ar, this message translates to:
  /// **'جودة القصة'**
  String get breakdownQuality;

  /// No description provided for @breakdownCleanliness.
  ///
  /// In ar, this message translates to:
  /// **'النظافة'**
  String get breakdownCleanliness;

  /// No description provided for @breakdownTimeAccuracy.
  ///
  /// In ar, this message translates to:
  /// **'دقة الوقت'**
  String get breakdownTimeAccuracy;

  /// No description provided for @reviewFilterAll.
  ///
  /// In ar, this message translates to:
  /// **'الكل'**
  String get reviewFilterAll;

  /// No description provided for @reviewFilterFiveStars.
  ///
  /// In ar, this message translates to:
  /// **'5 نجوم'**
  String get reviewFilterFiveStars;

  /// No description provided for @reviewFilterWithPhotos.
  ///
  /// In ar, this message translates to:
  /// **'فيه صور'**
  String get reviewFilterWithPhotos;

  /// No description provided for @salonReply.
  ///
  /// In ar, this message translates to:
  /// **'رد الصالون'**
  String get salonReply;

  /// No description provided for @reviewsEmpty.
  ///
  /// In ar, this message translates to:
  /// **'لسه مفيش تقييمات على الصالون ده.'**
  String get reviewsEmpty;

  /// No description provided for @reviewsFilterEmpty.
  ///
  /// In ar, this message translates to:
  /// **'مفيش تقييمات بالفلتر ده.'**
  String get reviewsFilterEmpty;

  /// No description provided for @timeAgoMinutes.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{دلوقتي} =1{من دقيقة} =2{من دقيقتين} few{من {count} دقايق} other{من {count} دقيقة}}'**
  String timeAgoMinutes(int count);

  /// No description provided for @timeAgoHours.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{من ساعة} =2{من ساعتين} few{من {count} ساعات} other{من {count} ساعة}}'**
  String timeAgoHours(int count);

  /// No description provided for @timeAgoDays.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{من يوم} =2{من يومين} few{من {count} أيام} other{من {count} يوم}}'**
  String timeAgoDays(int count);

  /// No description provided for @timeAgoWeeks.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{من أسبوع} =2{من أسبوعين} other{من {count} أسابيع}}'**
  String timeAgoWeeks(int count);

  /// No description provided for @timeAgoMonths.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{من شهر} =2{من شهرين} few{من {count} شهور} other{من {count} شهر}}'**
  String timeAgoMonths(int count);

  /// No description provided for @hoursHeader.
  ///
  /// In ar, this message translates to:
  /// **'مواعيد العمل'**
  String get hoursHeader;

  /// No description provided for @openNowBadge.
  ///
  /// In ar, this message translates to:
  /// **'مفتوح دلوقتي'**
  String get openNowBadge;

  /// No description provided for @todayWithDay.
  ///
  /// In ar, this message translates to:
  /// **'النهارده — {day}'**
  String todayWithDay(String day);

  /// No description provided for @dayOff.
  ///
  /// In ar, this message translates to:
  /// **'إجازة'**
  String get dayOff;

  /// No description provided for @hoursRange.
  ///
  /// In ar, this message translates to:
  /// **'{from} — {to}'**
  String hoursRange(String from, String to);

  /// No description provided for @selectionCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{اختار خدمة} =1{خدمة واحدة} =2{خدمتين} few{{count} خدمات} other{{count} خدمة}}'**
  String selectionCount(int count);

  /// No description provided for @joinQueue.
  ///
  /// In ar, this message translates to:
  /// **'ادخل الطابور'**
  String get joinQueue;

  /// No description provided for @pickServiceFirst.
  ///
  /// In ar, this message translates to:
  /// **'اختار خدمة واحدة على الأقل عشان تدخل الطابور'**
  String get pickServiceFirst;

  /// No description provided for @salonNotFoundTitle.
  ///
  /// In ar, this message translates to:
  /// **'الصالون ده مش موجود'**
  String get salonNotFoundTitle;

  /// No description provided for @salonNotFoundBody.
  ///
  /// In ar, this message translates to:
  /// **'ممكن يكون اتقفل أو الرابط مش مظبوط.'**
  String get salonNotFoundBody;

  /// No description provided for @backToHome.
  ///
  /// In ar, this message translates to:
  /// **'ارجع للرئيسية'**
  String get backToHome;

  /// No description provided for @shareSalonText.
  ///
  /// In ar, this message translates to:
  /// **'شوف {salon} على بالتدريج: {link}'**
  String shareSalonText(String salon, String link);

  /// No description provided for @cantOpenApp.
  ///
  /// In ar, this message translates to:
  /// **'مش قادرين نفتح التطبيق ده على موبايلك'**
  String get cantOpenApp;

  /// No description provided for @galleryTitle.
  ///
  /// In ar, this message translates to:
  /// **'صور {salon}'**
  String galleryTitle(String salon);

  /// No description provided for @galleryFilterAll.
  ///
  /// In ar, this message translates to:
  /// **'الكل {count}'**
  String galleryFilterAll(int count);

  /// No description provided for @galleryFilterWork.
  ///
  /// In ar, this message translates to:
  /// **'شغل الحلاقين {count}'**
  String galleryFilterWork(int count);

  /// No description provided for @galleryFilterPlace.
  ///
  /// In ar, this message translates to:
  /// **'المكان {count}'**
  String galleryFilterPlace(int count);

  /// No description provided for @galleryFilterVideo.
  ///
  /// In ar, this message translates to:
  /// **'فيديو {count}'**
  String galleryFilterVideo(int count);

  /// No description provided for @galleryMore.
  ///
  /// In ar, this message translates to:
  /// **'+{count}'**
  String galleryMore(int count);

  /// No description provided for @galleryReviewPhotos.
  ///
  /// In ar, this message translates to:
  /// **'صور من تقييمات الزباين'**
  String get galleryReviewPhotos;

  /// No description provided for @photoCounter.
  ///
  /// In ar, this message translates to:
  /// **'{index} / {total}'**
  String photoCounter(int index, int total);

  /// No description provided for @bookingWhenTitle.
  ///
  /// In ar, this message translates to:
  /// **'امتى تحب تيجي؟'**
  String get bookingWhenTitle;

  /// No description provided for @bookingNowTitle.
  ///
  /// In ar, this message translates to:
  /// **'دلوقتي — ادخل الطابور'**
  String get bookingNowTitle;

  /// No description provided for @bookingNowWait.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{مفيش دور — هتدخل على طول} =1{قدامك 1 بس · ~{minutes} د} other{قدامك {count} · ~{minutes} د}}'**
  String bookingNowWait(int count, int minutes);

  /// No description provided for @bookingNowClosed.
  ///
  /// In ar, this message translates to:
  /// **'الصالون مقفول دلوقتي — احجز معاد'**
  String get bookingNowClosed;

  /// No description provided for @bookingScheduleTitle.
  ///
  /// In ar, this message translates to:
  /// **'احجز معاد'**
  String get bookingScheduleTitle;

  /// No description provided for @bookingScheduleSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'اختار اليوم والساعة اللي تناسبك'**
  String get bookingScheduleSubtitle;

  /// No description provided for @bookingDurationNote.
  ///
  /// In ar, this message translates to:
  /// **'مدة خدماتك {minutes} دقيقة'**
  String bookingDurationNote(int minutes);

  /// No description provided for @slotPeriodMorning.
  ///
  /// In ar, this message translates to:
  /// **'الصبح'**
  String get slotPeriodMorning;

  /// No description provided for @slotPeriodAfternoon.
  ///
  /// In ar, this message translates to:
  /// **'بعد الضهر'**
  String get slotPeriodAfternoon;

  /// No description provided for @slotPeriodEvening.
  ///
  /// In ar, this message translates to:
  /// **'بالليل'**
  String get slotPeriodEvening;

  /// No description provided for @slotsDayClosed.
  ///
  /// In ar, this message translates to:
  /// **'الصالون أجازة اليوم ده — اختار يوم تاني.'**
  String get slotsDayClosed;

  /// No description provided for @slotsDayFull.
  ///
  /// In ar, this message translates to:
  /// **'مفيش مواعيد فاضية اليوم ده — جرّب يوم تاني.'**
  String get slotsDayFull;

  /// No description provided for @slotsLoadFailed.
  ///
  /// In ar, this message translates to:
  /// **'معرفناش نجيب المواعيد.'**
  String get slotsLoadFailed;

  /// No description provided for @a11ySlotUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'{time}، محجوز'**
  String a11ySlotUnavailable(String time);

  /// No description provided for @bookingContinueToBarber.
  ///
  /// In ar, this message translates to:
  /// **'كمّل — اختار الحلاق'**
  String get bookingContinueToBarber;

  /// No description provided for @bookingBarberTitle.
  ///
  /// In ar, this message translates to:
  /// **'اختار الحلاق'**
  String get bookingBarberTitle;

  /// No description provided for @barberAnyTitle.
  ///
  /// In ar, this message translates to:
  /// **'أي حلاق متاح'**
  String get barberAnyTitle;

  /// No description provided for @barberFastestBadge.
  ///
  /// In ar, this message translates to:
  /// **'الأسرع'**
  String get barberFastestBadge;

  /// No description provided for @barberAnySubtitle.
  ///
  /// In ar, this message translates to:
  /// **'أول واحد يخلّص هيستلمك'**
  String get barberAnySubtitle;

  /// No description provided for @barberAnySlotSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'هنختارلك حلاق فاضي في المعاد ده'**
  String get barberAnySlotSubtitle;

  /// No description provided for @barberPickByName.
  ///
  /// In ar, this message translates to:
  /// **'أو اختار حلاق بالاسم'**
  String get barberPickByName;

  /// No description provided for @waitImmediate.
  ///
  /// In ar, this message translates to:
  /// **'فوراً'**
  String get waitImmediate;

  /// No description provided for @waitNoQueue.
  ///
  /// In ar, this message translates to:
  /// **'مفيش دور'**
  String get waitNoQueue;

  /// No description provided for @barberFree.
  ///
  /// In ar, this message translates to:
  /// **'فاضي'**
  String get barberFree;

  /// Approximate minutes, pre-isolated LTR, e.g. ~18
  ///
  /// In ar, this message translates to:
  /// **'{value} د'**
  String waitApproxShort(String value);

  /// Signed minutes, pre-isolated LTR, e.g. +20
  ///
  /// In ar, this message translates to:
  /// **'{value} د'**
  String waitExtraMinutes(String value);

  /// No description provided for @peopleAheadOfYou.
  ///
  /// In ar, this message translates to:
  /// **'قدامك {count}'**
  String peopleAheadOfYou(int count);

  /// No description provided for @peopleAheadOfBarber.
  ///
  /// In ar, this message translates to:
  /// **'قدامه {count}'**
  String peopleAheadOfBarber(int count);

  /// No description provided for @barberNotInToday.
  ///
  /// In ar, this message translates to:
  /// **'مش موجود النهارده'**
  String get barberNotInToday;

  /// No description provided for @barberBusyAtSlot.
  ///
  /// In ar, this message translates to:
  /// **'مش فاضي في المعاد ده'**
  String get barberBusyAtSlot;

  /// No description provided for @bookingContinueToReview.
  ///
  /// In ar, this message translates to:
  /// **'كمّل — راجع الحجز'**
  String get bookingContinueToReview;

  /// No description provided for @bookingReviewTitle.
  ///
  /// In ar, this message translates to:
  /// **'راجع الحجز'**
  String get bookingReviewTitle;

  /// No description provided for @driveDistance.
  ///
  /// In ar, this message translates to:
  /// **'{km} كم — {minutes} دقايق بالعربية'**
  String driveDistance(String km, int minutes);

  /// No description provided for @reviewServicesHeader.
  ///
  /// In ar, this message translates to:
  /// **'الخدمات'**
  String get reviewServicesHeader;

  /// No description provided for @reviewBarberLabel.
  ///
  /// In ar, this message translates to:
  /// **'الحلاق'**
  String get reviewBarberLabel;

  /// No description provided for @reviewTimeLabel.
  ///
  /// In ar, this message translates to:
  /// **'المعاد'**
  String get reviewTimeLabel;

  /// No description provided for @timingNowLabel.
  ///
  /// In ar, this message translates to:
  /// **'دلوقتي — في الطابور'**
  String get timingNowLabel;

  /// No description provided for @slotDateTime.
  ///
  /// In ar, this message translates to:
  /// **'{day} · {time}'**
  String slotDateTime(String day, String time);

  /// No description provided for @waitRangeTitle.
  ///
  /// In ar, this message translates to:
  /// **'دورك خلال {min} لـ {max} دقيقة'**
  String waitRangeTitle(int min, int max);

  /// No description provided for @waitRightInTitle.
  ///
  /// In ar, this message translates to:
  /// **'هتدخل على طول'**
  String get waitRightInTitle;

  /// No description provided for @waitAheadAndDuration.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{محدش قدامك} =1{قدامك 1 بس} other{قدامك {count}}} · مدة خدمتك {minutes} دقيقة'**
  String waitAheadAndDuration(int count, int minutes);

  /// No description provided for @waitLiveNote.
  ///
  /// In ar, this message translates to:
  /// **'الوقت تقديري وبيتحدّث لحظياً حسب الكراسي الشغّالة.'**
  String get waitLiveNote;

  /// No description provided for @slotAppointmentTitle.
  ///
  /// In ar, this message translates to:
  /// **'معادك {day} الساعة {time}'**
  String slotAppointmentTitle(String day, String time);

  /// No description provided for @slotArriveNote.
  ///
  /// In ar, this message translates to:
  /// **'تعالى قبل معادك بـ 5 دقايق عشان تلحق دورك.'**
  String get slotArriveNote;

  /// No description provided for @policyQueue.
  ///
  /// In ar, this message translates to:
  /// **'لما يجي دورك عندك 5 دقايق تحضر. لو ما حضرتش، دورك بيتأخر مركز واحد وبعدها بيتلغى.'**
  String get policyQueue;

  /// No description provided for @policySlot.
  ///
  /// In ar, this message translates to:
  /// **'لو اتأخرت أكتر من 10 دقايق عن معادك، الحجز بيتلغى.'**
  String get policySlot;

  /// No description provided for @servicesSubtotal.
  ///
  /// In ar, this message translates to:
  /// **'مجموع الخدمات'**
  String get servicesSubtotal;

  /// No description provided for @bundleDiscount.
  ///
  /// In ar, this message translates to:
  /// **'خصم الباقة'**
  String get bundleDiscount;

  /// No description provided for @totalLabel.
  ///
  /// In ar, this message translates to:
  /// **'الإجمالي'**
  String get totalLabel;

  /// No description provided for @payCashNote.
  ///
  /// In ar, this message translates to:
  /// **'الدفع كاش في الفرع بعد الخدمة'**
  String get payCashNote;

  /// No description provided for @confirmJoinQueue.
  ///
  /// In ar, this message translates to:
  /// **'أكّد ودخّلني الطابور'**
  String get confirmJoinQueue;

  /// No description provided for @confirmSlotBooking.
  ///
  /// In ar, this message translates to:
  /// **'أكّد الحجز'**
  String get confirmSlotBooking;

  /// No description provided for @bookingErrorSlotTaken.
  ///
  /// In ar, this message translates to:
  /// **'المعاد ده لسه اتحجز — اختار معاد تاني.'**
  String get bookingErrorSlotTaken;

  /// No description provided for @bookingErrorBarberUnavailable.
  ///
  /// In ar, this message translates to:
  /// **'الحلاق ده مش متاح — اختار حلاق تاني.'**
  String get bookingErrorBarberUnavailable;

  /// No description provided for @bookingErrorSalonClosed.
  ///
  /// In ar, this message translates to:
  /// **'الصالون قفل — احجز معاد بدل الطابور.'**
  String get bookingErrorSalonClosed;

  /// No description provided for @bookingErrorAlreadyInQueue.
  ///
  /// In ar, this message translates to:
  /// **'انت في طابور دلوقتي. تابع دورك الأول.'**
  String get bookingErrorAlreadyInQueue;

  /// No description provided for @actionPickTime.
  ///
  /// In ar, this message translates to:
  /// **'اختار معاد'**
  String get actionPickTime;

  /// No description provided for @actionPickBarber.
  ///
  /// In ar, this message translates to:
  /// **'اختار حلاق'**
  String get actionPickBarber;

  /// No description provided for @actionTrackTurn.
  ///
  /// In ar, this message translates to:
  /// **'تابع دورك'**
  String get actionTrackTurn;

  /// No description provided for @bookingIncompleteTitle.
  ///
  /// In ar, this message translates to:
  /// **'الحجز لسه مش كامل'**
  String get bookingIncompleteTitle;

  /// No description provided for @bookingIncompleteBody.
  ///
  /// In ar, this message translates to:
  /// **'اختار خدماتك ومعادك من صفحة الصالون الأول.'**
  String get bookingIncompleteBody;

  /// No description provided for @actionBackToSalon.
  ///
  /// In ar, this message translates to:
  /// **'ارجع للصالون'**
  String get actionBackToSalon;

  /// No description provided for @confirmedQueueTitle.
  ///
  /// In ar, this message translates to:
  /// **'تمام — انت في الطابور'**
  String get confirmedQueueTitle;

  /// No description provided for @confirmedSlotTitle.
  ///
  /// In ar, this message translates to:
  /// **'تمام — حجزك اتأكد'**
  String get confirmedSlotTitle;

  /// No description provided for @ticketNumberLabel.
  ///
  /// In ar, this message translates to:
  /// **'رقم دورك'**
  String get ticketNumberLabel;

  /// No description provided for @aheadOfYouLabel.
  ///
  /// In ar, this message translates to:
  /// **'قدامك'**
  String get aheadOfYouLabel;

  /// No description provided for @aheadCount.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{محدش} =1{1 واحد} other{{count} أنفار}}'**
  String aheadCount(int count);

  /// No description provided for @expectedTimeLabel.
  ///
  /// In ar, this message translates to:
  /// **'الوقت المتوقع'**
  String get expectedTimeLabel;

  /// No description provided for @appointmentLabel.
  ///
  /// In ar, this message translates to:
  /// **'معادك'**
  String get appointmentLabel;

  /// No description provided for @confirmedQueueNote.
  ///
  /// In ar, this message translates to:
  /// **'هنبعتلك إشعار لما يفضل قدامك واحد، وبعدين لما يجي دورك.'**
  String get confirmedQueueNote;

  /// No description provided for @confirmedSlotNote.
  ///
  /// In ar, this message translates to:
  /// **'هنفكّرك قبل معادك بساعة.'**
  String get confirmedSlotNote;

  /// No description provided for @bookingLoadFailed.
  ///
  /// In ar, this message translates to:
  /// **'معرفناش نجيب الحجز.'**
  String get bookingLoadFailed;

  /// No description provided for @queueTitle.
  ///
  /// In ar, this message translates to:
  /// **'دورك'**
  String get queueTitle;

  /// No description provided for @queueAheadPeople.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =0{محدش قدامك} =1{فاضلك واحد بس} =2{قدامك 2} other{قدامك {count} أنفار}}'**
  String queueAheadPeople(int count);

  /// No description provided for @stageJoined.
  ///
  /// In ar, this message translates to:
  /// **'دخلت الطابور'**
  String get stageJoined;

  /// No description provided for @stageApproaching.
  ///
  /// In ar, this message translates to:
  /// **'قرّب دورك'**
  String get stageApproaching;

  /// No description provided for @stageYourTurn.
  ///
  /// In ar, this message translates to:
  /// **'دورك دلوقتي'**
  String get stageYourTurn;

  /// No description provided for @waitApproxSpaced.
  ///
  /// In ar, this message translates to:
  /// **'~ {minutes} د'**
  String waitApproxSpaced(int minutes);

  /// No description provided for @leaveAtLabel.
  ///
  /// In ar, this message translates to:
  /// **'تتحرك الساعة'**
  String get leaveAtLabel;

  /// No description provided for @leaveAtNow.
  ///
  /// In ar, this message translates to:
  /// **'دلوقتي'**
  String get leaveAtNow;

  /// No description provided for @distanceLabel.
  ///
  /// In ar, this message translates to:
  /// **'المسافة'**
  String get distanceLabel;

  /// No description provided for @liveNowHeader.
  ///
  /// In ar, this message translates to:
  /// **'اللي شغّال دلوقتي'**
  String get liveNowHeader;

  /// No description provided for @barbersOnShiftNamed.
  ///
  /// In ar, this message translates to:
  /// **'{names} في الشيفت'**
  String barbersOnShiftNamed(String names);

  /// No description provided for @listTwo.
  ///
  /// In ar, this message translates to:
  /// **'{a} و{b}'**
  String listTwo(String a, String b);

  /// No description provided for @listSeparator.
  ///
  /// In ar, this message translates to:
  /// **'، '**
  String get listSeparator;

  /// No description provided for @servicesJoiner.
  ///
  /// In ar, this message translates to:
  /// **' + '**
  String get servicesJoiner;

  /// No description provided for @moveNowTitle.
  ///
  /// In ar, this message translates to:
  /// **'اتحرّك دلوقتي'**
  String get moveNowTitle;

  /// No description provided for @moveNowBody.
  ///
  /// In ar, this message translates to:
  /// **'المشوار {travel} دقايق — دورك بعد {wait} دقايق'**
  String moveNowBody(int travel, int wait);

  /// No description provided for @openDirectionsToSalon.
  ///
  /// In ar, this message translates to:
  /// **'افتح الاتجاهات للصالون'**
  String get openDirectionsToSalon;

  /// No description provided for @leaveQueue.
  ///
  /// In ar, this message translates to:
  /// **'اطلع من الطابور'**
  String get leaveQueue;

  /// No description provided for @leaveDialogTitle.
  ///
  /// In ar, this message translates to:
  /// **'تطلع من الطابور؟'**
  String get leaveDialogTitle;

  /// No description provided for @leaveDialogBody.
  ///
  /// In ar, this message translates to:
  /// **'دورك رقم {number} هيروح لحد تاني ومش هينفع ترجعه. لو دخلت تاني هتبدأ من آخر الطابور.'**
  String leaveDialogBody(int number);

  /// No description provided for @leaveDialogNote.
  ///
  /// In ar, this message translates to:
  /// **'الخروج المتكرر من الطوابير بيقلّل تقييم الالتزام بتاعك.'**
  String get leaveDialogNote;

  /// No description provided for @leaveDialogConfirm.
  ///
  /// In ar, this message translates to:
  /// **'أيوه، اطلعني'**
  String get leaveDialogConfirm;

  /// No description provided for @leaveDialogStay.
  ///
  /// In ar, this message translates to:
  /// **'خليني في الطابور'**
  String get leaveDialogStay;

  /// No description provided for @yourTurnTitle.
  ///
  /// In ar, this message translates to:
  /// **'حان دورك'**
  String get yourTurnTitle;

  /// No description provided for @yourTurnBarberWaiting.
  ///
  /// In ar, this message translates to:
  /// **'ادخل على الكرسي — {barber} مستنيك'**
  String yourTurnBarberWaiting(String barber);

  /// No description provided for @yourTurnAnyBarber.
  ///
  /// In ar, this message translates to:
  /// **'ادخل على الكرسي — الحلاق مستنيك'**
  String get yourTurnAnyBarber;

  /// No description provided for @yourNumberLabel.
  ///
  /// In ar, this message translates to:
  /// **'رقمك'**
  String get yourNumberLabel;

  /// No description provided for @timeLeftLabel.
  ///
  /// In ar, this message translates to:
  /// **'فاضلك'**
  String get timeLeftLabel;

  /// No description provided for @yourTurnGraceNote.
  ///
  /// In ar, this message translates to:
  /// **'لو ما حضرتش خلال 5 دقايق، دورك هيتأخر مركز واحد'**
  String get yourTurnGraceNote;

  /// No description provided for @yourTurnGraceNoteFinal.
  ///
  /// In ar, this message translates to:
  /// **'لو ما حضرتش خلال 5 دقايق، الحجز هيتلغي'**
  String get yourTurnGraceNoteFinal;

  /// No description provided for @imAtSalon.
  ///
  /// In ar, this message translates to:
  /// **'أنا في المحل'**
  String get imAtSalon;

  /// No description provided for @postponeOne.
  ///
  /// In ar, this message translates to:
  /// **'أنا جاي — أجّلني واحد'**
  String get postponeOne;

  /// No description provided for @postponeUsedLabel.
  ///
  /// In ar, this message translates to:
  /// **'استخدمت التأجيل قبل كده'**
  String get postponeUsedLabel;

  /// No description provided for @postponedToast.
  ///
  /// In ar, this message translates to:
  /// **'أجّلناك مركز واحد — فاضلك واحد'**
  String get postponedToast;

  /// No description provided for @inServiceTitle.
  ///
  /// In ar, this message translates to:
  /// **'انت على الكرسي'**
  String get inServiceTitle;

  /// No description provided for @inServiceBody.
  ///
  /// In ar, this message translates to:
  /// **'نعيماً مقدماً! أول ما تخلص هنطلب منك تقيّم زيارتك.'**
  String get inServiceBody;

  /// No description provided for @completedTitle.
  ///
  /// In ar, this message translates to:
  /// **'نعيماً!'**
  String get completedTitle;

  /// No description provided for @completedBody.
  ///
  /// In ar, this message translates to:
  /// **'خلصت في {salon}. رأيك بيساعد غيرك يختار صح.'**
  String completedBody(String salon);

  /// No description provided for @rateVisitAction.
  ///
  /// In ar, this message translates to:
  /// **'قيّم زيارتك'**
  String get rateVisitAction;

  /// No description provided for @cancelledTitle.
  ///
  /// In ar, this message translates to:
  /// **'خرجت من الطابور'**
  String get cancelledTitle;

  /// No description provided for @cancelledBody.
  ///
  /// In ar, this message translates to:
  /// **'دورك راح لحد تاني. تقدر تحجز تاني في أي وقت.'**
  String get cancelledBody;

  /// No description provided for @bookingCancelledTitle.
  ///
  /// In ar, this message translates to:
  /// **'الحجز اتلغى'**
  String get bookingCancelledTitle;

  /// No description provided for @bookingCancelledBody.
  ///
  /// In ar, this message translates to:
  /// **'المعاد اتفتح لغيرك. تقدر تحجز معاد تاني في أي وقت.'**
  String get bookingCancelledBody;

  /// No description provided for @missedTitle.
  ///
  /// In ar, this message translates to:
  /// **'دورك فاتك'**
  String get missedTitle;

  /// No description provided for @missedBody.
  ///
  /// In ar, this message translates to:
  /// **'ما حضرتش في الوقت فالحجز اتلغى. تقدر تدخل الطابور تاني.'**
  String get missedBody;

  /// No description provided for @bookAgain.
  ///
  /// In ar, this message translates to:
  /// **'احجز تاني'**
  String get bookAgain;

  /// No description provided for @upcomingTitle.
  ///
  /// In ar, this message translates to:
  /// **'حجزك جاي'**
  String get upcomingTitle;

  /// No description provided for @cancelBooking.
  ///
  /// In ar, this message translates to:
  /// **'الغي الحجز'**
  String get cancelBooking;

  /// No description provided for @cancelDialogTitle.
  ///
  /// In ar, this message translates to:
  /// **'تلغي الحجز؟'**
  String get cancelDialogTitle;

  /// No description provided for @cancelDialogBody.
  ///
  /// In ar, this message translates to:
  /// **'معادك {time} هيتفتح لغيرك.'**
  String cancelDialogBody(String time);

  /// No description provided for @cancelDialogConfirm.
  ///
  /// In ar, this message translates to:
  /// **'أيوه، الغيه'**
  String get cancelDialogConfirm;

  /// No description provided for @cancelDialogKeep.
  ///
  /// In ar, this message translates to:
  /// **'خليه'**
  String get cancelDialogKeep;

  /// No description provided for @queueErrorNotYourTurn.
  ///
  /// In ar, this message translates to:
  /// **'لسه مجاش دورك.'**
  String get queueErrorNotYourTurn;

  /// No description provided for @queueErrorPostponeUsed.
  ///
  /// In ar, this message translates to:
  /// **'استخدمت التأجيل مرة قبل كده.'**
  String get queueErrorPostponeUsed;

  /// No description provided for @queueErrorFinished.
  ///
  /// In ar, this message translates to:
  /// **'الحجز ده خلص خلاص.'**
  String get queueErrorFinished;

  /// No description provided for @queueActionOffline.
  ///
  /// In ar, this message translates to:
  /// **'محتاج نت عشان تعمل ده.'**
  String get queueActionOffline;

  /// No description provided for @a11yLiveOffline.
  ///
  /// In ar, this message translates to:
  /// **'مش متحدّث'**
  String get a11yLiveOffline;

  /// No description provided for @durationLabel.
  ///
  /// In ar, this message translates to:
  /// **'مدة الخدمة'**
  String get durationLabel;

  /// No description provided for @rateVisitTitle.
  ///
  /// In ar, this message translates to:
  /// **'قيّم زيارتك'**
  String get rateVisitTitle;

  /// No description provided for @rateLater.
  ///
  /// In ar, this message translates to:
  /// **'بعدين'**
  String get rateLater;

  /// No description provided for @rateOverallQuestion.
  ///
  /// In ar, this message translates to:
  /// **'إيه رأيك في الخدمة؟'**
  String get rateOverallQuestion;

  /// No description provided for @starLabel1.
  ///
  /// In ar, this message translates to:
  /// **'وحش'**
  String get starLabel1;

  /// No description provided for @starLabel2.
  ///
  /// In ar, this message translates to:
  /// **'مش أحسن حاجة'**
  String get starLabel2;

  /// No description provided for @starLabel3.
  ///
  /// In ar, this message translates to:
  /// **'عادي'**
  String get starLabel3;

  /// No description provided for @starLabel4.
  ///
  /// In ar, this message translates to:
  /// **'حلو جداً'**
  String get starLabel4;

  /// No description provided for @starLabel5.
  ///
  /// In ar, this message translates to:
  /// **'ممتاز'**
  String get starLabel5;

  /// No description provided for @rateDetailsHeader.
  ///
  /// In ar, this message translates to:
  /// **'قيّم التفاصيل'**
  String get rateDetailsHeader;

  /// No description provided for @rateQuality.
  ///
  /// In ar, this message translates to:
  /// **'جودة القصة'**
  String get rateQuality;

  /// No description provided for @rateCleanliness.
  ///
  /// In ar, this message translates to:
  /// **'نظافة المكان'**
  String get rateCleanliness;

  /// No description provided for @rateTimeAccuracy.
  ///
  /// In ar, this message translates to:
  /// **'دقة الوقت المتوقع'**
  String get rateTimeAccuracy;

  /// No description provided for @rateTimeAccuracyNote.
  ///
  /// In ar, this message translates to:
  /// **'التطبيق قال {quoted} د واستنيت {actual} د'**
  String rateTimeAccuracyNote(int quoted, int actual);

  /// No description provided for @rateTagsHeader.
  ///
  /// In ar, this message translates to:
  /// **'إيه اللي عجبك؟'**
  String get rateTagsHeader;

  /// No description provided for @tagLightHand.
  ///
  /// In ar, this message translates to:
  /// **'ايده خفيفة'**
  String get tagLightHand;

  /// No description provided for @tagCleanPlace.
  ///
  /// In ar, this message translates to:
  /// **'المكان نضيف'**
  String get tagCleanPlace;

  /// No description provided for @tagRespectful.
  ///
  /// In ar, this message translates to:
  /// **'معاملة محترمة'**
  String get tagRespectful;

  /// No description provided for @tagFairPrice.
  ///
  /// In ar, this message translates to:
  /// **'السعر مناسب'**
  String get tagFairPrice;

  /// No description provided for @tagAccurateQueue.
  ///
  /// In ar, this message translates to:
  /// **'الدور كان دقيق'**
  String get tagAccurateQueue;

  /// No description provided for @rateCommentLabel.
  ///
  /// In ar, this message translates to:
  /// **'تحب تضيف كلمة؟'**
  String get rateCommentLabel;

  /// No description provided for @rateCommentHint.
  ///
  /// In ar, this message translates to:
  /// **'اكتب رأيك عشان تساعد اللي بعدك…'**
  String get rateCommentHint;

  /// No description provided for @rateAddPhoto.
  ///
  /// In ar, this message translates to:
  /// **'ضيف صورة للقصة'**
  String get rateAddPhoto;

  /// No description provided for @rateAddAnotherPhoto.
  ///
  /// In ar, this message translates to:
  /// **'ضيف صورة تانية'**
  String get rateAddAnotherPhoto;

  /// No description provided for @photoFromCamera.
  ///
  /// In ar, this message translates to:
  /// **'صوّر دلوقتي'**
  String get photoFromCamera;

  /// No description provided for @photoFromGallery.
  ///
  /// In ar, this message translates to:
  /// **'اختار من الصور'**
  String get photoFromGallery;

  /// No description provided for @a11yRemovePhoto.
  ///
  /// In ar, this message translates to:
  /// **'شيل الصورة'**
  String get a11yRemovePhoto;

  /// No description provided for @photoPickFailed.
  ///
  /// In ar, this message translates to:
  /// **'معرفناش نفتح الكاميرا أو الصور.'**
  String get photoPickFailed;

  /// No description provided for @rateAnonymous.
  ///
  /// In ar, this message translates to:
  /// **'انشر التقييم باسم مستعار'**
  String get rateAnonymous;

  /// No description provided for @rateSubmit.
  ///
  /// In ar, this message translates to:
  /// **'ابعت التقييم'**
  String get rateSubmit;

  /// No description provided for @rateNotAvailableTitle.
  ///
  /// In ar, this message translates to:
  /// **'التقييم لسه مش متاح'**
  String get rateNotAvailableTitle;

  /// No description provided for @rateNotAvailableBody.
  ///
  /// In ar, this message translates to:
  /// **'تقدر تقيّم الزيارة بعد ما الخدمة تخلص.'**
  String get rateNotAvailableBody;

  /// No description provided for @ratingSentTitle.
  ///
  /// In ar, this message translates to:
  /// **'شكراً — تقييمك اتبعت'**
  String get ratingSentTitle;

  /// No description provided for @ratingSentBody.
  ///
  /// In ar, this message translates to:
  /// **'رأيك هيساعد ناس تانية تختار صح، وهيظهر على صفحة الصالون خلال ساعة.'**
  String get ratingSentBody;

  /// No description provided for @ratingSentOfflineNote.
  ///
  /// In ar, this message translates to:
  /// **'متسجّل عندك وهيتبعت أول ما النت يرجع.'**
  String get ratingSentOfflineNote;

  /// No description provided for @yourRatingCaption.
  ///
  /// In ar, this message translates to:
  /// **'تقييمك'**
  String get yourRatingCaption;

  /// No description provided for @addToFavoritesTitle.
  ///
  /// In ar, this message translates to:
  /// **'تضيفه للمفضلة؟'**
  String get addToFavoritesTitle;

  /// No description provided for @addToFavoritesBody.
  ///
  /// In ar, this message translates to:
  /// **'هنقولك لما يبقى فاضي في وقتك المعتاد'**
  String get addToFavoritesBody;

  /// No description provided for @addToFavoritesAction.
  ///
  /// In ar, this message translates to:
  /// **'ضيفه للمفضلة'**
  String get addToFavoritesAction;

  /// No description provided for @addedToFavorites.
  ///
  /// In ar, this message translates to:
  /// **'اتضاف للمفضلة'**
  String get addedToFavorites;

  /// No description provided for @backToHomeDone.
  ///
  /// In ar, this message translates to:
  /// **'تمام، ارجعني للرئيسية'**
  String get backToHomeDone;

  /// No description provided for @bookingsTitle.
  ///
  /// In ar, this message translates to:
  /// **'حجوزاتي'**
  String get bookingsTitle;

  /// No description provided for @bookingsTabCurrent.
  ///
  /// In ar, this message translates to:
  /// **'الحالية'**
  String get bookingsTabCurrent;

  /// No description provided for @bookingsTabPast.
  ///
  /// In ar, this message translates to:
  /// **'السابقة'**
  String get bookingsTabPast;

  /// No description provided for @bookingsActiveNow.
  ///
  /// In ar, this message translates to:
  /// **'دورك شغّال دلوقتي'**
  String get bookingsActiveNow;

  /// No description provided for @bookingsUpcomingBadge.
  ///
  /// In ar, this message translates to:
  /// **'معاد محجوز'**
  String get bookingsUpcomingBadge;

  /// No description provided for @bookingsDetails.
  ///
  /// In ar, this message translates to:
  /// **'تفاصيل الحجز'**
  String get bookingsDetails;

  /// No description provided for @bookingsNotifyNote.
  ///
  /// In ar, this message translates to:
  /// **'هنبعتلك إشعار لما يفضل قدامك اتنين، وبعدين واحد، وبعدين لما يجي دورك.'**
  String get bookingsNotifyNote;

  /// No description provided for @bookingDone.
  ///
  /// In ar, this message translates to:
  /// **'خدمة تمّت'**
  String get bookingDone;

  /// No description provided for @bookingMissedBadge.
  ///
  /// In ar, this message translates to:
  /// **'اتلغى — ما حضرتش'**
  String get bookingMissedBadge;

  /// No description provided for @bookingCancelledBadge.
  ///
  /// In ar, this message translates to:
  /// **'اتلغى'**
  String get bookingCancelledBadge;

  /// No description provided for @bookingMissedReason.
  ///
  /// In ar, this message translates to:
  /// **'عدّى وقت الاستدعاء بـ 5 دقايق'**
  String get bookingMissedReason;

  /// No description provided for @rateBarberAndSalon.
  ///
  /// In ar, this message translates to:
  /// **'قيّم {barber} والصالون'**
  String rateBarberAndSalon(String barber);

  /// No description provided for @rateSalonPrompt.
  ///
  /// In ar, this message translates to:
  /// **'قيّم زيارتك'**
  String get rateSalonPrompt;

  /// No description provided for @rateNowAction.
  ///
  /// In ar, this message translates to:
  /// **'قيّم دلوقتي'**
  String get rateNowAction;

  /// No description provided for @rebookSameChoices.
  ///
  /// In ar, this message translates to:
  /// **'احجز تاني بنفس الاختيارات'**
  String get rebookSameChoices;

  /// No description provided for @bookingsEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'لسه ما حجزتش أي حاجة'**
  String get bookingsEmptyTitle;

  /// No description provided for @bookingsEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'أول ما تدخل طابور صالون، هتلاقي دورك ورقمك والوقت المتوقع هنا على طول.'**
  String get bookingsEmptyBody;

  /// No description provided for @bookingsEmptyCta.
  ///
  /// In ar, this message translates to:
  /// **'دوّر على صالون قريب منك'**
  String get bookingsEmptyCta;

  /// No description provided for @bookingsPastEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'مفيش زيارات سابقة'**
  String get bookingsPastEmptyTitle;

  /// No description provided for @bookingsPastEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'زياراتك اللي خلصت هتظهر هنا، وتقدر تقيّمها أو تحجز تاني بضغطة.'**
  String get bookingsPastEmptyBody;

  /// No description provided for @bookingsLoadFailed.
  ///
  /// In ar, this message translates to:
  /// **'معرفناش نجيب حجوزاتك.'**
  String get bookingsLoadFailed;

  /// No description provided for @withBarber.
  ///
  /// In ar, this message translates to:
  /// **'مع {barber}'**
  String withBarber(String barber);

  /// No description provided for @favoritesTitle.
  ///
  /// In ar, this message translates to:
  /// **'الصالونات المفضّلة'**
  String get favoritesTitle;

  /// No description provided for @favoritesSubtitle.
  ///
  /// In ar, this message translates to:
  /// **'{count, plural, =1{صالون واحد} =2{صالونين} few{{count} صالونات} other{{count} صالون}} · مرتّبة بأقل انتظار'**
  String favoritesSubtitle(int count);

  /// No description provided for @favoritesNotifyNote.
  ///
  /// In ar, this message translates to:
  /// **'بنبعتلك إشعار لما صالون مفضّل عندك يبقى فاضي في وقت بتروح فيه عادةً.'**
  String get favoritesNotifyNote;

  /// No description provided for @favoritesEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'مفيش صالونات مفضّلة'**
  String get favoritesEmptyTitle;

  /// No description provided for @favoritesEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'دوس على القلب في أي صالون عشان يتحفظ هنا، وتقدر تشوف دوره وتدخل بضغطة واحدة.'**
  String get favoritesEmptyBody;

  /// No description provided for @favoritesEmptyCta.
  ///
  /// In ar, this message translates to:
  /// **'اكتشف صالونات قريبة'**
  String get favoritesEmptyCta;

  /// No description provided for @favoritesLoadFailed.
  ///
  /// In ar, this message translates to:
  /// **'معرفناش نجيب المفضلة.'**
  String get favoritesLoadFailed;

  /// No description provided for @viewSalon.
  ///
  /// In ar, this message translates to:
  /// **'شوف الصالون'**
  String get viewSalon;

  /// No description provided for @notificationsTitle.
  ///
  /// In ar, this message translates to:
  /// **'الإشعارات'**
  String get notificationsTitle;

  /// No description provided for @markAllRead.
  ///
  /// In ar, this message translates to:
  /// **'علّم الكل كمقروء'**
  String get markAllRead;

  /// No description provided for @groupToday.
  ///
  /// In ar, this message translates to:
  /// **'النهارده'**
  String get groupToday;

  /// No description provided for @groupThisWeek.
  ///
  /// In ar, this message translates to:
  /// **'الأسبوع ده'**
  String get groupThisWeek;

  /// No description provided for @groupEarlier.
  ///
  /// In ar, this message translates to:
  /// **'أقدم'**
  String get groupEarlier;

  /// No description provided for @notificationsEmptyTitle.
  ///
  /// In ar, this message translates to:
  /// **'مفيش إشعارات لسه'**
  String get notificationsEmptyTitle;

  /// No description provided for @notificationsEmptyBody.
  ///
  /// In ar, this message translates to:
  /// **'أول ما تدخل طابور، هنبعتلك هنا كل تحديث لدورك وأي عروض من الصالونات اللي بتحبها.'**
  String get notificationsEmptyBody;

  /// No description provided for @notificationsEmptyCta.
  ///
  /// In ar, this message translates to:
  /// **'دوّر على صالون'**
  String get notificationsEmptyCta;

  /// No description provided for @a11yUnread.
  ///
  /// In ar, this message translates to:
  /// **'غير مقروء'**
  String get a11yUnread;
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
