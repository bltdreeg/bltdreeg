import 'dart:async';
import 'dart:convert';

import '../../../core/database/app_database.dart';
import '../../../core/error/failures.dart';
import '../../../core/network/connectivity_service.dart';
import '../../../core/utils/result.dart';
import '../domain/booking.dart';
import 'booking_models.dart';
import 'booking_remote.dart';

final class BookingRepositoryImpl implements BookingRepository {
  BookingRepositoryImpl({
    required this._remote,
    required AppDatabase database,
    required this._connectivity,
  }) : _db = database;

  final BookingRemoteDataSource _remote;
  final AppDatabase _db;
  final ConnectivityService _connectivity;

  /// Open [watch] streams per booking: actions push their result straight
  /// in, and "try again" refetches through them.
  final _watchers = <String, Set<_BookingWatcher>>{};

  static String _key(String id) => 'booking:$id';

  @override
  Future<Result<DaySchedule>> daySchedule({
    required String salonId,
    required DateTime day,
    required int durationMinutes,
  }) => guardResult(
    () => _remote.daySchedule(
      salonId: salonId,
      day: day,
      durationMinutes: durationMinutes,
    ),
  );

  // Not queued in the outbox: the customer needs the queue number (or the
  // slot rejection) right away, so confirming requires a connection.
  @override
  Future<Result<Booking>> confirm(BookingRequest request) =>
      guardResult(() async => _save(await _remote.confirm(request)));

  @override
  Future<Result<Booking>> booking(String bookingId) async {
    if (await _cached(bookingId) case final cached?) return Ok(cached);
    return guardResult(() async => _save(await _remote.fetch(bookingId)));
  }

  @override
  Stream<BookingSnapshot> watch(String bookingId) {
    late final _BookingWatcher watcher;
    // Closed by the watcher when the listener cancels.
    // ignore: close_sinks
    final controller = StreamController<BookingSnapshot>(
      onListen: () async {
        (_watchers[bookingId] ??= {}).add(watcher);
        await watcher.start();
      },
      onCancel: () async {
        _watchers[bookingId]?.remove(watcher);
        await watcher.stop();
      },
    );
    watcher = _BookingWatcher(this, bookingId, controller);
    return controller.stream;
  }

  @override
  Future<void> refresh(String bookingId) async {
    // "Try again" first re-asks the OS: its offline signal can be stale.
    await _connectivity.recheck();
    for (final w in [...?_watchers[bookingId]]) {
      await w.fetch();
    }
  }

  @override
  Future<Result<Booking>> checkIn(String bookingId) =>
      _act(bookingId, _remote.checkIn);

  @override
  Future<Result<Booking>> postpone(String bookingId) =>
      _act(bookingId, _remote.postpone);

  @override
  Future<Result<Booking>> leave(String bookingId) =>
      _act(bookingId, _remote.leave);

  // Queue actions change the customer's place for everyone else, so they
  // are never applied optimistically or replayed later from the outbox.
  Future<Result<Booking>> _act(
    String bookingId,
    Future<Booking> Function(String) action,
  ) async {
    final result = await guardResult(
      () async => _save(await action(bookingId)),
    );
    if (result case Ok(:final value)) _publish(value);
    return result;
  }

  void _publish(Booking booking) {
    for (final w in [...?_watchers[booking.id]]) {
      w.receive(booking);
    }
  }

  Future<Booking?> _cached(String bookingId) async {
    final cached = await _db.readCache(_key(bookingId));
    if (cached == null) return null;
    return BookingModel.fromJson(
      jsonDecode(cached.payload) as Map<String, Object?>,
    );
  }

  Future<Booking> _save(Booking booking) async {
    await _db.writeCache(
      _key(booking.id),
      jsonEncode(BookingModel.toJson(booking)),
    );
    return booking;
  }
}

/// One subscriber of [BookingRepositoryImpl.watch]: emits the cached copy,
/// then follows connectivity: online fetches and subscribes to pushes,
/// offline marks the data as not live.
final class _BookingWatcher {
  _BookingWatcher(this._repo, this._bookingId, this._controller);

  final BookingRepositoryImpl _repo;
  final String _bookingId;
  final StreamController<BookingSnapshot> _controller;

  var _current = const BookingSnapshot();
  StreamSubscription<bool>? _connectivitySub;
  StreamSubscription<Booking>? _liveSub;
  var _fetching = false;

  void _emit(BookingSnapshot next) {
    _current = next;
    if (!_controller.isClosed) _controller.add(next);
  }

  Future<void> start() async {
    if (await _repo._cached(_bookingId) case final cached?) {
      _emit(BookingSnapshot(booking: cached));
    }
    _connectivitySub = _repo._connectivity.watch().distinct().listen((online) {
      if (online) {
        unawaited(fetch());
      } else {
        unawaited(_liveSub?.cancel());
        _liveSub = null;
        _emit(
          _current.copyWith(
            isLive: false,
            failure: _current.booking == null ? const NetworkFailure() : null,
            clearFailure: _current.booking != null,
          ),
        );
      }
    });
  }

  Future<void> fetch() async {
    if (_fetching || _controller.isClosed) return;
    _fetching = true;
    final result = await guardResult(() => _repo._remote.fetch(_bookingId));
    _fetching = false;
    if (_controller.isClosed) return;
    switch (result) {
      case Ok(:final value):
        receive(await _repo._save(value));
        _subscribe();
      case Err(:final failure):
        _emit(_current.copyWith(isLive: false, failure: failure));
    }
  }

  void receive(Booking booking) => _emit(
    BookingSnapshot(booking: booking, isLive: _repo._connectivity.isOnline),
  );

  void _subscribe() {
    unawaited(_liveSub?.cancel());
    _liveSub = _repo._remote
        .watch(_bookingId)
        .listen(
          (booking) async => receive(await _repo._save(booking)),
          onError: (Object _) => _emit(_current.copyWith(isLive: false)),
        );
  }

  Future<void> stop() async {
    await _connectivitySub?.cancel();
    await _liveSub?.cancel();
    await _controller.close();
  }
}
