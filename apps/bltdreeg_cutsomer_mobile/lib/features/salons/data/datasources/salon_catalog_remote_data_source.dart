import '../../domain/entities/area.dart';
import '../../domain/entities/salon_summary.dart';

/// Server contract for discovery. Queue loads arrive as a push stream
/// (WebSocket in production; a timer in the fake).
abstract interface class SalonCatalogRemoteDataSource {
  Future<List<SalonSummary>> fetchCatalog(String areaId);

  Future<List<Area>> fetchAreas();

  /// Emits changed queue loads keyed by salon id.
  Stream<Map<String, QueueLoad>> watchQueueLoads(String areaId);
}
