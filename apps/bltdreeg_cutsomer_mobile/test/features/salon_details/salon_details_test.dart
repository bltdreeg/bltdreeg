import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/error/failures.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/sync/outbox_processor.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/in_memory_booking_draft_repository.dart';
import 'package:bltdreeg_cutsomer_mobile/features/favorites/data/favorites_data.dart';
import 'package:bltdreeg_cutsomer_mobile/features/favorites/domain/usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/data/salon_details_remote.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/data/salon_details_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/domain/salon_details.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/presentation/salon_details_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/repositories/recently_viewed_repository.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late FakeSalonCatalogRemoteDataSource catalog;
  late SalonDetailsRepositoryImpl repo;

  setUp(() {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
    db = AppDatabase(NativeDatabase.memory());
    connectivity = FakeConnectivityService();
    final server = FakeServer(
      environment: testEnvironment,
      connectivity: connectivity,
    );
    catalog = FakeSalonCatalogRemoteDataSource(
      server: server,
      connectivity: connectivity,
      driftInterval: const Duration(milliseconds: 20),
    );
    repo = SalonDetailsRepositoryImpl(
      remote: FakeSalonDetailsRemoteDataSource(
        server: server,
        catalog: catalog,
      ),
      database: db,
      connectivity: connectivity,
    );
  });

  tearDown(() => db.close());

  Future<SalonDetailsSnapshot> first(
    String id,
    bool Function(SalonDetailsSnapshot) test,
  ) => repo.watch(id).firstWhere(test).timeout(const Duration(seconds: 5));

  test('s1 carries the board content (frames 21–23)', () async {
    final details = (await first('s1', (s) => s.hasData)).details!;
    expect(details.summary.name, 'صالون الكابتن حسام');
    expect(
      [for (final g in details.serviceGroups) g.title],
      ['حلاقة وتصفيف', 'دقن وعناية'],
    );
    expect(details.allServices, hasLength(5));
    expect(details.barbers.map((b) => b.name), [
      'أحمد مجدي',
      'محمود السيد',
      'كريم عبد الله',
    ]);
    expect(details.barbersOnShift, hasLength(2));
    expect(details.offers.first.highlighted, isTrue);
    expect(details.reviews.first.authorName, 'محمد طارق');
    expect(
      details.hours.firstWhere((h) => h.weekday == DateTime.sunday).isClosed,
      isTrue,
    );
  });

  test('named barbers wait longer than the shared queue', () async {
    final details = (await first('s1', (s) => s.hasData)).details!;
    final ahmed = details.barbers.first.availability as BarberWorking;
    expect(ahmed.queue.peopleAhead, details.summary.queue.peopleAhead + 2);
  });

  test('cached copy is served offline', () async {
    await first('s3', (s) => s.hasData && s.isLive);
    connectivity.setForcedOffline(value: true);
    final offline = await first('s3', (s) => s.hasData);
    expect(offline.isLive, isFalse);
    expect(offline.details!.summary.name, 'بربر لاونج المعادي');
  });

  test('unknown salon → not found', () async {
    final snapshot = await first('nope', (s) => s.failure != null);
    expect(snapshot.failure, isA<NotFoundFailure>());
  });

  test('live pushes update the salon queue and barbers', () async {
    final loads = <int>{};
    final sub = repo.watch('s4').listen((s) {
      if (s.details != null) loads.add(s.details!.summary.queue.peopleAhead);
    });
    await Future<void>.delayed(const Duration(milliseconds: 600));
    await sub.cancel();
    expect(loads.length, greaterThan(1));
  });

  test(
    'cubit: services build the booking draft, favorites and recents',
    () async {
      final outbox = OutboxProcessor(database: db, connectivity: connectivity);
      final favorites = FavoritesRepositoryImpl(
        remote: FakeFavoritesRemoteDataSource(
          FakeServer(environment: testEnvironment, connectivity: connectivity),
        ),
        database: db,
        outbox: outbox,
      );
      final recents = RecentlyViewedRepository(db);
      final drafts = InMemoryBookingDraftRepository();
      final cubit = SalonDetailsCubit(
        salonId: 's1',
        repository: repo,
        drafts: drafts,
        recentlyViewed: recents,
        watchFavorites: WatchFavoriteIds(favorites),
        toggleFavorite: ToggleFavorite(favorites),
      );
      addTearDown(cubit.close);

      await cubit.stream.firstWhere((s) => s.details != null);
      final services = cubit.state.details!.allServices.toList();
      cubit
        ..toggleService(services[0])
        ..toggleService(services[3]);
      await Future<void>.delayed(Duration.zero);
      expect(cubit.state.draft.totalPrice, 70 + 50);
      expect(drafts.draftFor('s1').services, hasLength(2));

      await cubit.setFavorite(favorite: true);
      await Future<void>.delayed(const Duration(milliseconds: 50));
      expect(cubit.state.isFavorite, isTrue);
      expect(await recents.watch().first, ['s1']);

      cubit.filterReviews(const ReviewFilterWithPhotos());
      expect(cubit.state.filteredReviews.single.authorName, 'عمرو فتحي');
    },
  );
}
