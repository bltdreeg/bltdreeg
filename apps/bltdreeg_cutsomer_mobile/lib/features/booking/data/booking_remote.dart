import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/error/exceptions.dart';
import '../../../core/l10n_data/localized_text.dart';
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

  /// The signed-in customer's bookings.
  Future<List<Booking>> fetchMine();

  /// Live pushes of the booking as the queue moves.
  Stream<Booking> watch(String bookingId);

  /// Live pushes for any of the customer's bookings (the list screen).
  Stream<Booking> watchMinePushes();

  Future<Booking> checkIn(String bookingId);

  Future<Booking> postpone(String bookingId);

  Future<Booking> leave(String bookingId);
}

final class ApiBookingRemoteDataSource implements BookingRemoteDataSource {
  const ApiBookingRemoteDataSource(this._api, this._env);

  final ApiClient _api;
  final AppEnvironment _env;

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

  @override
  Future<List<Booking>> fetchMine() async {
    final json = await _api.getJson('/me/bookings');
    return [
      for (final b in json['bookings']! as List<Object?>)
        BookingModel.fromJson(b! as Map<String, Object?>),
    ];
  }

  @override
  Stream<Booking> watch(String bookingId) {
    final channel = WebSocketChannel.connect(
      Uri.parse('${_env.queueSocketUrl}/bookings/$bookingId'),
    );
    return channel.stream.map(
      (message) => BookingModel.fromJson(
        jsonDecode(message as String) as Map<String, Object?>,
      ),
    );
  }

  @override
  Stream<Booking> watchMinePushes() {
    final channel = WebSocketChannel.connect(
      Uri.parse('${_env.queueSocketUrl}/me/bookings'),
    );
    return channel.stream.map(
      (message) => BookingModel.fromJson(
        jsonDecode(message as String) as Map<String, Object?>,
      ),
    );
  }

  @override
  Future<Booking> checkIn(String bookingId) => _action(bookingId, 'check-in');

  @override
  Future<Booking> postpone(String bookingId) => _action(bookingId, 'postpone');

  @override
  Future<Booking> leave(String bookingId) => _action(bookingId, 'leave');

  Future<Booking> _action(String bookingId, String action) async =>
      BookingModel.fromJson(
        await _api.postJson('/bookings/$bookingId/$action'),
      );
}

/// In-memory booking backend on top of the fake salon backends: slots follow
/// each salon's hours and barbers, joining "now" really adds a person to the
/// salon's live queue, and confirmed slots stop being bookable.
///
/// Queue bookings move on their own: every [queueStepInterval] the person at
/// the front finishes. At the front the customer has [Booking.turnGrace] to
/// check in, is postponed once if they don't, then marked missed. A checked
/// in service completes after three steps.
final class FakeBookingRemoteDataSource implements BookingRemoteDataSource {
  FakeBookingRemoteDataSource({
    required this._server,
    required this._catalog,
    required this._details,
    this.queueStepInterval,
    DateTime Function()? clock,
  }) : _clock = clock ?? DateTime.now {
    _seedHistory();
  }

  /// Null: the queue only moves through [tick] (tests).
  final Duration? queueStepInterval;

  static const serviceSteps = 3;

  final FakeServer _server;
  final FakeSalonCatalogRemoteDataSource _catalog;
  final FakeSalonDetailsRemoteDataSource _details;
  final DateTime Function() _clock;

  static const slotStep = 30;

  /// Earliest bookable slot, so the customer has time to get there.
  static const leadTime = Duration(minutes: 20);

  final _bookings = <String, Booking>{};

  /// Idempotency: request id → booking id.
  final _requestIds = <String, String>{};
  final _holds =
      <({String bookingId, String barberId, DateTime start, DateTime end})>[];
  final _serviceSteps = <String, int>{};
  var _nextId = 1;

  // Lives as long as this data source (an app-lifetime singleton).
  // ignore: close_sinks
  final _pushes = StreamController<Booking>.broadcast();
  Timer? _ticker;

  @override
  Future<DaySchedule> daySchedule({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  }) => _server(() => _schedule(salonId, day, durationMinutes));

