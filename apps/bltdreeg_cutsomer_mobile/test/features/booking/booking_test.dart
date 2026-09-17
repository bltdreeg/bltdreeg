import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/error/failures.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/booking_remote.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/booking_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/data/in_memory_booking_draft_repository.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking_draft.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/presentation/booking_flow_cubits.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/data/salon_details_remote.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/data/salon_details_repository_impl.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salon_details/domain/salon_details.dart';
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
  const beard = SelectedService(
    id: 's1-beard',
    name: 'حلاقة دقن',
    durationMinutes: 15,
    price: 50,
  );
  const kids = SelectedService(
    id: 's1-kids',
    name: 'حلاقة أطفال',
    durationMinutes: 20,
    price: 55,
  );

  group('domain', () {
    test('bundle discount applies only when all its services are picked', () {
      const bundle = SalonOffer(
        id: 'o',
        kind: OfferKind.bundle,
        title: 'قصة + دقن',
        originalPrice: 120,
        price: 100,
        serviceIds: ['s1-haircut', 's1-beard'],
      );
      final full = BookingPricing.quote(
        const [haircut, beard, kids],
        const [bundle],
      );
      expect(full.subtotal, 175);
      expect(full.discounts, [const AppliedDiscount(offerId: 'o', amount: 20)]);
      expect(full.total, 155);

      final partial = BookingPricing.quote(const [haircut], const [bundle]);
      expect(partial.discounts, isEmpty);
      expect(partial.total, 70);
    });

    test('wait is a range rounded to 5 minutes, frame 25 shows 10–15', () {
      expect(
        WaitEstimate.around(12),
        const WaitEstimate(minMinutes: 10, maxMinutes: 15),
      );
      expect(WaitEstimate.around(0).isImmediate, isTrue);
      final small = WaitEstimate.around(3);
      expect(small.maxMinutes, greaterThan(small.minMinutes));
    });

    test('a new time resets the barber; the same time keeps it', () {
      const named = NamedBarber(id: 's1-b1', name: 'أحمد مجدي');
      final draft = const BookingDraft(
        salonId: 's1',
        services: [haircut],
        timing: JoinNow(),
      ).withBarber(named);
      expect(draft.withTiming(const JoinNow()).barber, named);
      expect(
        draft
            .withTiming(ScheduledSlot(start: DateTime(2026, 9, 18, 12)))
            .barber,
        const AnyBarber(),
      );
      expect(draft.isReadyForBarber, isTrue);
      expect(draft.withTiming(null).isReadyForBarber, isFalse);
    });
  });

  group('fake backend + repository', () {
    // Thursday 17 Sep 2026, 6 PM: s1 is open (11 AM – 1 AM).
    final now = DateTime(2026, 9, 17, 18);
    late AppDatabase db;
    late FakeSalonCatalogRemoteDataSource catalog;
    late FakeSalonDetailsRemoteDataSource details;
    late BookingRepositoryImpl repository;

    setUp(() {
      driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
      db = AppDatabase(NativeDatabase.memory());
      final connectivity = FakeConnectivityService();
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
      repository = BookingRepositoryImpl(
        remote: FakeBookingRemoteDataSource(
          server: server,
          catalog: catalog,
          details: details,
          clock: () => now,
        ),
        database: db,
      );
    });

    tearDown(() => db.close());

    BookingRequest request(
      String id,
      BookingTiming timing, {
      BarberChoice barber = const AnyBarber(),
    }) => BookingRequest(
      requestId: id,
      salonId: 's1',
      services: const [haircut, beard],
      timing: timing,
      barber: barber,
    );

    test('slots follow opening hours, lead time and service length', () async {
      final today = (await repository.daySchedule(
        salonId: 's1',
        day: now,
        durationMinutes: 40,
      )).valueOrNull!;
      expect(today.slots.first.start, DateTime(2026, 9, 17, 18, 30));
      // Thursday closes at 1 AM: the last 40-minute slot starts at 00:00.
      expect(today.slots.last.start, DateTime(2026, 9, 18));
      // Karim is off today and back tomorrow.
      expect(
        today.slots.every((s) => !s.freeBarberIds.contains('s1-b3')),
        isTrue,
      );

      final sunday = (await repository.daySchedule(
        salonId: 's1',
        day: DateTime(2026, 9, 20),
        durationMinutes: 40,
      )).valueOrNull!;
      expect(sunday.slots, isEmpty);
    });

    test('joining now assigns the next number, adds to the salon queue, '
        'and retries are idempotent', () async {
      final before = catalog.salonById('s1')!.queue.peopleAhead;
      final booking = (await repository.confirm(request('r1', const JoinNow())))
          .valueOrNull!;
      expect(booking.status, BookingStatus.waiting);
      expect(booking.peopleAhead, before);
      expect(booking.ticketNumber, before + 1);
      expect(booking.quote.total, 100);
      expect(catalog.salonById('s1')!.queue.peopleAhead, before + 1);

      final retry = (await repository.confirm(request('r1', const JoinNow())))
          .valueOrNull!;
      expect(retry, booking);
      expect(catalog.salonById('s1')!.queue.peopleAhead, before + 1);

      final second = await repository.confirm(request('r2', const JoinNow()));
      expect(
        second.failureOrNull,
        isA<RuleFailure>()
            .having((f) => f.code, 'code', BookingRuleCodes.alreadyInQueue)
            .having((f) => f.data['bookingId'], 'bookingId', booking.id),
      );

      // Cached for the confirmation screen and deep links.
      expect((await repository.booking(booking.id)).valueOrNull, booking);
    });

    test('a named barber who is off cannot take a queue booking', () async {
      final result = await repository.confirm(
        request(
          'r1',
          const JoinNow(),
          barber: const NamedBarber(id: 's1-b3', name: 'كريم عبد الله'),
        ),
      );
      expect(
        result.failureOrNull,
        isA<RuleFailure>().having(
          (f) => f.code,
          'code',
          BookingRuleCodes.barberUnavailable,
        ),
      );
    });

    test('a booked slot is no longer free for that barber', () async {
      final schedule = (await repository.daySchedule(
        salonId: 's1',
        day: DateTime(2026, 9, 18),
        durationMinutes: 40,
      )).valueOrNull!;
      final slot = schedule.slots.firstWhere(
        (s) => s.freeBarberIds.contains('s1-b1'),
      );
      const ahmed = NamedBarber(id: 's1-b1', name: 'أحمد مجدي');

      final booked = await repository.confirm(
        request('r1', ScheduledSlot(start: slot.start), barber: ahmed),
      );
      expect(booked.valueOrNull?.status, BookingStatus.upcoming);

      final again = await repository.confirm(
        request('r2', ScheduledSlot(start: slot.start), barber: ahmed),
      );
      expect(
        again.failureOrNull,
        isA<RuleFailure>().having(
          (f) => f.code,
          'code',
          BookingRuleCodes.slotTaken,
        ),
      );
    });

    test('confirming clears the draft; failures keep it', () async {
      final drafts = InMemoryBookingDraftRepository();
      final confirm = ConfirmBooking(repository, drafts);
      const draft = BookingDraft(
        salonId: 's1',
        services: [haircut],
        timing: JoinNow(),
      );
      drafts.save(draft);

      final ok = await confirm(draft, 'r1');
      expect(ok.isOk, isTrue);
      expect(drafts.draftFor('s1').isEmpty, isTrue);

      drafts.save(draft);
      final rejected = await confirm(draft, 'r2');
      expect(rejected.isOk, isFalse);
      expect(drafts.draftFor('s1'), draft);
    });

    test(
      'slot step defaults to "now" while open and loads days on demand',
      () async {
        final drafts = InMemoryBookingDraftRepository()
          ..save(const BookingDraft(salonId: 's1', services: [haircut, beard]));
        final cubit = BookingSlotCubit(
          salonId: 's1',
          details: SalonDetailsRepositoryImpl(
            remote: details,
            database: db,
            connectivity: FakeConnectivityService(),
          ),
          drafts: drafts,
          getDaySchedule: GetDaySchedule(repository),
          clock: () => now,
        );
        addTearDown(cubit.close);

        await cubit.stream
            .firstWhere((s) => s.mode != null)
            .timeout(const Duration(seconds: 5));
        await pumpEventQueue();
        expect(cubit.state.mode, TimingMode.now);
        expect(drafts.draftFor('s1').timing, const JoinNow());
        expect(cubit.state.canContinue, isTrue);

        cubit.selectSchedule();
        expect(drafts.draftFor('s1').timing, isNull);
        expect(cubit.state.canContinue, isFalse);
        final loaded = await cubit.stream
            .map((s) => s.selectedSchedule)
            .firstWhere((s) => s is ScheduleLoaded)
            .timeout(const Duration(seconds: 5));
        final slot = (loaded! as ScheduleLoaded).schedule.slots.firstWhere(
          (s) => s.isAvailable,
        );

        cubit.selectSlot(slot);
        await pumpEventQueue();
        expect(drafts.draftFor('s1').timing, isA<ScheduledSlot>());
        expect(cubit.state.canContinue, isTrue);
      },
    );
  });
}
