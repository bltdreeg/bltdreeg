import 'dart:async';
import 'dart:convert';

import '../../../core/database/app_database.dart';
import '../../../core/error/exceptions.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/fake_server.dart';
import '../../../core/sync/outbox_processor.dart';
import '../../../core/utils/result.dart';
import '../domain/favorites_repository.dart';

abstract interface class FavoritesRemoteDataSource {
  Future<Set<String>> fetchIds();
  Future<void> setFavorite(String salonId, {required bool favorite});
}

final class ApiFavoritesRemoteDataSource implements FavoritesRemoteDataSource {
  const ApiFavoritesRemoteDataSource(this._api);

  final ApiClient _api;

  @override
  Future<Set<String>> fetchIds() async {
    final json = await _api.getJson('/me/favorites');
    return {
      for (final id in json['salon_ids']! as List<Object?>) id! as String,
    };
  }

  @override
  Future<void> setFavorite(String salonId, {required bool favorite}) => favorite
      ? _api.putJson('/me/favorites/$salonId')
      : _api.deleteJson('/me/favorites/$salonId');
}

/// Demo account favorites match the board (frame 34).
final class FakeFavoritesRemoteDataSource implements FavoritesRemoteDataSource {
  FakeFavoritesRemoteDataSource(this._server);

  final FakeServer _server;
  final _ids = <String>{'s1', 's3', 's5'};

  @override
  Future<Set<String>> fetchIds() => _server(() => {..._ids});

  @override
  Future<void> setFavorite(String salonId, {required bool favorite}) => _server(
    () => favorite ? _ids.add(salonId) : _ids.remove(salonId),
    latency: const Duration(milliseconds: 300),
  );
}

final class FavoritesRepositoryImpl implements FavoritesRepository {
  FavoritesRepositoryImpl({
    required this._remote,
    required AppDatabase database,
    required this._outbox,
  }) : _db = database {
    _outbox.register(outboxType, (payload) async {
      await _remote.setFavorite(
        payload['salonId']! as String,
        favorite: payload['favorite']! as bool,
      );
    });
  }

  static const outboxType = 'favorites.set';
  static const _cacheKey = 'favorites:ids';

  final FavoritesRemoteDataSource _remote;
  final AppDatabase _db;
  final OutboxProcessor _outbox;

  @override
  Stream<Set<String>> watchIds() => _db
      .watchCache(_cacheKey)
      .map(
        (row) => row == null
            ? const <String>{}
            : {
                for (final id in jsonDecode(row.payload) as List<Object?>)
                  id! as String,
              },
      )
      .distinct(_sameSet);

  static bool _sameSet(Set<String> a, Set<String> b) =>
      a.length == b.length && a.containsAll(b);

  Future<Set<String>> _readLocal() => watchIds().first;

  Future<void> _writeLocal(Set<String> ids) =>
      _db.writeCache(_cacheKey, jsonEncode(ids.toList()));

  @override
  Future<Result<void>> setFavorite(
    String salonId, {
    required bool favorite,
  }) async {
    final ids = await _readLocal();
    await _writeLocal(
      favorite ? ({...ids, salonId}) : ({...ids}..remove(salonId)),
    );
    // The outbox sends immediately when online and retries when offline.
    await _outbox.enqueue(outboxType, {
      'salonId': salonId,
      'favorite': favorite,
    });
    return const Ok(null);
  }

  @override
  Future<void> sync() async {
    await _outbox.flush();
    try {
      await _writeLocal(await _remote.fetchIds());
    } on AppException {
      // Offline or signed out: keep the local copy.
    }
  }

  @override
  Future<void> clearLocal() => _db.deleteCache(_cacheKey);
}
