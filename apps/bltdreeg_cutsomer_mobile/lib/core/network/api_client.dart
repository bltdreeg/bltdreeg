import 'package:dio/dio.dart';

import '../config/app_environment.dart';
import '../error/exceptions.dart';
import 'connectivity_service.dart';

/// Thin wrapper around [Dio]. Real remote data sources depend on this, never
/// on `Dio` directly, so auth headers, locale and error translation live in one
/// place.
///
/// While the backend doesn't exist, feature DI wires fake remote data sources
/// instead; this client is still constructed so the swap is config-only.
final class ApiClient {
  ApiClient({
    required AppEnvironment environment,
    required this._connectivity,
    Dio? dio,
  }) : _dio =
           dio ??
           Dio(
             BaseOptions(
               baseUrl: environment.apiBaseUrl,
               connectTimeout: const Duration(seconds: 10),
               receiveTimeout: const Duration(seconds: 15),
             ),
           );

  final Dio _dio;
  final ConnectivityService _connectivity;

  String? _accessToken;
  String _languageCode = 'ar';

  void setAccessToken(String? token) => _accessToken = token;
  void setLanguage(String languageCode) => _languageCode = languageCode;

  Future<Map<String, Object?>> getJson(
    String path, {
    Map<String, Object?>? query,
  }) => _send(
    () => _dio.get<Map<String, Object?>>(
      path,
      queryParameters: query,
      options: _options(),
    ),
  );

  Future<Map<String, Object?>> postJson(String path, {Object? body}) => _send(
    () =>
        _dio.post<Map<String, Object?>>(path, data: body, options: _options()),
  );

  Future<Map<String, Object?>> putJson(String path, {Object? body}) => _send(
    () => _dio.put<Map<String, Object?>>(path, data: body, options: _options()),
  );

  /// Multipart upload: [fields] plus files under [fileField].
  Future<Map<String, Object?>> postMultipart(
    String path, {
    required Map<String, Object?> fields,
    String fileField = 'files',
    List<String> filePaths = const [],
  }) async {
    final form = FormData.fromMap({
      ...fields,
      fileField: [for (final p in filePaths) await MultipartFile.fromFile(p)],
    });
    return _send(
      () => _dio.post<Map<String, Object?>>(
        path,
        data: form,
        options: _options(),
      ),
    );
  }

  Future<Map<String, Object?>> deleteJson(String path) =>
      _send(() => _dio.delete<Map<String, Object?>>(path, options: _options()));

  Options _options() => Options(
    headers: {
      'Accept-Language': _languageCode,
      if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
    },
  );

  Future<Map<String, Object?>> _send(
    Future<Response<Map<String, Object?>>> Function() request,
  ) async {
    if (!_connectivity.isOnline) throw const NetworkException('offline');
    try {
      final response = await request();
      return response.data ?? const {};
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      if (status == 401) throw UnauthorizedException(e.message);
      if (status == 404) throw NotFoundException(e.message);
      if (status != null) {
        throw ServerException(statusCode: status, message: e.message);
      }
      throw NetworkException(e.message);
    }
  }
}
