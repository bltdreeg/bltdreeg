import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/domain/entities/otp_challenge.dart';
import 'app_routes.dart';

/// Typed navigation helpers. Screens call these instead of passing route
/// names, path parameters or query keys around.
extension AppNavigation on BuildContext {
  // ---- auth & onboarding ------------------------------------------------------
  void goOnboarding() => goNamed(AppRoutes.onboarding.name);

  void goLogin({String? from, bool phone = false}) => goNamed(
    AppRoutes.login.name,
    queryParameters: {
      RouteQuery.from: ?from,
      if (phone) RouteQuery.loginMethod: 'phone',
    },
  );

  Future<void> pushLogin({String? from}) => pushNamed(
    AppRoutes.login.name,
    queryParameters: {RouteQuery.from: ?from},
  );

  Future<void> pushRegister({String? from}) => pushNamed(
    AppRoutes.register.name,
    queryParameters: {RouteQuery.from: ?from},
  );

  /// The route carries only the phone; the OTP screen reads the pending
  /// challenge for it from the auth repository, so it survives router
  /// refreshes (route `extra` does not).
  Future<void> pushOtp(OtpChallenge challenge, {String? from}) => pushNamed(
    AppRoutes.otp.name,
    queryParameters: {
      RouteQuery.phone: challenge.phone,
      RouteQuery.from: ?from,
    },
  );

  // ---- tabs -------------------------------------------------------------------
  void goHome() => goNamed(AppRoutes.home.name);
  void goBookings() => goNamed(AppRoutes.bookings.name);
  void goSearch() => goNamed(AppRoutes.search.name);
  void goAccount() => goNamed(AppRoutes.account.name);

  Future<void> pushNotifications() => pushNamed(AppRoutes.notifications.name);
  Future<void> pushEditProfile() => pushNamed(AppRoutes.editProfile.name);
  Future<void> pushFavorites() => pushNamed(AppRoutes.favorites.name);
  Future<void> pushNotificationSettings() =>
      pushNamed(AppRoutes.notificationSettings.name);
  Future<void> pushLanguage() => pushNamed(AppRoutes.language.name);
  Future<void> pushHelp() => pushNamed(AppRoutes.help.name);

  // ---- salon ------------------------------------------------------------------
  Future<void> pushSalon(String salonId) => pushNamed(
    AppRoutes.salon.name,
    pathParameters: {RouteParams.salonId: salonId},
  );

  Future<void> pushSalonGallery(String salonId) => pushNamed(
    AppRoutes.salonGallery.name,
    pathParameters: {RouteParams.salonId: salonId},
  );

  // ---- booking flow -----------------------------------------------------------
  Future<void> pushBookingSlot(String salonId) => pushNamed(
    AppRoutes.bookingSlot.name,
    pathParameters: {RouteParams.salonId: salonId},
  );

  Future<void> pushBookingBarber(String salonId) => pushNamed(
    AppRoutes.bookingBarber.name,
    pathParameters: {RouteParams.salonId: salonId},
  );

  Future<void> pushBookingReview(String salonId) => pushNamed(
    AppRoutes.bookingReview.name,
    pathParameters: {RouteParams.salonId: salonId},
  );

  /// Replaces the whole booking flow with the confirmation screen.
  void goBookingConfirmed(String bookingId) => goNamed(
    AppRoutes.bookingConfirmed.name,
    pathParameters: {RouteParams.bookingId: bookingId},
  );

  // ---- queue & rating -----------------------------------------------------------
  Future<void> pushQueue(String bookingId) => pushNamed(
    AppRoutes.queue.name,
    pathParameters: {RouteParams.bookingId: bookingId},
  );

  void goQueue(String bookingId) => goNamed(
    AppRoutes.queue.name,
    pathParameters: {RouteParams.bookingId: bookingId},
  );

  Future<void> pushRateVisit(String bookingId) => pushNamed(
    AppRoutes.rateVisit.name,
    pathParameters: {RouteParams.bookingId: bookingId},
  );

  void goRatingSent(String bookingId) => goNamed(
    AppRoutes.ratingSent.name,
    pathParameters: {RouteParams.bookingId: bookingId},
  );

  /// Back if there is somewhere to go back to, otherwise home.
  void popOrGoHome() => canPop() ? pop() : goHome();
}
