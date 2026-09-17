import 'dart:math';

import '../config/app_environment.dart';
import '../error/exceptions.dart';
import 'connectivity_service.dart';

/// Shared behaviour for every fake remote data source: simulated round-trip
/// latency with jitter, and a [NetworkException] whenever connectivity is
/// off, exactly as a real HTTP call would fail.
///
/// Fake data sources call [call] around their in-memory logic so the
/// repositories above them exercise the same error paths they will in
/// production.
final class FakeServer {
  FakeServer({
    required this._environment,
    required this._connectivity,
    Random? random,
  }) : _random = random ?? Random();

  final AppEnvironment _environment;
  final ConnectivityService _connectivity;
  final Random _random;

  /// Probability (0..1) that a request fails with a 500. Stays 0 unless a
  /// test or a debug toggle raises it.
  double failureRate = 0;

  Future<T> call<T>(T Function() handler, {Duration? latency}) async {
    if (!_connectivity.isOnline) {
      throw const NetworkException('fake-server: offline');
    }
    // A per-call [latency] shapes how an action feels in the app; with
    // latency disabled (tests) every call is immediate.
    final base = _environment.simulatedLatency == Duration.zero
        ? Duration.zero
        : latency ?? _environment.simulatedLatency;
    final jitterMs = base.inMilliseconds == 0
        ? 0
        : _random.nextInt(base.inMilliseconds ~/ 2 + 1);
    await Future<void>.delayed(base + Duration(milliseconds: jitterMs));
    if (!_connectivity.isOnline) {
      throw const NetworkException('fake-server: dropped mid-request');
    }
    if (failureRate > 0 && _random.nextDouble() < failureRate) {
      throw const ServerException(statusCode: 500, message: 'fake-server');
    }
    return handler();
  }
}
