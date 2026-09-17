import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'connectivity_service.dart';

final class ConnectivityState extends Equatable {
  const ConnectivityState({required this.isOnline, required this.isForced});

  final bool isOnline;

  /// Offline because of the developer toggle, not the platform.
  final bool isForced;

  @override
  List<Object?> get props => [isOnline, isForced];
}

/// App-wide online/offline state that drives the offline banner and the
/// full-screen offline view.
class ConnectivityCubit extends Cubit<ConnectivityState> {
  ConnectivityCubit(this._service)
    : super(
        ConnectivityState(
          isOnline: _service.isOnline,
          isForced: _service.isForcedOffline,
        ),
      ) {
    _subscription = _service.watch().listen(
      (online) => emit(
        ConnectivityState(isOnline: online, isForced: _service.isForcedOffline),
      ),
    );
  }

  final ConnectivityService _service;
  late final StreamSubscription<bool> _subscription;

  /// Re-queries the platform ("جرّب تاني" on offline views).
  Future<bool> recheck() => _service.recheck();

  void toggleSimulatedOffline() =>
      _service.setForcedOffline(value: !_service.isForcedOffline);

  @override
  Future<void> close() async {
    await _subscription.cancel();
    return super.close();
  }
}
