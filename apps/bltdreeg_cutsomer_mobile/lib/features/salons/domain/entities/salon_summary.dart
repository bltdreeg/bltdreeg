import 'package:equatable/equatable.dart';

import '../../../../core/l10n_data/localized_text.dart';

enum ServiceCategory { haircut, beard, kids, color, skincare }

/// Live load of a salon's queue.
final class QueueLoad extends Equatable {
  const QueueLoad({required this.peopleAhead, required this.waitMinutes});

  static const empty = QueueLoad(peopleAhead: 0, waitMinutes: 0);

  final int peopleAhead;
  final int waitMinutes;

  @override
  List<Object?> get props => [peopleAhead, waitMinutes];
}

/// How busy a salon is, as colored on the board (green / amber / red).
enum QueueLevel { free, moderate, busy, closed }

/// A salon as shown in lists (home rails, search results, favorites).
final class SalonSummary extends Equatable {
  const SalonSummary({
    required this.id,
    required this.name,
    required this.areaId,
    required this.areaName,
    required this.distanceKm,
    required this.priceFrom,
    required this.services,
    required this.openedOn,
    required this.queue,
    this.rating,
    this.reviewsCount = 0,
    this.servicePrices = const {},
    this.imageUrl,
    this.opensAt,
    this.closedWeekdays = const {},
  });

  final String id;

  /// As written by the owner; never translated.
  final String name;
  final String areaId;
  final LocalizedText areaName;
  final double distanceKm;
  final double? rating;
  final int reviewsCount;

  /// Cheapest service, EGP.
  final int priceFrom;
  final Map<ServiceCategory, int> servicePrices;
  final Set<ServiceCategory> services;
  final String? imageUrl;
  final DateTime openedOn;
  final QueueLoad queue;

  /// Set when the salon is closed right now.
  final DateTime? opensAt;

  /// `DateTime.weekday` values the salon is closed all day.
  final Set<int> closedWeekdays;

  bool get isOpen => opensAt == null;

  QueueLevel get level {
    if (!isOpen) return QueueLevel.closed;
    return switch (queue.peopleAhead) {
      <= 1 => QueueLevel.free,
      <= 3 => QueueLevel.moderate,
      _ => QueueLevel.busy,
    };
  }

  bool isNew(DateTime now) => now.difference(openedOn).inDays <= 45;

  bool openOn(DateTime day) => !closedWeekdays.contains(day.weekday);

  /// Price for [category], falling back to the "from" price.
  int priceFor(ServiceCategory? category) =>
      category == null ? priceFrom : servicePrices[category] ?? priceFrom;

  SalonSummary withQueue(QueueLoad load) => SalonSummary(
    id: id,
    name: name,
    areaId: areaId,
    areaName: areaName,
    distanceKm: distanceKm,
    rating: rating,
    reviewsCount: reviewsCount,
    priceFrom: priceFrom,
    servicePrices: servicePrices,
    services: services,
    imageUrl: imageUrl,
    openedOn: openedOn,
    queue: load,
    opensAt: opensAt,
    closedWeekdays: closedWeekdays,
  );

  @override
  List<Object?> get props => [
    id,
    name,
    areaId,
    areaName,
    distanceKm,
    rating,
    reviewsCount,
    priceFrom,
    servicePrices,
    services,
    imageUrl,
    openedOn,
    queue,
    opensAt,
    closedWeekdays,
  ];
}
