import '../../../core/error/exceptions.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/fake_server.dart';
import '../../salon_details/data/salon_details_remote.dart';
import '../../salon_details/domain/salon_details.dart';
import '../../salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import '../domain/booking.dart';
import '../domain/booking_draft.dart';
import 'booking_models.dart';

abstract interface class BookingRemoteDataSource {
  Future<DaySchedule> daySchedule({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  });

  Future<Booking> confirm(BookingRequest request);

  Future<Booking> fetch(String bookingId);
}

final class ApiBookingRemoteDataSource implements BookingRemoteDataSource {
  const ApiBookingRemoteDataSource(this._api);

  final ApiClient _api;

  @override
  Future<DaySchedule> daySchedule({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  }) async {
    final date =
        '${day.year}-${day.month.toString().padLeft(2, '0')}-'
        '${day.day.toString().padLeft(2, '0')}';
    return BookingModel.scheduleFromJson(
      await _api.getJson(
        '/salons/$salonId/slots',
        query: {'date': date, 'duration': '$durationMinutes'},
      ),
    );
  }

  @override
  Future<Booking> confirm(BookingRequest request) async =>
      BookingModel.fromJson(
        await _api.postJson(
          '/bookings',
          body: BookingModel.requestToJson(request),
        ),
      );

  @override
  Future<Booking> fetch(String bookingId) async =>
      BookingModel.fromJson(await _api.getJson('/bookings/$bookingId'));
}

/// In-memory booking backend on top of the fake salon backends: slots follow
/// each salon's hours and barbers, joining "now" really adds a person to the
/// salon's live queue, and confirmed slots stop being bookable.
final class FakeBookingRemoteDataSource implements BookingRemoteDataSource {
  FakeBookingRemoteDataSource({
    required this._server,
    required this._catalog,
    required this._details,
    DateTime Function()? clock,
  }) : _clock = clock ?? DateTime.now;

  final FakeServer _server;
  final FakeSalonCatalogRemoteDataSource _catalog;
  final FakeSalonDetailsRemoteDataSource _details;
  final DateTime Function() _clock;

  static const slotStep = 30;

  /// Earliest bookable slot, so the customer has time to get there.
  static const leadTime = Duration(minutes: 20);

  final _bookings = <String, Booking>{};
  final _byRequest = <String, Booking>{};
  final _holds = <({String barberId, DateTime start, DateTime end})>[];
  var _nextId = 1;

  @override
  Future<DaySchedule> daySchedule({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  }) => _server(() => _schedule(salonId, day, durationMinutes));

  @override
  Future<Booking> confirm(BookingRequest request) => _server(
    () => _byRequest[request.requestId] ??= _confirm(request),
    // A commit that assigns a queue number feels heavier than a read.
    latency: const Duration(milliseconds: 1100),
  );

  @override
  Future<Booking> fetch(String bookingId) => _server(
    () => _bookings[bookingId] ?? (throw NotFoundException(bookingId)),
  );

  // ---- rules -----------------------------------------------------------------

  DaySchedule _schedule(String salonId, DateTime day, int durationMinutes) {
    final details = _details.detailsFor(salonId);
    if (details == null) throw NotFoundException('salon $salonId');
    final date = DateTime(day.year, day.month, day.day);
    final hours = details.hours
        .where((h) => h.weekday == date.weekday)
        .firstOrNull;
    if (hours == null || hours.isClosed) return DaySchedule.closed(date);

    final earliest = _clock().add(leadTime);
    return DaySchedule(
      day: date,
      slots: [
        for (
          var m = hours.opensAt!;
          m + durationMinutes <= hours.closesAt!;
          m += slotStep
        )
          if (date.add(Duration(minutes: m)) case final start
              when !start.isBefore(earliest))
            TimeSlot(
              start: start,
              freeBarberIds: {
                for (final b in details.barbers)
                  if (_isFree(salonId, b, date, start, durationMinutes)) b.id,
              },
            ),
      ],
    );
  }

  /// [workingDay] is the day the shift started: a 00:30 slot on a salon
  /// open until 1 AM still belongs to the previous day's shift.
  bool _isFree(
    String salonId,
    Barber barber,
    DateTime workingDay,
    DateTime start,
    int minutes,
  ) {
    if (barber.availability case BarberOff(:final returnsOn)
        when workingDay.isBefore(returnsOn)) {
      return false;
    }
    final end = start.add(Duration(minutes: minutes));
    final held = _holds.any(
      (h) =>
          h.barberId == barber.id &&
          start.isBefore(h.end) &&
          h.start.isBefore(end),
    );
    if (held) return false;
    // Other customers' appointments: evenings are busier.
    final busyOutOf10 = start.hour >= 18 ? 5 : 3;
    return _stableHash('$salonId|${barber.id}|${start.toIso8601String()}') %
            10 >=
        busyOutOf10;
  }

