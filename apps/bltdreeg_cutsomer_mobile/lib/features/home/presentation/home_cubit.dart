import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/usecase/usecase.dart';
import '../../../core/utils/result.dart';
import '../../salons/domain/entities/area.dart';
import '../../salons/domain/entities/catalog_snapshot.dart';
import '../../salons/domain/entities/salon_summary.dart';
import '../../salons/domain/entities/search_criteria.dart';
import '../../salons/domain/repositories/recently_viewed_repository.dart';
import '../../salons/domain/services/salon_matcher.dart';
import '../../salons/domain/usecases.dart';

final class HomeState extends Equatable {
  const HomeState({
    required this.areaId,
    this.areas = const [],
    this.snapshot = const CatalogSnapshot(),
    this.sort = SalonSort.leastWait,
    this.recentIds = const [],
  });

  final String areaId;
  final List<Area> areas;
  final CatalogSnapshot snapshot;

  /// Chip selection; orders the "recommended" list (frame 07).
  final SalonSort sort;

  /// Salons the user opened, newest first.
  final List<String> recentIds;

  Area? get area => areas.where((a) => a.id == areaId).firstOrNull;

  List<SalonSummary> get _all => snapshot.salons ?? const [];

  List<SalonSummary> get _nearby => [
    for (final s in _all)
      if (s.distanceKm <= SearchCriteria.defaultRadiusKm) s,
  ];

  /// "تقدر تدخل دلوقتي": open with at most two people ahead.
  List<SalonSummary> availableNow(DateTime now) => SalonMatcher.sort(
    [
      for (final s in _nearby)
        if (s.isOpen && s.queue.peopleAhead <= 2) s,
    ],
    SalonSort.leastWait,
    now: now,
  ).take(6).toList();

  List<SalonSummary> recommended(DateTime now) => SalonMatcher.sort(
    [
      for (final s in _nearby)
        if (s.rating != null) s,
    ],
    sort,
    now: now,
  ).take(5).toList();

  List<SalonSummary> newInArea(DateTime now) => SalonMatcher.sort(
    [
      for (final s in _nearby)
        if (s.isNew(now)) s,
    ],
    SalonSort.newest,
    now: now,
  );

  /// Cached salons shown while offline ("آخر صالونات شوفتها"): the ones
  /// the user actually opened first, topped up with the nearest.
  List<SalonSummary> get lastSeen {
    final byId = {for (final s in _all) s.id: s};
    final viewed = [for (final id in recentIds) ?byId[id]];
    final rest = SalonMatcher.sort(
      [
        for (final s in _nearby)
          if (!recentIds.contains(s.id)) s,
      ],
      SalonSort.nearest,
      now: DateTime(0),
    );
    return [...viewed, ...rest].take(5).toList();
  }

  HomeState copyWith({
    String? areaId,
    List<Area>? areas,
    CatalogSnapshot? snapshot,
    SalonSort? sort,
    List<String>? recentIds,
  }) => HomeState(
    areaId: areaId ?? this.areaId,
    areas: areas ?? this.areas,
    snapshot: snapshot ?? this.snapshot,
    sort: sort ?? this.sort,
    recentIds: recentIds ?? this.recentIds,
  );

  @override
  List<Object?> get props => [areaId, areas, snapshot, sort, recentIds];
}

class HomeCubit extends Cubit<HomeState> {
  HomeCubit({
    required WatchSelectedArea watchSelectedArea,
    required this._watchCatalog,
    required this._refreshCatalog,
    required GetAreas getAreas,
    RecentlyViewedRepository? recentlyViewed,
  }) : super(HomeState(areaId: watchSelectedArea.current)) {
    _areaSub = watchSelectedArea().distinct().listen(_onArea);
    _recentSub = recentlyViewed?.watch().listen(
      (ids) => emit(state.copyWith(recentIds: ids)),
    );
    unawaited(_loadAreas(getAreas));
  }

  final WatchCatalog _watchCatalog;
  final RefreshCatalog _refreshCatalog;
  late final StreamSubscription<String> _areaSub;
  StreamSubscription<List<String>>? _recentSub;
  StreamSubscription<CatalogSnapshot>? _catalogSub;

  void _onArea(String areaId) {
    unawaited(_catalogSub?.cancel());
    emit(state.copyWith(areaId: areaId, snapshot: const CatalogSnapshot()));
    _catalogSub = _watchCatalog(areaId)
        .listen((snapshot) => emit(state.copyWith(snapshot: snapshot)));
  }

  Future<void> _loadAreas(GetAreas getAreas) async {
    final result = await getAreas(const NoParams());
    if (isClosed) return;
    if (result case Ok(value: final areas)) emit(state.copyWith(areas: areas));
  }

  void sortChanged(SalonSort sort) => emit(state.copyWith(sort: sort));

  Future<void> refresh() => _refreshCatalog(state.areaId);

  @override
  Future<void> close() async {
    await _areaSub.cancel();
    await _recentSub?.cancel();
    await _catalogSub?.cancel();
    return super.close();
  }
}
