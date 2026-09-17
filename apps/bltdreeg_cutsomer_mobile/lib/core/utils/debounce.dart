import 'dart:async';

import 'package:bloc/bloc.dart';
import 'package:flutter/foundation.dart';
import 'package:stream_transform/stream_transform.dart';

/// Bloc event transformer for search-as-you-type: waits for [duration] of
/// silence, then cancels any in-flight handler when a newer event arrives.
EventTransformer<E> debounceRestartable<E>(Duration duration) =>
    (events, mapper) => events.debounce(duration).switchMap(mapper);

/// Imperative debouncer for widgets that aren't driven by a bloc event.
final class Debouncer {
  Debouncer(this.duration);

  final Duration duration;
  Timer? _timer;

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(duration, action);
  }

  void cancel() => _timer?.cancel();

  void dispose() => cancel();
}
