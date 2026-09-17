import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/features/home/presentation/home_cubit.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/entities/catalog_snapshot.dart';
import 'package:bltdreeg_cutsomer_mobile/features/salons/domain/entities/search_criteria.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  final now = DateTime(2026, 9, 17, 9, 41);
  late HomeState state;

  setUpAll(() async {
    final salons = await FakeSalonCatalogRemoteDataSource(
      server: FakeServer(
        environment: testEnvironment,
        connectivity: FakeConnectivityService(),
      ),
      connectivity: FakeConnectivityService(),
      clock: () => now,
    ).fetchCatalog('maadi');
    state = HomeState(
      areaId: 'maadi',
      snapshot: CatalogSnapshot(salons: salons, isLive: true),
    );
  });

  test('"walk in now" rail matches the board order (frame 07)', () {
    expect(
      [for (final s in state.availableNow(now)) s.name],
      [
        'صالون الكابتن حسام',
        'صالون النجم',
        'الدهّان للحلاقة',
        'بربر لاونج المعادي',
      ],
    );
  });

  test('sections only use salons within 5 km', () {
    expect(state.recommended(now).every((s) => s.distanceKm <= 5), isTrue);
  });

  test('chip sort reorders recommended', () {
    final topRated = state.copyWith(sort: SalonSort.topRated).recommended(now);
    expect(topRated.first.name, 'Barber Point دجلة');
    final cheapest = state.copyWith(sort: SalonSort.cheapest).recommended(now);
    expect(cheapest.first.name, 'حلاق الأسطى رجب');
  });

  test('"new in your area" lists recently opened salons, newest first', () {
    expect(
      [for (final s in state.newInArea(now)) s.name],
      ['صالون النجم', 'كلاسيك بربر شوب'],
    );
  });
}
