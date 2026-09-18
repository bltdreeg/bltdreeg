import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../features/account/presentation/pages/account_page.dart';
import '../../features/account/presentation/pages/edit_profile_page.dart';
import '../../features/account/presentation/pages/help_page.dart';
import '../../features/account/presentation/pages/language_page.dart';
import '../../features/account/presentation/pages/notification_settings_page.dart';
import '../../features/auth/domain/entities/otp_challenge.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/presentation/login/login_cubit.dart';
import '../../features/auth/presentation/login/login_page.dart';
import '../../features/auth/presentation/otp/otp_page.dart';
import '../../features/auth/presentation/register/register_page.dart';
import '../../features/auth/presentation/session/auth_session_cubit.dart';
import '../../features/booking/presentation/pages/booking_barber_page.dart';
import '../../features/booking/presentation/pages/booking_confirmed_page.dart';
import '../../features/booking/presentation/pages/booking_review_page.dart';
import '../../features/booking/presentation/pages/booking_slot_page.dart';
import '../../features/booking/presentation/pages/bookings_page.dart';
import '../../features/favorites/presentation/pages/favorites_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/queue/presentation/pages/queue_page.dart';
import '../../features/rating/presentation/pages/rate_visit_page.dart';
import '../../features/rating/presentation/pages/rating_sent_page.dart';
import '../../features/salon_details/domain/salon_details.dart';
import '../../features/salon_details/presentation/pages/salon_details_page.dart';
import '../../features/salon_details/presentation/pages/salon_gallery_page.dart';
import '../../features/salons/domain/entities/search_criteria.dart';
import '../../features/search/presentation/pages/search_page.dart';
import '../dev/design_system_gallery_page.dart';
import '../storage/app_preferences.dart';
import '../theme/app_dimens.dart';
import 'app_routes.dart';
import 'shell/fade_branch_container.dart';
import 'shell/main_shell_scaffold.dart';

/// Builds the app's single [GoRouter].
///
/// Structure:
/// * pre-auth routes (onboarding, login, register, otp)
/// * a `StatefulShellRoute` with four branches (home, bookings, search,
///   account); each keeps its own stack, and switching fades
/// * full-screen routes on the root navigator (salon, booking flow, queue,
///   rating) that cover the bottom nav
///
/// Placeholder pages are replaced by real screens phase by phase. Routes in
/// [AppRoutes.protectedRoutes] require a signed-in user; others redirect to
/// login with a `from` return location.
final class AppRouter {
  AppRouter({
    required this._preferences,
    required this.session,
    required this.authRepository,
  });

  final AppPreferences _preferences;
  final AuthSessionCubit session;
  final AuthRepository authRepository;

  final _rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');

