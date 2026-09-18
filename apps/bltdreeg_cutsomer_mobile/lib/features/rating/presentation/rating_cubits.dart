import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/failures.dart';
import '../../../core/utils/result.dart';
import '../../booking/domain/booking.dart';
import '../../booking/domain/usecases.dart';
import '../../favorites/domain/usecases.dart';
import '../domain/photo_capture.dart';
import '../domain/rating.dart';

enum RateSubmitStatus { editing, submitting, done }

final class RateVisitState extends Equatable {
  const RateVisitState({
    required this.bookingId,
    this.booking,
    this.loadFailure,
    this.existing,
    this.overall = 0,
    this.quality = 0,
    this.cleanliness = 0,
    this.timeAccuracy = 0,
    this.tags = const {},
    this.comment = '',
    this.anonymous = false,
    this.photos = const [],
    this.status = RateSubmitStatus.editing,
    this.photoFailed = false,
  });

  final String bookingId;
  final Booking? booking;
  final Failure? loadFailure;

  /// Rating already given for this visit.
  final VisitRating? existing;
  final int overall;
  final int quality;
  final int cleanliness;
  final int timeAccuracy;
  final Set<RatingTag> tags;
  final String comment;
  final bool anonymous;

  /// Picked photo paths, copied into app storage on submit.
  final List<String> photos;
  final RateSubmitStatus status;
  final bool photoFailed;

  bool get isLoading => booking == null && loadFailure == null;

  /// Ratings open only after the visit is completed (board note, frame 31).
  bool get canRate => booking?.status == BookingStatus.completed;
  bool get canSubmit =>
      canRate && overall > 0 && status == RateSubmitStatus.editing;
  bool get canAddPhoto => photos.length < VisitRating.maxPhotos;

  RateVisitState copyWith({
    Booking? booking,
    Failure? loadFailure,
    bool clearLoadFailure = false,
    VisitRating? existing,
    int? overall,
    int? quality,
    int? cleanliness,
    int? timeAccuracy,
    Set<RatingTag>? tags,
    String? comment,
    bool? anonymous,
    List<String>? photos,
    RateSubmitStatus? status,
    bool? photoFailed,
  }) => RateVisitState(
    bookingId: bookingId,
    booking: booking ?? this.booking,
    loadFailure: clearLoadFailure ? null : loadFailure ?? this.loadFailure,
    existing: existing ?? this.existing,
    overall: overall ?? this.overall,
    quality: quality ?? this.quality,
    cleanliness: cleanliness ?? this.cleanliness,
    timeAccuracy: timeAccuracy ?? this.timeAccuracy,
    tags: tags ?? this.tags,
    comment: comment ?? this.comment,
    anonymous: anonymous ?? this.anonymous,
    photos: photos ?? this.photos,
    status: status ?? this.status,
    photoFailed: photoFailed ?? false,
  );

  @override
  List<Object?> get props => [
    bookingId,
    booking,
    loadFailure,
    existing,
    overall,
    quality,
    cleanliness,
    timeAccuracy,
    tags,
    comment,
    anonymous,
    photos,
    status,
    photoFailed,
  ];
}

class RateVisitCubit extends Cubit<RateVisitState> {
  RateVisitCubit({
    required String bookingId,
    required this._getBooking,
    required this._getRating,
    required this._submitRating,
    required this._photoPicker,
    required this._photoStore,
    DateTime Function()? clock,
  }) : _clock = clock ?? DateTime.now,
       super(RateVisitState(bookingId: bookingId)) {
    unawaited(load());
  }

  final GetBooking _getBooking;
  final GetVisitRating _getRating;
  final SubmitRating _submitRating;
  final PhotoPicker _photoPicker;
  final RatingPhotoStore _photoStore;
  final DateTime Function() _clock;

  Future<void> load() async {
    emit(state.copyWith(clearLoadFailure: true));
    final existing = await _getRating(state.bookingId);
    final result = await _getBooking(state.bookingId);
    if (isClosed) return;
    emit(switch (result) {
      Ok(:final value) => state.copyWith(booking: value, existing: existing),
      Err(:final failure) => state.copyWith(loadFailure: failure),
    });
  }

  /// The first overall rating pre-fills the details the customer hasn't
  /// touched, so a quick rating stays one tap.
  void setOverall(int stars) => emit(
    state.copyWith(
      overall: stars,
      quality: state.quality == 0 ? stars : null,
      cleanliness: state.cleanliness == 0 ? stars : null,
      timeAccuracy: state.timeAccuracy == 0 ? stars : null,
    ),
  );

  void setQuality(int stars) => emit(state.copyWith(quality: stars));
  void setCleanliness(int stars) => emit(state.copyWith(cleanliness: stars));
  void setTimeAccuracy(int stars) => emit(state.copyWith(timeAccuracy: stars));

