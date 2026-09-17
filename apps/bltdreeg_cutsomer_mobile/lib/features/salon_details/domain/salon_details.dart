import 'package:equatable/equatable.dart';

import '../../../core/error/failures.dart';
import '../../../core/l10n_data/localized_text.dart';
import '../../salons/domain/entities/salon_summary.dart';

// Salon-authored content (service names, barber names, offer titles, review
// text) is stored as written by the owner/customer and never translated.

final class SalonService extends Equatable {
  const SalonService({
    required this.id,
    required this.name,
    required this.category,
    required this.durationMinutes,
    required this.price,
  });

  final String id;
  final String name;
  final ServiceCategory category;
  final int durationMinutes;
  final int price;

  @override
  List<Object?> get props => [id, name, category, durationMinutes, price];
}

final class ServiceGroup extends Equatable {
  const ServiceGroup({required this.title, required this.services});

  final String title;
  final List<SalonService> services;

  @override
  List<Object?> get props => [title, services];
}

sealed class BarberAvailability extends Equatable {
  const BarberAvailability();
}

/// Working today; [queue] is the barber's own sub-queue.
final class BarberWorking extends BarberAvailability {
  const BarberWorking(this.queue);

  final QueueLoad queue;

  @override
  List<Object?> get props => [queue];
}

final class BarberOff extends BarberAvailability {
  const BarberOff({required this.returnsOn});

  final DateTime returnsOn;

  @override
  List<Object?> get props => [returnsOn];
}

final class Barber extends Equatable {
  const Barber({
    required this.id,
    required this.name,
    required this.specialty,
    required this.availability,
    this.yearsExperience,
    this.rating,
    this.reviewsCount = 0,
    this.imageUrl,
  });

  final String id;
  final String name;
  final String specialty;
  final int? yearsExperience;
  final double? rating;
  final int reviewsCount;
  final String? imageUrl;
  final BarberAvailability availability;

  bool get isWorking => availability is BarberWorking;

  Barber withAvailability(BarberAvailability value) => Barber(
    id: id,
    name: name,
    specialty: specialty,
    yearsExperience: yearsExperience,
    rating: rating,
    reviewsCount: reviewsCount,
    imageUrl: imageUrl,
    availability: value,
  );

  @override
  List<Object?> get props => [
    id,
    name,
    specialty,
    yearsExperience,
    rating,
    reviewsCount,
    imageUrl,
    availability,
  ];
}

enum OfferKind { discount, bundle, loyalty }

final class SalonOffer extends Equatable {
  const SalonOffer({
    required this.id,
    required this.kind,
    required this.title,
    this.description,
    this.expiresAt,
    this.originalPrice,
    this.price,
    this.visitsDone,
    this.visitsTarget,
    this.highlighted = false,
    this.serviceIds = const [],
  });

  final String id;
  final OfferKind kind;
  final String title;
  final String? description;
  final DateTime? expiresAt;

  /// Bundle pricing.
  final int? originalPrice;
  final int? price;

  /// Loyalty progress ("the 5th is free").
  final int? visitsDone;
  final int? visitsTarget;

  /// Shown with the dashed teal frame (the offer running right now).
  final bool highlighted;

  /// Services a bundle applies to.
  final List<String> serviceIds;

  @override
  List<Object?> get props => [
    id,
    kind,
    title,
    description,
    expiresAt,
    originalPrice,
    price,
    visitsDone,
    visitsTarget,
    highlighted,
    serviceIds,
  ];
}

final class RatingBreakdown extends Equatable {
  const RatingBreakdown({
    required this.quality,
    required this.cleanliness,
    required this.timeAccuracy,
  });

  final double quality;
  final double cleanliness;

  /// "دقة الوقت المتوقع": how honest the queue estimate was.
  final double timeAccuracy;

  @override
  List<Object?> get props => [quality, cleanliness, timeAccuracy];
}

final class Review extends Equatable {
  const Review({
    required this.id,
    required this.authorName,
    required this.stars,
    required this.createdAt,
    required this.text,
    this.serviceName,
    this.barberName,
    this.barberId,
    this.photoCount = 0,
    this.salonReply,
  });

  final String id;
  final String authorName;
  final int stars;
  final DateTime createdAt;
  final String text;
  final String? serviceName;
  final String? barberName;
  final String? barberId;
  final int photoCount;
  final String? salonReply;

