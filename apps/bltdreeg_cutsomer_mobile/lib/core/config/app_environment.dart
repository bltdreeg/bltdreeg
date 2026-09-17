/// Build-time environment. Select with
/// `flutter run --dart-define=BACKEND=fake|real`.
///
/// `fake` (default) wires every feature to in-memory fake remote data sources
/// that simulate latency, errors and realtime pushes. `real` wires the
/// dio / WebSocket implementations once the backend exists.
enum BackendMode { fake, real }

/// Shown on the account and help screens; keep in step with pubspec.
abstract final class AppInfo {
  static const version = '1.0.0';
  static const supportNumber = '19245';
  static const termsUrl = 'https://beltadreeg.com/terms';
  static const privacyUrl = 'https://beltadreeg.com/privacy';
}

final class AppEnvironment {
  const AppEnvironment({
    required this.backendMode,
    required this.apiBaseUrl,
    required this.queueSocketUrl,
    this.simulatedLatency = const Duration(milliseconds: 650),
    this.fakeLiveUpdateInterval = const Duration(seconds: 15),
    this.fakeQueueStepInterval = const Duration(seconds: 20),
  });

  factory AppEnvironment.fromDefines() {
    const backend = String.fromEnvironment('BACKEND', defaultValue: 'fake');
    return const AppEnvironment(
      backendMode: backend == 'real' ? BackendMode.real : BackendMode.fake,
      apiBaseUrl: String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'https://api.beltadreeg.com/v1',
      ),
      queueSocketUrl: String.fromEnvironment(
        'QUEUE_WS_URL',
        defaultValue: 'wss://api.beltadreeg.com/v1/queue',
      ),
    );
  }

  final BackendMode backendMode;
  final String apiBaseUrl;
  final String queueSocketUrl;

  /// Base round-trip delay applied by the fake backend.
  final Duration simulatedLatency;

  /// How often the fake backend pushes live queue changes. Null disables
  /// pushes (widget tests, static demos).
  final Duration? fakeLiveUpdateInterval;

  /// How often the person at the front of a fake queue finishes, so a
  /// joined queue visibly moves to "your turn" during a demo. Null freezes
  /// fake queues.
  final Duration? fakeQueueStepInterval;

  bool get usesFakeBackend => backendMode == BackendMode.fake;
}
