import 'dart:async';
import 'dart:math';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/error/failures.dart';
import '../../../core/utils/result.dart';
import '../../salon_details/domain/salon_details.dart';
import '../domain/booking.dart';
import '../domain/booking_draft.dart';
import '../domain/usecases.dart';

/// What every booking step reads: the salon (live queue, hours, barbers) and
/// the shared draft. The draft repository is the source of truth between
/// steps, so each route gets its own small cubit.
final class BookingFlow extends Equatable {
  const BookingFlow({
    required this.draft,
    this.snapshot = const SalonDetailsSnapshot(),
  });

  final BookingDraft draft;
  final SalonDetailsSnapshot snapshot;

  SalonDetails? get details => snapshot.details;

  BookingFlow copyWith({BookingDraft? draft, SalonDetailsSnapshot? snapshot}) =>
      BookingFlow(
        draft: draft ?? this.draft,
        snapshot: snapshot ?? this.snapshot,
      );

  @override
  List<Object?> get props => [draft, snapshot];
}

abstract class _BookingStepCubit<S> extends Cubit<S> {
  _BookingStepCubit(
    super.initialState, {
    required this.salonId,
    required this._details,
    required this.drafts,
  }) {
    _subs
      ..add(_details.watch(salonId).listen(onSnapshot))
      ..add(drafts.watch(salonId).listen(onDraft));
  }

  final String salonId;
  final BookingDraftRepository drafts;
  final SalonDetailsRepository _details;
  final _subs = <StreamSubscription<Object?>>[];

  BookingDraft get draft => drafts.draftFor(salonId);

  void onSnapshot(SalonDetailsSnapshot snapshot);
  void onDraft(BookingDraft draft);

  Future<void> retryDetails() => _details.refresh(salonId);

  @override
  Future<void> close() async {
    for (final s in _subs) {
      await s.cancel();
    }
    return super.close();
  }
}

// ---- step 1: now or a slot ---------------------------------------------------------

enum TimingMode { now, schedule }

sealed class ScheduleLoad extends Equatable {
  const ScheduleLoad();
}

final class ScheduleLoading extends ScheduleLoad {
  const ScheduleLoading();

  @override
  List<Object?> get props => const [];
}

final class ScheduleLoaded extends ScheduleLoad {
  const ScheduleLoaded(this.schedule);

  final DaySchedule schedule;

  @override
  List<Object?> get props => [schedule];
}

final class ScheduleFailed extends ScheduleLoad {
  const ScheduleFailed(this.failure);

  final Failure failure;

  @override
  List<Object?> get props => [failure];
}

final class BookingSlotState extends Equatable {
  const BookingSlotState({
    required this.flow,
    required this.today,
    required this.selectedDay,
    this.mode,
    this.schedules = const {},
  });

  static const daysAhead = 7;

  final BookingFlow flow;
  final DateTime today;
  final DateTime selectedDay;

  /// Null until the salon loads: "now" is only offered while it's open.
  final TimingMode? mode;
  final Map<DateTime, ScheduleLoad> schedules;

  List<DateTime> get days => [
    for (var i = 0; i < daysAhead; i++)
      DateTime(today.year, today.month, today.day + i),
  ];

  bool get canJoinNow => flow.details?.summary.isOpen ?? false;

  bool isClosedOn(DateTime day) =>
      flow.details?.hours
          .where((h) => h.weekday == day.weekday)
          .firstOrNull
          ?.isClosed ??
      false;

  ScheduleLoad? get selectedSchedule => schedules[selectedDay];

  bool get canContinue => switch ((mode, flow.draft.timing)) {
    (TimingMode.now, JoinNow()) => canJoinNow,
    (TimingMode.schedule, ScheduledSlot()) => true,
    _ => false,
  };

  BookingSlotState copyWith({
    BookingFlow? flow,
    DateTime? selectedDay,
    TimingMode? mode,
    Map<DateTime, ScheduleLoad>? schedules,
  }) => BookingSlotState(
    flow: flow ?? this.flow,
    today: today,
    selectedDay: selectedDay ?? this.selectedDay,
    mode: mode ?? this.mode,
    schedules: schedules ?? this.schedules,
  );

  @override
  List<Object?> get props => [flow, today, selectedDay, mode, schedules];
}

class BookingSlotCubit extends _BookingStepCubit<BookingSlotState> {
  BookingSlotCubit({
    required super.salonId,
    required super.details,
    required super.drafts,
    required this._getDaySchedule,
    DateTime Function()? clock,
  }) : super(_initial(drafts.draftFor(salonId), (clock ?? DateTime.now)()));

  final GetDaySchedule _getDaySchedule;

