import 'package:bltdreeg_cutsomer_mobile/core/database/app_database.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/connectivity_service.dart';
import 'package:bltdreeg_cutsomer_mobile/core/network/fake_server.dart';
import 'package:bltdreeg_cutsomer_mobile/core/sync/outbox_processor.dart';
import 'package:bltdreeg_cutsomer_mobile/features/notifications/data/notifications_data.dart';
import 'package:bltdreeg_cutsomer_mobile/features/notifications/domain/app_notification.dart';
import 'package:bltdreeg_cutsomer_mobile/features/notifications/presentation/notifications_cubit.dart';
import 'package:drift/drift.dart' show driftRuntimeOptions;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../helpers/test_bootstrap.dart';

void main() {
  final now = DateTime(2026, 9, 17, 20);
  late AppDatabase db;
  late FakeConnectivityService connectivity;
  late FakeNotificationsRemoteDataSource remote;
  late OutboxProcessor outbox;
  late NotificationsRepositoryImpl repository;

  setUp(() {
    driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;
    db = AppDatabase(NativeDatabase.memory());
    connectivity = FakeConnectivityService();
    remote = FakeNotificationsRemoteDataSource(
      FakeServer(environment: testEnvironment, connectivity: connectivity),
      clock: () => now,
    );
    outbox = OutboxProcessor(database: db, connectivity: connectivity)..start();
    repository = NotificationsRepositoryImpl(
      remote: remote,
      database: db,
      outbox: outbox,
    );
  });

  tearDown(() async {
    await outbox.dispose();
    await db.close();
  });

  test('queue kinds are told apart from offers', () {
    expect(NotificationKind.yourTurn.isQueue, isTrue);
    expect(NotificationKind.cancelled.isQueue, isTrue);
    expect(NotificationKind.offer.isQueue, isFalse);
    expect(NotificationKind.rateReminder.isQueue, isFalse);
  });

  test('refresh caches the list and counts unread', () async {
    await repository.refresh();
    final items = await repository.watch().first;
    expect(items, hasLength(6));
    expect(await repository.watchUnreadCount().first, 6);
  });

  test('marking read survives a refresh and reaches the server', () async {
    await repository.refresh();
    await repository.markRead('n1');
    expect(await repository.watchUnreadCount().first, 5);

    // The server copy still says unread until the outbox flushes.
    await repository.refresh();
    expect(
      (await repository.watch().first).firstWhere((n) => n.id == 'n1').isRead,
      isTrue,
    );

    await outbox.flush();
    await repository.refresh();
    expect(await repository.watchUnreadCount().first, 5);
  });

  test('mark all read clears the badge', () async {
    await repository.refresh();
    await repository.markAllRead();
    expect(await repository.watchUnreadCount().first, 0);
  });

  test('read marks made offline are replayed later', () async {
    await repository.refresh();
    connectivity.setForcedOffline(value: true);
    await repository.markRead('n4');
    expect(await repository.watchUnreadCount().first, 5);

    connectivity.setForcedOffline(value: false);
    await outbox.flush();
    await repository.refresh();
    expect(
      (await repository.watch().first).firstWhere((n) => n.id == 'n4').isRead,
      isTrue,
    );
  });

  test('groups by today, this week and earlier', () async {
    await repository.refresh();
    final state = NotificationsState(
      items: await repository.watch().first,
      isLoaded: true,
    );
    final groups = state.groupedBy(now);
    expect(groups[NotificationGroup.today]!.map((n) => n.id), [
      'n1',
      'n2',
      'n3',
    ]);
    // Frame 32 keeps the week-old cancellation under "this week".
    expect(groups[NotificationGroup.thisWeek]!.map((n) => n.id), [
      'n4',
      'n5',
      'n6',
    ]);
    expect(groups[NotificationGroup.earlier], isNull);
  });
}
