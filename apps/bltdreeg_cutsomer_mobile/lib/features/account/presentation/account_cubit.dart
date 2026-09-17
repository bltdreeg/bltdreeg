import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../booking/domain/booking.dart';
import '../../favorites/domain/usecases.dart';

final class AccountState extends Equatable {
  const AccountState({
    this.bookings = const BookingsSnapshot(),
    this.favorites = 0,
  });

  final BookingsSnapshot bookings;
  final int favorites;

  int get completedVisits => [
    for (final b in bookings.bookings)
      if (b.status == BookingStatus.completed) b,
  ].length;

  List<Booking> get active => bookings.active;

  /// The live queue booking, if any: signing out explains what happens to it
  /// (frame 17).
  Booking? get activeQueue =>
      active.where((b) => b.isQueue && b.status.isActive).firstOrNull;

  AccountState copyWith({BookingsSnapshot? bookings, int? favorites}) =>
      AccountState(
        bookings: bookings ?? this.bookings,
        favorites: favorites ?? this.favorites,
      );

  @override
  List<Object?> get props => [bookings, favorites];
}

/// Frame 16 counters: visits done, favorites, active bookings.
class AccountCubit extends Cubit<AccountState> {
  AccountCubit({
    required BookingRepository bookings,
    required WatchFavoriteIds watchFavorites,
  }) : super(const AccountState()) {
    _bookingsSub = bookings.watchMine().listen(
      (snapshot) => emit(state.copyWith(bookings: snapshot)),
    );
    _favoritesSub = watchFavorites().listen(
      (ids) => emit(state.copyWith(favorites: ids.length)),
    );
  }

  late final StreamSubscription<BookingsSnapshot> _bookingsSub;
  late final StreamSubscription<Set<String>> _favoritesSub;

  @override
  Future<void> close() async {
    await _bookingsSub.cancel();
    await _favoritesSub.cancel();
    return super.close();
  }
}
