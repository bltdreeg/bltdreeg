import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';

part 'app_database.g.dart';

/// Server payloads cached as JSON, keyed by resource
/// (e.g. `salon:42`, `home_feed:maadi`). Repositories emit these instantly,
/// then refresh from the remote source.
class CacheEntries extends Table {
  TextColumn get key => text()();
  TextColumn get payload => text()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {key};
}

/// Writes captured while offline (outbox pattern). Replayed in insertion
/// order by `OutboxProcessor` when connectivity returns.
class OutboxEntries extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get type => text()();
  TextColumn get payload => text()();
  DateTimeColumn get createdAt => dateTime()();
  IntColumn get attempts => integer().withDefault(const Constant(0))();
  TextColumn get lastError => text().nullable()();
}

@DriftDatabase(tables: [CacheEntries, OutboxEntries])
class AppDatabase extends _$AppDatabase {
  AppDatabase([QueryExecutor? executor])
    : super(executor ?? driftDatabase(name: 'beltadreeg'));

  @override
  int get schemaVersion => 1;

  // ---- cache ---------------------------------------------------------------

  Stream<CacheEntry?> watchCache(String key) => (select(
    cacheEntries,
  )..where((t) => t.key.equals(key))).watchSingleOrNull();

  Future<CacheEntry?> readCache(String key) =>
      (select(cacheEntries)..where((t) => t.key.equals(key))).getSingleOrNull();

  Future<void> writeCache(String key, String payload) => into(cacheEntries)
      .insertOnConflictUpdate(
        CacheEntriesCompanion.insert(
          key: key,
          payload: payload,
          updatedAt: DateTime.now(),
        ),
      );

  Future<void> deleteCache(String key) =>
      (delete(cacheEntries)..where((t) => t.key.equals(key))).go();

  Future<void> clearCache() => delete(cacheEntries).go();

  // ---- outbox --------------------------------------------------------------

  Future<int> enqueueOutbox(String type, String payload) =>
      into(outboxEntries).insert(
        OutboxEntriesCompanion.insert(
          type: type,
          payload: payload,
          createdAt: DateTime.now(),
        ),
      );

  Future<List<OutboxEntry>> pendingOutbox() =>
      (select(outboxEntries)..orderBy([(t) => OrderingTerm.asc(t.id)])).get();

  Stream<int> watchOutboxCount() {
    final count = outboxEntries.id.count();
    return (selectOnly(
      outboxEntries,
    )..addColumns([count])).map((row) => row.read(count) ?? 0).watchSingle();
  }

  Future<void> markOutboxAttempt(int id, String error) =>
      (update(outboxEntries)..where((t) => t.id.equals(id))).write(
        OutboxEntriesCompanion.custom(
          attempts: outboxEntries.attempts + const Constant(1),
          lastError: Variable(error),
        ),
      );

  Future<void> removeOutbox(int id) =>
      (delete(outboxEntries)..where((t) => t.id.equals(id))).go();
}
