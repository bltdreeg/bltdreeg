import '../../../../core/utils/result.dart';
import '../entities/area.dart';
import '../entities/catalog_snapshot.dart';

abstract interface class SalonCatalogRepository {
  /// Offline-first stream for an area: cached data immediately, then the
  /// server copy, then live queue updates while online.
  Stream<CatalogSnapshot> watchCatalog(String areaId);

  /// Offline-first stream for specific salons (favorites), with live queue
  /// updates for the areas they sit in.
  Stream<CatalogSnapshot> watchSalons(Set<String> ids);

  Future<void> refreshSalons(Set<String> ids);

  /// Forces a network refresh for an active [watchCatalog] stream.
  Future<void> refresh(String areaId);

  Future<Result<List<Area>>> getAreas();

  String get selectedAreaId;
  Stream<String> watchSelectedAreaId();
  Future<void> selectArea(String areaId);
}

abstract interface class SearchHistoryRepository {
  Stream<List<String>> watchRecent();
  Future<void> add(String query);
  Future<void> remove(String query);
  Future<void> clear();
}