  late final GoRouter config = GoRouter(
    navigatorKey: _rootKey,
    initialLocation: AppRoutes.home.path,
    refreshListenable: session.routerRefresh,
    redirect: _redirect,
    routes: [
      GoRoute(
        name: AppRoutes.onboarding.name,
        path: AppRoutes.onboarding.path,
        builder: (_, _) => const OnboardingPage(),
      ),
      GoRoute(
        name: AppRoutes.login.name,
        path: AppRoutes.login.path,
        builder: (_, state) => LoginPage(
          from: state.uri.queryParameters[RouteQuery.from],
          initialMethod:
              state.uri.queryParameters[RouteQuery.loginMethod] == 'phone'
              ? LoginMethod.phone
              : LoginMethod.email,
        ),
      ),
      GoRoute(
        name: AppRoutes.register.name,
        path: AppRoutes.register.path,
        builder: (_, state) =>
            RegisterPage(from: state.uri.queryParameters[RouteQuery.from]),
      ),
      GoRoute(
        name: AppRoutes.otp.name,
        path: AppRoutes.otp.path,
        // Without a pending challenge (e.g. a cold deep link) there's no code
        // to verify; fall back to the phone login screen.
        redirect: (_, state) => _pendingChallenge(state) != null
            ? null
            : '${AppRoutes.login.path}?${RouteQuery.loginMethod}=phone',
        builder: (_, state) => OtpPage(
          challenge: _pendingChallenge(state)!,
          from: state.uri.queryParameters[RouteQuery.from],
        ),
      ),

      StatefulShellRoute(
        builder: (_, _, shell) => shell,
        navigatorContainerBuilder: (context, shell, children) =>
            MainShellScaffold(
              navigationShell: shell,
              body: FadeBranchContainer(
                currentIndex: shell.currentIndex,
                children: children,
              ),
            ),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                name: AppRoutes.home.name,
                path: AppRoutes.home.path,
                builder: (_, _) => const HomePage(),
                routes: [
                  GoRoute(
                    name: AppRoutes.notifications.name,
                    path: AppRoutes.notifications.path,
                    builder: (_, _) => const NotificationsPage(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                name: AppRoutes.bookings.name,
                path: AppRoutes.bookings.path,
                builder: (_, _) => const BookingsPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                name: AppRoutes.search.name,
                path: AppRoutes.search.path,
                builder: (_, state) {
                  final query = state.uri.queryParameters;
                  return SearchPage(
                    sort: SalonSort.values.asNameMap()[query[RouteQuery.sort]],
                    openNowOnly: query[RouteQuery.openNow] == '1',
                  );
                },
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                name: AppRoutes.account.name,
                path: AppRoutes.account.path,
                builder: (_, _) => const AccountPage(),
                routes: [
                  GoRoute(
                    name: AppRoutes.editProfile.name,
                    path: AppRoutes.editProfile.path,
                    builder: (_, _) => const EditProfilePage(),
                  ),
                  GoRoute(
                    name: AppRoutes.favorites.name,
                    path: AppRoutes.favorites.path,
                    builder: (_, _) => const FavoritesPage(),
                  ),
                  GoRoute(
                    name: AppRoutes.notificationSettings.name,
                    path: AppRoutes.notificationSettings.path,
                    builder: (_, _) => const NotificationSettingsPage(),
                  ),
                  GoRoute(
                    name: AppRoutes.language.name,
                    path: AppRoutes.language.path,
                    builder: (_, _) => const LanguagePage(),
                  ),
                  GoRoute(
                    name: AppRoutes.help.name,
                    path: AppRoutes.help.path,
                    builder: (_, _) => const HelpPage(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),

      GoRoute(
        parentNavigatorKey: _rootKey,
        name: AppRoutes.salon.name,
        path: AppRoutes.salon.path,
        builder: (_, state) => SalonDetailsPage(
          key: ValueKey(state.pathParameters[RouteParams.salonId]),
          salonId: state.pathParameters[RouteParams.salonId]!,
        ),
        routes: [
          GoRoute(
            name: AppRoutes.salonGallery.name,
            path: AppRoutes.salonGallery.path,
            builder: (_, state) => SalonGalleryPage(
              key: ValueKey(state.pathParameters[RouteParams.salonId]),
              salonId: state.pathParameters[RouteParams.salonId]!,
            ),
            routes: [
              GoRoute(
                name: AppRoutes.salonPhoto.name,
                path: AppRoutes.salonPhoto.path,
                pageBuilder: (_, state) {
                  final query = state.uri.queryParameters;
                  return CustomTransitionPage<void>(
                    key: state.pageKey,
                    opaque: false,
                    transitionDuration: AppMotion.medium,
                    transitionsBuilder: (_, animation, _, child) =>
                        FadeTransition(opacity: animation, child: child),
                    child: SalonPhotoViewerPage(
                      key: ValueKey(state.pathParameters[RouteParams.salonId]),
                      salonId: state.pathParameters[RouteParams.salonId]!,
                      initialIndex:
                          int.tryParse(query[RouteQuery.index] ?? '') ?? 0,
                      kind: GalleryKind.values
                          .asNameMap()[query[RouteQuery.kind]],
                    ),
                  );
                },
              ),
            ],
          ),
          GoRoute(
            name: AppRoutes.bookingSlot.name,
            path: AppRoutes.bookingSlot.path,
            builder: (_, state) => BookingSlotPage(
              key: ValueKey(state.pathParameters[RouteParams.salonId]),
              salonId: state.pathParameters[RouteParams.salonId]!,
            ),
          ),
          GoRoute(
            name: AppRoutes.bookingBarber.name,
            path: AppRoutes.bookingBarber.path,
            builder: (_, state) => BookingBarberPage(
              key: ValueKey(state.pathParameters[RouteParams.salonId]),
              salonId: state.pathParameters[RouteParams.salonId]!,
            ),
          ),
          GoRoute(
            name: AppRoutes.bookingReview.name,
            path: AppRoutes.bookingReview.path,
            builder: (_, state) => BookingReviewPage(
              key: ValueKey(state.pathParameters[RouteParams.salonId]),
              salonId: state.pathParameters[RouteParams.salonId]!,
            ),
          ),
        ],
      ),
      GoRoute(
        parentNavigatorKey: _rootKey,
        name: AppRoutes.bookingConfirmed.name,
        path: AppRoutes.bookingConfirmed.path,
        pageBuilder: (_, state) => CustomTransitionPage<void>(
          key: state.pageKey,
          transitionDuration: AppMotion.medium,
          transitionsBuilder: (_, animation, _, child) =>
              FadeTransition(opacity: animation, child: child),
          child: BookingConfirmedPage(
            key: ValueKey(state.pathParameters[RouteParams.bookingId]),
            bookingId: state.pathParameters[RouteParams.bookingId]!,
          ),
        ),
      ),
      GoRoute(
        parentNavigatorKey: _rootKey,
        name: AppRoutes.queue.name,
        path: AppRoutes.queue.path,
        builder: (_, state) => QueuePage(
          key: ValueKey(state.pathParameters[RouteParams.bookingId]),
          bookingId: state.pathParameters[RouteParams.bookingId]!,
        ),
      ),
      GoRoute(
        parentNavigatorKey: _rootKey,
        name: AppRoutes.rateVisit.name,
        path: AppRoutes.rateVisit.path,
        builder: (_, state) => RateVisitPage(
          key: ValueKey(state.pathParameters[RouteParams.bookingId]),
          bookingId: state.pathParameters[RouteParams.bookingId]!,
        ),
        routes: [
          GoRoute(
            name: AppRoutes.ratingSent.name,
            path: AppRoutes.ratingSent.path,
            pageBuilder: (_, state) => CustomTransitionPage<void>(
              key: state.pageKey,
              transitionDuration: AppMotion.medium,
              transitionsBuilder: (_, animation, _, child) =>
                  FadeTransition(opacity: animation, child: child),
              child: RatingSentPage(
                key: ValueKey(state.pathParameters[RouteParams.bookingId]),
                bookingId: state.pathParameters[RouteParams.bookingId]!,
              ),
            ),
          ),
        ],
      ),
      if (kDebugMode)
        GoRoute(
          parentNavigatorKey: _rootKey,
          name: AppRoutes.devDesignSystem.name,
          path: AppRoutes.devDesignSystem.path,
          builder: (_, _) => const DesignSystemGalleryPage(),
        ),
    ],
  );

  OtpChallenge? _pendingChallenge(GoRouterState state) {
    final phone = state.uri.queryParameters[RouteQuery.phone];
    return phone == null ? null : authRepository.pendingChallenge(phone);
  }

  /// Route patterns (e.g. `/queue/:bookingId`) that need an account.
  static final _protectedPatterns = {
    for (final route in AppRoutes.protectedRoutes) route.fullPath,
  };

  static bool isProtected(String? fullPath) =>
      fullPath != null &&
      _protectedPatterns.any(
        (p) => fullPath == p || fullPath.startsWith('$p/'),
      );

  /// `beltadreeg://salon/42` arrives as a full URI; go_router only matches
  /// paths, so fold the scheme's host back into the first path segment.
  static String? normalizeAppLink(Uri uri) {
    if (uri.scheme != appLinkScheme) return null;
    final path = '/${uri.host}${uri.path}';
    return uri.hasQuery ? '$path?${uri.query}' : path;
  }

  String? _redirect(BuildContext context, GoRouterState state) {
    final appLink = normalizeAppLink(state.uri);
    if (appLink != null) return appLink;

    final onOnboarding = state.matchedLocation == AppRoutes.onboarding.path;
    if (!_preferences.onboardingSeen && !onOnboarding) {
      // Deep links still work after onboarding is completed once.
      return AppRoutes.onboarding.path;
    }
    if (isProtected(state.fullPath) && !session.state.isAuthenticated) {
      return Uri(
        path: AppRoutes.login.path,
        queryParameters: {RouteQuery.from: state.uri.toString()},
      ).toString();
    }
    return null;
  }
}