  static BookingSlotState _initial(BookingDraft draft, DateTime now) {
    final today = DateTime(now.year, now.month, now.day);
    final timing = draft.timing;
    return BookingSlotState(
      flow: BookingFlow(draft: draft),
      today: today,
      selectedDay: switch (timing) {
        ScheduledSlot(:final start) => DateTime(
          start.year,
          start.month,
          start.day,
        ),
        _ => today,
      },
      mode: switch (timing) {
        ScheduledSlot() => TimingMode.schedule,
        JoinNow() => TimingMode.now,
        null => null,
      },
    );
  }

  @override
  void onSnapshot(SalonDetailsSnapshot snapshot) {
    final hadDetails = state.flow.details != null;
    emit(state.copyWith(flow: state.flow.copyWith(snapshot: snapshot)));
    if (snapshot.details == null) return;

    if (state.mode == null) {
      // First time the salon is known: default to the fastest option.
      state.canJoinNow ? selectNow() : selectSchedule();
    } else if (state.mode == TimingMode.now && !state.canJoinNow) {
      // The salon closed while the customer was choosing.
      selectSchedule();
    } else if (state.mode == TimingMode.schedule && !hadDetails) {
      _load(state.selectedDay);
    }
  }

  @override
  void onDraft(BookingDraft draft) =>
      emit(state.copyWith(flow: state.flow.copyWith(draft: draft)));

  void selectNow() {
    if (!state.canJoinNow) return;
    emit(state.copyWith(mode: TimingMode.now));
    drafts.save(draft.withTiming(const JoinNow()));
  }

  void selectSchedule() {
    emit(
      state.copyWith(
        mode: TimingMode.schedule,
        selectedDay: _firstOpenDay(from: state.selectedDay),
      ),
    );
    if (draft.timing is JoinNow) drafts.save(draft.withTiming(null));
    _load(state.selectedDay);
  }

  void selectDay(DateTime day) {
    if (state.isClosedOn(day)) return;
    emit(state.copyWith(selectedDay: day));
    _load(day);
  }

  void selectSlot(TimeSlot slot) {
    if (!slot.isAvailable) return;
    drafts.save(
      draft.withTiming(
        ScheduledSlot(start: slot.start, freeBarberIds: slot.freeBarberIds),
      ),
    );
  }

  void retrySchedule() => _load(state.selectedDay, force: true);

  DateTime _firstOpenDay({required DateTime from}) {
    if (state.flow.details == null) return from;
    return [
          for (final d in state.days)
            if (!d.isBefore(from)) d,
        ].where((d) => !state.isClosedOn(d)).firstOrNull ??
        from;
  }

  Future<void> _load(DateTime day, {bool force = false}) async {
    if (state.flow.details == null) return;
    final current = state.schedules[day];
    if (!force && (current is ScheduleLoading || current is ScheduleLoaded)) {
      return;
    }
    emit(
      state.copyWith(
        schedules: {...state.schedules, day: const ScheduleLoading()},
      ),
    );
    final result = await _getDaySchedule(
      salonId: salonId,
      day: day,
      durationMinutes: draft.totalMinutes,
    );
    if (isClosed) return;
    emit(
      state.copyWith(
        schedules: {
          ...state.schedules,
          day: switch (result) {
            Ok(:final value) => ScheduleLoaded(value),
            Err(:final failure) => ScheduleFailed(failure),
          },
        },
      ),
    );
  }
}

// ---- step 2: barber ------------------------------------------------------------------

class BookingBarberCubit extends _BookingStepCubit<BookingFlow> {
  BookingBarberCubit({
    required super.salonId,
    required super.details,
    required super.drafts,
  }) : super(BookingFlow(draft: drafts.draftFor(salonId)));

  @override
  void onSnapshot(SalonDetailsSnapshot snapshot) {
    emit(state.copyWith(snapshot: snapshot));
    // A named barber who just went off shift can't take a queue booking.
    final barber = draft.barber;
    if (barber is NamedBarber && draft.timing is JoinNow) {
      final match = snapshot.details?.barbers
          .where((b) => b.id == barber.id)
          .firstOrNull;
      if (match != null && !match.isWorking) selectAny();
    }
  }

  @override
  void onDraft(BookingDraft draft) => emit(state.copyWith(draft: draft));

  void selectAny() => drafts.save(draft.withBarber(const AnyBarber()));

  void selectBarber(Barber barber) => drafts.save(
    draft.withBarber(NamedBarber(id: barber.id, name: barber.name)),
  );
}

// ---- step 3: review & confirm ------------------------------------------------------

sealed class ConfirmStatus extends Equatable {
  const ConfirmStatus();
}

final class ConfirmIdle extends ConfirmStatus {
  const ConfirmIdle();

  @override
  List<Object?> get props => const [];
}

final class ConfirmSubmitting extends ConfirmStatus {
  const ConfirmSubmitting();

