import 'package:equatable/equatable.dart';

import '../../../core/error/failures.dart';
import '../../../core/l10n_data/localized_text.dart';
import '../../../core/utils/result.dart';
import '../../salon_details/domain/salon_details.dart';
import 'booking_draft.dart';

/// Lifecycle of a booking. Queue bookings go waiting → yourTurn → inService
/// → completed; scheduled ones start as upcoming. cancelled (the customer
/// left) and missed (didn't show up) are final.
enum BookingStatus {
  waiting,
  yourTurn,
  upcoming,
  inService,
  completed,
  cancelled,
  missed;

  bool get isActive => switch (this) {
    waiting || yourTurn || upcoming || inService => true,
    completed || cancelled || missed => false,
  };
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
    this.turnStartedAt,
    this.postponeUsed = false,
  });

  /// How long the customer has to show up once it's their turn (frame 29).
  static const turnGrace = Duration(minutes: 5);

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

  /// When [BookingStatus.yourTurn] started; the grace countdown runs from it.
  final DateTime? turnStartedAt;

  /// "أجّلني واحد" can be used once per booking.
  final bool postponeUsed;

  bool get isQueue => timing is JoinNow;

  DateTime? get turnDeadline => turnStartedAt?.add(turnGrace);

  Booking copyWith({
    BookingStatus? status,
    int? peopleAhead,
    int? waitMinutes,
    DateTime? turnStartedAt,
    bool clearTurnStartedAt = false,
    bool? postponeUsed,
  }) => Booking(
    id: id,
    salonId: salonId,
    salonName: salonName,
    salonArea: salonArea,
    salonAddress: salonAddress,
    latitude: latitude,
    longitude: longitude,
    services: services,
    timing: timing,
    status: status ?? this.status,
    quote: quote,
    createdAt: createdAt,
    barberId: barberId,
    barberName: barberName,
    ticketNumber: ticketNumber,
    peopleAhead: peopleAhead ?? this.peopleAhead,
    waitMinutes: waitMinutes ?? this.waitMinutes,
    turnStartedAt: clearTurnStartedAt
        ? null
        : turnStartedAt ?? this.turnStartedAt,
    postponeUsed: postponeUsed ?? this.postponeUsed,
  );
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
    turnStartedAt,
    postponeUsed,
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

  /// Queue actions on a booking in the wrong state.
  static const notYourTurn = 'not_your_turn';
  static const postponeUsed = 'postpone_used';
  static const bookingFinished = 'booking_finished';
}

/// What the queue screen shows (frames 27-30).
enum QueueStage {
  waiting,
  approaching,
  yourTurn,
  inService,
  completed,
  cancelled,
  missed,
  upcoming,
}

extension BookingQueueStage on Booking {
  QueueStage get stage => switch (status) {
    BookingStatus.waiting when peopleAhead <= 1 => QueueStage.approaching,
    BookingStatus.waiting => QueueStage.waiting,
    BookingStatus.yourTurn => QueueStage.yourTurn,
    BookingStatus.upcoming => QueueStage.upcoming,
    BookingStatus.inService => QueueStage.inService,
    BookingStatus.completed => QueueStage.completed,
    BookingStatus.cancelled => QueueStage.cancelled,
    BookingStatus.missed => QueueStage.missed,
  };
}

final class BookingSnapshot extends Equatable {
  const BookingSnapshot({this.booking, this.isLive = false, this.failure});

  final Booking? booking;

  /// Receiving live pushes right now; false shows "not updated".
  final bool isLive;
  final Failure? failure;

  BookingSnapshot copyWith({
    Booking? booking,
    bool? isLive,
    Failure? failure,
    bool clearFailure = false,
  }) => BookingSnapshot(
    booking: booking ?? this.booking,
    isLive: isLive ?? this.isLive,
    failure: clearFailure ? null : failure ?? this.failure,
  );

  @override
  List<Object?> get props => [booking, isLive, failure];
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

  /// Offline-first live booking: cache, then server, then pushes.
  Stream<BookingSnapshot> watch(String bookingId);

  Future<void> refresh(String bookingId);

  /// "أنا في المحل" (frame 29).
  Future<Result<Booking>> checkIn(String bookingId);

  /// "أجّلني واحد": back one place, once per booking.
  Future<Result<Booking>> postpone(String bookingId);

  /// Leave the queue (frame 30) or cancel a scheduled booking.
  Future<Result<Booking>> leave(String bookingId);
}
