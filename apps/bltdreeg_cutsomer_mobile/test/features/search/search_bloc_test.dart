import 'package:bloc_test/bloc_test.dart';
import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/storage/app_preferences.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/salon_catalog_local_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/repositories/salon_catalog_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/entities/salon_summary.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/entities/search_criteria.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/search/presentation/search_bloc.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late AppDatabase db;
  late SalonCatalogRepositoryImpl repo;
  late SearchHistoryRepositoryImpl history;

  setUp(() async {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
    db = AppDatabase(NativeDatabase.memory());
    final connectivity = FakeConnectivityService();
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
    final local = SalonCatalogLocalDataSource(db);
    repo = SalonCatalogRepositoryImpl(
      remote: FakeSalonCatalogRemoteDataSource(
        server: FakeServer(
          environment: testEnvironment,
          connectivity: connectivity,
        ),
        connectivity: connectivity,
        driftInterval: const Duration(hours: 1),
      ),
      local: local,
      connectivity: connectivity,
      preferences: await AppPreferences.create(),
    );
    history = SearchHistoryRepositoryImpl(local);
  });

  tearDown(() => db.close());

  SearchBloc build() => SearchBloc(
    watchSelectedArea: WatchSelectedArea(repo),
    watchCatalog: WatchCatalog(repo),
    refreshCatalog: RefreshCatalog(repo),
    getAreas: GetAreas(repo),
    recentSearches: RecentSearches(history),
    debounce: const Duration(milliseconds: 10),
  );

  final now = DateTime.now();

  blocTest<SearchBloc, SearchState>(
    'typing debounces into results',
    build: build,
    act: (bloc) async {
      await Future<void>.delayed(const Duration(milliseconds: 100));
      bloc
        ..add(const SearchQueryChanged('ب'))
        ..add(const SearchQueryChanged('بر'))
        ..add(const SearchQueryChanged('بربر'));
    },
    wait: const Duration(milliseconds: 200),
    verify: (bloc) {
      expect(bloc.state.criteria.query, 'بربر');
      expect(bloc.state.isIdle, isFalse);
      expect(bloc.state.results(now), hasLength(4));
    },
  );

  blocTest<SearchBloc, SearchState>(
    'no results → expand radius finds the salon (frame 15)',
    build: build,
    act: (bloc) async {
      await Future<void>.delayed(const Duration(milliseconds: 100));
      bloc.add(const SearchQueryChanged('صالون الورد'));
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(bloc.state.results(now), isEmpty);
      expect(bloc.state.canExpandRadius, isTrue);
      bloc.add(const SearchRadiusExpanded());
    },
    wait: const Duration(milliseconds: 100),
    verify: (bloc) {
      expect(bloc.state.results(now).single.name, 'وردة بيوتي سنتر');
      expect(bloc.state.canExpandRadius, isFalse);
    },
  );

  blocTest<SearchBloc, SearchState>(
    'launch params, filter preview count and clearing filters',
    build: build,
    act: (bloc) async {
      bloc.add(
        const SearchLaunched(sort: SalonSort.leastWait, openNowOnly: true),
      );
      await Future<void>.delayed(const Duration(milliseconds: 100));
      final draft = bloc.state.criteria.copyWith(
        services: {ServiceCategory.kids},
      );
      expect(
        bloc.state.countFor(draft, now),
        lessThan(bloc.state.results(now).length),
      );
      bloc.add(SearchCriteriaApplied(draft));
      await Future<void>.delayed(const Duration(milliseconds: 20));
      expect(bloc.state.criteria.activeFilterCount, 3);
      bloc.add(const SearchFiltersCleared());
    },
    wait: const Duration(milliseconds: 50),
    verify: (bloc) {
      expect(bloc.state.criteria.hasFilters, isFalse);
      expect(bloc.state.isIdle, isTrue);
    },
  );

  test(
    'committed queries become recent searches (deduped, newest first)',
    () async {
      final bloc = build();
      addTearDown(bloc.close);
      for (final q in ['بربر', 'الكابتن', 'بربر']) {
        bloc
          ..add(SearchQueryChanged(q))
          ..add(SearchQueryCommitted(q));
        await Future<void>.delayed(const Duration(milliseconds: 40));
      }
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(bloc.state.recent, ['بربر', 'الكابتن']);
      bloc.add(const RecentSearchRemoved('بربر'));
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(bloc.state.recent, ['الكابتن']);
    },
  );
}
