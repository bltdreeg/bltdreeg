import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../booking/domain/booking_draft.dart';
import '../../favorites/domain/usecases.dart';
import '../../salons/domain/repositories/recently_viewed_repository.dart';
import '../domain/salon_details.dart';

sealed class ReviewFilter extends Equatable {
  const ReviewFilter();
}

final class ReviewFilterAll extends ReviewFilter {
  const ReviewFilterAll();
  @override
  List<Object?> get props => const [];
}

final class ReviewFilterFiveStars extends ReviewFilter {
  const ReviewFilterFiveStars();
  @override
  List<Object?> get props => const [];
}

final class ReviewFilterWithPhotos extends ReviewFilter {
  const ReviewFilterWithPhotos();
  @override
  List<Object?> get props => const [];
}

final class ReviewFilterBarber extends ReviewFilter {
  const ReviewFilterBarber(this.barberId);
  final String barberId;
  @override
  List<Object?> get props => [barberId];
}

final class SalonDetailsState extends Equatable {
  const SalonDetailsState({
    required this.salonId,
    required this.draft,
    this.snapshot = const SalonDetailsSnapshot(),
    this.isFavorite = false,
    this.reviewFilter = const ReviewFilterAll(),
  });

  final String salonId;
  final SalonDetailsSnapshot snapshot;
  final BookingDraft draft;
  final bool isFavorite;
  final ReviewFilter reviewFilter;

  SalonDetails? get details => snapshot.details;

  List<Review> get filteredReviews {
    final reviews = details?.reviews ?? const <Review>[];
    return switch (reviewFilter) {
      ReviewFilterAll() => reviews,
      ReviewFilterFiveStars() => [
        for (final r in reviews)
          if (r.stars == 5) r,
      ],
      ReviewFilterWithPhotos() => [
        for (final r in reviews)
          if (r.photoCount > 0) r,
      ],
      ReviewFilterBarber(:final barberId) => [
        for (final r in reviews)
          if (r.barberId == barberId) r,
      ],
    };
  }

  SalonDetailsState copyWith({
    SalonDetailsSnapshot? snapshot,
    BookingDraft? draft,
    bool? isFavorite,
    ReviewFilter? reviewFilter,
  }) => SalonDetailsState(
    salonId: salonId,
    snapshot: snapshot ?? this.snapshot,
    draft: draft ?? this.draft,
    isFavorite: isFavorite ?? this.isFavorite,
    reviewFilter: reviewFilter ?? this.reviewFilter,
  );

  @override
  List<Object?> get props => [
    salonId,
    snapshot,
    draft,
    isFavorite,
    reviewFilter,
  ];
}

class SalonDetailsCubit extends Cubit<SalonDetailsState> {
  SalonDetailsCubit({
    required String salonId,
    required SalonDetailsRepository repository,
    required BookingDraftRepository drafts,
    required RecentlyViewedRepository recentlyViewed,
    required WatchFavoriteIds watchFavorites,
    required this._toggleFavorite,
  }) : _repository = repository,
       _drafts = drafts,
       super(
         SalonDetailsState(salonId: salonId, draft: drafts.draftFor(salonId)),
       ) {
    unawaited(recentlyViewed.record(salonId));
    _subs
      ..add(
        repository
            .watch(salonId)
            .listen((s) => emit(state.copyWith(snapshot: s))),
      )
      ..add(drafts.watch(salonId).listen((d) => emit(state.copyWith(draft: d))))
      ..add(
        watchFavorites().listen(
          (ids) => emit(state.copyWith(isFavorite: ids.contains(salonId))),
        ),
      );
  }

  final SalonDetailsRepository _repository;
  final BookingDraftRepository _drafts;
  final ToggleFavorite _toggleFavorite;
  final _subs = <StreamSubscription<Object?>>[];

  /// Toggles against the repository (the source of truth), not [state]:
  /// the state only updates after the draft stream emits, so quick
  /// successive taps would otherwise overwrite each other.
  void toggleService(SalonService service) => _drafts.save(
    _drafts
        .draftFor(state.salonId)
        .toggle(
          SelectedService(
            id: service.id,
            name: service.name,
            durationMinutes: service.durationMinutes,
            price: service.price,
          ),
        ),
  );

  Future<void> setFavorite({required bool favorite}) async {
    // Optimistic; the repository streams the confirmed set back.
    emit(state.copyWith(isFavorite: favorite));
    await _toggleFavorite(state.salonId, favorite: favorite);
  }

  void filterReviews(ReviewFilter filter) =>
      emit(state.copyWith(reviewFilter: filter));

  Future<void> refresh() => _repository.refresh(state.salonId);

  @override
  Future<void> close() async {
    for (final s in _subs) {
      await s.cancel();
    }
    return super.close();
  }
}
