import 'dart:async';
import 'dart:convert';

import '../../../core/database/app_database.dart';
import '../../../core/error/failures.dart';
import '../../../core/network/connectivity_service.dart';
import '../../../core/utils/result.dart';
import '../domain/salon_details.dart';
import 'salon_details_models.dart';
import 'salon_details_remote.dart';

final class SalonDetailsRepositoryImpl implements SalonDetailsRepository {
  SalonDetailsRepositoryImpl({
    required this._remote,
    required AppDatabase database,
    required this._connectivity,
  }) : _db = database;

  final SalonDetailsRemoteDataSource _remote;
  final AppDatabase _db;
  final ConnectivityService _connectivity;
  final _refreshers = <String, Future<void> Function()>{};

  static String _key(String id) => 'salon:$id';

  @override
  Stream<SalonDetailsSnapshot> watch(String salonId) {
    late final StreamController<SalonDetailsSnapshot> controller;
    var current = const SalonDetailsSnapshot();
    StreamSubscription<bool>? connectivitySub;
    StreamSubscription<SalonLiveUpdate>? liveSub;
    var fetching = false;

    void emit(SalonDetailsSnapshot next) {
      current = next;
      if (!controller.isClosed) controller.add(next);
    }

    void startLive() {
      unawaited(liveSub?.cancel());
      liveSub = _remote.watchLive(salonId).listen((update) {
        final details = current.details;
        if (details == null) return;
        emit(
          current.copyWith(
            isLive: true,
            details: details.withLive(
              load: update.load,
              barbers: [
                for (final b in details.barbers)
                  if (update.barbers[b.id] case final a?)
                    b.withAvailability(a)
                  else
                    b,
              ],
            ),
          ),
        );
      }, onError: (Object _) => emit(current.copyWith(isLive: false)));
    }

    Future<void> fetch() async {
      if (fetching) return;
      fetching = true;
      emit(current.copyWith(isRefreshing: true));
      final result = await guardResult(() => _remote.fetch(salonId));
      fetching = false;
      if (controller.isClosed) return;
      switch (result) {
        case Ok(value: final details):
          await _db.writeCache(
            _key(salonId),
            jsonEncode(SalonDetailsModel.toJson(details)),
          );
          emit(
            SalonDetailsSnapshot(
              details: details,
              isLive: _connectivity.isOnline,
            ),
          );
          startLive();
        case Err(:final failure):
          emit(
            current.copyWith(
              isRefreshing: false,
              isLive: false,
              failure: failure,
            ),
          );
      }
    }

    controller = StreamController<SalonDetailsSnapshot>(
      onListen: () async {
        final cached = await _db.readCache(_key(salonId));
        if (cached != null) {
          emit(
            SalonDetailsSnapshot(
              details: SalonDetailsModel.fromJson(
                jsonDecode(cached.payload) as Map<String, Object?>,
              ),
            ),
          );
        }
        _refreshers[salonId] = fetch;
        connectivitySub = _connectivity.watch().distinct().listen((online) {
          if (online) {
            unawaited(fetch());
          } else {
            unawaited(liveSub?.cancel());
            emit(
              current.copyWith(
                isLive: false,
                failure: current.hasData ? null : const NetworkFailure(),
              ),
            );
          }
        });
      },
      onCancel: () async {
        _refreshers.remove(salonId);
        await connectivitySub?.cancel();
        await liveSub?.cancel();
        await controller.close();
      },
    );
    return controller.stream;
  }

  @override
  Future<void> refresh(String salonId) async {
    // "Try again" first re-asks the OS: its offline signal can be stale.
    await _connectivity.recheck();
    await _refreshers[salonId]?.call();
  }
}
