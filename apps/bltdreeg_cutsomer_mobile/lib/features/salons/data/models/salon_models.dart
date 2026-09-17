import '../../../../core/l10n_data/localized_text.dart';
import '../../domain/entities/area.dart';
import '../../domain/entities/salon_summary.dart';

abstract final class SalonSummaryModel {
  static SalonSummary fromJson(Map<String, Object?> j) => SalonSummary(
    id: j['id']! as String,
    name: j['name']! as String,
    areaId: j['area_id']! as String,
    areaName: LocalizedText.fromJson(j['area_name']! as Map<String, Object?>),
    distanceKm: (j['distance_km']! as num).toDouble(),
    rating: (j['rating'] as num?)?.toDouble(),
    reviewsCount: j['reviews_count'] as int? ?? 0,
    priceFrom: j['price_from']! as int,
    servicePrices: {
      for (final e
          in (j['service_prices'] as Map<String, Object?>? ?? {}).entries)
        ServiceCategory.values.byName(e.key): e.value! as int,
    },
    services: {
      for (final s in (j['services']! as List<Object?>))
        ServiceCategory.values.byName(s! as String),
    },
    imageUrl: j['image_url'] as String?,
    openedOn: DateTime.parse(j['opened_on']! as String),
    queue: QueueLoadModel.fromJson(j['queue']! as Map<String, Object?>),
    opensAt: switch (j['opens_at']) {
      final String s => DateTime.parse(s),
      _ => null,
    },
    closedWeekdays: {
      for (final d in (j['closed_weekdays'] as List<Object?>? ?? const []))
        d! as int,
    },
  );

  static Map<String, Object?> toJson(SalonSummary s) => {
    'id': s.id,
    'name': s.name,
    'area_id': s.areaId,
    'area_name': s.areaName.toJson(),
    'distance_km': s.distanceKm,
    'rating': s.rating,
    'reviews_count': s.reviewsCount,
    'price_from': s.priceFrom,
    'service_prices': {
      for (final e in s.servicePrices.entries) e.key.name: e.value,
    },
    'services': [for (final c in s.services) c.name],
    'image_url': s.imageUrl,
    'opened_on': s.openedOn.toIso8601String(),
    'queue': QueueLoadModel.toJson(s.queue),
    'opens_at': s.opensAt?.toIso8601String(),
    'closed_weekdays': s.closedWeekdays.toList(),
  };
}

abstract final class QueueLoadModel {
  static QueueLoad fromJson(Map<String, Object?> j) => QueueLoad(
    peopleAhead: j['people_ahead']! as int,
    waitMinutes: j['wait_minutes']! as int,
  );

  static Map<String, Object?> toJson(QueueLoad q) => {
    'people_ahead': q.peopleAhead,
    'wait_minutes': q.waitMinutes,
  };
}

abstract final class AreaModel {
  static Area fromJson(Map<String, Object?> j) => Area(
    id: j['id']! as String,
    name: LocalizedText.fromJson(j['name']! as Map<String, Object?>),
    city: LocalizedText.fromJson(j['city']! as Map<String, Object?>),
    salonsCount: j['salons_count']! as int,
    isNearby: j['is_nearby'] as bool? ?? false,
  );

  static Map<String, Object?> toJson(Area a) => {
    'id': a.id,
    'name': a.name.toJson(),
    'city': a.city.toJson(),
    'salons_count': a.salonsCount,
    'is_nearby': a.isNearby,
  };
}
