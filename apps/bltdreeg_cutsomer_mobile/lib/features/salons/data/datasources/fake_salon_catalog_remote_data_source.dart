import 'dart:async';
import 'dart:math';

import '../../../../core/error/exceptions.dart';
import '../../../../core/l10n_data/localized_text.dart';
import '../../../../core/network/connectivity_service.dart';
import '../../../../core/network/fake_server.dart';
import '../../domain/entities/area.dart';
import '../../domain/entities/salon_summary.dart';
import 'salon_catalog_remote_data_source.dart';

/// In-memory discovery backend seeded with the salons from the design board.
///
/// The Maadi cluster has 10 salons (8 within 5 km, 2 beyond, so "expand
/// search to 10 km" finds more). Every [driftInterval] a few open salons'
/// queues move by ±1 person, pushed like a WebSocket message.
final class FakeSalonCatalogRemoteDataSource
    implements SalonCatalogRemoteDataSource {
  FakeSalonCatalogRemoteDataSource({
    required this._server,
    required this._connectivity,
    DateTime Function()? clock,
    Random? random,
    this.driftInterval = const Duration(seconds: 15),
  }) : _clock = clock ?? DateTime.now,
       _random = random ?? Random(7) {
    _seed();
  }

  final FakeServer _server;
  final ConnectivityService _connectivity;
  final DateTime Function() _clock;
  final Random _random;

  /// Null disables live pushes.
  final Duration? driftInterval;

  static const maadiCluster = {
    'maadi',
    'zahraa-maadi',
    'degla',
    'maadi-gardens',
  };

  static const _cairo = LocalizedText(ar: 'القاهرة', en: 'Cairo');

  static const areas = [
    Area(
      id: 'maadi',
      name: LocalizedText(ar: 'المعادي', en: 'Maadi'),
      city: _cairo,
      salonsCount: 24,
      isNearby: true,
    ),
    Area(
      id: 'zahraa-maadi',
      name: LocalizedText(ar: 'زهراء المعادي', en: 'Zahraa El Maadi'),
      city: _cairo,
      salonsCount: 11,
      isNearby: true,
    ),
    Area(
      id: 'degla',
      name: LocalizedText(ar: 'دجلة', en: 'Degla'),
      city: _cairo,
      salonsCount: 9,
      isNearby: true,
    ),
    Area(
      id: 'maadi-gardens',
      name: LocalizedText(ar: 'حدائق المعادي', en: 'Hadayek El Maadi'),
      city: _cairo,
      salonsCount: 7,
      isNearby: true,
    ),
    Area(
      id: 'nasr-city',
      name: LocalizedText(ar: 'مدينة نصر', en: 'Nasr City'),
      city: _cairo,
      salonsCount: 41,
    ),
    Area(
      id: 'heliopolis',
      name: LocalizedText(ar: 'مصر الجديدة', en: 'Heliopolis'),
      city: _cairo,
      salonsCount: 33,
    ),
    Area(
      id: 'dokki',
      name: LocalizedText(ar: 'الدقي والمهندسين', en: 'Dokki & Mohandessin'),
      city: _cairo,
      salonsCount: 28,
    ),
  ];

  late final List<SalonSummary> _salons;

  /// Minutes each person adds to the wait, per salon.
  final _minutesPerPerson = <String, int>{};

  void _seed() {
    final now = _clock();
    DateTime nextAt(int hour, {bool forceTomorrow = false}) {
      final today = DateTime(now.year, now.month, now.day, hour);
      return forceTomorrow || !today.isAfter(now)
          ? today.add(const Duration(days: 1))
          : today;
    }

    LocalizedText area(String id) => areas.firstWhere((a) => a.id == id).name;
    const newMaadi = LocalizedText(ar: 'المعادي الجديدة', en: 'New Maadi');

    SalonSummary salon({
      required String id,
      required String name,
      required String areaId,
      LocalizedText? areaName,
      required double km,
      double? rating,
      int reviews = 0,
      required Map<ServiceCategory, int> prices,
      required int openedDaysAgo,
      int ahead = 0,
      int perPerson = 9,
      DateTime? opensAt,
      Set<int> closedWeekdays = const {},
    }) {
      _minutesPerPerson[id] = perPerson;
      return SalonSummary(
        id: id,
        name: name,
        areaId: areaId,
        areaName: areaName ?? area(areaId),
        distanceKm: km,
        rating: rating,
        reviewsCount: reviews,
        priceFrom: prices[ServiceCategory.haircut] ?? prices.values.reduce(min),
        servicePrices: prices,
        services: prices.keys.toSet(),
        openedOn: now.subtract(Duration(days: openedDaysAgo)),
        queue: QueueLoad(peopleAhead: ahead, waitMinutes: ahead * perPerson),
        opensAt: opensAt,
        closedWeekdays: closedWeekdays,
      );
    }

    const h = ServiceCategory.haircut;
    const b = ServiceCategory.beard;
    const k = ServiceCategory.kids;
    const c = ServiceCategory.color;
    const s = ServiceCategory.skincare;

    _salons = [
      salon(
        id: 's1',
        name: 'صالون الكابتن حسام',
        areaId: 'maadi',
        km: 0.8,
        rating: 4.8,
        reviews: 214,
        prices: {h: 70, b: 50, k: 55, s: 110},
        openedDaysAgo: 900,
        closedWeekdays: {DateTime.sunday},
      ),
      salon(
        id: 's2',
        name: 'الدهّان للحلاقة',
        areaId: 'zahraa-maadi',
        km: 1.4,
        rating: 4.5,
        reviews: 96,
        prices: {h: 60, b: 60},
        openedDaysAgo: 700,
        ahead: 1,
        perPerson: 10,
      ),
      salon(
        id: 's3',
        name: 'بربر لاونج المعادي',
        areaId: 'maadi',
        areaName: newMaadi,
        km: 1.2,
        rating: 4.6,
        reviews: 138,
        prices: {h: 90, b: 45, c: 200},
        openedDaysAgo: 520,
        ahead: 2,
        perPerson: 8,
      ),
      salon(
        id: 's4',
        name: 'حلاق الأسطى رجب',
        areaId: 'maadi',
        areaName: const LocalizedText(ar: 'عرب المعادي', en: 'Arab El Maadi'),
        km: 1.6,
        rating: 4.4,
        reviews: 62,
        prices: {h: 50, b: 30, k: 40},
        openedDaysAgo: 2400,
        ahead: 5,
        closedWeekdays: {DateTime.friday},
      ),
      salon(
        id: 's5',
        name: 'Barber Point دجلة',
        areaId: 'degla',
        km: 2.1,
        rating: 4.9,
        reviews: 309,
        prices: {h: 120, b: 70, s: 180, c: 250},
        openedDaysAgo: 400,
        opensAt: nextAt(12),
      ),
      salon(
        id: 's6',
        name: 'صالون النجم',
        areaId: 'maadi',
        km: 1.9,
        prices: {h: 65, k: 50},
        openedDaysAgo: 14,
      ),
      salon(
        id: 's7',
        name: 'كلاسيك بربر شوب',
        areaId: 'maadi',
        areaName: const LocalizedText(
          ar: 'سرايات المعادي',
          en: 'Sarayat El Maadi',
        ),
        km: 2.3,
        rating: 4.3,
        reviews: 41,
        prices: {h: 75, b: 40},
        openedDaysAgo: 30,
        ahead: 3,
        perPerson: 8,
      ),
      salon(
        id: 's8',
        name: 'بربر هاوس الأوتوستراد',
        areaId: 'maadi',
        areaName: const LocalizedText(ar: 'الأوتوستراد', en: 'Autostrad'),
        km: 3.7,
        rating: 4.1,
        reviews: 18,
        prices: {h: 65},
        openedDaysAgo: 200,
        opensAt: nextAt(11, forceTomorrow: true),
      ),
      salon(
        id: 's9',
        name: 'وردة بيوتي سنتر',
        areaId: 'maadi-gardens',
        km: 6.4,
        rating: 4.2,
        reviews: 57,
        prices: {h: 80, c: 220, s: 150},
        openedDaysAgo: 330,
        ahead: 1,
        perPerson: 12,
      ),
      salon(
        id: 's10',
        name: 'صالون الملك',
        areaId: 'zahraa-maadi',
        km: 8.1,
        rating: 4.0,
        reviews: 33,
        prices: {h: 55, b: 35, k: 45},
        openedDaysAgo: 1100,
        ahead: 4,
      ),
    ];
  }

  @override
  Future<List<SalonSummary>> fetchCatalog(String areaId) => _server(
    () => maadiCluster.contains(areaId) ? List.of(_salons) : const [],
  );

  @override
  Future<List<Area>> fetchAreas() => _server(() => areas);

  @override
  Stream<Map<String, QueueLoad>> watchQueueLoads(String areaId) {
    if (driftInterval == null || !maadiCluster.contains(areaId)) {
      return const Stream.empty();
    }
    return _driftStream;
  }

  /// One shared drift ticker for all listeners (home, search, salon page),
  /// like a single server-side queue. Runs only while someone listens.
  late final Stream<Map<String, QueueLoad>> _driftStream = () {
    Timer? timer;
    // Lives as long as this data source (an app-lifetime singleton).
    // ignore: close_sinks
    late final StreamController<Map<String, QueueLoad>> controller;
    controller = StreamController<Map<String, QueueLoad>>.broadcast(
      onListen: () => timer = Timer.periodic(driftInterval!, (_) {
        if (!_connectivity.isOnline) {
          controller.addError(
            const NetworkException('fake-socket: disconnected'),
          );
          return;
        }
        final changed = _drift();
        if (changed.isNotEmpty) controller.add(changed);
      }),
      onCancel: () => timer?.cancel(),
    );
    return controller.stream;
  }();

  /// Current state of one salon (fake salon-details backend).
  SalonSummary? salonById(String id) =>
      _salons.where((s) => s.id == id).firstOrNull;

  int minutesPerPerson(String salonId) => _minutesPerPerson[salonId] ?? 9;

  Map<String, QueueLoad> _drift() {
    final open = [
      for (final s in _salons)
        if (s.isOpen) s,
    ];
    final changed = <String, QueueLoad>{};
    for (var i = 0; i < 3 && open.isNotEmpty; i++) {
      final salon = open.removeAt(_random.nextInt(open.length));
      final ahead = (salon.queue.peopleAhead + _random.nextInt(3) - 1).clamp(
        0,
        8,
      );
      if (ahead == salon.queue.peopleAhead) continue;
      final load = QueueLoad(
        peopleAhead: ahead,
        waitMinutes: ahead * (_minutesPerPerson[salon.id] ?? 9),
      );
      final index = _salons.indexWhere((s) => s.id == salon.id);
      _salons[index] = salon.withQueue(load);
      changed[salon.id] = load;
    }
    return changed;
  }
}
