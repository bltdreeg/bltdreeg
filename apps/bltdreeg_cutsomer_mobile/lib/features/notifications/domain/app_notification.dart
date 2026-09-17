import 'package:equatable/equatable.dart';

/// What a notification is about. Queue kinds are styled apart from offers so
/// one glance tells them apart (board note, frame 32).
enum NotificationKind {
  yourTurn,
  almostUp,
  queueMoved,
  offer,
  rateReminder,
  cancelled;

  bool get isQueue => switch (this) {
    yourTurn || almostUp || queueMoved || cancelled => true,
    offer || rateReminder => false,
  };
}

final class AppNotification extends Equatable {
  const AppNotification({
    required this.id,
    required this.kind,
    required this.title,
    required this.body,
    required this.createdAt,
    this.isRead = false,
    this.bookingId,
    this.salonId,
  });

  final String id;
  final NotificationKind kind;

  /// Server-authored copy: notifications are sent, not composed on device.
  final String title;
  final String body;
  final DateTime createdAt;
  final bool isRead;

  /// Where tapping goes.
  final String? bookingId;
  final String? salonId;

  AppNotification markRead() => AppNotification(
    id: id,
    kind: kind,
    title: title,
    body: body,
    createdAt: createdAt,
    isRead: true,
    bookingId: bookingId,
    salonId: salonId,
  );

  @override
  List<Object?> get props => [
    id,
    kind,
    title,
    body,
    createdAt,
    isRead,
    bookingId,
    salonId,
  ];
}

abstract interface class NotificationsRepository {
  /// Cached list first, then the server copy.
  Stream<List<AppNotification>> watch();

  Stream<int> watchUnreadCount();

  Future<void> refresh();

  Future<void> markRead(String id);

  Future<void> markAllRead();
}
