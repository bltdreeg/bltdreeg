import 'package:get_it/get_it.dart';

import '../../core/config/app_environment.dart';
import '../home/presentation/home_cubit.dart';
import '../search/presentation/search_bloc.dart';
import 'data/datasources/api_salon_catalog_remote_data_source.dart';
import 'data/datasources/fake_salon_catalog_remote_data_source.dart';
import 'data/datasources/salon_catalog_local_data_source.dart';
import 'data/datasources/salon_catalog_remote_data_source.dart';
import 'data/repositories/salon_catalog_repository_impl.dart';
import 'domain/repositories/salon_catalog_repository.dart';
import 'domain/usecases.dart';

/// Discovery: salon catalog shared by home, search and favorites.
void registerSalonsModule(GetIt sl, AppEnvironment env) {
  sl
    ..registerLazySingleton<SalonCatalogRemoteDataSource>(
      () => env.usesFakeBackend
          ? FakeSalonCatalogRemoteDataSource(
              server: sl(),
              connectivity: sl(),
              driftInterval: env.fakeLiveUpdateInterval,
            )
          : ApiSalonCatalogRemoteDataSource(sl(), env),
    )
    ..registerLazySingleton(() => SalonCatalogLocalDataSource(sl()))
    ..registerLazySingleton<SalonCatalogRepository>(
      () => SalonCatalogRepositoryImpl(
        remote: sl(),
        local: sl(),
        connectivity: sl(),
        preferences: sl(),
      ),
    )
    ..registerLazySingleton<SearchHistoryRepository>(
      () => SearchHistoryRepositoryImpl(sl()),
    )
    ..registerFactory(() => WatchCatalog(sl()))
    ..registerFactory(() => RefreshCatalog(sl()))
    ..registerFactory(() => GetAreas(sl()))
    ..registerFactory(() => WatchSelectedArea(sl()))
    ..registerFactory(() => SelectArea(sl()))
    ..registerFactory(() => RecentSearches(sl()))
    ..registerFactory(
      () => HomeCubit(
        watchSelectedArea: sl(),
        watchCatalog: sl(),
        refreshCatalog: sl(),
        getAreas: sl(),
        recentlyViewed: sl(),
      ),
    )
    ..registerFactory(
      () => SearchBloc(
        watchSelectedArea: sl(),
        watchCatalog: sl(),
        refreshCatalog: sl(),
        getAreas: sl(),
        recentSearches: sl(),
      ),
    );
}
