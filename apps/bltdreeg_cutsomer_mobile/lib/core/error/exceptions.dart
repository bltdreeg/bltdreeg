/// Data-layer exceptions. Data sources throw these; repositories catch them
/// (via [guardResult]) and convert to `Failure`s so they never leak upward.
sealed class AppException implements Exception {
  const AppException([this.message]);

  final String? message;

  @override
  String toString() => '$runtimeType(${message ?? ''})';
}

final class NetworkException extends AppException {
  const NetworkException([super.message]);
}

final class ServerException extends AppException {
  const ServerException({this.statusCode, String? message}) : super(message);

  final int? statusCode;
}

final class UnauthorizedException extends AppException {
  const UnauthorizedException([super.message]);
}

final class NotFoundException extends AppException {
  const NotFoundException([super.message]);
}

final class RuleException extends AppException {
  const RuleException(this.code, {this.data = const {}, String? message})
    : super(message);

  final String code;
  final Map<String, Object?> data;
}

final class CacheException extends AppException {
  const CacheException([super.message]);
}
