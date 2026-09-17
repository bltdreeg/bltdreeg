import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../dev/design_system_gallery_page.dart';
import '../storage/app_preferences.dart';
import 'app_navigation.dart';
import 'app_routes.dart';
import 'route_placeholder_page.dart';
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
/// Placeholder pages are replaced by real screens phase by phase. The auth
/// guard for [AppRoutes.protectedRoutes] is added with the auth feature.
final class AppRouter {
  AppRouter({required this._preferences, this._refresh});

  final AppPreferences _preferences;
  final Listenable? _refresh;

  final _rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');

  late final GoRouter config = GoRouter(
    navigatorKey: _rootKey,
    initialLocation: AppRoutes.home.path,
    refreshListenable: _refresh,
    redirect: _redirect,
    routes: [
      GoRoute(
        name: AppRoutes.onboarding.name,
        path: AppRoutes.onboarding.path,
        builder: (context, _) => RoutePlaceholderPage(
          title: 'Onboarding',
          links: [
            (
              '→ finish onboarding',
              () async {
                await _preferences.setOnboardingSeen();
                if (context.mounted) context.goLogin();
              },
            ),
          ],
        ),
      ),
      GoRoute(
        name: AppRoutes.login.name,
        path: AppRoutes.login.path,
        builder: (context, _) => RoutePlaceholderPage(
          title: 'Login',
          links: [
            ('→ register', () => context.pushRegister()),
            ('→ otp', () => context.pushOtp(phone: '01023456789')),
            ('→ home (guest)', () => context.goHome()),
          ],
        ),
      ),
      GoRoute(
        name: AppRoutes.register.name,
        path: AppRoutes.register.path,
        builder: (_, _) => const RoutePlaceholderPage(title: 'Register'),
      ),
      GoRoute(
        name: AppRoutes.otp.name,
        path: AppRoutes.otp.path,
        builder: (_, _) => const RoutePlaceholderPage(title: 'OTP'),
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
                builder: (context, _) => RoutePlaceholderPage(
                  title: 'Home',
                  links: [
                    ('→ notifications', () => context.pushNotifications()),
                    ('→ salon 1', () => context.pushSalon('1')),
                    ('→ onboarding', () => context.goOnboarding()),
                    if (kDebugMode)
                      (
                        '→ design system',
                        () => context.pushNamed(AppRoutes.devDesignSystem.name),
                      ),
                  ],
                ),
                routes: [
                  GoRoute(
                    name: AppRoutes.notifications.name,
                    path: AppRoutes.notifications.path,
                    builder: (_, _) =>
                        const RoutePlaceholderPage(title: 'Notifications'),
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
                builder: (context, _) => RoutePlaceholderPage(
                  title: 'My bookings',
                  links: [
                    ('→ queue b1', () => context.pushQueue('b1')),
                    ('→ rate b1', () => context.pushRateVisit('b1')),
                  ],
                ),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                name: AppRoutes.search.name,
                path: AppRoutes.search.path,
                builder: (_, _) => const RoutePlaceholderPage(title: 'Search'),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                name: AppRoutes.account.name,
                path: AppRoutes.account.path,
                builder: (context, _) => RoutePlaceholderPage(
                  title: 'Account',
                  links: [
                    ('→ profile', () => context.pushEditProfile()),
                    ('→ favorites', () => context.pushFavorites()),
                    (
                      '→ notification settings',
                      () => context.pushNotificationSettings(),
                    ),
                    ('→ language', () => context.pushLanguage()),
                    ('→ help', () => context.pushHelp()),
                  ],
                ),
                routes: [
                  _placeholder(AppRoutes.editProfile, 'Edit profile'),
                  _placeholder(AppRoutes.favorites, 'Favorites'),
                  _placeholder(
                    AppRoutes.notificationSettings,
                    'Notification settings',
                  ),
                  _placeholder(AppRoutes.language, 'Language'),
                  _placeholder(AppRoutes.help, 'Help & support'),
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
        builder: (context, state) {
          final id = state.pathParameters[RouteParams.salonId]!;
          return RoutePlaceholderPage(
            title: 'Salon $id',
            links: [
              ('→ gallery', () => context.pushSalonGallery(id)),
              ('→ book', () => context.pushBookingSlot(id)),
            ],
          );
        },
        routes: [
          _placeholder(AppRoutes.salonGallery, 'Gallery'),
          GoRoute(
            name: AppRoutes.bookingSlot.name,
            path: AppRoutes.bookingSlot.path,
            builder: (context, state) {
              final id = state.pathParameters[RouteParams.salonId]!;
              return RoutePlaceholderPage(
                title: 'Booking 1/3 — slot',
                links: [('→ barber', () => context.pushBookingBarber(id))],
              );
            },
          ),
          GoRoute(
            name: AppRoutes.bookingBarber.name,
            path: AppRoutes.bookingBarber.path,
            builder: (context, state) {
              final id = state.pathParameters[RouteParams.salonId]!;
              return RoutePlaceholderPage(
                title: 'Booking 2/3 — barber',
                links: [('→ review', () => context.pushBookingReview(id))],
              );
            },
          ),
          GoRoute(
            name: AppRoutes.bookingReview.name,
            path: AppRoutes.bookingReview.path,
            builder: (context, _) => RoutePlaceholderPage(
              title: 'Booking 3/3 — review',
              links: [('→ confirm', () => context.goBookingConfirmed('b1'))],
            ),
          ),
        ],
      ),
      GoRoute(
        parentNavigatorKey: _rootKey,
        name: AppRoutes.bookingConfirmed.name,
        path: AppRoutes.bookingConfirmed.path,
        builder: (context, state) => RoutePlaceholderPage(
          title: 'Entered queue',
          links: [
            (
              '→ track',
              () =>
                  context.goQueue(state.pathParameters[RouteParams.bookingId]!),
            ),
          ],
        ),
      ),
      GoRoute(
        parentNavigatorKey: _rootKey,
        name: AppRoutes.queue.name,
        path: AppRoutes.queue.path,
        builder: (_, _) => const RoutePlaceholderPage(title: 'Queue'),
      ),
      GoRoute(
        parentNavigatorKey: _rootKey,
        name: AppRoutes.rateVisit.name,
        path: AppRoutes.rateVisit.path,
        builder: (context, state) => RoutePlaceholderPage(
          title: 'Rate visit',
          links: [
            (
              '→ sent',
              () => context.goRatingSent(
                state.pathParameters[RouteParams.bookingId]!,
              ),
            ),
          ],
        ),
        routes: [_placeholder(AppRoutes.ratingSent, 'Rating sent')],
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

  String? _redirect(BuildContext context, GoRouterState state) {
    final path = state.matchedLocation;
    final onOnboarding = path == AppRoutes.onboarding.path;
    if (!_preferences.onboardingSeen && !onOnboarding) {
      // Deep links still work after onboarding is completed once.
      return AppRoutes.onboarding.path;
    }
    return null;
  }

  static GoRoute _placeholder(AppRoute route, String title) => GoRoute(
    name: route.name,
    path: route.path,
    builder: (_, _) => RoutePlaceholderPage(title: title),
  );
}
