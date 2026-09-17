import '../../../core/usecase/usecase.dart';
import '../../../core/utils/result.dart';
import 'entities/area.dart';
import 'entities/catalog_snapshot.dart';
import 'repositories/salon_catalog_repository.dart';

final class WatchCatalog {
  const WatchCatalog(this._repository);

  final SalonCatalogRepository _repository;

  Stream<CatalogSnapshot> call(String areaId) =>
      _repository.watchCatalog(areaId);
}

final class RefreshCatalog {
  const RefreshCatalog(this._repository);

  final SalonCatalogRepository _repository;

  Future<void> call(String areaId) => _repository.refresh(areaId);
}

final class GetAreas implements UseCase<List<Area>, NoParams> {
  const GetAreas(this._repository);

  final SalonCatalogRepository _repository;

  @override
  Future<Result<List<Area>>> call(NoParams _) => _repository.getAreas();
}

final class WatchSelectedArea {
  const WatchSelectedArea(this._repository);

  final SalonCatalogRepository _repository;

  Stream<String> call() => _repository.watchSelectedAreaId();

  String get current => _repository.selectedAreaId;
}

final class SelectArea implements UseCase<void, String> {
  const SelectArea(this._repository);

  final SalonCatalogRepository _repository;

  @override
  Future<Result<void>> call(String areaId) =>
      guardResult(() => _repository.selectArea(areaId));
}

final class RecentSearches {
  const RecentSearches(this._repository);

  final SearchHistoryRepository _repository;

  Stream<List<String>> watch() => _repository.watchRecent();
  Future<void> add(String query) => _repository.add(query);
  Future<void> remove(String query) => _repository.remove(query);
  Future<void> clear() => _repository.clear();
}
