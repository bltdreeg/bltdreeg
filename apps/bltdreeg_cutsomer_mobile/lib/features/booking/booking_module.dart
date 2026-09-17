import 'package:get_it/get_it.dart';

import '../../core/config/app_environment.dart';
import '../salon_details/data/salon_details_remote.dart';
import '../salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import '../salons/data/datasources/salon_catalog_remote_data_source.dart';
import 'data/booking_remote.dart';
import 'data/booking_repository_impl.dart';
import 'data/in_memory_booking_draft_repository.dart';
import 'domain/booking.dart';
import 'domain/booking_draft.dart';
import 'domain/usecases.dart';
import 'presentation/booking_flow_cubits.dart';

/// Booking flow: the draft started on the salon page, slots, confirmation.
void registerBookingModule(GetIt sl, AppEnvironment env) {
  sl
    ..registerLazySingleton<BookingDraftRepository>(
      InMemoryBookingDraftRepository.new,
    )
    ..registerLazySingleton<BookingRemoteDataSource>(
      () => env.usesFakeBackend
          ? FakeBookingRemoteDataSource(
              server: sl(),
              // Shares state with the fake salon backends: joining "now"
              // moves the salon's live queue.
              catalog:
                  sl<SalonCatalogRemoteDataSource>()
                      as FakeSalonCatalogRemoteDataSource,
              details:
                  sl<SalonDetailsRemoteDataSource>()
                      as FakeSalonDetailsRemoteDataSource,
            )
          : ApiBookingRemoteDataSource(sl()),
    )
    ..registerLazySingleton<BookingRepository>(
      () => BookingRepositoryImpl(remote: sl(), database: sl()),
    )
    ..registerFactory(() => GetDaySchedule(sl()))
    ..registerFactory(() => ConfirmBooking(sl(), sl()))
    ..registerFactory(() => GetBooking(sl()))
    ..registerFactoryParam<BookingSlotCubit, String, void>(
      (salonId, _) => BookingSlotCubit(
        salonId: salonId,
        details: sl(),
        drafts: sl(),
        getDaySchedule: sl(),
      ),
    )
    ..registerFactoryParam<BookingBarberCubit, String, void>(
      (salonId, _) =>
          BookingBarberCubit(salonId: salonId, details: sl(), drafts: sl()),
    )
    ..registerFactoryParam<BookingReviewCubit, String, void>(
      (salonId, _) => BookingReviewCubit(
        salonId: salonId,
        details: sl(),
        drafts: sl(),
        confirmBooking: sl(),
      ),
    )
    ..registerFactoryParam<BookingConfirmedCubit, String, void>(
      (bookingId, _) =>
          BookingConfirmedCubit(bookingId: bookingId, getBooking: sl()),
    );
}
