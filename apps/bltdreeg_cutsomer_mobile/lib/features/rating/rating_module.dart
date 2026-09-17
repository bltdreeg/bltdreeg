import 'package:get_it/get_it.dart';

import '../../core/config/app_environment.dart';
import 'data/photo_picker.dart';
import 'data/rating_data.dart';
import 'domain/rating.dart';
import 'presentation/rating_cubits.dart';

/// Visit rating (frame 31) and its confirmation (frame 41).
void registerRatingModule(GetIt sl, AppEnvironment env) {
  sl
    ..registerLazySingleton<RatingRemoteDataSource>(
      () => env.usesFakeBackend
          ? FakeRatingRemoteDataSource(sl())
          : ApiRatingRemoteDataSource(sl()),
    )
    ..registerLazySingleton<RatingRepository>(
      () => RatingRepositoryImpl(remote: sl(), database: sl(), outbox: sl()),
    )
    ..registerLazySingleton<PhotoPicker>(ImagePickerPhotoPicker.new)
    ..registerLazySingleton<RatingPhotoStore>(
      () => const AppDocumentsRatingPhotoStore(),
    )
    ..registerFactory(() => SubmitRating(sl()))
    ..registerFactory(() => GetVisitRating(sl()))
    ..registerFactory(() => GetVisitRatings(sl()))
    ..registerFactoryParam<RateVisitCubit, String, void>(
      (bookingId, _) => RateVisitCubit(
        bookingId: bookingId,
        getBooking: sl(),
        getRating: sl(),
        submitRating: sl(),
        photoPicker: sl(),
        photoStore: sl(),
      ),
    )
    ..registerFactoryParam<RatingSentCubit, String, void>(
      (bookingId, _) => RatingSentCubit(
        bookingId: bookingId,
        getRating: sl(),
        getBooking: sl(),
        repository: sl(),
        watchFavorites: sl(),
        toggleFavorite: sl(),
      ),
    );
}
