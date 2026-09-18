import 'dart:convert';

import '../../../../core/database/app_database.dart';
import '../../domain/repositories/recently_viewed_repository.dart';

final class RecentlyViewedRepositoryImpl implements RecentlyViewedRepository {
  const RecentlyViewedRepositoryImpl(this._db);

  static const _key = 'salons:recently_viewed';
  static const maxEntries = 10;

  final AppDatabase _db;

  @override
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

  @override
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
