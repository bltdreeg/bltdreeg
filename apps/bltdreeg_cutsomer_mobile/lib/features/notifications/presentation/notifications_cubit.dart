import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../domain/app_notification.dart';

/// Day buckets shown as group labels (frame 32).
enum NotificationGroup { today, thisWeek, earlier }

final class NotificationsState extends Equatable {
  const NotificationsState({this.items = const [], this.isLoaded = false});

  final List<AppNotification> items;
  final bool isLoaded;

  int get unread => items.where((n) => !n.isRead).length;
  bool get isEmpty => isLoaded && items.isEmpty;

  /// Newest first, grouped by age.
  Map<NotificationGroup, List<AppNotification>> groupedBy(DateTime now) {
    final today = DateTime(now.year, now.month, now.day);
    final groups = <NotificationGroup, List<AppNotification>>{};
    for (final n in [
      ...items,
    ]..sort((a, b) => b.createdAt.compareTo(a.createdAt))) {
      final group = !n.createdAt.isBefore(today)
          ? NotificationGroup.today
          : n.createdAt.isAfter(today.subtract(const Duration(days: 7)))
          ? NotificationGroup.thisWeek
          : NotificationGroup.earlier;
      (groups[group] ??= []).add(n);
    }
    return groups;
  }

  @override
  List<Object?> get props => [items, isLoaded];
}

class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit(this._repository) : super(const NotificationsState()) {
    _sub = _repository.watch().listen(
      (items) => emit(NotificationsState(items: items, isLoaded: true)),
    );
    unawaited(_repository.refresh());
  }

  final NotificationsRepository _repository;
  late final StreamSubscription<List<AppNotification>> _sub;

  Future<void> refresh() => _repository.refresh();

  Future<void> markRead(String id) => _repository.markRead(id);

  Future<void> markAllRead() => _repository.markAllRead();

  @override
  Future<void> close() async {
    await _sub.cancel();
    return super.close();
  }
}

/// Unread badge on the home bell.
class UnreadNotificationsCubit extends Cubit<int> {
  UnreadNotificationsCubit(NotificationsRepository repository) : super(0) {
    _sub = repository.watchUnreadCount().listen(emit);
  }

  late final StreamSubscription<int> _sub;

  @override
  Future<void> close() async {
    await _sub.cancel();
    return super.close();
  }
}
