import 'dart:convert';

import '../../../core/database/app_database.dart';
import '../../../core/utils/result.dart';
import '../domain/booking.dart';
import 'booking_models.dart';
import 'booking_remote.dart';

final class BookingRepositoryImpl implements BookingRepository {
  BookingRepositoryImpl({required this._remote, required AppDatabase database})
    : _db = database;

  final BookingRemoteDataSource _remote;
  final AppDatabase _db;

  static String _key(String id) => 'booking:$id';

  @override
  Future<Result<DaySchedule>> daySchedule({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  }) => guardResult(
    () => _remote.daySchedule(
      salonId: salonId,
      day: day,
      durationMinutes: durationMinutes,
    ),
  );

  // Not queued in the outbox: the customer needs the queue number (or the
  // slot rejection) right away, so confirming requires a connection.
  @override
  Future<Result<Booking>> confirm(BookingRequest request) =>
      guardResult(() async => _save(await _remote.confirm(request)));

  @override
  Future<Result<Booking>> booking(String bookingId) async {
    final cached = await _db.readCache(_key(bookingId));
    if (cached != null) {
      return Ok(
        BookingModel.fromJson(
          jsonDecode(cached.payload) as Map<String, Object?>,
        ),
      );
    }
    return guardResult(() async => _save(await _remote.fetch(bookingId)));
  }

  Future<Booking> _save(Booking booking) async {
    await _db.writeCache(
      _key(booking.id),
      jsonEncode(BookingModel.toJson(booking)),
    );
    return booking;
  }
}
