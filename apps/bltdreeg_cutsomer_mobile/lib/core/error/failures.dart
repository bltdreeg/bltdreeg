import 'package:equatable/equatable.dart';

/// Domain-level error returned inside a [Result]. Presentation maps each
/// subtype to a localized message; nothing below the domain layer ever
/// produces user-facing copy.
sealed class Failure extends Equatable {
  const Failure([this.debugMessage]);

  /// Developer-facing detail. Never shown in the UI.
  final String? debugMessage;

  @override
  List<Object?> get props => [debugMessage];
}

/// The device is offline, or the request could not reach the server.
final class NetworkFailure extends Failure {
  const NetworkFailure([super.debugMessage]);
}

/// The server answered with a non-success status.
final class ServerFailure extends Failure {
  const ServerFailure({this.statusCode, String? debugMessage})
    : super(debugMessage);

  final int? statusCode;

  @override
  List<Object?> get props => [statusCode, debugMessage];
}

/// Session is missing or expired.
final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([super.debugMessage]);
}

final class NotFoundFailure extends Failure {
  const NotFoundFailure([super.debugMessage]);
}

/// Business rule rejected the request (wrong OTP, slot taken, ...).
/// [code] lets the UI pick a precise message.
final class RuleFailure extends Failure {
  const RuleFailure(this.code, {this.data = const {}, String? debugMessage})
    : super(debugMessage);

  final String code;
  final Map<String, Object?> data;

  @override
  List<Object?> get props => [code, data, debugMessage];
}

/// Local storage read/write failed.
final class CacheFailure extends Failure {
  const CacheFailure([super.debugMessage]);
}

final class UnexpectedFailure extends Failure {
  const UnexpectedFailure([super.debugMessage]);
}
