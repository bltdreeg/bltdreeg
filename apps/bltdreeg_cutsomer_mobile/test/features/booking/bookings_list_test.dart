import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/sync/outbox_processor.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/booking_remote.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/booking_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/in_memory_booking_draft_repository.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking_draft.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/presentation/bookings_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/features/rating/data/rating_data.dart';
import 'package:bltdreeg_cutsomer_mobile/features/rating/domain/rating.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/data/salon_details_remote.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  // Thursday 17 Sep 2026, 6 PM: s1 is open.
  final now = DateTime(2026, 9, 17, 18);
  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late FakeSalonCatalogRemoteDataSource catalog;
  late FakeBookingRemoteDataSource remote;
  late BookingRepositoryImpl repository;
  late RatingRepositoryImpl ratings;
  late OutboxProcessor outbox;
  late InMemoryBookingDraftRepository drafts;

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
      clock: () => now,
      driftInterval: null,
    );
    remote = FakeBookingRemoteDataSource(
      server: server,
      catalog: catalog,
      details: FakeSalonDetailsRemoteDataSource(
        server: server,
        catalog: catalog,
        clock: () => now,
      ),
      clock: () => now,
    );
    repository = BookingRepositoryImpl(
      remote: remote,
      database: db,
      connectivity: connectivity,
    );
    outbox = OutboxProcessor(database: db, connectivity: connectivity);
    ratings = RatingRepositoryImpl(
      remote: FakeRatingRemoteDataSource(server, clock: () => now),
      database: db,
      outbox: outbox,
    );
    drafts = InMemoryBookingDraftRepository();
  });

  tearDown(() async {
    await outbox.dispose();
    await db.close();
  });

  BookingsCubit cubit() {
    final c = BookingsCubit(
      repository: repository,
      drafts: drafts,
      getRatings: GetVisitRatings(ratings),
    );
    addTearDown(c.close);
    return c;
  }

  /// Waits for the list and the background ratings lookup it triggers.
  Future<BookingsState> loaded(BookingsCubit c) => c.stream
      .firstWhere((s) => s.snapshot.isLoaded && s.ratings.isNotEmpty)
      .timeout(const Duration(seconds: 5));

  test('seeded history lands in the past tab, newest first', () async {
    final c = cubit();
    final state = await loaded(c);

    expect(state.snapshot.active, isEmpty);
    expect(state.snapshot.past.map((b) => b.id), [
      'bk-past-1',
      'bk-past-2',
      'bk-past-3',
    ]);
    // The older visit was already rated on the server (frame 10).
    expect(state.ratings['bk-past-2']?.overall, 4);
    expect(state.ratings.containsKey('bk-past-1'), isFalse);
  });

  test('a live queue booking shows first in the current tab', () async {
    final c = cubit();
    await loaded(c);

    final joined = (await repository.confirm(
      const BookingRequest(
        requestId: 'r1',
        salonId: 's1',
        services: [
          SelectedService(
            id: 's1-haircut',
            name: 'قصة شعر',
            durationMinutes: 25,
            price: 70,
          ),
        ],
        timing: JoinNow(),
        barber: AnyBarber(),
      ),
    )).valueOrNull!;

    final state = await c.stream
        .firstWhere((s) => s.snapshot.active.isNotEmpty)
        .timeout(const Duration(seconds: 5));
    expect(state.snapshot.active.single.id, joined.id);
    // The current tab is the default and lists it first.
    expect(state.tab, BookingsTab.current);
    expect(state.visible.first.id, joined.id);
  });

  test('rebook puts the same services and barber back in the draft', () async {
    final c = cubit();
    final state = await loaded(c);
    final previous = state.snapshot.past.firstWhere((b) => b.id == 'bk-past-1');

    c.rebook(previous);
    final draft = drafts.draftFor('s1');
    expect(draft.services, previous.services);
    expect(draft.barber, isA<NamedBarber>());
    // The time is chosen again: waits change between visits.
    expect(draft.timing, isNull);
    expect(draft.isReadyForBarber, isFalse);
  });

  test('switching tabs changes what is listed', () async {
    final c = cubit();
    await loaded(c);
    expect(c.state.tab, BookingsTab.current);
    expect(c.state.visible, isEmpty);

    c.selectTab(BookingsTab.past);
    expect(c.state.visible, hasLength(3));
  });
}
