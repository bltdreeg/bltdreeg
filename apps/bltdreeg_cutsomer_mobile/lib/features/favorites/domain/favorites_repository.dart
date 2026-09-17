import '../../../core/utils/result.dart';

abstract interface class FavoritesRepository {
  /// Favorite salon ids, from the device first, reconciled with the server.
  Stream<Set<String>> watchIds();

  /// Optimistic: updates locally at once, syncs now or when back online.
  Future<Result<void>> setFavorite(String salonId, {required bool favorite});

  /// Pulls the server copy (after sign-in / on launch).
  Future<void> sync();

  /// Forgets local favorites (sign-out).
  Future<void> clearLocal();
}
