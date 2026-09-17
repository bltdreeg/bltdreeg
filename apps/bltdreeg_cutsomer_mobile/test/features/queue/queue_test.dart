import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/error/failures.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/booking_remote.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/booking_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking_draft.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/queue/presentation/queue_bloc.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/data/salon_details_remote.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/data/salon_details_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  const haircut = SelectedService(
    id: 's1-haircut',
    name: 'قصة شعر',
    durationMinutes: 25,
    price: 70,
  );

  // Thursday 17 Sep 2026, 6 PM: s1 is open.
  var now = DateTime(2026, 9, 17, 18);
  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late FakeSalonCatalogRemoteDataSource catalog;
  late FakeSalonDetailsRemoteDataSource details;
  late FakeBookingRemoteDataSource remote;
  late BookingRepositoryImpl repository;

  setUp(() {
    now = DateTime(2026, 9, 17, 18);
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
    details = FakeSalonDetailsRemoteDataSource(
      server: server,
      catalog: catalog,
      clock: () => now,
    );
    remote = FakeBookingRemoteDataSource(
      server: server,
      catalog: catalog,
      details: details,
      clock: () => now,
    );
    repository = BookingRepositoryImpl(
      remote: remote,
      database: db,
      connectivity: connectivity,
    );
  });

  tearDown(() => db.close());

  Future<Booking> joinNow() async => (await repository.confirm(
    const BookingRequest(
      requestId: 'r1',
      salonId: 's1',
      services: [haircut],
      timing: JoinNow(),
      barber: AnyBarber(),
    ),
  )).valueOrNull!;

  /// Ticks until the customer is at the front.
  Future<Booking> reachTurn(Booking booking) async {
    for (var i = 0; i < booking.peopleAhead; i++) {
      remote.tick();
    }
    return remote.fetch(booking.id);
  }

  group('fake queue', () {
    test('moves waiting → approaching → your turn as people finish', () async {
      var booking = await joinNow();
      if (booking.peopleAhead < 2) {
        // Make the walk-through meaningful regardless of the seeded queue.
        catalog
          ..joinQueue('s1')
          ..joinQueue('s1');
      }
      booking = await joinNowAgainIfNeeded(booking, repository, remote);
      final stages = <QueueStage>[booking.stage];
      while (booking.stage != QueueStage.yourTurn) {
        remote.tick();
        booking = await remote.fetch(booking.id);
        stages.add(booking.stage);
      }
      expect(stages, contains(QueueStage.approaching));
      expect(stages.last, QueueStage.yourTurn);
      expect(booking.turnStartedAt, now);
      expect(booking.waitMinutes, 0);
    });

    test('no show: postponed once, then missed', () async {
      var booking = await reachTurn(await joinNow());
      expect(booking.status, BookingStatus.yourTurn);

      now = now.add(Booking.turnGrace);
      remote.tick();
      booking = await remote.fetch(booking.id);
      expect(booking.status, BookingStatus.waiting);
      expect(booking.peopleAhead, 1);
      expect(booking.postponeUsed, isTrue);

      remote.tick();
      booking = await remote.fetch(booking.id);
      expect(booking.status, BookingStatus.yourTurn);
      now = now.add(Booking.turnGrace);
      remote.tick();
      expect((await remote.fetch(booking.id)).status, BookingStatus.missed);
    });

    test('check in, then the service completes', () async {
      final booking = await reachTurn(await joinNow());
      final checkedIn = (await repository.checkIn(booking.id)).valueOrNull!;
      expect(checkedIn.stage, QueueStage.inService);
      for (var i = 0; i < FakeBookingRemoteDataSource.serviceSteps; i++) {
        remote.tick();
      }
      expect((await remote.fetch(booking.id)).status, BookingStatus.completed);
    });

    test('postpone is allowed once and only at the front', () async {
      final booking = await joinNow();
      if (booking.peopleAhead > 0) {
        expect(
          (await repository.postpone(booking.id)).failureOrNull,
          isA<RuleFailure>().having(
            (f) => f.code,
            'code',
            BookingRuleCodes.notYourTurn,
          ),
        );
      }
      await reachTurn(booking);
      final postponed = (await repository.postpone(booking.id)).valueOrNull!;
      expect(postponed.peopleAhead, 1);
      remote.tick();
      expect(
        (await repository.postpone(booking.id)).failureOrNull,
        isA<RuleFailure>().having(
          (f) => f.code,
          'code',
          BookingRuleCodes.postponeUsed,
        ),
      );
    });

    test('leaving frees the place and allows joining again', () async {
      final booking = await joinNow();
      final before = catalog.salonById('s1')!.queue.peopleAhead;
      final left = (await repository.leave(booking.id)).valueOrNull!;
      expect(left.status, BookingStatus.cancelled);
      expect(catalog.salonById('s1')!.queue.peopleAhead, before - 1);
      expect(
        (await repository.leave(booking.id)).failureOrNull,
        isA<RuleFailure>().having(
          (f) => f.code,
          'code',
          BookingRuleCodes.bookingFinished,
        ),
      );
      final again = await repository.confirm(
        const BookingRequest(
          requestId: 'r2',
          salonId: 's1',
          services: [haircut],
          timing: JoinNow(),
          barber: AnyBarber(),
        ),
      );
      expect(again.isOk, isTrue);
    });
  });

  group('repository watch', () {
    test('emits pushes and goes not-live while offline', () async {
      final booking = await joinNow();
      final snapshots = <BookingSnapshot>[];
      final sub = repository.watch(booking.id).listen(snapshots.add);
      addTearDown(sub.cancel);
      await pumpEventQueue();
      expect(snapshots.last.booking, booking);
      expect(snapshots.last.isLive, isTrue);

      remote.tick();
      await pumpEventQueue();
      expect(
        snapshots.last.booking!.peopleAhead,
        (booking.peopleAhead - 1).clamp(0, 99),
      );

      connectivity.setForcedOffline(value: true);
      await pumpEventQueue();
      expect(snapshots.last.isLive, isFalse);
      expect(snapshots.last.booking, isNotNull);
    });
  });

  group('QueueBloc', () {
    test('counts down the turn and runs one action at a time', () async {
      final booking = await reachTurn(await joinNow());
      final bloc = QueueBloc(
        bookingId: booking.id,
        watchBooking: WatchBooking(repository),
        salonDetails: SalonDetailsRepositoryImpl(
          remote: details,
          database: db,
          connectivity: connectivity,
        ),
        repository: repository,
        checkIn: CheckInToQueue(repository),
        postpone: PostponeTurn(repository),
        leave: LeaveQueue(repository),
        clock: () => now,
        tickInterval: null,
      )..add(const QueueStarted());
      addTearDown(bloc.close);

      final loaded = await bloc.stream
          .firstWhere((s) => s.stage == QueueStage.yourTurn)
          .timeout(const Duration(seconds: 5));
      expect(loaded.turnTimeLeft, Booking.turnGrace);

      now = now.add(const Duration(minutes: 1, seconds: 28));
      bloc
        ..add(const QueueRetryPressed())
        ..add(const QueuePostponePressed())
        ..add(const QueuePostponePressed());
      final done = await bloc.stream
          .firstWhere((s) => s.pending == null && s.booking!.postponeUsed)
          .timeout(const Duration(seconds: 5));
      expect(done.stage, QueueStage.approaching);
      expect(done.actionFailure, isNull);
    });
  });
}

/// Rejoins when the seeded queue was too short for a full walk-through.
Future<Booking> joinNowAgainIfNeeded(
  Booking booking,
  BookingRepositoryImpl repository,
  FakeBookingRemoteDataSource remote,
) async {
  if (booking.peopleAhead >= 2) return booking;
  await repository.leave(booking.id);
  return (await repository.confirm(
    BookingRequest(
      requestId: 'rejoin',
      salonId: booking.salonId,
      services: booking.services,
      timing: const JoinNow(),
      barber: const AnyBarber(),
    ),
  )).valueOrNull!;
}
