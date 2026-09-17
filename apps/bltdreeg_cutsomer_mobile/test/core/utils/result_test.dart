import 'package:bltdreeg_cutsomer_mobile/core/error/exceptions.dart';
import 'package:bltdreeg_cutsomer_mobile/core/error/failures.dart';
import 'package:bltdreeg_cutsomer_mobile/core/utils/result.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('guardResult wraps values in Ok', () async {
    final result = await guardResult(() async => 42);
    expect(result, isA<Ok<int>>());
    expect(result.valueOrNull, 42);
  });

  test('guardResult maps data exceptions to failures', () async {
    Future<Result<void>> run(AppException e) => guardResult(() => throw e);

    expect(
      (await run(const NetworkException())).failureOrNull,
      isA<NetworkFailure>(),
    );
    expect(
      (await run(const ServerException(statusCode: 503))).failureOrNull,
      const ServerFailure(statusCode: 503),
    );
    expect(
      (await run(const RuleException('otp_invalid'))).failureOrNull,
      const RuleFailure('otp_invalid'),
    );
  });

  test('fold and map', () {
    const Result<int> ok = Ok(2);
    const Result<int> err = Err(NetworkFailure());
    expect(ok.map((v) => v * 2).valueOrNull, 4);
    expect(err.fold((_) => 'failed', (v) => '$v'), 'failed');
  });
}