  @override
  List<Object?> get props => [
    id,
    authorName,
    stars,
    createdAt,
    text,
    serviceName,
    barberName,
    barberId,
    photoCount,
    salonReply,
  ];
}

/// Opening hours for one weekday, in minutes from midnight. [closesAt] can
/// exceed 24h for shops closing after midnight (e.g. 1500 = 1 AM).
final class DayHours extends Equatable {
  const DayHours({required this.weekday, this.opensAt, this.closesAt});

  const DayHours.closed(this.weekday) : opensAt = null, closesAt = null;

  final int weekday;
  final int? opensAt;
  final int? closesAt;

  bool get isClosed => opensAt == null;

  @override
  List<Object?> get props => [weekday, opensAt, closesAt];
}

enum GalleryKind { work, place, video }

final class GalleryItem extends Equatable {
  const GalleryItem({
    required this.id,
    required this.kind,
    this.url,
    this.caption,
    this.durationSeconds,
  });

  final String id;
  final GalleryKind kind;
  final String? url;
  final String? caption;
  final int? durationSeconds;

  @override
  List<Object?> get props => [id, kind, url, caption, durationSeconds];
}

final class SalonDetails extends Equatable {
  const SalonDetails({
    required this.summary,
    required this.address,
    required this.phone,
    required this.latitude,
    required this.longitude,
    required this.chairsActive,
    required this.serviceGroups,
    required this.barbers,
    required this.offers,
    required this.ratingBreakdown,
    required this.reviews,
    required this.hours,
    required this.gallery,
    this.reviewPhotos = const [],
  });

  final SalonSummary summary;
  final LocalizedText address;
  final String phone;
  final double latitude;
  final double longitude;
  final int chairsActive;
  final List<ServiceGroup> serviceGroups;
  final List<Barber> barbers;
  final List<SalonOffer> offers;
  final RatingBreakdown? ratingBreakdown;
  final List<Review> reviews;
  final List<DayHours> hours;
  final List<GalleryItem> gallery;
  final List<GalleryItem> reviewPhotos;

  String get id => summary.id;

  List<Barber> get barbersOnShift => [
    for (final b in barbers)
      if (b.isWorking) b,
  ];

  Iterable<SalonService> get allServices =>
      serviceGroups.expand((g) => g.services);

  SalonDetails withLive({
    required QueueLoad load,
    required List<Barber> barbers,
  }) => SalonDetails(
    summary: summary.withQueue(load),
    address: address,
    phone: phone,
    latitude: latitude,
    longitude: longitude,
    chairsActive: chairsActive,
    serviceGroups: serviceGroups,
    barbers: barbers,
    offers: offers,
    ratingBreakdown: ratingBreakdown,
    reviews: reviews,
    hours: hours,
    gallery: gallery,
    reviewPhotos: reviewPhotos,
  );

  @override
  List<Object?> get props => [
    summary,
    address,
    phone,
    latitude,
    longitude,
    chairsActive,
    serviceGroups,
    barbers,
    offers,
    ratingBreakdown,
    reviews,
    hours,
    gallery,
    reviewPhotos,
  ];
}

/// Live push for one salon: its queue and each barber's sub-queue.
final class SalonLiveUpdate extends Equatable {
  const SalonLiveUpdate({required this.load, required this.barbers});

  final QueueLoad load;
  final Map<String, BarberAvailability> barbers;

  @override
  List<Object?> get props => [load, barbers];
}

final class SalonDetailsSnapshot extends Equatable {
  const SalonDetailsSnapshot({
    this.details,
    this.isLive = false,
    this.isRefreshing = false,
    this.failure,
  });

  final SalonDetails? details;
  final bool isLive;
  final bool isRefreshing;
  final Failure? failure;

  bool get hasData => details != null;

  SalonDetailsSnapshot copyWith({
    SalonDetails? details,
    bool? isLive,
    bool? isRefreshing,
    Failure? failure,
    bool clearFailure = false,
  }) => SalonDetailsSnapshot(
    details: details ?? this.details,
    isLive: isLive ?? this.isLive,
    isRefreshing: isRefreshing ?? this.isRefreshing,
    failure: clearFailure ? null : failure ?? this.failure,
  );

  @override
  List<Object?> get props => [details, isLive, isRefreshing, failure];
}

abstract interface class SalonDetailsRepository {
  /// Offline-first: cached copy, then server, then live queue pushes.
  Stream<SalonDetailsSnapshot> watch(String salonId);

  Future<void> refresh(String salonId);
}
