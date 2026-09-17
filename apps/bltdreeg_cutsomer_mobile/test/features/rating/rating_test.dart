import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/l10n_data/localized_text.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/sync/outbox_processor.dart';
import 'package:bltdreeg_cutsomer_mobile/core/utils/result.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking_draft.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/usecases.dart';
import 'package:bltdreeg_cutsomer_mobile/features/rating/data/photo_picker.dart';
import 'package:bltdreeg_cutsomer_mobile/features/rating/data/rating_data.dart';
import 'package:bltdreeg_cutsomer_mobile/features/rating/domain/rating.dart';
import 'package:bltdreeg_cutsomer_mobile/features/rating/presentation/rating_cubits.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import '../../helpers/test_bootstrap.dart';

class _MockBookingRepository extends Mock implements BookingRepository {}

class _FakePicker implements PhotoPicker {
  String? next = '/tmp/cut.jpg';
  bool fail = false;

  @override
  Future<String?> pick(PhotoSource source) async {
    if (fail) throw Exception('denied');
    return next;
  }
}

class _KeepInPlace implements RatingPhotoStore {
  @override
  Future<String> keep(String bookingId, String sourcePath, int index) async =>
      '/app/ratings/$bookingId/$index.jpg';
}

void main() {
  final joinedAt = DateTime(2026, 9, 17, 19);
  Booking booking(BookingStatus status) => Booking(
    id: 'bk1',
    salonId: 's1',
    salonName: 'صالون الكابتن حسام',
    salonArea: const LocalizedText(ar: 'المعادي', en: 'Maadi'),
    salonAddress: const LocalizedText(ar: 'المعادي', en: 'Maadi'),
    latitude: 0,
    longitude: 0,
    services: const [
      SelectedService(id: 'h', name: 'قصة شعر', durationMinutes: 25, price: 70),
    ],
    timing: const JoinNow(),
    status: status,
    quote: const BookingQuote(subtotal: 70),
    createdAt: joinedAt,
    quotedWaitMinutes: 20,
    servedAt: joinedAt.add(const Duration(minutes: 25)),
  );

  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late FakeRatingRemoteDataSource remote;
  late OutboxProcessor outbox;
  late RatingRepositoryImpl repository;
  late _MockBookingRepository bookings;
  late _FakePicker picker;

  setUp(() {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
    db = AppDatabase(NativeDatabase.memory());
    connectivity = FakeConnectivityService();
    remote = FakeRatingRemoteDataSource(
      FakeServer(environment: testEnvironment, connectivity: connectivity),
    );
    outbox = OutboxProcessor(database: db, connectivity: connectivity)..start();
    repository = RatingRepositoryImpl(
      remote: remote,
      database: db,
      outbox: outbox,
    );
    bookings = _MockBookingRepository();
    picker = _FakePicker();
  });

  tearDown(() async {
    await outbox.dispose();
    await db.close();
  });

  RateVisitCubit cubit() => RateVisitCubit(
    bookingId: 'bk1',
    getBooking: GetBooking(bookings),
    getRating: GetVisitRating(repository),
    submitRating: SubmitRating(repository),
    photoPicker: picker,
    photoStore: _KeepInPlace(),
    clock: () => joinedAt.add(const Duration(hours: 1)),
  );

  Future<RateVisitCubit> loaded(BookingStatus status) async {
    when(() => bookings.booking('bk1'))
        .thenAnswer((_) async => Ok(booking(status)));
    final c = cubit();
    addTearDown(c.close);
    await c.stream.firstWhere((s) => !s.isLoading);
    return c;
  }

  test('wait accuracy compares the promise with the real wait', () {
    final b = booking(BookingStatus.completed);
    expect(b.quotedWaitMinutes, 20);
    expect(b.actualWaitMinutes, 25);
  });

  test('rating opens only after the visit is completed', () async {
    final c = await loaded(BookingStatus.inService);
    expect(c.state.canRate, isFalse);
    c.setOverall(5);
    expect(c.state.canSubmit, isFalse);
  });

  test('overall stars pre-fill untouched details', () async {
    final c = await loaded(BookingStatus.completed)
      ..setCleanliness(2)
      ..setOverall(4);
    expect(c.state.quality, 4);
    expect(c.state.cleanliness, 2);
    expect(c.state.timeAccuracy, 4);
    expect(c.state.canSubmit, isTrue);
  });

  test('submits photos, tags and comment; sent at once when online', () async {
    final c = await loaded(BookingStatus.completed);
    c
      ..setOverall(5)
      ..toggleTag(RatingTag.lightHand)
      ..toggleTag(RatingTag.respectful)
      ..toggleTag(RatingTag.lightHand)
      ..setComment('  تمام جداً  ')
      ..setAnonymous(value: true);
    await c.addPhoto(PhotoSource.gallery);
    await c.submit();

    expect(c.state.status, RateSubmitStatus.done);
    await pumpEventQueue();
    final sent = remote.received['bk1']!;
    expect(sent.tags, {RatingTag.respectful});
    expect(sent.comment, 'تمام جداً');
    expect(sent.anonymous, isTrue);
    expect(sent.photoPaths, ['/app/ratings/bk1/0.jpg']);
    expect(await repository.isPending('bk1'), isFalse);
    expect((await repository.ratingFor('bk1'))?.overall, 5);
  });

  test('offline: saved locally and replayed when back online', () async {
    connectivity.setForcedOffline(value: true);
    final c = await loaded(BookingStatus.completed)
      ..setOverall(3);
    await c.submit();
    expect(c.state.status, RateSubmitStatus.done);
    expect(await repository.isPending('bk1'), isTrue);
    expect(remote.received.containsKey('bk1'), isFalse);

    connectivity.setForcedOffline(value: false);
    await outbox.flush();
    expect(remote.received['bk1']?.overall, 3);
    expect(await repository.isPending('bk1'), isFalse);
  });

  test('photo picker failure is reported, max photos respected', () async {
    final c = await loaded(BookingStatus.completed);
    picker.fail = true;
    await c.addPhoto(PhotoSource.camera);
    expect(c.state.photoFailed, isTrue);
    expect(c.state.photos, isEmpty);

    picker.fail = false;
    for (var i = 0; i < VisitRating.maxPhotos + 1; i++) {
      await c.addPhoto(PhotoSource.gallery);
    }
    expect(c.state.photos, hasLength(VisitRating.maxPhotos));
    expect(c.state.canAddPhoto, isFalse);
  });

  test('an already rated visit is recognized on open', () async {
    await repository.submit(
      VisitRating(
        bookingId: 'bk1',
        salonId: 's1',
        overall: 4,
        submittedAt: joinedAt,
      ),
    );
    final c = await loaded(BookingStatus.completed);
    expect(c.state.existing?.overall, 4);
  });
}
