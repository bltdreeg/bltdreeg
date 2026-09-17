import 'package:equatable/equatable.dart';

import '../../../core/l10n_data/localized_text.dart';
import '../../../core/utils/result.dart';
import '../../salon_details/domain/salon_details.dart';
import 'booking_draft.dart';

/// Lifecycle of a booking. The queue screen (27-30) and the bookings list
/// (09-11) move it past [waiting] / [upcoming].
enum BookingStatus {
  waiting,
  upcoming,
  inService,
  completed,
  cancelled,
  missed,
}

/// A discount applied at review (e.g. the "قصة + دقن" bundle).
final class AppliedDiscount extends Equatable {
  const AppliedDiscount({required this.offerId, required this.amount});

  final String offerId;
  final int amount;

  @override
  List<Object?> get props => [offerId, amount];
}

final class BookingQuote extends Equatable {
  const BookingQuote({required this.subtotal, this.discounts = const []});

  final int subtotal;
  final List<AppliedDiscount> discounts;

  int get discountTotal => discounts.fold(0, (sum, d) => sum + d.amount);
  int get total => subtotal - discountTotal;

  @override
  List<Object?> get props => [subtotal, discounts];
}

abstract final class BookingPricing {
  /// Applies every bundle whose services are all selected. A service counts
  /// toward one bundle at most; bundles are tried in the salon's order.
  static BookingQuote quote(
    List<SelectedService> services,
    List<SalonOffer> offers,
  ) {
    final prices = {for (final s in services) s.id: s.price};
    final used = <String>{};
    final discounts = <AppliedDiscount>[];
    for (final offer in offers) {
      if (offer.kind != OfferKind.bundle ||
          offer.price == null ||
          offer.serviceIds.isEmpty ||
          !offer.serviceIds.every(
            (id) => prices.containsKey(id) && !used.contains(id),
          )) {
        continue;
      }
      final regular = offer.serviceIds.fold(0, (sum, id) => sum + prices[id]!);
      final saving = regular - offer.price!;
      if (saving <= 0) continue;
      used.addAll(offer.serviceIds);
      discounts.add(AppliedDiscount(offerId: offer.id, amount: saving));
    }
    return BookingQuote(
      subtotal: prices.values.fold(0, (sum, p) => sum + p),
      discounts: discounts,
    );
  }
}

/// Wait shown as a range ("10 to 15 min"), not a single number the salon
/// can't promise (board note on frame 25).
final class WaitEstimate extends Equatable {
  const WaitEstimate({required this.minMinutes, required this.maxMinutes});

  factory WaitEstimate.around(int minutes) {
    if (minutes <= 0) return const WaitEstimate(minMinutes: 0, maxMinutes: 0);
    final low = (minutes * 0.8 / 5).round() * 5;
    final high = (minutes * 1.2 / 5).ceil() * 5;
    return WaitEstimate(
      minMinutes: low,
      maxMinutes: high > low ? high : low + 5,
    );
  }

  final int minMinutes;
  final int maxMinutes;

  bool get isImmediate => maxMinutes == 0;

  @override
  List<Object?> get props => [minMinutes, maxMinutes];
}

final class Booking extends Equatable {
  const Booking({
    required this.id,
    required this.salonId,
    required this.salonName,
    required this.salonArea,
    required this.salonAddress,
    required this.latitude,
    required this.longitude,
    required this.services,
    required this.timing,
    required this.status,
    required this.quote,
    required this.createdAt,
    this.barberId,
    this.barberName,
    this.ticketNumber,
    this.peopleAhead = 0,
    this.waitMinutes = 0,
  });

  final String id;
  final String salonId;
  final String salonName;
  final LocalizedText salonArea;
  final LocalizedText salonAddress;
  final double latitude;
  final double longitude;
  final List<SelectedService> services;
  final BookingTiming timing;
  final BookingStatus status;
  final BookingQuote quote;
  final DateTime createdAt;

  /// Null means "any available barber".
  final String? barberId;
  final String? barberName;

  /// Queue position ("رقم دورك") for [JoinNow] bookings.
  final int? ticketNumber;
  final int peopleAhead;
  final int waitMinutes;

  bool get isQueue => timing is JoinNow;
  int get totalMinutes => services.fold(0, (sum, s) => sum + s.durationMinutes);

  @override
  List<Object?> get props => [
    id,
    salonId,
    salonName,
    salonArea,
    salonAddress,
    latitude,
    longitude,
    services,
    timing,
    status,
    quote,
    createdAt,
    barberId,
    barberName,
    ticketNumber,
    peopleAhead,
    waitMinutes,
  ];
}

final class TimeSlot extends Equatable {
  const TimeSlot({required this.start, required this.freeBarberIds});

  final DateTime start;
  final Set<String> freeBarberIds;

  bool get isAvailable => freeBarberIds.isNotEmpty;

  @override
  List<Object?> get props => [start, freeBarberIds];
}

/// Bookable times for one day, sized for the selected services.
final class DaySchedule extends Equatable {
  const DaySchedule({required this.day, required this.slots});

  const DaySchedule.closed(this.day) : slots = const [];

  final DateTime day;
  final List<TimeSlot> slots;

  bool get hasAvailability => slots.any((s) => s.isAvailable);

  @override
  List<Object?> get props => [day, slots];
}

final class BookingRequest extends Equatable {
  const BookingRequest({
    required this.requestId,
    required this.salonId,
    required this.services,
    required this.timing,
    required this.barber,
  });

  factory BookingRequest.fromDraft(BookingDraft draft, String requestId) =>
      BookingRequest(
        requestId: requestId,
        salonId: draft.salonId,
        services: draft.services,
        timing: draft.timing!,
        barber: draft.barber,
      );

  /// Idempotency key: retrying the same review screen never books twice.
  final String requestId;
  final String salonId;
  final List<SelectedService> services;
  final BookingTiming timing;
  final BarberChoice barber;

  int get totalMinutes => services.fold(0, (sum, s) => sum + s.durationMinutes);

  @override
  List<Object?> get props => [requestId, salonId, services, timing, barber];
}

/// [RuleFailure] codes returned when confirming.
abstract final class BookingRuleCodes {
  static const slotTaken = 'slot_taken';
  static const barberUnavailable = 'barber_unavailable';
  static const salonClosed = 'salon_closed';

  /// `data['bookingId']` is the active queue booking.
  static const alreadyInQueue = 'already_in_queue';
}

abstract interface class BookingRepository {
  Future<Result<DaySchedule>> daySchedule({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  });

  /// Needs a connection: the queue number is assigned by the server.
  Future<Result<Booking>> confirm(BookingRequest request);

  /// Cached copy first (works offline and from deep links), then server.
  Future<Result<Booking>> booking(String bookingId);
}
