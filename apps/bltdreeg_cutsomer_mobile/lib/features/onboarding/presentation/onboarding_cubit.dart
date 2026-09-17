import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/usecase/usecase.dart';
import '../domain/complete_onboarding.dart';

/// Current slide index (0-based).
class OnboardingCubit extends Cubit<int> {
  OnboardingCubit({required this._completeOnboarding}) : super(0);

  static const pageCount = 3;

  final CompleteOnboarding _completeOnboarding;

  bool get isLast => state == pageCount - 1;

  void pageChanged(int index) => emit(index.clamp(0, pageCount - 1));

  Future<void> complete() => _completeOnboarding(const NoParams());
}
