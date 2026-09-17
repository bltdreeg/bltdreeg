import '../../../core/utils/result.dart';
import 'favorites_repository.dart';

final class WatchFavoriteIds {
  const WatchFavoriteIds(this._repository);

  final FavoritesRepository _repository;

  Stream<Set<String>> call() => _repository.watchIds();
}

final class ToggleFavorite {
  const ToggleFavorite(this._repository);

  final FavoritesRepository _repository;

  Future<Result<void>> call(String salonId, {required bool favorite}) =>
      _repository.setFavorite(salonId, favorite: favorite);
}
