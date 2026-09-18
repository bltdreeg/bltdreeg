/// Salons the user opened, newest first (the home rail
/// "آخر صالونات شوفتها"). Kept locally; there is nothing to sync.
abstract interface class RecentlyViewedRepository {
  Stream<List<String>> watch();

  Future<void> record(String salonId);
}
