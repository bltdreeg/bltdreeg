import '../../../core/l10n_data/localized_text.dart';
import '../domain/booking.dart';
import '../domain/booking_draft.dart';

/// JSON mapping for bookings (REST payloads and the drift cache).
abstract final class BookingModel {
  static Booking fromJson(Map<String, Object?> j) => Booking(
    id: j['id']! as String,
    salonId: j['salon_id']! as String,
    salonName: j['salon_name']! as String,
    salonArea: LocalizedText.fromJson(j['salon_area']! as Map<String, Object?>),
    salonAddress: LocalizedText.fromJson(
      j['salon_address']! as Map<String, Object?>,
    ),
    latitude: (j['lat']! as num).toDouble(),
    longitude: (j['lng']! as num).toDouble(),
    services: [for (final s in _list(j['services'])) serviceFromJson(s)],
    timing: timingFromJson(j['timing']! as Map<String, Object?>),
    status: BookingStatus.values.byName(j['status']! as String),
    quote: BookingQuote(
      subtotal: j['subtotal']! as int,
      discounts: [
        for (final d in _list(j['discounts']))
          AppliedDiscount(
            offerId: d['offer_id']! as String,
            amount: d['amount']! as int,
          ),
      ],
    ),
    createdAt: DateTime.parse(j['created_at']! as String),
    barberId: j['barber_id'] as String?,
    barberName: j['barber_name'] as String?,
    ticketNumber: j['ticket_number'] as int?,
    peopleAhead: j['people_ahead'] as int? ?? 0,
    waitMinutes: j['wait_minutes'] as int? ?? 0,
    turnStartedAt: switch (j['turn_started_at']) {
      final String iso => DateTime.parse(iso),
      _ => null,
    },
    postponeUsed: j['postpone_used'] as bool? ?? false,
  );

  static Map<String, Object?> toJson(Booking b) => {
    'id': b.id,
    'salon_id': b.salonId,
    'salon_name': b.salonName,
    'salon_area': b.salonArea.toJson(),
    'salon_address': b.salonAddress.toJson(),
    'lat': b.latitude,
    'lng': b.longitude,
    'services': [for (final s in b.services) serviceToJson(s)],
    'timing': timingToJson(b.timing),
    'status': b.status.name,
    'subtotal': b.quote.subtotal,
    'discounts': [
      for (final d in b.quote.discounts)
        {'offer_id': d.offerId, 'amount': d.amount},
    ],
    'created_at': b.createdAt.toIso8601String(),
    'barber_id': b.barberId,
    'barber_name': b.barberName,
    'ticket_number': b.ticketNumber,
    'people_ahead': b.peopleAhead,
    'wait_minutes': b.waitMinutes,
    'turn_started_at': b.turnStartedAt?.toIso8601String(),
    'postpone_used': b.postponeUsed,
  };

  static Map<String, Object?> requestToJson(BookingRequest r) => {
    'request_id': r.requestId,
    'salon_id': r.salonId,
    'service_ids': [for (final s in r.services) s.id],
    'timing': timingToJson(r.timing),
    'barber_id': switch (r.barber) {
      NamedBarber(:final id) => id,
      AnyBarber() => null,
    },
  };

  static DaySchedule scheduleFromJson(Map<String, Object?> j) => DaySchedule(
    day: DateTime.parse(j['day']! as String),
    slots: [
      for (final s in _list(j['slots']))
        TimeSlot(
          start: DateTime.parse(s['start']! as String),
          freeBarberIds: {
            for (final id in s['free_barber_ids']! as List<Object?>)
              id! as String,
          },
        ),
    ],
  );

  static SelectedService serviceFromJson(Map<String, Object?> j) =>
      SelectedService(
        id: j['id']! as String,
        name: j['name']! as String,
        durationMinutes: j['duration']! as int,
        price: j['price']! as int,
      );

  static Map<String, Object?> serviceToJson(SelectedService s) => {
    'id': s.id,
    'name': s.name,
    'duration': s.durationMinutes,
    'price': s.price,
  };

  static BookingTiming timingFromJson(Map<String, Object?> j) =>
      switch (j['type']) {
        'slot' => ScheduledSlot(start: DateTime.parse(j['start']! as String)),
        _ => const JoinNow(),
      };

  static Map<String, Object?> timingToJson(BookingTiming t) => switch (t) {
    JoinNow() => {'type': 'now'},
    ScheduledSlot(:final start) => {
      'type': 'slot',
      'start': start.toIso8601String(),
    },
  };

  static Iterable<Map<String, Object?>> _list(Object? value) =>
      (value as List<Object?>? ?? const []).cast<Map<String, Object?>>();
}
