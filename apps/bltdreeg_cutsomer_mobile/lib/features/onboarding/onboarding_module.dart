import 'package:get_it/get_it.dart';

import 'data/onboarding_repository_impl.dart';
import 'domain/complete_onboarding.dart';
import 'domain/onboarding_repository.dart';
import 'presentation/onboarding_cubit.dart';

void registerOnboardingModule(GetIt sl) {
  sl
    ..registerLazySingleton<OnboardingRepository>(
      () => OnboardingRepositoryImpl(sl()),
    )
    ..registerFactory(() => CompleteOnboarding(sl()))
    ..registerFactory(() => OnboardingCubit(completeOnboarding: sl()));
}
