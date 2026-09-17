import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/storage/app_preferences.dart';
import 'package:bltdreeg_cutsomer_mobile/core/sync/outbox_processor.dart';
import 'package:bltdreeg_cutsomer_mobile/features/favorites/data/favorites_data.dart';
import 'package:bltdreeg_cutsomer_mobile/features/favorites/domain/usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/favorites/presentation/favorites_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/salon_catalog_local_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/repositories/salon_catalog_repository_impl.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  // Thursday 6 PM: most Maadi salons are open, Barber Point is closed.
  final now = DateTime(2026, 9, 17, 18);
  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late FakeSalonCatalogRemoteDataSource catalog;
  late FavoritesRepositoryImpl favorites;
  late SalonCatalogRepositoryImpl salons;
  late OutboxProcessor outbox;

  setUp(() async {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    db = AppDatabase(NativeDatabase.memory());
    connectivity = FakeConnectivityService();
    final server = FakeServer(
      environment: testEnvironment,
      connectivity: connectivity,
    );
    catalog = FakeSalonCatalogRemoteDataSource(
      server: server,
      connectivity: connectivity,
      clock: () => now,
      driftInterval: null,
    );
    outbox = OutboxProcessor(database: db, connectivity: connectivity);
    favorites = FavoritesRepositoryImpl(
      remote: FakeFavoritesRemoteDataSource(server),
      database: db,
      outbox: outbox,
    );
    salons = SalonCatalogRepositoryImpl(
      remote: catalog,
      local: SalonCatalogLocalDataSource(db),
      connectivity: connectivity,
      preferences: await AppPreferences.create(),
      clock: () => now,
    );
  });

  tearDown(() async {
    await outbox.dispose();
    await db.close();
  });

  Future<FavoritesCubit> board() async {
    // The demo account starts with s1, s3 and s5 favorited.
    await favorites.sync();
    final cubit = FavoritesCubit(
      watchFavorites: WatchFavoriteIds(favorites),
      catalog: salons,
      toggleFavorite: ToggleFavorite(favorites),
    );
    addTearDown(cubit.close);
    await cubit.stream
        .firstWhere((s) => s.salons.isNotEmpty)
        .timeout(const Duration(seconds: 5));
    return cubit;
  }

  test('favorites load from their own ids, across areas', () async {
    final cubit = await board();
    expect(cubit.state.ids, {'s1', 's3', 's5'});
    expect(cubit.state.salons.map((s) => s.id).toSet(), {'s1', 's3', 's5'});
  });

  test('sorted by who can take you soonest, closed last', () async {
    final cubit = await board();
    final list = cubit.state.salons;
    final waits = [for (final s in list) s.queue.waitMinutes];
    final open = [for (final s in list) s.isOpen];

    expect(open, [...open]..sort((a, b) => a == b ? 0 : (a ? -1 : 1)));
    final openWaits = [
      for (var i = 0; i < list.length; i++)
        if (open[i]) waits[i],
    ];
    expect(openWaits, [...openWaits]..sort());
  });

  test('removing a favorite drops the row', () async {
    final cubit = await board();
    await cubit.remove('s1');
    final next = await cubit.stream
        .firstWhere((s) => !(s.ids?.contains('s1') ?? true))
        .timeout(const Duration(seconds: 5));
    expect(next.salons.map((s) => s.id), isNot(contains('s1')));
  });

  test('no favorites shows the empty board', () async {
    final cubit = FavoritesCubit(
      watchFavorites: WatchFavoriteIds(favorites),
      catalog: salons,
      toggleFavorite: ToggleFavorite(favorites),
    );
    addTearDown(cubit.close);
    final state = await cubit.stream
        .firstWhere((s) => s.ids != null)
        .timeout(const Duration(seconds: 5));
    expect(state.isEmpty, isTrue);
    expect(state.isLoading, isFalse);
  });
}
