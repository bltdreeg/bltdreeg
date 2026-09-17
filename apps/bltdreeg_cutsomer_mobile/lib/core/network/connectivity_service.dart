import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

/// Reports whether the app can currently reach the network.
///
/// Combines the real platform signal with a developer override so the
/// offline banner (frame 08) and the full-screen offline view (frame 18) can
/// be demoed or tested on a connected device.
abstract interface class ConnectivityService {
  bool get isOnline;

  /// Emits on every change, starting with the current value.
  Stream<bool> watch();

  /// When true the app behaves as offline regardless of the platform.
  bool get isForcedOffline;
  void setForcedOffline({required bool value});

  Future<void> dispose();
}

final class AppConnectivityService implements ConnectivityService {
  AppConnectivityService({Connectivity? connectivity})
    : _connectivity = connectivity ?? Connectivity() {
    _subscription = _connectivity.onConnectivityChanged.listen(_onPlatform);
    unawaited(_connectivity.checkConnectivity().then(_onPlatform));
  }

  final Connectivity _connectivity;
  final _controller = StreamController<bool>.broadcast();
  late final StreamSubscription<List<ConnectivityResult>> _subscription;

  bool _platformOnline = true;
  bool _forcedOffline = false;

  @override
  bool get isOnline => _platformOnline && !_forcedOffline;

  @override
  bool get isForcedOffline => _forcedOffline;

  @override
  Stream<bool> watch() async* {
    yield isOnline;
    yield* _controller.stream.distinct();
  }

  @override
  void setForcedOffline({required bool value}) {
    _forcedOffline = value;
    _controller.add(isOnline);
  }

  void _onPlatform(List<ConnectivityResult> results) {
    _platformOnline = results.any((r) => r != ConnectivityResult.none);
    _controller.add(isOnline);
  }

  @override
  Future<void> dispose() async {
    await _subscription.cancel();
    // Broadcast `close()` only completes once every listener is gone; don't
    // block disposal on subscribers that outlive the service.
    unawaited(_controller.close());
  }
}

/// Deterministic implementation for tests.
final class FakeConnectivityService implements ConnectivityService {
  FakeConnectivityService({this._online = true});

  final _controller = StreamController<bool>.broadcast();
  bool _online;

  @override
  bool get isOnline => _online;

  @override
  bool get isForcedOffline => !_online;

  @override
  void setForcedOffline({required bool value}) {
    _online = !value;
    _controller.add(_online);
  }

  @override
  Stream<bool> watch() async* {
    yield _online;
    yield* _controller.stream;
  }

  @override
  Future<void> dispose() async => unawaited(_controller.close());
}
