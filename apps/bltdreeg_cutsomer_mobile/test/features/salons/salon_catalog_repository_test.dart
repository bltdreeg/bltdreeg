import 'dart:async';

import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/storage/app_preferences.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/salon_catalog_local_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/repositories/salon_catalog_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/entities/catalog_snapshot.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late AppPreferences prefs;

  setUp(() async {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
    db = AppDatabase(NativeDatabase.memory());
    connectivity = FakeConnectivityService();
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    prefs = await AppPreferences.create();
  });

  tearDown(() => db.close());

  SalonCatalogRepositoryImpl build({
    Duration drift = const Duration(hours: 1),
  }) => SalonCatalogRepositoryImpl(
    remote: FakeSalonCatalogRemoteDataSource(
      server: FakeServer(
        environment: testEnvironment,
        connectivity: connectivity,
      ),
      connectivity: connectivity,
      driftInterval: drift,
    ),
    local: SalonCatalogLocalDataSource(db),
    connectivity: connectivity,
    preferences: prefs,
  );

  Future<CatalogSnapshot> firstWhere(
    Stream<CatalogSnapshot> stream,
    bool Function(CatalogSnapshot) test,
  ) => stream.firstWhere(test).timeout(const Duration(seconds: 5));

  test('online: fetches, caches and goes live', () async {
    final snapshot = await firstWhere(
      build().watchCatalog('maadi'),
      (s) => s.hasData && s.isLive,
    );
    expect(snapshot.salons, hasLength(10));
    expect(
      await SalonCatalogLocalDataSource(db).readCatalog('maadi'),
      isNotNull,
    );
  });

  test('offline with cache: emits cached data, not live, no failure', () async {
    await firstWhere(build().watchCatalog('maadi'), (s) => s.isLive);

    connectivity.setForcedOffline(value: true);
    final snapshot = await firstWhere(
      build().watchCatalog('maadi'),
      (s) => s.hasData,
    );
    expect(snapshot.isLive, isFalse);
    expect(snapshot.salons, hasLength(10));
    expect(snapshot.updatedAt, isNotNull);
  });

  test('offline without cache: network failure (frame 18)', () async {
    connectivity.setForcedOffline(value: true);
    final snapshot = await firstWhere(
      build().watchCatalog('maadi'),
      (s) => s.failure != null,
    );
    expect(snapshot.hasData, isFalse);
  });

  test('live queue pushes are merged into the snapshot', () async {
    final repo = build(drift: const Duration(milliseconds: 20));
    final seen = <List<int>>[];
    final sub = repo.watchCatalog('maadi').listen((s) {
      if (s.salons != null) {
        seen.add([for (final x in s.salons!) x.queue.peopleAhead]);
      }
    });
    await Future<void>.delayed(const Duration(milliseconds: 400));
    await sub.cancel();
    expect(seen.toSet().length, greaterThan(1));
  });

  test('areas outside the fake cluster are empty', () async {
    final snapshot = await firstWhere(
      build().watchCatalog('nasr-city'),
      (s) => s.hasData,
    );
    expect(snapshot.salons, isEmpty);
  });

  test('selected area persists and streams changes', () async {
    final repo = build();
    expect(repo.selectedAreaId, 'maadi');
    final next = repo.watchSelectedAreaId().skip(1).first;
    await repo.selectArea('degla');
    expect(await next, 'degla');
    expect(prefs.selectedAreaId, 'degla');
  });
}
