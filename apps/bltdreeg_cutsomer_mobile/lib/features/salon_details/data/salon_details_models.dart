import '../../../core/l10n_data/localized_text.dart';
import '../../salons/data/models/salon_models.dart';
import '../../salons/domain/entities/salon_summary.dart';
import '../domain/salon_details.dart';

/// JSON mapping for salon details (REST payload and drift cache).
abstract final class SalonDetailsModel {
  static SalonDetails fromJson(Map<String, Object?> j) => SalonDetails(
    summary: SalonSummaryModel.fromJson(j['summary']! as Map<String, Object?>),
    address: LocalizedText.fromJson(j['address']! as Map<String, Object?>),
    phone: j['phone']! as String,
    latitude: (j['lat']! as num).toDouble(),
    longitude: (j['lng']! as num).toDouble(),
    chairsActive: j['chairs_active']! as int,
    serviceGroups: [
      for (final g in _list(j['service_groups']))
        ServiceGroup(
          title: g['title']! as String,
          services: [
            for (final s in _list(g['services']))
              SalonService(
                id: s['id']! as String,
                name: s['name']! as String,
                category: ServiceCategory.values.byName(
                  s['category']! as String,
                ),
                durationMinutes: s['duration']! as int,
                price: s['price']! as int,
              ),
          ],
        ),
    ],
    barbers: [for (final b in _list(j['barbers'])) _barberFromJson(b)],
    offers: [
      for (final o in _list(j['offers']))
        SalonOffer(
          id: o['id']! as String,
          kind: OfferKind.values.byName(o['kind']! as String),
          title: o['title']! as String,
          description: o['description'] as String?,
          expiresAt: _date(o['expires_at']),
          originalPrice: o['original_price'] as int?,
          price: o['price'] as int?,
          visitsDone: o['visits_done'] as int?,
          visitsTarget: o['visits_target'] as int?,
          highlighted: o['highlighted'] as bool? ?? false,
          serviceIds: [
            for (final id in (o['service_ids'] as List<Object?>? ?? const []))
              id! as String,
          ],
        ),
    ],
    ratingBreakdown: switch (j['rating_breakdown']) {
      final Map<String, Object?> r => RatingBreakdown(
        quality: (r['quality']! as num).toDouble(),
        cleanliness: (r['cleanliness']! as num).toDouble(),
        timeAccuracy: (r['time_accuracy']! as num).toDouble(),
      ),
      _ => null,
    },
    reviews: [
      for (final r in _list(j['reviews']))
        Review(
          id: r['id']! as String,
          authorName: r['author']! as String,
          stars: r['stars']! as int,
          createdAt: DateTime.parse(r['created_at']! as String),
          text: r['text']! as String,
          serviceName: r['service'] as String?,
          barberName: r['barber'] as String?,
          barberId: r['barber_id'] as String?,
          photoCount: r['photo_count'] as int? ?? 0,
          salonReply: r['reply'] as String?,
        ),
    ],
    hours: [
      for (final h in _list(j['hours']))
        DayHours(
          weekday: h['weekday']! as int,
          opensAt: h['opens'] as int?,
          closesAt: h['closes'] as int?,
        ),
    ],
    gallery: [for (final g in _list(j['gallery'])) _galleryFromJson(g)],
    reviewPhotos: [
      for (final g in _list(j['review_photos'])) _galleryFromJson(g),
    ],
  );

