import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/failures.dart';
import '../../salons/domain/entities/catalog_snapshot.dart';
import '../../salons/domain/entities/salon_summary.dart';
import '../../salons/domain/repositories/salon_catalog_repository.dart';
import '../domain/usecases.dart';

final class FavoritesState extends Equatable {
  const FavoritesState({this.ids, this.snapshot = const CatalogSnapshot()});

  /// Null until the favorite ids arrive.
  final Set<String>? ids;
  final CatalogSnapshot snapshot;

  bool get isLoading => ids == null || (snapshot.salons == null && !isEmpty);
  bool get isEmpty => ids?.isEmpty ?? false;
  Failure? get failure => snapshot.failure;
  bool get isLive => snapshot.isLive;

  /// "Where do I go now", not an alphabetical list: free salons first, then
  /// by wait, with closed ones last (board note, frame 34).
  List<SalonSummary> get salons {
    final favorites = [
      for (final s in snapshot.salons ?? const <SalonSummary>[])
        if (ids?.contains(s.id) ?? false) s,
    ];
    return favorites..sort((a, b) {
      if (a.isOpen != b.isOpen) return a.isOpen ? -1 : 1;
      final byWait = a.queue.waitMinutes.compareTo(b.queue.waitMinutes);
      return byWait != 0 ? byWait : a.distanceKm.compareTo(b.distanceKm);
    });
  }

  FavoritesState copyWith({Set<String>? ids, CatalogSnapshot? snapshot}) =>
      FavoritesState(ids: ids ?? this.ids, snapshot: snapshot ?? this.snapshot);

  @override
  List<Object?> get props => [ids, snapshot];
}

/// Frames 34-35: favorites as a "where can I go now" board.
class FavoritesCubit extends Cubit<FavoritesState> {
  FavoritesCubit({
    required WatchFavoriteIds watchFavorites,
    required this._catalog,
    required this._toggleFavorite,
  }) : super(const FavoritesState()) {
    _idsSub = watchFavorites().listen(_onIds);
  }

  final SalonCatalogRepository _catalog;
  final ToggleFavorite _toggleFavorite;
  late final StreamSubscription<Set<String>> _idsSub;
  StreamSubscription<CatalogSnapshot>? _salonsSub;

  void _onIds(Set<String> ids) {
    final changed = state.ids == null || !_sameSet(state.ids!, ids);
    emit(state.copyWith(ids: ids));
    // Removing a favorite keeps the loaded salons: the row just drops out.
    if (changed && ids.isNotEmpty) _watchSalons(ids);
  }

  void _watchSalons(Set<String> ids) {
    unawaited(_salonsSub?.cancel());
    _salonsSub = _catalog
        .watchSalons(ids)
        .listen((snapshot) => emit(state.copyWith(snapshot: snapshot)));
  }

  static bool _sameSet(Set<String> a, Set<String> b) =>
      a.length == b.length && a.containsAll(b);

  Future<void> refresh() =>
      _catalog.refreshSalons(state.ids ?? const <String>{});

  Future<void> remove(String salonId) =>
      _toggleFavorite(salonId, favorite: false);

  @override
  Future<void> close() async {
    await _idsSub.cancel();
    await _salonsSub?.cancel();
    return super.close();
  }
}