  @override
  Future<Booking> confirm(BookingRequest request) => _server(
    () {
      if (_requestIds[request.requestId] case final id?) return _bookings[id]!;
      final booking = _confirm(request);
      _requestIds[request.requestId] = booking.id;
      _ensureTicker();
      return booking;
    },
    // A commit that assigns a queue number feels heavier than a read.
    latency: const Duration(milliseconds: 1100),
  );

  @override
  Future<Booking> fetch(String bookingId) => _server(() => _require(bookingId));

  @override
  Future<List<Booking>> fetchMine() => _server(() => _bookings.values.toList());

  /// Past visits so the bookings list has history on a fresh install
  /// (frame 10): one rated, one waiting for a rating, one no-show.
  void _seedHistory() {
    final now = _clock();
    Booking past({
      required String id,
      required String salonId,
      required String name,
      required LocalizedText area,
      required List<SelectedService> services,
      required BookingStatus status,
      required Duration ago,
      String? barberName,
      int discount = 0,
    }) {
      final at = now.subtract(ago);
      return Booking(
        id: id,
        salonId: salonId,
        salonName: name,
        salonArea: area,
        salonAddress: area,
        latitude: 29.96,
        longitude: 31.25,
        services: services,
        timing: const JoinNow(),
        status: status,
        quote: BookingQuote(
          subtotal: services.fold(0, (sum, s) => sum + s.price),
          discounts: discount == 0
              ? const []
              : [AppliedDiscount(offerId: '$salonId-o2', amount: discount)],
        ),
        createdAt: at.subtract(const Duration(minutes: 25)),
        barberName: barberName,
        barberId: barberName == null ? null : '$salonId-b1',
        ticketNumber: 4,
        quotedWaitMinutes: 20,
        servedAt: status == BookingStatus.missed ? null : at,
      );
    }

    const maadi = LocalizedText(ar: 'المعادي', en: 'Maadi');
    for (final booking in [
      past(
        id: 'bk-past-1',
        salonId: 's1',
        name: 'صالون الكابتن حسام',
        area: maadi,
        services: const [
          SelectedService(
            id: 's1-haircut',
            name: 'قصة شعر',
            durationMinutes: 25,
            price: 70,
          ),
          SelectedService(
            id: 's1-beard',
            name: 'حلاقة دقن',
            durationMinutes: 15,
            price: 50,
          ),
        ],
        status: BookingStatus.completed,
        ago: const Duration(days: 6, hours: 2),
        barberName: 'أحمد مجدي',
      ),
      past(
        id: 'bk-past-2',
        salonId: 's3',
        name: 'بربر لاونج المعادي',
        area: const LocalizedText(ar: 'المعادي الجديدة', en: 'New Maadi'),
        services: const [
          SelectedService(
            id: 's3-haircut',
            name: 'قصة شعر',
            durationMinutes: 25,
            price: 90,
          ),
        ],
        status: BookingStatus.completed,
        ago: const Duration(days: 18, hours: 3),
        barberName: 'محمود السيد',
      ),
      past(
        id: 'bk-past-3',
        salonId: 's5',
        name: 'حلاق الأسطى رجب',
        area: maadi,
        services: const [
          SelectedService(
            id: 's5-beard',
            name: 'حلاقة دقن',
            durationMinutes: 15,
            price: 45,
          ),
        ],
        status: BookingStatus.missed,
        ago: const Duration(days: 29, hours: 5),
      ),
    ]) {
      _bookings[booking.id] = booking;
    }
  }

  @override
  Stream<Booking> watch(String bookingId) =>
      _pushes.stream.where((b) => b.id == bookingId);

  @override
  Stream<Booking> watchMinePushes() => _pushes.stream;

  @override
  Future<Booking> checkIn(String bookingId) => _server(() {
    final booking = _require(bookingId);
    _requireActive(booking);
    if (booking.status != BookingStatus.yourTurn) {
      throw const RuleException(BookingRuleCodes.notYourTurn);
    }
    _serviceSteps[bookingId] = 0;
    return _update(
      booking.copyWith(
        status: BookingStatus.inService,
        clearTurnStartedAt: true,
        servedAt: _clock(),
      ),
    );
  });

  @override
  Future<Booking> postpone(String bookingId) => _server(() {
    final booking = _require(bookingId);
    _requireActive(booking);
    if (booking.status != BookingStatus.yourTurn) {
      throw const RuleException(BookingRuleCodes.notYourTurn);
    }
    if (booking.postponeUsed) {
      throw const RuleException(BookingRuleCodes.postponeUsed);
    }
    return _update(_postponed(booking));
  });

