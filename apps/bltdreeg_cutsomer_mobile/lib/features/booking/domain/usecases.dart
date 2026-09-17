import '../../../core/utils/result.dart';
import 'booking.dart';
import 'booking_draft.dart';

final class GetDaySchedule {
  const GetDaySchedule(this._repository);

  final BookingRepository _repository;

  Future<Result<DaySchedule>> call({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  }) => _repository.daySchedule(
    salonId: salonId,
    day: DateTime(day.year, day.month, day.day),
    durationMinutes: durationMinutes,
  );
}

/// Confirms a complete draft and clears it on success, so going back to the
/// salon page starts a fresh selection.
final class ConfirmBooking {
  const ConfirmBooking(this._repository, this._drafts);

  final BookingRepository _repository;
  final BookingDraftRepository _drafts;

  Future<Result<Booking>> call(BookingDraft draft, String requestId) async {
    assert(draft.isReadyForBarber, 'Confirming an incomplete draft');
    final result = await _repository.confirm(
      BookingRequest.fromDraft(draft, requestId),
    );
    if (result.isOk) _drafts.clear(draft.salonId);
    return result;
  }
}

final class GetBooking {
  const GetBooking(this._repository);

  final BookingRepository _repository;

  Future<Result<Booking>> call(String bookingId) =>
      _repository.booking(bookingId);
}
