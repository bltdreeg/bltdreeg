import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../../../../core/config/app_environment.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/entities/area.dart';
import '../../domain/entities/salon_summary.dart';
import '../models/salon_models.dart';
import 'salon_catalog_remote_data_source.dart';

/// Real backend: REST for lists, WebSocket for live queue loads.
final class ApiSalonCatalogRemoteDataSource
    implements SalonCatalogRemoteDataSource {
  const ApiSalonCatalogRemoteDataSource(this._api, this._env);

  final ApiClient _api;
  final AppEnvironment _env;

  @override
  Future<List<SalonSummary>> fetchCatalog(String areaId) async {
    final json = await _api.getJson('/areas/$areaId/salons');
    return [
      for (final s in json['salons']! as List<Object?>)
        SalonSummaryModel.fromJson(s! as Map<String, Object?>),
    ];
  }

  @override
  Future<List<SalonSummary>> fetchByIds(Set<String> ids) async {
    final json = await _api.getJson('/salons', query: {'ids': ids.join(',')});
    return [
      for (final s in json['salons']! as List<Object?>)
        SalonSummaryModel.fromJson(s! as Map<String, Object?>),
    ];
  }

  @override
  Future<List<Area>> fetchAreas() async {
    final json = await _api.getJson('/areas');
    return [
      for (final a in json['areas']! as List<Object?>)
        AreaModel.fromJson(a! as Map<String, Object?>),
    ];
  }

  @override
  Stream<Map<String, QueueLoad>> watchQueueLoads(String areaId) {
    final channel = WebSocketChannel.connect(
      Uri.parse('${_env.queueSocketUrl}/areas/$areaId'),
    );
    return channel.stream.map((message) {
      final json = jsonDecode(message as String) as Map<String, Object?>;
      return {
        for (final e in (json['loads']! as Map<String, Object?>).entries)
          e.key: QueueLoadModel.fromJson(e.value! as Map<String, Object?>),
      };
    });
  }
}
