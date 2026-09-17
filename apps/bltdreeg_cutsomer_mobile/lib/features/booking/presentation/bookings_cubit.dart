import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../rating/domain/rating.dart';
import '../domain/booking.dart';
import '../domain/booking_draft.dart';

enum BookingsTab { current, past }

final class BookingsState extends Equatable {
  const BookingsState({
    this.snapshot = const BookingsSnapshot(),
    this.tab = BookingsTab.current,
    this.ratings = const {},
  });

  final BookingsSnapshot snapshot;
  final BookingsTab tab;

  /// Ratings already given, by booking id (frame 10).
  final Map<String, VisitRating> ratings;

  List<Booking> get visible => switch (tab) {
    BookingsTab.current => snapshot.active,
    BookingsTab.past => snapshot.past,
  };

  bool get isEmpty => snapshot.isLoaded && snapshot.bookings.isEmpty;

  BookingsState copyWith({
    BookingsSnapshot? snapshot,
    BookingsTab? tab,
    Map<String, VisitRating>? ratings,
  }) => BookingsState(
    snapshot: snapshot ?? this.snapshot,
    tab: tab ?? this.tab,
    ratings: ratings ?? this.ratings,
  );

  @override
  List<Object?> get props => [snapshot, tab, ratings];
}

/// Frames 09-11: the customer's current and past bookings.
class BookingsCubit extends Cubit<BookingsState> {
  BookingsCubit({
    required this._repository,
    required this._drafts,
    required this._getRatings,
  }) : super(const BookingsState()) {
    _sub = _repository.watchMine().listen(_onSnapshot);
  }

  final BookingRepository _repository;
  final BookingDraftRepository _drafts;
  final GetVisitRatings _getRatings;
  late final StreamSubscription<BookingsSnapshot> _sub;

  void _onSnapshot(BookingsSnapshot snapshot) {
    emit(state.copyWith(snapshot: snapshot));
    unawaited(_loadRatings(snapshot));
  }

  Future<void> _loadRatings(BookingsSnapshot snapshot) async {
    final ids = [
      for (final b in snapshot.past)
        if (b.status == BookingStatus.completed &&
            !state.ratings.containsKey(b.id))
          b.id,
    ];
    if (ids.isEmpty) return;
    final ratings = await _getRatings(ids);
    if (isClosed || ratings.isEmpty) return;
    emit(state.copyWith(ratings: {...state.ratings, ...ratings}));
  }

  void selectTab(BookingsTab tab) => emit(state.copyWith(tab: tab));

  Future<void> refresh() => _repository.refreshMine();

  /// "احجز تاني بنفس الاختيارات": puts the same services (and barber, when
  /// there was one) back in the draft so the flow starts at the time step.
  void rebook(Booking booking) => _drafts.save(
    BookingDraft(
      salonId: booking.salonId,
      services: booking.services,
      barber: switch ((booking.barberId, booking.barberName)) {
        (final id?, final name?) => NamedBarber(id: id, name: name),
        _ => const AnyBarber(),
      },
    ),
  );

  @override
  Future<void> close() async {
    await _sub.cancel();
    return super.close();
  }
}