  Booking _confirm(BookingRequest request) {
    final details = _details.detailsFor(request.salonId);
    if (details == null) throw NotFoundException('salon ${request.salonId}');
    final named = switch (request.barber) {
      NamedBarber(:final id) =>
        details.barbers.where((b) => b.id == id).firstOrNull ??
            (throw const RuleException(BookingRuleCodes.barberUnavailable)),
      AnyBarber() => null,
    };

    Booking booking({
      required BookingStatus status,
      int? ticketNumber,
      int peopleAhead = 0,
      int waitMinutes = 0,
    }) => Booking(
      id: 'bk${_nextId++}',
      salonId: details.id,
      salonName: details.summary.name,
      salonArea: details.summary.areaName,
      salonAddress: details.address,
      latitude: details.latitude,
      longitude: details.longitude,
      services: request.services,
      timing: request.timing,
      status: status,
      quote: BookingPricing.quote(request.services, details.offers),
      createdAt: _clock(),
      barberId: named?.id,
      barberName: named?.name,
      ticketNumber: ticketNumber,
      peopleAhead: peopleAhead,
      waitMinutes: waitMinutes,
    );

    final result = switch (request.timing) {
      JoinNow() => _joinNow(request, details, named, booking),
      ScheduledSlot(:final start) => _bookSlot(request, start, named, booking),
    };
    _bookings[result.id] = result;
    return result;
  }

  Booking _joinNow(
    BookingRequest request,
    SalonDetails details,
    Barber? named,
    Booking Function({
      required BookingStatus status,
      int? ticketNumber,
      int peopleAhead,
      int waitMinutes,
    })
    build,
  ) {
    if (!details.summary.isOpen) {
      throw const RuleException(BookingRuleCodes.salonClosed);
    }
    final active = _bookings.values
        .where((b) => b.status == BookingStatus.waiting)
        .firstOrNull;
    if (active != null) {
      throw RuleException(
        BookingRuleCodes.alreadyInQueue,
        data: {'bookingId': active.id},
      );
    }
    if (named != null && named.availability is! BarberWorking) {
      throw const RuleException(BookingRuleCodes.barberUnavailable);
    }
    final before = _catalog.joinQueue(request.salonId);
    final load = switch (named?.availability) {
      BarberWorking(:final queue) => queue,
      _ => before,
    };
    return build(
      status: BookingStatus.waiting,
      ticketNumber: load.peopleAhead + 1,
      peopleAhead: load.peopleAhead,
      waitMinutes: load.waitMinutes,
    );
  }

  Booking _bookSlot(
    BookingRequest request,
    DateTime start,
    Barber? named,
    Booking Function({required BookingStatus status}) build,
  ) {
    final schedule = _schedule(request.salonId, start, request.totalMinutes);
    final slot = schedule.slots.where((s) => s.start == start).firstOrNull;
    if (slot == null || !slot.isAvailable) {
      throw const RuleException(BookingRuleCodes.slotTaken);
    }
    final barberId = named?.id ?? slot.freeBarberIds.first;
    if (!slot.freeBarberIds.contains(barberId)) {
      throw RuleException(
        named?.availability is BarberOff
            ? BookingRuleCodes.barberUnavailable
            : BookingRuleCodes.slotTaken,
      );
    }
    _holds.add((
      barberId: barberId,
      start: start,
      end: start.add(Duration(minutes: request.totalMinutes)),
    ));
    return build(status: BookingStatus.upcoming);
  }

  /// Same value on every run (String.hashCode is not stable across runs).
  static int _stableHash(String value) {
    var hash = 17;
    for (final unit in value.codeUnits) {
      hash = (hash * 31 + unit) & 0x7fffffff;
    }
    // Avalanche: ids differing in one character must not give related
    // values, or two barbers would never be busy at the same time.
    hash ^= hash >> 15;
    hash = (hash * 0x2c1b3c6d) & 0x7fffffff;
    hash ^= hash >> 12;
    hash = (hash * 0x297a2d39) & 0x7fffffff;
    return hash ^ (hash >> 15);
  }
}
