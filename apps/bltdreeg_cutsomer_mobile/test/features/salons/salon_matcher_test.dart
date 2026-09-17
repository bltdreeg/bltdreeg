import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/entities/salon_summary.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/entities/search_criteria.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/services/salon_matcher.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  final now = DateTime(2026, 9, 17, 9, 41); // Thursday morning
  late List<SalonSummary> salons;

  setUpAll(() async {
    salons = await FakeSalonCatalogRemoteDataSource(
      server: FakeServer(
        environment: testEnvironment,
        connectivity: FakeConnectivityService(),
      ),
      connectivity: FakeConnectivityService(),
      clock: () => now,
    ).fetchCatalog('maadi');
  });

  List<String> names(SearchCriteria c) => [
    for (final s in SalonMatcher.apply(salons, c, now: now)) s.name,
  ];

  test('normalizes Arabic spelling variants', () {
    expect(SalonMatcher.normalize('الدهّان'), 'الدهان');
    expect(SalonMatcher.normalize('وردة'), 'ورده');
    expect(SalonMatcher.normalize('أحمد'), 'احمد');
    expect(SalonMatcher.normalize('٤ BARBER'), '4 barber');
  });

  test('"بربر" finds the 4 barber salons within 5 km (frame 13)', () {
    expect(names(const SearchCriteria(query: 'بربر')), hasLength(4));
  });

  test('"صالون الورد" finds nothing within 5 km, but does within 10 km', () {
    expect(names(const SearchCriteria(query: 'صالون الورد')), isEmpty);
    expect(names(const SearchCriteria(query: 'صالون الورد', radiusKm: 10)), [
      'وردة بيوتي سنتر',
    ]);
  });

  test('filters combine: haircut + open now + price ≤ 80, least wait', () {
    final result = SalonMatcher.apply(
      salons,
      const SearchCriteria(
        services: {ServiceCategory.haircut},
        openNowOnly: true,
        maxPrice: 80,
        sort: SalonSort.leastWait,
      ),
      now: now,
    );
    expect(result.every((s) => s.isOpen), isTrue);
    expect(
      result.every((s) => s.priceFor(ServiceCategory.haircut) <= 80),
      isTrue,
    );
    for (var i = 1; i < result.length; i++) {
      expect(
        result[i - 1].queue.waitMinutes <= result[i].queue.waitMinutes,
        isTrue,
      );
    }
  });

  test('day filter excludes salons closed that weekday', () {
    final sunday = DateTime(2026, 9, 20);
    expect(
      names(SearchCriteria(day: sunday)),
      isNot(contains('صالون الكابتن حسام')),
    );
  });

  test('active filter count matches the board badge', () {
    const criteria = SearchCriteria(
      sort: SalonSort.leastWait,
      services: {ServiceCategory.haircut},
    );
    expect(criteria.activeFilterCount, 2);
    expect(criteria.withoutFilters().activeFilterCount, 0);
  });

  test('suggestions offer close names', () {
    final suggestions = SalonMatcher.suggestions(salons, 'صالون النجوم');
    expect(suggestions.first.name, 'صالون النجم');
  });
}
