import 'dart:convert';

import '../../../../core/database/app_database.dart';

/// Salons the user opened, newest first (offline home "آخر صالونات شوفتها").
final class RecentlyViewedRepository {
  const RecentlyViewedRepository(this._db);

  static const _key = 'salons:recently_viewed';
  static const maxEntries = 10;

  final AppDatabase _db;

  Stream<List<String>> watch() => _db
      .watchCache(_key)
      .map(
        (row) => row == null
            ? const <String>[]
            : [
                for (final id in jsonDecode(row.payload) as List<Object?>)
                  id! as String,
              ],
      );

  Future<void> record(String salonId) async {
    final current = await watch().first;
    await _db.writeCache(
      _key,
      jsonEncode(
        [
          salonId,
          ...current.where((id) => id != salonId),
        ].take(maxEntries).toList(),
      ),
    );
  }
}
