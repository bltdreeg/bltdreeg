import 'dart:async';
import 'dart:convert';

import '../database/app_database.dart';
import '../error/exceptions.dart';
import '../network/connectivity_service.dart';

/// Replays one kind of queued write against the server.
typedef OutboxHandler = Future<void> Function(Map<String, Object?> payload);

/// Offline write queue.
///
/// Features enqueue writes they couldn't send (e.g. favoriting a salon on
/// the metro); the processor replays them in order whenever the device is
/// online. Network failures keep an entry for the next attempt; any other
/// failure drops it after [maxAttempts] so one bad write can't block the
/// queue forever.
final class OutboxProcessor {
  OutboxProcessor({required AppDatabase database, required this._connectivity})
    : _db = database;

  static const maxAttempts = 5;

  final AppDatabase _db;
  final ConnectivityService _connectivity;
  final _handlers = <String, OutboxHandler>{};
  StreamSubscription<bool>? _connectivitySub;
  Future<void>? _running;

  void register(String type, OutboxHandler handler) =>
      _handlers[type] = handler;

  /// Starts replaying on every transition to online.
  void start() {
    _connectivitySub ??= _connectivity.watch().distinct().listen((online) {
      if (online) unawaited(flush());
    });
  }

  Future<void> enqueue(String type, Map<String, Object?> payload) async {
    await _db.enqueueOutbox(type, jsonEncode(payload));
    if (_connectivity.isOnline) unawaited(flush());
  }

  /// Replays pending entries in insertion order. Concurrent calls share one
  /// run.
  Future<void> flush() => _running ??= _flush().whenComplete(() {
    _running = null;
  });

  Future<void> _flush() async {
    for (final entry in await _db.pendingOutbox()) {
      if (!_connectivity.isOnline) return;
      final handler = _handlers[entry.type];
      if (handler == null) continue;
      try {
        await handler(jsonDecode(entry.payload) as Map<String, Object?>);
        await _db.removeOutbox(entry.id);
      } on NetworkException {
        // Still offline for this request: keep order, try again later.
        return;
      } on Object catch (error) {
        await _db.markOutboxAttempt(entry.id, '$error');
        if (entry.attempts + 1 >= maxAttempts) {
          await _db.removeOutbox(entry.id);
        }
      }
    }
  }

  Future<void> dispose() async => _connectivitySub?.cancel();
}
