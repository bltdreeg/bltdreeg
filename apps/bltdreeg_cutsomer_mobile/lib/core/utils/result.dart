import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../error/exceptions.dart';
import '../error/failures.dart';

/// Success-or-failure value returned by repositories and use cases.
///
/// A Dart 3 sealed type instead of `dartz.Either`: exhaustive `switch`
/// pattern matching gives the same safety without a functional-programming
/// dependency.
sealed class Result<T> {
  const Result();

  bool get isOk => this is Ok<T>;

  T? get valueOrNull => switch (this) {
    Ok(:final value) => value,
    Err() => null,
  };

  Failure? get failureOrNull => switch (this) {
    Ok() => null,
    Err(:final failure) => failure,
  };

  R fold<R>(R Function(Failure failure) onErr, R Function(T value) onOk) =>
      switch (this) {
        Ok(:final value) => onOk(value),
        Err(:final failure) => onErr(failure),
      };

  Result<R> map<R>(R Function(T value) transform) => switch (this) {
    Ok(:final value) => Ok(transform(value)),
    Err(:final failure) => Err(failure),
  };
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);

  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);

  final Failure failure;
}

/// Runs [body] and converts any thrown [AppException] / [DioException] into
/// an [Err] with the matching [Failure]. Use at the repository boundary.
Future<Result<T>> guardResult<T>(Future<T> Function() body) async {
  try {
    return Ok(await body());
  } on Object catch (error, stack) {
    return Err(mapErrorToFailure(error, stack));
  }
}

@visibleForTesting
Failure mapErrorToFailure(Object error, [StackTrace? stack]) {
  return switch (error) {
    NetworkException(:final message) => NetworkFailure(message),
    ServerException(:final statusCode, :final message) => ServerFailure(
      statusCode: statusCode,
      debugMessage: message,
    ),
    UnauthorizedException(:final message) => UnauthorizedFailure(message),
    NotFoundException(:final message) => NotFoundFailure(message),
    RuleException(:final code, :final data, :final message) => RuleFailure(
      code,
      data: data,
      debugMessage: message,
    ),
    CacheException(:final message) => CacheFailure(message),
    DioException() => _mapDio(error),
    _ => UnexpectedFailure('$error\n$stack'),
  };
}

Failure _mapDio(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionError:
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.transformTimeout:
      return NetworkFailure(e.message);
    case DioExceptionType.badResponse:
      final status = e.response?.statusCode;
      if (status == 401) return UnauthorizedFailure(e.message);
      if (status == 404) return NotFoundFailure(e.message);
      return ServerFailure(statusCode: status, debugMessage: e.message);
    case DioExceptionType.badCertificate:
    case DioExceptionType.cancel:
    case DioExceptionType.unknown:
      return UnexpectedFailure(e.message);
  }
}
