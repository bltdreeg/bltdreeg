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

/// Work-in-progress booking for one salon. Starts on the salon page (services)
/// and is completed by the booking flow (time, barber, review).
final class BookingDraft extends Equatable {
  const BookingDraft({required this.salonId, this.services = const []});

  final String salonId;
  final List<SelectedService> services;

  bool get isEmpty => services.isEmpty;
  int get totalPrice => services.fold(0, (sum, s) => sum + s.price);
  int get totalMinutes => services.fold(0, (sum, s) => sum + s.durationMinutes);

  bool contains(String serviceId) => services.any((s) => s.id == serviceId);

  BookingDraft toggle(SelectedService service) => BookingDraft(
    salonId: salonId,
    services: contains(service.id)
        ? [
            for (final s in services)
              if (s.id != service.id) s,
          ]
        : [...services, service],
  );

  @override
  List<Object?> get props => [salonId, services];
}

/// Keeps drafts alive across the salon page and the booking routes.
abstract interface class BookingDraftRepository {
  BookingDraft draftFor(String salonId);
  Stream<BookingDraft> watch(String salonId);
  void save(BookingDraft draft);
  void clear(String salonId);
}
