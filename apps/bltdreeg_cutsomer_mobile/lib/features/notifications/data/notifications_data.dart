import 'dart:async';
import 'dart:convert';

import '../../../core/database/app_database.dart';
import '../../../core/error/exceptions.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/fake_server.dart';
import '../../../core/sync/outbox_processor.dart';
import '../domain/app_notification.dart';

abstract final class NotificationModel {
  static Map<String, Object?> toJson(AppNotification n) => {
    'id': n.id,
    'kind': n.kind.name,
    'title': n.title,
    'body': n.body,
    'created_at': n.createdAt.toIso8601String(),
    'is_read': n.isRead,
    'booking_id': n.bookingId,
    'salon_id': n.salonId,
  };

  static AppNotification fromJson(Map<String, Object?> j) => AppNotification(
    id: j['id']! as String,
    kind:
        NotificationKind.values.asNameMap()[j['kind']] ??
        NotificationKind.queueMoved,
    title: j['title']! as String,
    body: j['body']! as String,
    createdAt: DateTime.parse(j['created_at']! as String),
    isRead: j['is_read'] as bool? ?? false,
    bookingId: j['booking_id'] as String?,
    salonId: j['salon_id'] as String?,
  );
}

abstract interface class NotificationsRemoteDataSource {
  Future<List<AppNotification>> fetch();

  Future<void> markRead(List<String> ids);
}

final class ApiNotificationsRemoteDataSource
    implements NotificationsRemoteDataSource {
  const ApiNotificationsRemoteDataSource(this._api);

  final ApiClient _api;

  @override
  Future<List<AppNotification>> fetch() async {
    final json = await _api.getJson('/me/notifications');
    return [
      for (final n in json['notifications']! as List<Object?>)
        NotificationModel.fromJson(n! as Map<String, Object?>),
    ];
  }

  @override
  Future<void> markRead(List<String> ids) =>
      _api.postJson('/me/notifications/read', body: {'ids': ids});
}

/// Seeded with the board's notification history (frame 32).
final class FakeNotificationsRemoteDataSource
    implements NotificationsRemoteDataSource {
  FakeNotificationsRemoteDataSource(this._server, {DateTime Function()? clock})
    : _clock = clock ?? DateTime.now;

  final FakeServer _server;
  final DateTime Function() _clock;
  final _read = <String>{};

  @override
  Future<List<AppNotification>> fetch() => _server(() {
    final now = _clock();
    AppNotification n({
      required String id,
      required NotificationKind kind,
      required String title,
      required String body,
      required Duration ago,
      String? bookingId,
      String? salonId,
    }) => AppNotification(
      id: id,
      kind: kind,
      title: title,
      body: body,
      createdAt: now.subtract(ago),
      isRead: _read.contains(id),
      bookingId: bookingId,
      salonId: salonId,
    );

    return [
      n(
        id: 'n1',
        kind: NotificationKind.yourTurn,
        title: 'حان دورك',
        body: 'ادخل على الكرسي في صالون الكابتن حسام. عندك 5 دقايق.',
        ago: const Duration(minutes: 4),
        bookingId: 'bk-past-1',
        salonId: 's1',
      ),
      n(
        id: 'n2',
        kind: NotificationKind.almostUp,
        title: 'فاضلك واحد بس — اتحرّك',
        body: 'المشوار 4 دقايق من مكانك لصالون الكابتن حسام.',
        ago: const Duration(minutes: 14),
        bookingId: 'bk-past-1',
        salonId: 's1',
      ),
      n(
        id: 'n3',
        kind: NotificationKind.queueMoved,
        title: 'فاضلك اتنين',
        body: 'دورك قرّب في صالون الكابتن حسام.',
        ago: const Duration(minutes: 22),
        bookingId: 'bk-past-1',
        salonId: 's1',
      ),
      n(
        id: 'n4',
        kind: NotificationKind.offer,
        title: 'عرض جديد في صالون مفضّل عندك',
        body: 'خصم 20٪ على قصة الشعر في الكابتن حسام، من 12 لـ 4.',
        ago: const Duration(days: 2),
        salonId: 's1',
      ),
      n(
        id: 'n5',
        kind: NotificationKind.rateReminder,
        title: 'قيّم زيارتك الأخيرة',
        body: 'رأيك في أحمد مجدي هيساعد ناس تانية تختار.',
        ago: const Duration(days: 5),
        bookingId: 'bk-past-1',
        salonId: 's1',
      ),
      n(
        id: 'n6',
        kind: NotificationKind.cancelled,
        title: 'دورك اتلغى',
        body: 'ما حضرتش في الوقت المحدد في حلاق الأسطى رجب.',
        ago: const Duration(days: 7),
        bookingId: 'bk-past-3',
        salonId: 's5',
      ),
    ];
  });

  @override
  Future<void> markRead(List<String> ids) => _server(
    () => _read.addAll(ids),
    latency: const Duration(milliseconds: 250),
  );
}

final class NotificationsRepositoryImpl implements NotificationsRepository {
  NotificationsRepositoryImpl({
    required this._remote,
    required AppDatabase database,
    required this._outbox,
  }) : _db = database {
    _outbox.register(outboxType, (payload) async {
      await _remote.markRead([
        for (final id in payload['ids']! as List<Object?>) id! as String,
      ]);
    });
  }

  static const outboxType = 'notifications.read';
  static const _cacheKey = 'notifications:list';

  final NotificationsRemoteDataSource _remote;
  final AppDatabase _db;
  final OutboxProcessor _outbox;

  @override
  Stream<List<AppNotification>> watch() => _db
      .watchCache(_cacheKey)
      .map(
        (row) => row == null
            ? const <AppNotification>[]
            : [
                for (final n in jsonDecode(row.payload) as List<Object?>)
                  NotificationModel.fromJson(n! as Map<String, Object?>),
              ],
      );

  @override
  Stream<int> watchUnreadCount() =>
      watch().map((list) => list.where((n) => !n.isRead).length).distinct();

  @override
  Future<void> refresh() async {
    try {
      final fetched = await _remote.fetch();
      // Local read marks win: they may not have reached the server yet.
      final localRead = {
        for (final n in await watch().first)
          if (n.isRead) n.id,
      };
      await _write([
        for (final n in fetched)
          if (localRead.contains(n.id)) n.markRead() else n,
      ]);
    } on AppException {
      // Offline: keep the cached list.
    }
  }

  @override
  Future<void> markRead(String id) => _mark([id]);

  @override
  Future<void> markAllRead() async {
    final unread = [
      for (final n in await watch().first)
        if (!n.isRead) n.id,
    ];
    if (unread.isNotEmpty) await _mark(unread);
  }

  Future<void> _mark(List<String> ids) async {
    final current = await watch().first;
    await _write([
      for (final n in current)
        if (ids.contains(n.id)) n.markRead() else n,
    ]);
    await _outbox.enqueue(outboxType, {'ids': ids});
  }

  Future<void> _write(List<AppNotification> list) => _db.writeCache(
    _cacheKey,
    jsonEncode([for (final n in list) NotificationModel.toJson(n)]),
  );
}
