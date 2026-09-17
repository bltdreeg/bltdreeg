import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/sync/outbox_processor.dart';
import 'package:bltdreeg_cutsomer_mobile/features/favorites/data/favorites_data.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late FakeFavoritesRemoteDataSource remote;
  late OutboxProcessor outbox;
  late FavoritesRepositoryImpl repo;

  setUp(() {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
    db = AppDatabase(NativeDatabase.memory());
    connectivity = FakeConnectivityService();
    remote = FakeFavoritesRemoteDataSource(
      FakeServer(environment: testEnvironment, connectivity: connectivity),
    );
    outbox = OutboxProcessor(database: db, connectivity: connectivity)..start();
    repo = FavoritesRepositoryImpl(
      remote: remote,
      database: db,
      outbox: outbox,
    );
  });

  tearDown(() async {
    await outbox.dispose();
    await db.close();
  });

  // The fake server answers favorite writes after ~300 ms.
  Future<void> settle() =>
      Future<void>.delayed(const Duration(milliseconds: 900));

  test('sync pulls the demo favorites from the server', () async {
    await repo.sync();
    expect(await repo.watchIds().first, {'s1', 's3', 's5'});
  });

  test(
    'offline toggle updates locally now and syncs when back online',
    () async {
      await repo.sync();
      connectivity.setForcedOffline(value: true);

      await repo.setFavorite('s2', favorite: true);
      await repo.setFavorite('s1', favorite: false);
      expect(await repo.watchIds().first, {'s2', 's3', 's5'});
      expect(
        await remote.fetchIds().catchError((_) => <String>{}),
        isEmpty,
        reason: 'server unreachable while offline',
      );
      expect(await db.pendingOutbox(), hasLength(2));

      connectivity.setForcedOffline(value: false);
      await settle();
      expect(await db.pendingOutbox(), isEmpty);
      expect(await remote.fetchIds(), {'s2', 's3', 's5'});
    },
  );

  test('clearLocal forgets favorites (sign-out)', () async {
    await repo.sync();
    await repo.clearLocal();
    expect(await repo.watchIds().first, isEmpty);
  });
}