  @override
  Future<Booking> leave(String bookingId) => _server(() {
    final booking = _require(bookingId);
    _requireActive(booking);
    if (booking.status == BookingStatus.inService) {
      throw const RuleException(BookingRuleCodes.bookingFinished);
    }
    if (booking.isQueue) {
      _catalog.leaveQueue(booking.salonId);
    } else {
      _holds.removeWhere((h) => h.bookingId == bookingId);
    }
    return _update(booking.copyWith(status: BookingStatus.cancelled));
  });

  /// Moves every running queue booking one step (see the class docs).
  void tick() {
    if (!_server.isOnline) {
      if (_pushes.hasListener) {
        _pushes.addError(const NetworkException('fake-socket: disconnected'));
      }
      return;
    }
    final now = _clock();
    for (final booking in [..._bookings.values]) {
      final next = _advance(booking, now);
      if (next != booking) _update(next);
    }
    if (!_bookings.values.any(_isRunning)) {
      _ticker?.cancel();
      _ticker = null;
    }
  }

  Booking _advance(Booking booking, DateTime now) {
    switch (booking.status) {
      case BookingStatus.waiting:
        // The customer at the front finished.
        _catalog.leaveQueue(booking.salonId);
        final ahead = booking.peopleAhead - 1;
        if (ahead <= 0) {
          return booking.copyWith(
            status: BookingStatus.yourTurn,
            peopleAhead: 0,
            waitMinutes: 0,
            turnStartedAt: now,
          );
        }
        return booking.copyWith(
          peopleAhead: ahead,
          waitMinutes: ahead * _catalog.minutesPerPerson(booking.salonId),
        );
      case BookingStatus.yourTurn:
        if (now.isBefore(booking.turnDeadline!)) return booking;
        return booking.postponeUsed
            ? booking.copyWith(
                status: BookingStatus.missed,
                clearTurnStartedAt: true,
              )
            : _postponed(booking);
      case BookingStatus.inService:
        final steps = (_serviceSteps[booking.id] ?? 0) + 1;
        _serviceSteps[booking.id] = steps;
        return steps >= serviceSteps
            ? booking.copyWith(status: BookingStatus.completed)
            : booking;
      case BookingStatus.upcoming ||
          BookingStatus.completed ||
          BookingStatus.cancelled ||
          BookingStatus.missed:
        return booking;
    }
  }

  Booking _postponed(Booking booking) => booking.copyWith(
    status: BookingStatus.waiting,
    peopleAhead: 1,
    waitMinutes: _catalog.minutesPerPerson(booking.salonId),
    clearTurnStartedAt: true,
    postponeUsed: true,
  );

  static bool _isRunning(Booking b) =>
      b.isQueue &&
      (b.status == BookingStatus.waiting ||
          b.status == BookingStatus.yourTurn ||
          b.status == BookingStatus.inService);

  void _ensureTicker() {
    final interval = queueStepInterval;
    if (interval == null || _ticker != null) return;
    if (!_bookings.values.any(_isRunning)) return;
    _ticker = Timer.periodic(interval, (_) => tick());
  }

  Booking _require(String bookingId) =>
      _bookings[bookingId] ?? (throw NotFoundException(bookingId));

  static void _requireActive(Booking booking) {
    if (!booking.status.isActive) {
      throw const RuleException(BookingRuleCodes.bookingFinished);
    }
  }

  Booking _update(Booking booking) {
    _bookings[booking.id] = booking;
    if (_pushes.hasListener) _pushes.add(booking);
    return booking;
  }

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
      quotedWaitMinutes: request.timing is JoinNow ? waitMinutes : null,
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
        .where((b) => b.isQueue && b.status.isActive)
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
    final booking = build(
      status: BookingStatus.waiting,
      ticketNumber: load.peopleAhead + 1,
      peopleAhead: load.peopleAhead,
      waitMinutes: load.waitMinutes,
    );
    // Nobody ahead: the turn starts right away.
    return load.peopleAhead == 0
        ? booking.copyWith(
            status: BookingStatus.yourTurn,
            turnStartedAt: _clock(),
          )
        : booking;
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
      bookingId: 'bk$_nextId',
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