  static Map<String, Object?> toJson(SalonDetails d) => {
    'summary': SalonSummaryModel.toJson(d.summary),
    'address': d.address.toJson(),
    'phone': d.phone,
    'lat': d.latitude,
    'lng': d.longitude,
    'chairs_active': d.chairsActive,
    'service_groups': [
      for (final g in d.serviceGroups)
        {
          'title': g.title,
          'services': [
            for (final s in g.services)
              {
                'id': s.id,
                'name': s.name,
                'category': s.category.name,
                'duration': s.durationMinutes,
                'price': s.price,
              },
          ],
        },
    ],
    'barbers': [for (final b in d.barbers) barberToJson(b)],
    'offers': [
      for (final o in d.offers)
        {
          'id': o.id,
          'kind': o.kind.name,
          'title': o.title,
          'description': o.description,
          'expires_at': o.expiresAt?.toIso8601String(),
          'original_price': o.originalPrice,
          'price': o.price,
          'visits_done': o.visitsDone,
          'visits_target': o.visitsTarget,
          'highlighted': o.highlighted,
          'service_ids': o.serviceIds,
        },
    ],
    'rating_breakdown': switch (d.ratingBreakdown) {
      final r? => {
        'quality': r.quality,
        'cleanliness': r.cleanliness,
        'time_accuracy': r.timeAccuracy,
      },
      null => null,
    },
    'reviews': [
      for (final r in d.reviews)
        {
          'id': r.id,
          'author': r.authorName,
          'stars': r.stars,
          'created_at': r.createdAt.toIso8601String(),
          'text': r.text,
          'service': r.serviceName,
          'barber': r.barberName,
          'barber_id': r.barberId,
          'photo_count': r.photoCount,
          'reply': r.salonReply,
        },
    ],
    'hours': [
      for (final h in d.hours)
        {'weekday': h.weekday, 'opens': h.opensAt, 'closes': h.closesAt},
    ],
    'gallery': [for (final g in d.gallery) _galleryToJson(g)],
    'review_photos': [for (final g in d.reviewPhotos) _galleryToJson(g)],
  };

  static Map<String, Object?> barberToJson(Barber b) => {
    'id': b.id,
    'name': b.name,
    'specialty': b.specialty,
    'years': b.yearsExperience,
    'rating': b.rating,
    'reviews_count': b.reviewsCount,
    'image_url': b.imageUrl,
    'availability': availabilityToJson(b.availability),
  };

  static Map<String, Object?> availabilityToJson(BarberAvailability a) =>
      switch (a) {
        BarberWorking(:final queue) => {
          'status': 'working',
          'queue': QueueLoadModel.toJson(queue),
        },
        BarberOff(:final returnsOn) => {
          'status': 'off',
          'returns_on': returnsOn.toIso8601String(),
        },
      };

  static BarberAvailability availabilityFromJson(Map<String, Object?> j) =>
      j['status'] == 'off'
      ? BarberOff(returnsOn: DateTime.parse(j['returns_on']! as String))
      : BarberWorking(
          QueueLoadModel.fromJson(j['queue']! as Map<String, Object?>),
        );

  static Barber _barberFromJson(Map<String, Object?> b) => Barber(
    id: b['id']! as String,
    name: b['name']! as String,
    specialty: b['specialty']! as String,
    yearsExperience: b['years'] as int?,
    rating: (b['rating'] as num?)?.toDouble(),
    reviewsCount: b['reviews_count'] as int? ?? 0,
    imageUrl: b['image_url'] as String?,
    availability: availabilityFromJson(
      b['availability']! as Map<String, Object?>,
    ),
  );

  static GalleryItem _galleryFromJson(Map<String, Object?> g) => GalleryItem(
    id: g['id']! as String,
    kind: GalleryKind.values.byName(g['kind']! as String),
    url: g['url'] as String?,
    caption: g['caption'] as String?,
    durationSeconds: g['duration'] as int?,
  );

  static Map<String, Object?> _galleryToJson(GalleryItem g) => {
    'id': g.id,
    'kind': g.kind.name,
    'url': g.url,
    'caption': g.caption,
    'duration': g.durationSeconds,
  };

  static List<Map<String, Object?>> _list(Object? value) => [
    for (final e in (value as List<Object?>? ?? const []))
      e! as Map<String, Object?>,
  ];

  static DateTime? _date(Object? value) =>
      value is String ? DateTime.parse(value) : null;
}
