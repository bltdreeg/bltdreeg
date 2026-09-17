import 'package:get_it/get_it.dart';

import '../booking/domain/usecases.dart';
import 'presentation/queue_bloc.dart';

/// Live queue screen (frames 27-30) on top of the booking repository.
void registerQueueModule(GetIt sl) {
  sl
    ..registerFactory(() => WatchBooking(sl()))
    ..registerFactory(() => CheckInToQueue(sl()))
    ..registerFactory(() => PostponeTurn(sl()))
    ..registerFactory(() => LeaveQueue(sl()))
    ..registerFactoryParam<QueueBloc, String, void>(
      (bookingId, _) => QueueBloc(
        bookingId: bookingId,
        watchBooking: sl(),
        salonDetails: sl(),
        repository: sl(),
        checkIn: sl(),
        postpone: sl(),
        leave: sl(),
      ),
    );
}