  void toggleTag(RatingTag tag) => emit(
    state.copyWith(
      tags: state.tags.contains(tag)
          ? ({...state.tags}..remove(tag))
          : {...state.tags, tag},
    ),
  );

  void setComment(String value) => emit(
    state.copyWith(
      comment: value.length > VisitRating.maxCommentLength
          ? value.substring(0, VisitRating.maxCommentLength)
          : value,
    ),
  );

  void setAnonymous({required bool value}) =>
      emit(state.copyWith(anonymous: value));

  Future<void> addPhoto(PhotoSource source) async {
    if (!state.canAddPhoto) return;
    try {
      final path = await _photoPicker.pick(source);
      if (path == null || isClosed) return;
      emit(state.copyWith(photos: [...state.photos, path]));
    } on Object {
      // Permission denied or no camera (simulator).
      if (!isClosed) emit(state.copyWith(photoFailed: true));
    }
  }

  void removePhoto(int index) =>
      emit(state.copyWith(photos: [...state.photos]..removeAt(index)));

  Future<void> submit() async {
    final booking = state.booking;
    if (!state.canSubmit || booking == null) return;
    emit(state.copyWith(status: RateSubmitStatus.submitting));
    final kept = <String>[];
    for (var i = 0; i < state.photos.length; i++) {
      try {
        kept.add(await _photoStore.keep(booking.id, state.photos[i], i));
      } on Object {
        // A photo that can't be copied is dropped, not the whole rating.
      }
    }
    final result = await _submitRating(
      VisitRating(
        bookingId: booking.id,
        salonId: booking.salonId,
        overall: state.overall,
        quality: state.quality,
        cleanliness: state.cleanliness,
        timeAccuracy: state.timeAccuracy,
        tags: state.tags,
        comment: state.comment.trim(),
        anonymous: state.anonymous,
        photoPaths: kept,
        submittedAt: _clock(),
      ),
    );
    if (isClosed) return;
    emit(
      state.copyWith(
        status: result.isOk ? RateSubmitStatus.done : RateSubmitStatus.editing,
        existing: result.valueOrNull,
      ),
    );
  }
}

// ---- frame 41 -------------------------------------------------------------------------

final class RatingSentState extends Equatable {
  const RatingSentState({
    this.rating,
    this.booking,
    this.isFavorite = false,
    this.isPending = false,
    this.loaded = false,
  });

  final VisitRating? rating;
  final Booking? booking;
  final bool isFavorite;

  /// Saved offline; goes out when the connection is back.
  final bool isPending;
  final bool loaded;

  RatingSentState copyWith({
    VisitRating? rating,
    Booking? booking,
    bool? isFavorite,
    bool? isPending,
    bool? loaded,
  }) => RatingSentState(
    rating: rating ?? this.rating,
    booking: booking ?? this.booking,
    isFavorite: isFavorite ?? this.isFavorite,
    isPending: isPending ?? this.isPending,
    loaded: loaded ?? this.loaded,
  );

  @override
  List<Object?> get props => [rating, booking, isFavorite, isPending, loaded];
}

class RatingSentCubit extends Cubit<RatingSentState> {
  RatingSentCubit({
    required this.bookingId,
    required this._getRating,
    required this._getBooking,
    required this._repository,
    required WatchFavoriteIds watchFavorites,
    required this._toggleFavorite,
  }) : super(const RatingSentState()) {
    unawaited(_load());
    _favoritesSub = watchFavorites().listen((ids) {
      final salonId = state.booking?.salonId ?? state.rating?.salonId;
      _favoriteIds = ids;
      if (salonId != null) {
        emit(state.copyWith(isFavorite: ids.contains(salonId)));
      }
    });
  }

  final String bookingId;
  final GetVisitRating _getRating;
  final GetBooking _getBooking;
  final RatingRepository _repository;
  final ToggleFavorite _toggleFavorite;
  late final StreamSubscription<Set<String>> _favoritesSub;
  Set<String> _favoriteIds = const {};

  Future<void> _load() async {
    final rating = await _getRating(bookingId);
    final booking = (await _getBooking(bookingId)).valueOrNull;
    final pending = await _repository.isPending(bookingId);
    if (isClosed) return;
    final salonId = booking?.salonId ?? rating?.salonId;
    emit(
      state.copyWith(
        rating: rating,
        booking: booking,
        isPending: pending,
        isFavorite: salonId != null && _favoriteIds.contains(salonId),
        loaded: true,
      ),
    );
  }

  Future<void> addToFavorites() async {
    final salonId = state.booking?.salonId ?? state.rating?.salonId;
    if (salonId == null || state.isFavorite) return;
    emit(state.copyWith(isFavorite: true));
    await _toggleFavorite(salonId, favorite: true);
  }

  @override
  Future<void> close() async {
    await _favoritesSub.cancel();
    return super.close();
  }
}
