import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/usecase/usecase.dart';
import '../../../core/utils/debounce.dart';
import '../../../core/utils/result.dart';
import '../../salons/domain/entities/area.dart';
import '../../salons/domain/entities/catalog_snapshot.dart';
import '../../salons/domain/entities/salon_summary.dart';
import '../../salons/domain/entities/search_criteria.dart';
import '../../salons/domain/services/salon_matcher.dart';
import '../../salons/domain/usecases.dart';

// ---- events ------------------------------------------------------------------

sealed class SearchEvent {
  const SearchEvent();
}

/// Applies criteria coming from the URL (home "see all" links).
final class SearchLaunched extends SearchEvent {
  const SearchLaunched({this.sort, this.openNowOnly = false});

  final SalonSort? sort;
  final bool openNowOnly;
}

final class SearchQueryChanged extends SearchEvent {
  const SearchQueryChanged(this.query);

  final String query;
}

/// Keyboard "search" or picking a suggestion: remembers [query]. Carries
/// the text itself because [SearchQueryChanged] is debounced.
final class SearchQueryCommitted extends SearchEvent {
  const SearchQueryCommitted(this.query);

  final String query;
}

final class SearchCriteriaApplied extends SearchEvent {
  const SearchCriteriaApplied(this.criteria);

  final SearchCriteria criteria;
}

final class SearchFiltersCleared extends SearchEvent {
  const SearchFiltersCleared();
}

final class SearchRadiusExpanded extends SearchEvent {
  const SearchRadiusExpanded();
}

final class SearchRetried extends SearchEvent {
  const SearchRetried();
}

final class RecentSearchRemoved extends SearchEvent {
  const RecentSearchRemoved(this.query);

  final String query;
}

final class RecentSearchesCleared extends SearchEvent {
  const RecentSearchesCleared();
}

final class _AreaChanged extends SearchEvent {
  const _AreaChanged(this.areaId);

  final String areaId;
}

final class _CatalogUpdated extends SearchEvent {
  const _CatalogUpdated(this.snapshot);

  final CatalogSnapshot snapshot;
}

final class _RecentUpdated extends SearchEvent {
  const _RecentUpdated(this.recent);

  final List<String> recent;
}

final class _AreasLoaded extends SearchEvent {
  const _AreasLoaded(this.areas);

  final List<Area> areas;
}

// ---- state -------------------------------------------------------------------

final class SearchState extends Equatable {
  const SearchState({
    this.criteria = const SearchCriteria(),
    this.snapshot = const CatalogSnapshot(),
    this.recent = const [],
    this.areaId = '',
    this.areas = const [],
  });

  final SearchCriteria criteria;
  final CatalogSnapshot snapshot;
  final List<String> recent;
  final String areaId;
  final List<Area> areas;

  Area? get area => areas.where((a) => a.id == areaId).firstOrNull;

  List<SalonSummary> get _salons => snapshot.salons ?? const [];

  /// No query and no filters: show recents + nearby (frame 12).
  bool get isIdle => criteria.query.trim().isEmpty && !criteria.hasFilters;

  List<SalonSummary> results(DateTime now) =>
      SalonMatcher.apply(_salons, criteria, now: now);

  /// Frame 12 "قريب منك دلوقتي", sorted by wait.
  List<SalonSummary> nearby(DateTime now) => SalonMatcher.apply(
    _salons,
    const SearchCriteria(sort: SalonSort.leastWait),
    now: now,
  );

  /// Count preview for the filter sheet.
  int countFor(SearchCriteria draft, DateTime now) =>
      SalonMatcher.apply(_salons, draft, now: now).length;

  List<SalonSummary> get suggestions =>
      SalonMatcher.suggestions(_salons, criteria.query);

  bool get canExpandRadius =>
      criteria.radiusKm < SearchCriteria.expandedRadiusKm;

  SearchState copyWith({
    SearchCriteria? criteria,
    CatalogSnapshot? snapshot,
    List<String>? recent,
    String? areaId,
    List<Area>? areas,
  }) => SearchState(
    criteria: criteria ?? this.criteria,
    snapshot: snapshot ?? this.snapshot,
    recent: recent ?? this.recent,
    areaId: areaId ?? this.areaId,
    areas: areas ?? this.areas,
  );

