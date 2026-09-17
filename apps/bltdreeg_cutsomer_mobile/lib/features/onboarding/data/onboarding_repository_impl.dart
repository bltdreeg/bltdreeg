import '../../../core/storage/app_preferences.dart';
import '../domain/onboarding_repository.dart';

final class OnboardingRepositoryImpl implements OnboardingRepository {
  const OnboardingRepositoryImpl(this._preferences);

  final AppPreferences _preferences;

  @override
  bool get isCompleted => _preferences.onboardingSeen;

  @override
  Future<void> markCompleted() => _preferences.setOnboardingSeen();
}
