import 'dart:async';

import '../../../../core/error/failures.dart';
import '../../../../core/network/connectivity_service.dart';
import '../../../../core/storage/app_preferences.dart';
import '../../../../core/utils/result.dart';
import '../../domain/entities/area.dart';
import '../../domain/entities/catalog_snapshot.dart';
import '../../domain/entities/salon_summary.dart';
import '../../domain/repositories/salon_catalog_repository.dart';
import '../datasources/salon_catalog_local_data_source.dart';
import '../datasources/salon_catalog_remote_data_source.dart';

final class SalonCatalogRepositoryImpl implements SalonCatalogRepository {
  SalonCatalogRepositoryImpl({
    required this._remote,
    required this._local,
    required this._connectivity,
    required AppPreferences preferences,
    DateTime Function()? clock,
  }) : _prefs = preferences,
       _clock = clock ?? DateTime.now;

  static const defaultAreaId = 'maadi';

  final SalonCatalogRemoteDataSource _remote;
  final SalonCatalogLocalDataSource _local;
  final ConnectivityService _connectivity;
  final AppPreferences _prefs;
  final DateTime Function() _clock;

  final _refreshers = <String, Future<void> Function()>{};
  final _areaController = StreamController<String>.broadcast();

  @override
  Stream<CatalogSnapshot> watchCatalog(String areaId) {
    late final StreamController<CatalogSnapshot> controller;
    var current = const CatalogSnapshot();
    StreamSubscription<bool>? connectivitySub;
    StreamSubscription<Object?>? liveSub;
    var fetching = false;

    void emit(CatalogSnapshot next) {
      current = next;
      if (!controller.isClosed) controller.add(next);
    }

    void startLive() {
      unawaited(liveSub?.cancel());
      liveSub = _remote.watchQueueLoads(areaId).listen((loads) {
        final salons = current.salons;
        if (salons == null || loads.isEmpty) return;
        final merged = [
          for (final s in salons)
            if (loads[s.id] case final load?) s.withQueue(load) else s,
        ];
        emit(
          current.copyWith(salons: merged, updatedAt: _clock(), isLive: true),
        );
        unawaited(_local.saveCatalog(areaId, merged));
      }, onError: (Object _) => emit(current.copyWith(isLive: false)));
    }

    Future<void> fetch() async {
      if (fetching) return;
      fetching = true;
      emit(current.copyWith(isRefreshing: true));
      final result = await guardResult(() => _remote.fetchCatalog(areaId));
      fetching = false;
      if (controller.isClosed) return;
      switch (result) {
        case Ok(value: final salons):
          await _local.saveCatalog(areaId, salons);
          emit(
            CatalogSnapshot(
              salons: salons,
              updatedAt: _clock(),
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

    controller = StreamController<CatalogSnapshot>(
      onListen: () async {
        final cached = await _local.readCatalog(areaId);
        if (cached != null) {
          emit(
            CatalogSnapshot(salons: cached.salons, updatedAt: cached.updatedAt),
          );
        }
        _refreshers[areaId] = fetch;
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
        _refreshers.remove(areaId);
        await connectivitySub?.cancel();
        await liveSub?.cancel();
        await controller.close();
      },
    );
    return controller.stream;
  }

  @override
  Stream<CatalogSnapshot> watchSalons(Set<String> ids) {
    final key = _idsKey(ids);
    late final StreamController<CatalogSnapshot> controller;
    var current = const CatalogSnapshot();
    StreamSubscription<bool>? connectivitySub;
    final liveSubs = <StreamSubscription<Object?>>[];
    var fetching = false;

    void emit(CatalogSnapshot next) {
      current = next;
      if (!controller.isClosed) controller.add(next);
    }

    Future<void> stopLive() async {
      for (final sub in liveSubs) {
        await sub.cancel();
      }
      liveSubs.clear();
    }

    void startLive(List<SalonSummary> salons) {
      unawaited(stopLive());
      // Favorites can span areas; follow each area's queue pushes.
      for (final areaId in {for (final s in salons) s.areaId}) {
        liveSubs.add(
          _remote.watchQueueLoads(areaId).listen((loads) {
            final known = current.salons;
            if (known == null || loads.isEmpty) return;
            final merged = [
              for (final s in known)
                if (loads[s.id] case final load?) s.withQueue(load) else s,
            ];
            emit(
              current.copyWith(
                salons: merged,
                updatedAt: _clock(),
                isLive: true,
              ),
            );
            unawaited(_local.saveCatalog(key, merged));
          }, onError: (Object _) => emit(current.copyWith(isLive: false))),
        );
      }
    }

    Future<void> fetch() async {
      if (fetching || ids.isEmpty) return;
      fetching = true;
      emit(current.copyWith(isRefreshing: true));
      final result = await guardResult(() => _remote.fetchByIds(ids));
      fetching = false;
      if (controller.isClosed) return;
      switch (result) {
        case Ok(value: final salons):
          await _local.saveCatalog(key, salons);
          emit(
            CatalogSnapshot(
              salons: salons,
              updatedAt: _clock(),
              isLive: _connectivity.isOnline,
            ),
          );
          startLive(salons);
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

    controller = StreamController<CatalogSnapshot>(
      onListen: () async {
        if (ids.isEmpty) {
          emit(CatalogSnapshot(salons: const [], updatedAt: _clock()));
          return;
        }
        final cached = await _local.readCatalog(key);
        if (cached != null) {
          emit(
            CatalogSnapshot(salons: cached.salons, updatedAt: cached.updatedAt),
          );
        }
        _refreshers[key] = fetch;
        connectivitySub = _connectivity.watch().distinct().listen((online) {
          if (online) {
            unawaited(fetch());
          } else {
            unawaited(stopLive());
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
        _refreshers.remove(key);
        await connectivitySub?.cancel();
        await stopLive();
        await controller.close();
      },
    );
    return controller.stream;
  }

  @override
  Future<void> refreshSalons(Set<String> ids) async {
    await _connectivity.recheck();
    await _refreshers[_idsKey(ids)]?.call();
  }

  /// Cache key for a set of salons, independent of order.
  static String _idsKey(Set<String> ids) =>
      'salons:${(ids.toList()..sort()).join(',')}';

  @override
  Future<void> refresh(String areaId) async {
    // "Try again" first re-asks the OS: its offline signal can be stale.
    await _connectivity.recheck();
    await _refreshers[areaId]?.call();
  }

  @override
  Future<Result<List<Area>>> getAreas() async {
    final result = await guardResult(_remote.fetchAreas);
    switch (result) {
      case Ok(:final value):
        await _local.saveAreas(value);
        return result;
      case Err():
        final cached = await _local.readAreas();
        return cached == null ? result : Ok(cached);
    }
  }

  @override
  String get selectedAreaId => _prefs.selectedAreaId ?? defaultAreaId;

  @override
  Stream<String> watchSelectedAreaId() => Stream.multi((listener) {
    listener.add(selectedAreaId);
    final sub = _areaController.stream.listen(listener.add);
    listener.onCancel = sub.cancel;
  });

  @override
  Future<void> selectArea(String areaId) async {
    await _prefs.setSelectedAreaId(areaId);
    _areaController.add(areaId);
  }
}

final class SearchHistoryRepositoryImpl implements SearchHistoryRepository {
  const SearchHistoryRepositoryImpl(this._local);

  static const maxEntries = 6;

  final SalonCatalogLocalDataSource _local;

  @override
  Stream<List<String>> watchRecent() => _local.watchRecentSearches();

  @override
  Future<void> add(String query) async {
    final q = query.trim();
    if (q.length < 2) return;
    final current = await _local.readRecentSearches();
    await _local.saveRecentSearches(
      [q, ...current.where((e) => e != q)].take(maxEntries).toList(),
    );
  }

  @override
  Future<void> remove(String query) async {
    final current = await _local.readRecentSearches();
    await _local.saveRecentSearches(current.where((e) => e != query).toList());
  }

  @override
  Future<void> clear() => _local.saveRecentSearches(const []);
}