  @override
  List<Object?> get props => const [];
}

final class ConfirmFailed extends ConfirmStatus {
  const ConfirmFailed(this.failure);

  final Failure failure;

  @override
  List<Object?> get props => [failure];
}

final class ConfirmDone extends ConfirmStatus {
  const ConfirmDone(this.booking);

  final Booking booking;

  @override
  List<Object?> get props => [booking];
}

final class BookingReviewState extends Equatable {
  const BookingReviewState({
    required this.flow,
    this.status = const ConfirmIdle(),
  });

  final BookingFlow flow;
  final ConfirmStatus status;

  BookingQuote get quote => BookingPricing.quote(
    flow.draft.services,
    flow.details?.offers ?? const [],
  );

  /// People ahead and minutes for the chosen barber (or the shared queue).
  QueueLoadView get queue {
    final details = flow.details;
    if (details == null) return const QueueLoadView(0, 0);
    if (flow.draft.barber case NamedBarber(:final id)) {
      final barber = details.barbers.where((b) => b.id == id).firstOrNull;
      if (barber?.availability case BarberWorking(:final queue)) {
        return QueueLoadView(queue.peopleAhead, queue.waitMinutes);
      }
    }
    final q = details.summary.queue;
    return QueueLoadView(q.peopleAhead, q.waitMinutes);
  }

  BookingReviewState copyWith({BookingFlow? flow, ConfirmStatus? status}) =>
      BookingReviewState(
        flow: flow ?? this.flow,
        status: status ?? this.status,
      );

  @override
  List<Object?> get props => [flow, status];
}

final class QueueLoadView extends Equatable {
  const QueueLoadView(this.peopleAhead, this.waitMinutes);

  final int peopleAhead;
  final int waitMinutes;

  WaitEstimate get estimate => WaitEstimate.around(waitMinutes);

  @override
  List<Object?> get props => [peopleAhead, waitMinutes];
}

class BookingReviewCubit extends _BookingStepCubit<BookingReviewState> {
  BookingReviewCubit({
    required super.salonId,
    required super.details,
    required super.drafts,
    required this._confirmBooking,
    Random? random,
    DateTime Function()? clock,
  }) : _requestId =
           '${(clock ?? DateTime.now)().microsecondsSinceEpoch}-'
           '${(random ?? Random()).nextInt(1 << 32)}',
       super(
         BookingReviewState(flow: BookingFlow(draft: drafts.draftFor(salonId))),
       );

  final ConfirmBooking _confirmBooking;

  /// One idempotency key per review screen: a retry after a dropped
  /// response returns the same booking instead of joining twice.
  final String _requestId;

  @override
  void onSnapshot(SalonDetailsSnapshot snapshot) =>
      emit(state.copyWith(flow: state.flow.copyWith(snapshot: snapshot)));

  @override
  void onDraft(BookingDraft draft) {
    // Confirming clears the draft; keep showing what was booked while the
    // app navigates to the confirmation screen.
    if (state.status is ConfirmDone) return;
    emit(state.copyWith(flow: state.flow.copyWith(draft: draft)));
  }

  Future<void> confirm() async {
    if (state.status is ConfirmSubmitting || state.status is ConfirmDone) {
      return;
    }
    if (!state.flow.draft.isReadyForBarber) return;
    emit(state.copyWith(status: const ConfirmSubmitting()));
    final result = await _confirmBooking(state.flow.draft, _requestId);
    if (isClosed) return;
    emit(
      state.copyWith(
        status: switch (result) {
          Ok(:final value) => ConfirmDone(value),
          Err(:final failure) => ConfirmFailed(failure),
        },
      ),
    );
  }

  void dismissError() {
    if (state.status is ConfirmFailed) {
      emit(state.copyWith(status: const ConfirmIdle()));
    }
  }
}

// ---- confirmation (frame 26) --------------------------------------------------------

final class BookingConfirmedState extends Equatable {
  const BookingConfirmedState({this.booking, this.failure});

  final Booking? booking;
  final Failure? failure;

  bool get isLoading => booking == null && failure == null;

  @override
  List<Object?> get props => [booking, failure];
}

class BookingConfirmedCubit extends Cubit<BookingConfirmedState> {
  BookingConfirmedCubit({required this.bookingId, required this._getBooking})
    : super(const BookingConfirmedState()) {
    unawaited(load());
  }

  final String bookingId;
  final GetBooking _getBooking;

  Future<void> load() async {
    if (state.failure != null) emit(const BookingConfirmedState());
    final result = await _getBooking(bookingId);
    if (isClosed) return;
    emit(switch (result) {
      Ok(:final value) => BookingConfirmedState(booking: value),
      Err(:final failure) => BookingConfirmedState(failure: failure),
    });
  }
}
