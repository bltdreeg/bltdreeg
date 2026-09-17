/// Central route table. Every screen has a stable [AppRoute.name]; code
/// navigates by name through `AppNavigation` and never builds paths by hand.
///
/// Paths are deep-link ready: `beltadreeg://salon/42` maps to `/salon/42`.
/// Nested routes store a relative [AppRoute.path] segment; [AppRoute.fullPath]
/// documents the resolved location.
final class AppRoute {
  const AppRoute(this.name, this.path, {String? fullPath})
    : fullPath = fullPath ?? path;

  final String name;
  final String path;
  final String fullPath;
}

abstract final class RouteParams {
  static const salonId = 'salonId';
  static const bookingId = 'bookingId';
}

abstract final class RouteQuery {
  /// Where to return after a successful login (guarded deep links).
  static const from = 'from';
  static const phone = 'phone';
  static const loginMethod = 'method';
  static const barberId = 'barberId';
  static const sort = 'sort';
  static const openNow = 'open';
}

abstract final class AppRoutes {
  // ---- pre-auth --------------------------------------------------------------
  static const onboarding = AppRoute('onboarding', '/onboarding'); // 01-03
  static const login = AppRoute('login', '/login'); // 04-05
  static const register = AppRoute('register', '/register'); // 06
  static const otp = AppRoute('otp', '/otp'); // 19-20

  // ---- bottom-nav shell: branch 0 (home) ------------------------------------
  static const home = AppRoute('home', '/home'); // 07-08, 18
  static const notifications = AppRoute(
    'notifications',
    'notifications',
    fullPath: '/home/notifications',
  ); // 32-33

  // ---- branch 1 (bookings) ---------------------------------------------------
  static const bookings = AppRoute('bookings', '/bookings'); // 09-11

  // ---- branch 2 (search) ------------------------------------------------------
  static const search = AppRoute('search', '/search'); // 12-15

  // ---- branch 3 (account) -----------------------------------------------------
  static const account = AppRoute('account', '/account'); // 16-17, 43
  static const editProfile = AppRoute(
    'editProfile',
    'profile',
    fullPath: '/account/profile',
  ); // 36
  static const favorites = AppRoute(
    'favorites',
    'favorites',
    fullPath: '/account/favorites',
  ); // 34-35
  static const notificationSettings = AppRoute(
    'notificationSettings',
    'notification-settings',
    fullPath: '/account/notification-settings',
  ); // 37
  static const language = AppRoute(
    'language',
    'language',
    fullPath: '/account/language',
  ); // 38
  static const help = AppRoute('help', 'help', fullPath: '/account/help'); // 42

  // ---- full-screen (above the shell) ------------------------------------------
  static const salon = AppRoute('salon', '/salon/:salonId'); // 21-23
  static const salonGallery = AppRoute(
    'salonGallery',
    'gallery',
    fullPath: '/salon/:salonId/gallery',
  ); // 39

  /// Booking flow (new slot step + 24-25). Shares one draft cubit.
  static const bookingSlot = AppRoute(
    'bookingSlot',
    'book/slot',
    fullPath: '/salon/:salonId/book/slot',
  );
  static const bookingBarber = AppRoute(
    'bookingBarber',
    'book/barber',
    fullPath: '/salon/:salonId/book/barber',
  );
  static const bookingReview = AppRoute(
    'bookingReview',
    'book/review',
    fullPath: '/salon/:salonId/book/review',
  );

  static const bookingConfirmed = AppRoute(
    'bookingConfirmed',
    '/booking/:bookingId/confirmed',
  ); // 26
  static const queue = AppRoute('queue', '/queue/:bookingId'); // 27-30
  static const rateVisit = AppRoute(
    'rateVisit',
    '/booking/:bookingId/rate',
  ); // 31
  static const ratingSent = AppRoute(
    'ratingSent',
    'sent',
    fullPath: '/booking/:bookingId/rate/sent',
  ); // 41

  /// Debug-only component gallery.
  static const devDesignSystem = AppRoute(
    'devDesignSystem',
    '/dev/design-system',
  );

  /// Routes that need a signed-in user; guests are sent to [login].
  static const protectedRoutes = {
    bookingSlot,
    bookingBarber,
    bookingReview,
    bookingConfirmed,
    queue,
    rateVisit,
    ratingSent,
    editProfile,
    favorites,
    notificationSettings,
  };
}
