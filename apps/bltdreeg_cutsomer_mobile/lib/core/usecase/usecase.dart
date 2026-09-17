import '../utils/result.dart';

/// One business action. Blocs depend on use cases, never on repositories,
/// so every action is individually testable and swappable.
abstract interface class UseCase<T, Params> {
  Future<Result<T>> call(Params params);
}

final class NoParams {
  const NoParams();
}
