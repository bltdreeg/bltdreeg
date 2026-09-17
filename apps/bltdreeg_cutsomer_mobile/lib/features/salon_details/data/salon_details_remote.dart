import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../../../core/config/app_environment.dart';
import '../../../core/error/exceptions.dart';
import '../../../core/l10n_data/localized_text.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/fake_server.dart';
import '../../salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import '../../salons/data/models/salon_models.dart';
import '../../salons/domain/entities/salon_summary.dart';
import '../domain/salon_details.dart';
import 'salon_details_models.dart';

abstract interface class SalonDetailsRemoteDataSource {
  Future<SalonDetails> fetch(String salonId);

  /// Push stream of the salon's queue and barbers' sub-queues.
  Stream<SalonLiveUpdate> watchLive(String salonId);
}

final class ApiSalonDetailsRemoteDataSource
    implements SalonDetailsRemoteDataSource {
  const ApiSalonDetailsRemoteDataSource(this._api, this._env);

  final ApiClient _api;
  final AppEnvironment _env;

  @override
  Future<SalonDetails> fetch(String salonId) async =>
      SalonDetailsModel.fromJson(await _api.getJson('/salons/$salonId'));

  @override
  Stream<SalonLiveUpdate> watchLive(String salonId) {
    final channel = WebSocketChannel.connect(
      Uri.parse('${_env.queueSocketUrl}/salons/$salonId'),
    );
    return channel.stream.map((message) {
      final json = jsonDecode(message as String) as Map<String, Object?>;
      return SalonLiveUpdate(
        load: QueueLoadModel.fromJson(json['load']! as Map<String, Object?>),
        barbers: {
          for (final e in (json['barbers']! as Map<String, Object?>).entries)
            e.key: SalonDetailsModel.availabilityFromJson(
              e.value! as Map<String, Object?>,
            ),
        },
      );
    });
  }
}

