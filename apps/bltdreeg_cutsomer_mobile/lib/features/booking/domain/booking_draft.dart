import 'package:equatable/equatable.dart';

/// A service picked on the salon page. Carries what the booking flow needs
/// so it doesn't have to refetch the menu.
final class SelectedService extends Equatable {
  const SelectedService({
    required this.id,
    required this.name,
    required this.durationMinutes,
    required this.price,
  });

  final String id;
  final String name;
  final int durationMinutes;
  final int price;

  @override
  List<Object?> get props => [id, name, durationMinutes, price];
}

/// When the customer comes: join the live queue now, or a scheduled slot.
sealed class BookingTiming extends Equatable {
  const BookingTiming();
}

final class JoinNow extends BookingTiming {
  const JoinNow();

  @override
  List<Object?> get props => const [];
}

final class ScheduledSlot extends BookingTiming {
  const ScheduledSlot({required this.start, this.freeBarberIds = const {}});

  final DateTime start;

  /// Barbers free at [start] when the slot was picked, so the barber step
  /// doesn't refetch. The server re-checks on confirmation.
  final Set<String> freeBarberIds;

  @override
  List<Object?> get props => [start, freeBarberIds];
}

sealed class BarberChoice extends Equatable {
  const BarberChoice();
}

/// "أي حلاق متاح": the first free barber (the default and fastest).
final class AnyBarber extends BarberChoice {
  const AnyBarber();

  @override
  List<Object?> get props => const [];
}

final class NamedBarber extends BarberChoice {
  const NamedBarber({required this.id, required this.name});

  final String id;
  final String name;

  @override
  List<Object?> get props => [id, name];
}

/// Work-in-progress booking for one salon. Starts on the salon page (services)
/// and is completed by the booking flow (time, barber, review).
final class BookingDraft extends Equatable {
  const BookingDraft({
    required this.salonId,
    this.services = const [],
    this.timing,
    this.barber = const AnyBarber(),
  });

  final String salonId;
  final List<SelectedService> services;

  /// Null until the customer picks "now" or a slot.
  final BookingTiming? timing;
  final BarberChoice barber;

  bool get isEmpty => services.isEmpty;
  int get totalPrice => services.fold(0, (sum, s) => sum + s.price);
  int get totalMinutes => services.fold(0, (sum, s) => sum + s.durationMinutes);

  /// Services and a time are chosen: the barber and review steps can run.
  bool get isReadyForBarber => !isEmpty && timing != null;

  bool contains(String serviceId) => services.any((s) => s.id == serviceId);

  BookingDraft toggle(SelectedService service) => BookingDraft(
    salonId: salonId,
    services: contains(service.id)
        ? [
            for (final s in services)
              if (s.id != service.id) s,
          ]
        : [...services, service],
    // Changing the services changes the duration, so a picked slot may no
    // longer fit; the time and barber are chosen again.
  );

  /// A different time resets the barber: who is free depends on the time.
  BookingDraft withTiming(BookingTiming? value) => BookingDraft(
    salonId: salonId,
    services: services,
    timing: value,
    barber: value == timing ? barber : const AnyBarber(),
  );

  BookingDraft withBarber(BarberChoice value) => BookingDraft(
    salonId: salonId,
    services: services,
    timing: timing,
    barber: value,
  );

  @override
  List<Object?> get props => [salonId, services, timing, barber];
}

/// Keeps drafts alive across the salon page and the booking routes.
abstract interface class BookingDraftRepository {
  BookingDraft draftFor(String salonId);
  Stream<BookingDraft> watch(String salonId);
  void save(BookingDraft draft);
  void clear(String salonId);
}
