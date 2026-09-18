/// The account the fake backend is seeded with. Shown on the login and OTP
/// screens in debug builds so a demo never needs them memorised, and reused
/// by `FakeAuthRemoteDataSource` and the tests.
abstract final class DemoCredentials {
  static const email = 'karim.abdelrahman@gmail.com';
  static const password = 'barber2026';
  static const phone = '01023456789';
  static const otp = '1234';
}
