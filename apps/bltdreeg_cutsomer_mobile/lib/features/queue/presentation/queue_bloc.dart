import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/failures.dart';
import '../../../core/utils/result.dart';
import '../../booking/domain/booking.dart';
import '../../booking/domain/usecases.dart';
import '../../salon_details/domain/salon_details.dart';

sealed class QueueEvent extends Equatable {
  const QueueEvent();

  @override
  List<Object?> get props => const [];
}

final class QueueStarted extends QueueEvent {
  const QueueStarted();
}

final class QueueRetryPressed extends QueueEvent {
  const QueueRetryPressed();
}

final class QueueCheckInPressed extends QueueEvent {
  const QueueCheckInPressed();
}

final class QueuePostponePressed extends QueueEvent {
  const QueuePostponePressed();
}

/// Sent after the frame 30 confirmation.
final class QueueLeaveConfirmed extends QueueEvent {
  const QueueLeaveConfirmed();
}

final class QueueErrorDismissed extends QueueEvent {
  const QueueErrorDismissed();
}

final class _SnapshotReceived extends QueueEvent {
  const _SnapshotReceived(this.snapshot);

  final BookingSnapshot snapshot;

  @override
  List<Object?> get props => [snapshot];
}

final class _SalonReceived extends QueueEvent {
  const _SalonReceived(this.details);

  final SalonDetails details;

  @override
  List<Object?> get props => [details];
}

final class _Ticked extends QueueEvent {
  const _Ticked(this.now);

  final DateTime now;

  @override
  List<Object?> get props => [now];
}

enum QueueAction { checkIn, postpone, leave }

final class QueueState extends Equatable {
  const QueueState({
    required this.bookingId,
    required this.now,
    this.snapshot = const BookingSnapshot(),
    this.salon,
    this.pending,
    this.actionFailure,
  });

  final String bookingId;
  final BookingSnapshot snapshot;

  /// Live salon details: chairs and barbers on shift (frame 27).
  final SalonDetails? salon;

  /// Wall clock, ticking every second for the turn countdown.
  final DateTime now;
  final QueueAction? pending;
  final Failure? actionFailure;

  Booking? get booking => snapshot.booking;
  QueueStage? get stage => booking?.stage;
  bool get isBusy => pending != null;

  /// Time left to show up once it's the customer's turn.
  Duration get turnTimeLeft {
    final deadline = booking?.turnDeadline;
    if (deadline == null) return Duration.zero;
    final left = deadline.difference(now);
    return left.isNegative ? Duration.zero : left;
  }

  QueueState copyWith({
    BookingSnapshot? snapshot,
    SalonDetails? salon,
    DateTime? now,
    QueueAction? pending,
    bool clearPending = false,
    Failure? actionFailure,
    bool clearActionFailure = false,
  }) => QueueState(
    bookingId: bookingId,
    snapshot: snapshot ?? this.snapshot,
    salon: salon ?? this.salon,
    now: now ?? this.now,
    pending: clearPending ? null : pending ?? this.pending,
    actionFailure: clearActionFailure
        ? null
        : actionFailure ?? this.actionFailure,
  );

  @override
  List<Object?> get props => [
    bookingId,
    snapshot,
    salon,
    now,
    pending,
    actionFailure,
  ];
}

/// Live queue (frames 27-30) as a Bloc over the booking's push stream, the
/// salon's live details and a one-second clock for the turn countdown.
class QueueBloc extends Bloc<QueueEvent, QueueState> {
  QueueBloc({
    required String bookingId,
    required this._watchBooking,
    required this._salonDetails,
    required this._repository,
    required this._checkIn,
    required this._postpone,
    required this._leave,
    DateTime Function()? clock,
    this._tickInterval = const Duration(seconds: 1),
  }) : _clock = clock ?? DateTime.now,
       super(QueueState(bookingId: bookingId, now: (clock ?? DateTime.now)())) {
    on<QueueStarted>(_onStarted);
    on<_SnapshotReceived>(_onSnapshot);
    on<_SalonReceived>((e, emit) => emit(state.copyWith(salon: e.details)));
    on<_Ticked>((e, emit) => emit(state.copyWith(now: e.now)));
    on<QueueRetryPressed>((_, _) => _repository.refresh(state.bookingId));
    on<QueueCheckInPressed>((_, emit) => _run(QueueAction.checkIn, emit));
    on<QueuePostponePressed>((_, emit) => _run(QueueAction.postpone, emit));
    on<QueueLeaveConfirmed>((_, emit) => _run(QueueAction.leave, emit));
    on<QueueErrorDismissed>(
      (_, emit) => emit(state.copyWith(clearActionFailure: true)),
    );
  }

  final WatchBooking _watchBooking;
  final SalonDetailsRepository _salonDetails;
  final BookingRepository _repository;
  final CheckInToQueue _checkIn;
  final PostponeTurn _postpone;
  final LeaveQueue _leave;
  final DateTime Function() _clock;
  final Duration? _tickInterval;

  StreamSubscription<BookingSnapshot>? _bookingSub;
  StreamSubscription<SalonDetailsSnapshot>? _salonSub;
  Timer? _ticker;

  void _onStarted(QueueStarted event, Emitter<QueueState> emit) {
    unawaited(_bookingSub?.cancel());
    _bookingSub = _watchBooking(state.bookingId)
        .listen((s) => add(_SnapshotReceived(s)));
    if (_tickInterval case final interval?) {
      _ticker ??= Timer.periodic(interval, (_) => add(_Ticked(_clock())));
    }
  }

  void _onSnapshot(_SnapshotReceived event, Emitter<QueueState> emit) {
    emit(state.copyWith(snapshot: event.snapshot, now: _clock()));
    final booking = event.snapshot.booking;
    if (booking != null && _salonSub == null) {
      _salonSub = _salonDetails.watch(booking.salonId).listen((s) {
        if (s.details case final details?) add(_SalonReceived(details));
      });
    }
  }

  Future<void> _run(QueueAction action, Emitter<QueueState> emit) async {
    // One action at a time: a double tap must not postpone twice.
    if (state.isBusy || state.booking == null) return;
    emit(state.copyWith(pending: action, clearActionFailure: true));
    final id = state.bookingId;
    final result = await switch (action) {
      QueueAction.checkIn => _checkIn(id),
      QueueAction.postpone => _postpone(id),
      QueueAction.leave => _leave(id),
    };
    emit(switch (result) {
      // The repository also pushes the result into the booking stream.
      Ok(:final value) => state.copyWith(
        snapshot: state.snapshot.copyWith(booking: value),
        clearPending: true,
      ),
      Err(:final failure) => state.copyWith(
        clearPending: true,
        actionFailure: failure,
      ),
    });
  }

  @override
  Future<void> close() async {
    _ticker?.cancel();
    await _bookingSub?.cancel();
    await _salonSub?.cancel();
    return super.close();
  }
}
