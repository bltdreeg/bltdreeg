import '../../../core/usecase/usecase.dart';
import '../../../core/utils/result.dart';
import 'onboarding_repository.dart';

final class CompleteOnboarding implements UseCase<void, NoParams> {
  const CompleteOnboarding(this._repository);

  final OnboardingRepository _repository;

  @override
  Future<Result<void>> call(NoParams _) =>
      guardResult(_repository.markCompleted);
}