/// Builds rich details on top of the fake catalog, so the salon page and the
/// lists always agree. "صالون الكابتن حسام" (s1) carries the board's exact
/// content; other salons get consistent generated content.
final class FakeSalonDetailsRemoteDataSource
    implements SalonDetailsRemoteDataSource {
  FakeSalonDetailsRemoteDataSource({
    required this._server,
    required this._catalog,
    DateTime Function()? clock,
  }) : _clock = clock ?? DateTime.now;

  final FakeServer _server;
  final FakeSalonCatalogRemoteDataSource _catalog;
  final DateTime Function() _clock;

  @override
  Future<SalonDetails> fetch(String salonId) => _server(() {
    final summary = _catalog.salonById(salonId);
    if (summary == null) throw NotFoundException('salon $salonId');
    return _build(summary);
  });

  @override
  Stream<SalonLiveUpdate> watchLive(String salonId) {
    final summary = _catalog.salonById(salonId);
    if (summary == null) return const Stream.empty();
    return _catalog
        .watchQueueLoads(summary.areaId)
        .where((loads) => loads.containsKey(salonId))
        .map((loads) {
          final current = _catalog.salonById(salonId)!;
          return SalonLiveUpdate(
            load: loads[salonId]!,
            barbers: {for (final b in _barbers(current)) b.id: b.availability},
          );
        });
  }

  /// Current details without latency (other fake backends build on it).
  SalonDetails? detailsFor(String salonId) =>
      switch (_catalog.salonById(salonId)) {
        final summary? => _build(summary),
        null => null,
      };

  // ---- fixtures --------------------------------------------------------------

  SalonDetails _build(SalonSummary s) => SalonDetails(
    summary: s,
    address:
        _addresses[s.id] ?? LocalizedText(ar: s.areaName.ar, en: s.areaName.en),
    phone:
        '0225${s.id.hashCode.abs().toString().padLeft(6, '0').substring(0, 6)}',
    latitude: 29.9602 + s.distanceKm / 200,
    longitude: 31.2569 + s.distanceKm / 250,
    chairsActive: s.id == 's1' ? 3 : 2,
    serviceGroups: _services(s),
    barbers: _barbers(s),
    offers: _offers(s),
    ratingBreakdown: s.rating == null
        ? null
        : RatingBreakdown(
            quality: (s.rating! + 0.1).clamp(0, 5),
            cleanliness: (s.rating! - 0.1).clamp(0, 5),
            timeAccuracy: (s.rating! - 0.6).clamp(0, 5),
          ),
    reviews: _reviews(s),
    hours: _hours(s),
    gallery: _gallery(s),
    reviewPhotos: [
      for (var i = 1; i <= 3; i++)
        GalleryItem(id: '${s.id}-rp$i', kind: GalleryKind.work),
    ],
  );

  static const _addresses = {
    's1': LocalizedText(
      ar: '9 ش المنشية، المعادي',
      en: '9 El Manshia St, Maadi',
    ),
    's3': LocalizedText(
      ar: '27 ش النصر، المعادي الجديدة',
      en: '27 El Nasr St, New Maadi',
    ),
  };

  List<ServiceGroup> _services(SalonSummary s) {
    if (s.id == 's1') {
      return const [
        ServiceGroup(
          title: 'حلاقة وتصفيف',
          services: [
            SalonService(
              id: 's1-haircut',
              name: 'قصة شعر',
              category: ServiceCategory.haircut,
              durationMinutes: 25,
              price: 70,
            ),
            SalonService(
              id: 's1-haircut-wash',
              name: 'قصة شعر + غسيل',
              category: ServiceCategory.haircut,
              durationMinutes: 35,
              price: 90,
            ),
            SalonService(
              id: 's1-kids',
              name: 'حلاقة أطفال',
              category: ServiceCategory.kids,
              durationMinutes: 20,
              price: 55,
            ),
          ],
        ),
        ServiceGroup(
          title: 'دقن وعناية',
          services: [
            SalonService(
              id: 's1-beard',
              name: 'حلاقة دقن',
              category: ServiceCategory.beard,
              durationMinutes: 15,
              price: 50,
            ),
            SalonService(
              id: 's1-skincare',
              name: 'ماسك وتنظيف بشرة',
              category: ServiceCategory.skincare,
              durationMinutes: 30,
              price: 110,
            ),
          ],
        ),
      ];
    }
    const meta = {
      ServiceCategory.haircut: ('قصة شعر', 25),
      ServiceCategory.kids: ('حلاقة أطفال', 20),
      ServiceCategory.color: ('صبغة', 45),
      ServiceCategory.beard: ('حلاقة دقن', 15),
      ServiceCategory.skincare: ('تنظيف بشرة', 30),
    };
    SalonService service(ServiceCategory c) => SalonService(
      id: '${s.id}-${c.name}',
      name: meta[c]!.$1,
      category: c,
      durationMinutes: meta[c]!.$2,
      price: s.servicePrices[c]!,
    );
    final hair = [
      for (final c in const [
        ServiceCategory.haircut,
        ServiceCategory.kids,
        ServiceCategory.color,
      ])
        if (s.services.contains(c)) service(c),
    ];
    final care = [
      for (final c in const [ServiceCategory.beard, ServiceCategory.skincare])
        if (s.services.contains(c)) service(c),
    ];
    return [
      if (hair.isNotEmpty) ServiceGroup(title: 'حلاقة وتصفيف', services: hair),
      if (care.isNotEmpty) ServiceGroup(title: 'دقن وعناية', services: care),
    ];
  }

  /// Named-barber sub-queues are longer than the shared queue by a fixed
  /// offset per barber (board frame 22: salon free, أحمد has 2 ahead).
  List<Barber> _barbers(SalonSummary s) {
    final perPerson = _catalog.minutesPerPerson(s.id);
    BarberAvailability working(int offset) {
      final ahead = s.queue.peopleAhead + offset;
      return BarberWorking(
        QueueLoad(
          peopleAhead: ahead,
          waitMinutes: ahead * perPerson + offset * 1,
        ),
      );
    }

    final tomorrow = DateTime(_clock().year, _clock().month, _clock().day + 1);
    if (s.id == 's1') {
      return [
        Barber(
          id: 's1-b1',
          name: 'أحمد مجدي',
          specialty: 'فيد وتدريج',
          yearsExperience: 6,
          rating: 4.9,
          reviewsCount: 86,
          availability: working(2),
        ),
        Barber(
          id: 's1-b2',
          name: 'محمود السيد',
          specialty: 'حلاقة كلاسيك ودقن',
          yearsExperience: 4,
          rating: 4.6,
          reviewsCount: 52,
          availability: working(0),
        ),
        Barber(
          id: 's1-b3',
          name: 'كريم عبد الله',
          specialty: 'صبغة وعلاج شعر',
          rating: 4.4,
          reviewsCount: 29,
          availability: BarberOff(returnsOn: tomorrow),
        ),
      ];
    }
    const names = [
      ('عمر حسين', 'فيد وتدريج'),
      ('مصطفى كمال', 'حلاقة كلاسيك'),
      ('سيد عبد العزيز', 'دقن وتحديد'),
      ('هاني فؤاد', 'قصات أطفال'),
    ];
    final seed = int.parse(s.id.substring(1));
    return [
      for (var i = 0; i < 2; i++)
        Barber(
          id: '${s.id}-b${i + 1}',
          name: names[(seed + i) % names.length].$1,
          specialty: names[(seed + i) % names.length].$2,
          yearsExperience: 2 + (seed + i) % 7,
          rating: s.rating == null ? null : (s.rating! - i * 0.2).clamp(3, 5),
          reviewsCount: s.reviewsCount ~/ (2 + i),
          availability: s.isOpen ? working(i) : BarberOff(returnsOn: tomorrow),
        ),
    ];
  }

  List<SalonOffer> _offers(SalonSummary s) {
    final now = _clock();
    if (s.id == 's1') {
      return [
        SalonOffer(
          id: 's1-o1',
          kind: OfferKind.discount,
          title: 'خصم 20٪ على قصة الشعر',
          description: 'من الأحد للأربعاء، من 12 ظهراً لـ 4 عصراً',
          expiresAt: now.add(const Duration(days: 6)),
          highlighted: true,
        ),
        const SalonOffer(
          id: 's1-o2',
          kind: OfferKind.bundle,
          title: 'باقة: قصة + دقن بـ 100 ج.م',
          originalPrice: 120,
          price: 100,
          serviceIds: ['s1-haircut', 's1-beard'],
        ),
        const SalonOffer(
          id: 's1-o3',
          kind: OfferKind.loyalty,
          title: 'الخامسة ببلاش',
          visitsDone: 3,
          visitsTarget: 5,
        ),
      ];
    }
    return [
      SalonOffer(
        id: '${s.id}-o1',
        kind: OfferKind.loyalty,
        title: 'السادسة ببلاش',
        visitsDone: int.parse(s.id.substring(1)) % 5,
        visitsTarget: 6,
      ),
    ];
  }

  List<Review> _reviews(SalonSummary s) {
    final now = _clock();
    if (s.rating == null) return const [];
    if (s.id == 's1') {
      return [
        Review(
          id: 's1-r1',
          authorName: 'محمد طارق',
          stars: 5,
          createdAt: now.subtract(const Duration(days: 3)),
          text: 'الأسطى أحمد ايده خفيفة والقصة طلعت زي ما طلبت بالظبط. المحل نضيف والدور كان بالظبط زي ما التطبيق قال.',
          serviceName: 'قصة شعر',
          barberName: 'أحمد مجدي',
          barberId: 's1-b1',
        ),
        Review(
          id: 's1-r2',
          authorName: 'يوسف الشناوي',
          stars: 4,
          createdAt: now.subtract(const Duration(days: 7)),
          text: 'الحلاقة ممتازة بس استنيت 10 دقايق زيادة عن الوقت اللي التطبيق قاله.',
          salonReply: 'اعتذر يا فندم، كان فيه زبون اتأخر. شكراً لملاحظتك.',
        ),
        Review(
          id: 's1-r3',
          authorName: 'عمرو فتحي',
          stars: 5,
          createdAt: now.subtract(const Duration(days: 12)),
          text: 'أحسن فيد عملته من زمان. صورت القصة عشان أرجع بيها تاني.',
          serviceName: 'قصة شعر + غسيل',
          barberName: 'أحمد مجدي',
          barberId: 's1-b1',
          photoCount: 2,
        ),
        Review(
          id: 's1-r4',
          authorName: 'شريف منير',
          stars: 3,
          createdAt: now.subtract(const Duration(days: 20)),
          text: 'الدقن كويسة بس المكان كان زحمة شوية يوم الجمعة.',
          serviceName: 'حلاقة دقن',
          barberName: 'محمود السيد',
          barberId: 's1-b2',
        ),
      ];
    }
    return [
      Review(
        id: '${s.id}-r1',
        authorName: 'أحمد سامي',
        stars: s.rating!.round(),
        createdAt: now.subtract(const Duration(days: 5)),
        text: 'خدمة كويسة والأسعار زي المكتوب بالظبط.',
        serviceName: 'قصة شعر',
      ),
    ];
  }

  List<DayHours> _hours(SalonSummary s) {
    const h = 60;
    return [
      for (var weekday = 1; weekday <= 7; weekday++)
        if (s.closedWeekdays.contains(weekday))
          DayHours.closed(weekday)
        else
          switch (weekday) {
            DateTime.thursday => DayHours(
              weekday: weekday,
              opensAt: 11 * h,
              closesAt: 25 * h,
            ),
            DateTime.friday => DayHours(
              weekday: weekday,
              opensAt: 14 * h,
              closesAt: 25 * h,
            ),
            _ => DayHours(weekday: weekday, opensAt: 11 * h, closesAt: 24 * h),
          },
    ];
  }

  List<GalleryItem> _gallery(SalonSummary s) => [
    GalleryItem(
      id: '${s.id}-v1',
      kind: GalleryKind.video,
      caption: 'جولة في المحل',
      durationSeconds: 48,
    ),
    for (var i = 1; i <= 7; i++)
      GalleryItem(id: '${s.id}-w$i', kind: GalleryKind.work),
    for (var i = 1; i <= 5; i++)
      GalleryItem(id: '${s.id}-p$i', kind: GalleryKind.place),
  ];
}
