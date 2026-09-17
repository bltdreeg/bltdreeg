import 'package:get_it/get_it.dart';

import '../../core/config/app_environment.dart';
import '../../core/sync/outbox_processor.dart';
import '../booking/data/in_memory_booking_draft_repository.dart';
import '../booking/domain/booking_draft.dart';
import '../favorites/data/favorites_data.dart';
import '../favorites/domain/favorites_repository.dart';
import '../favorites/domain/usecases.dart';
import '../salons/data/datasources/fake_salon_catalog_remote_data_source.dart';
import '../salons/data/datasources/salon_catalog_remote_data_source.dart';
import '../salons/data/repositories/recently_viewed_repository.dart';
import 'data/salon_details_remote.dart';
import 'data/salon_details_repository_impl.dart';
import 'domain/salon_details.dart';
import 'presentation/pages/salon_gallery_page.dart';
import 'presentation/salon_details_cubit.dart';

/// Salon page + the pieces it owns or starts: favorites, recently viewed and
/// the booking draft (service selection).
void registerSalonDetailsModule(GetIt sl, AppEnvironment env) {
  sl
    ..registerLazySingleton(
      () => OutboxProcessor(database: sl(), connectivity: sl())..start(),
      dispose: (o) => o.dispose(),
    )
    ..registerLazySingleton<SalonDetailsRemoteDataSource>(
      () => env.usesFakeBackend
          ? FakeSalonDetailsRemoteDataSource(
              server: sl(),
              // The fake details backend shares state with the fake catalog.
              catalog:
                  sl<SalonCatalogRemoteDataSource>()
                      as FakeSalonCatalogRemoteDataSource,
            )
          : ApiSalonDetailsRemoteDataSource(sl(), env),
    )
    ..registerLazySingleton<SalonDetailsRepository>(
      () => SalonDetailsRepositoryImpl(
        remote: sl(),
        database: sl(),
        connectivity: sl(),
      ),
    )
    ..registerLazySingleton<FavoritesRemoteDataSource>(
      () => env.usesFakeBackend
          ? FakeFavoritesRemoteDataSource(sl())
          : ApiFavoritesRemoteDataSource(sl()),
    )
    ..registerLazySingleton<FavoritesRepository>(
      () => FavoritesRepositoryImpl(remote: sl(), database: sl(), outbox: sl()),
    )
    ..registerFactory(() => WatchFavoriteIds(sl()))
    ..registerFactory(() => ToggleFavorite(sl()))
    ..registerLazySingleton(() => RecentlyViewedRepository(sl()))
    ..registerLazySingleton<BookingDraftRepository>(
      InMemoryBookingDraftRepository.new,
    )
    ..registerFactoryParam<SalonDetailsCubit, String, void>(
      (salonId, _) => SalonDetailsCubit(
        salonId: salonId,
        repository: sl(),
        drafts: sl(),
        recentlyViewed: sl(),
        watchFavorites: sl(),
        toggleFavorite: sl(),
      ),
    )
    ..registerFactoryParam<SalonGalleryCubit, String, void>(
      (salonId, _) => SalonGalleryCubit(salonId: salonId, repository: sl()),
    );
}