  @override
  List<Object?> get props => [criteria, snapshot, recent, areaId, areas];
}

// ---- bloc --------------------------------------------------------------------

class SearchBloc extends Bloc<SearchEvent, SearchState> {
  SearchBloc({
    required WatchSelectedArea watchSelectedArea,
    required this._watchCatalog,
    required this._refreshCatalog,
    required GetAreas getAreas,
    required RecentSearches recentSearches,
    this.debounce = const Duration(milliseconds: 300),
  }) : _recent = recentSearches,
       super(SearchState(areaId: watchSelectedArea.current)) {
    on<SearchQueryChanged>(
      _onQueryChanged,
      transformer: debounceRestartable(debounce),
    );
    on<SearchLaunched>(_onLaunched);
    on<SearchQueryCommitted>(_onCommitted);
    on<SearchCriteriaApplied>(
      (e, emit) => emit(state.copyWith(criteria: e.criteria)),
    );
    on<SearchFiltersCleared>(
      (_, emit) =>
          emit(state.copyWith(criteria: state.criteria.withoutFilters())),
    );
    on<SearchRadiusExpanded>(
      (_, emit) => emit(
        state.copyWith(
          criteria: state.criteria.copyWith(
            radiusKm: SearchCriteria.expandedRadiusKm,
          ),
        ),
      ),
    );
    on<SearchRetried>((_, _) => _refreshCatalog(state.areaId));
    on<RecentSearchRemoved>((e, _) => _recent.remove(e.query));
    on<RecentSearchesCleared>((_, _) => _recent.clear());
    on<_AreaChanged>(_onAreaChanged);
    on<_CatalogUpdated>(
      (e, emit) => emit(state.copyWith(snapshot: e.snapshot)),
    );
    on<_RecentUpdated>((e, emit) => emit(state.copyWith(recent: e.recent)));
    on<_AreasLoaded>((e, emit) => emit(state.copyWith(areas: e.areas)));

    _areaSub = watchSelectedArea().distinct().listen(
      (id) => add(_AreaChanged(id)),
    );
    _recentSub = _recent.watch().listen((r) => add(_RecentUpdated(r)));
    unawaited(
      getAreas(const NoParams()).then((r) {
        if (isClosed) return;
        if (r case Ok(value: final areas)) add(_AreasLoaded(areas));
      }),
    );
  }

  final Duration debounce;
  final WatchCatalog _watchCatalog;
  final RefreshCatalog _refreshCatalog;
  final RecentSearches _recent;
  late final StreamSubscription<String> _areaSub;
  late final StreamSubscription<List<String>> _recentSub;
  StreamSubscription<CatalogSnapshot>? _catalogSub;

  void _onQueryChanged(SearchQueryChanged e, Emitter<SearchState> emit) =>
      emit(state.copyWith(criteria: state.criteria.copyWith(query: e.query)));

  void _onLaunched(SearchLaunched e, Emitter<SearchState> emit) {
    if (e.sort == null && !e.openNowOnly) return;
    emit(
      state.copyWith(
        criteria: SearchCriteria(
          query: state.criteria.query,
          sort: e.sort,
          openNowOnly: e.openNowOnly,
        ),
      ),
    );
  }

  Future<void> _onCommitted(
    SearchQueryCommitted e,
    Emitter<SearchState> emit,
  ) => _recent.add(e.query);

  Future<void> _onAreaChanged(_AreaChanged e, Emitter<SearchState> emit) async {
    await _catalogSub?.cancel();
    emit(state.copyWith(areaId: e.areaId, snapshot: const CatalogSnapshot()));
    _catalogSub = _watchCatalog(e.areaId)
        .listen((s) => add(_CatalogUpdated(s)));
  }

  @override
  Future<void> close() async {
    await _areaSub.cancel();
    await _recentSub.cancel();
    await _catalogSub?.cancel();
    return super.close();
  }
}
