import 'package:equatable/equatable.dart';

import '../../../core/utils/result.dart';

/// Quick compliments (frame 31, optional).
enum RatingTag { lightHand, cleanPlace, respectful, fairPrice, accurateQueue }

/// A customer's rating of a completed visit (frame 31).
final class VisitRating extends Equatable {
  const VisitRating({
    required this.bookingId,
    required this.salonId,
    required this.overall,
    required this.submittedAt,
    this.quality = 0,
    this.cleanliness = 0,
    this.timeAccuracy = 0,
    this.tags = const {},
    this.comment = '',
    this.anonymous = false,
    this.photoPaths = const [],
  });

  static const maxPhotos = 3;
  static const maxCommentLength = 500;

  final String bookingId;
  final String salonId;

  /// 1..5 stars.
  final int overall;

  /// 0 when not rated, else 1..5.
  final int quality;
  final int cleanliness;

  /// "دقة الوقت المتوقع": rated separately because it feeds salon ranking
  /// and exposes salons that game the queue estimate.
  final int timeAccuracy;
  final Set<RatingTag> tags;
  final String comment;
  final bool anonymous;

  /// App-owned copies of the attached photos.
  final List<String> photoPaths;
  final DateTime submittedAt;

  @override
  List<Object?> get props => [
    bookingId,
    salonId,
    overall,
    quality,
    cleanliness,
    timeAccuracy,
    tags,
    comment,
    anonymous,
    photoPaths,
    submittedAt,
  ];
}

abstract interface class RatingRepository {
  /// Saved on the device at once and sent now or when back online; a rating
  /// never waits on the network.
  Future<Result<VisitRating>> submit(VisitRating rating);

  /// The rating already given for [bookingId], if any.
  Future<VisitRating?> ratingFor(String bookingId);

  /// Ratings for past bookings, by booking id (bookings list).
  Future<Map<String, VisitRating>> ratingsFor(Iterable<String> bookingIds);

  /// Still waiting in the outbox (offline when submitted).
  Future<bool> isPending(String bookingId);
}

final class SubmitRating {
  const SubmitRating(this._repository);

  final RatingRepository _repository;

  Future<Result<VisitRating>> call(VisitRating rating) {
    assert(rating.overall >= 1 && rating.overall <= 5, 'Overall is required');
    return _repository.submit(rating);
  }
}

final class GetVisitRatings {
  const GetVisitRatings(this._repository);

  final RatingRepository _repository;

  Future<Map<String, VisitRating>> call(Iterable<String> bookingIds) =>
      _repository.ratingsFor(bookingIds);
}

final class GetVisitRating {
  const GetVisitRating(this._repository);

  final RatingRepository _repository;

  Future<VisitRating?> call(String bookingId) =>
      _repository.ratingFor(bookingId);
}
