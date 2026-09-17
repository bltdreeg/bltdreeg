import 'dart:convert';

import '../../../../core/database/app_database.dart';
import '../../domain/entities/area.dart';
import '../../domain/entities/salon_summary.dart';
import '../models/salon_models.dart';

typedef CachedCatalog = ({List<SalonSummary> salons, DateTime updatedAt});

final class SalonCatalogLocalDataSource {
  const SalonCatalogLocalDataSource(this._db);

  final AppDatabase _db;

  static String _catalogKey(String areaId) => 'catalog:$areaId';
  static const _areasKey = 'catalog:areas';
  static const _recentKey = 'search:recent';

  Future<CachedCatalog?> readCatalog(String areaId) async {
    final row = await _db.readCache(_catalogKey(areaId));
    if (row == null) return null;
    final list = jsonDecode(row.payload) as List<Object?>;
    return (
      salons: [
        for (final s in list)
          SalonSummaryModel.fromJson(s! as Map<String, Object?>),
      ],
      updatedAt: row.updatedAt,
    );
  }

  Future<void> saveCatalog(String areaId, List<SalonSummary> salons) =>
      _db.writeCache(
        _catalogKey(areaId),
        jsonEncode([for (final s in salons) SalonSummaryModel.toJson(s)]),
      );

  Future<List<Area>?> readAreas() async {
    final row = await _db.readCache(_areasKey);
    if (row == null) return null;
    return [
      for (final a in jsonDecode(row.payload) as List<Object?>)
        AreaModel.fromJson(a! as Map<String, Object?>),
    ];
  }

  Future<void> saveAreas(List<Area> areas) => _db.writeCache(
    _areasKey,
    jsonEncode([for (final a in areas) AreaModel.toJson(a)]),
  );

  Stream<List<String>> watchRecentSearches() => _db
      .watchCache(_recentKey)
      .map(
        (row) => row == null
            ? const <String>[]
            : [
                for (final q in jsonDecode(row.payload) as List<Object?>)
                  q! as String,
              ],
      );

  Future<List<String>> readRecentSearches() => watchRecentSearches().first;

  Future<void> saveRecentSearches(List<String> queries) =>
      _db.writeCache(_recentKey, jsonEncode(queries));
}
