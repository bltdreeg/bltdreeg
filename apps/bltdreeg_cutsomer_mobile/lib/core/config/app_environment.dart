/// Build-time environment. Select with
/// `flutter run --dart-define=BACKEND=fake|real`.
///
/// `fake` (default) wires every feature to in-memory fake remote data sources
/// that simulate latency, errors and realtime pushes. `real` wires the
/// dio / WebSocket implementations once the backend exists.
enum BackendMode { fake, real }

final class AppEnvironment {
  const AppEnvironment({
    required this.backendMode,
    required this.apiBaseUrl,
    required this.queueSocketUrl,
    this.simulatedLatency = const Duration(milliseconds: 650),
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

  bool get usesFakeBackend => backendMode == BackendMode.fake;
}
