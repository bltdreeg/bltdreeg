import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/utils/result.dart';
import '../../domain/auth_failure_codes.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/usecases/auth_usecases.dart';

enum OtpStatus {
  editing,
  verifying,

  /// Wrong code (frame 20).
  invalid,

  /// Too many wrong codes; verification paused.
  locked,
  success,
}

final class OtpState extends Equatable {
  const OtpState({
    required this.challenge,
    required this.now,
    this.code = '',
    this.status = OtpStatus.editing,
    this.attemptsLeft,
    this.lockMinutes,
    this.isResending = false,
    this.failure,
    this.resendCount = 0,
  });

  final OtpChallenge challenge;
  final DateTime now;
  final String code;
  final OtpStatus status;
  final int? attemptsLeft;
  final int? lockMinutes;
  final bool isResending;

  /// Transient non-rule failure (offline, server) to surface as a toast.
  final Failure? failure;

  /// Increments on every successful resend, so the UI can confirm it.
  final int resendCount;

  Duration get resendIn {
    final left = challenge.resendAvailableAt.difference(now);
    return left.isNegative ? Duration.zero : left;
  }

  bool get canResend =>
      resendIn == Duration.zero && !isResending && status != OtpStatus.success;

  bool get canVerify =>
      code.length == challenge.codeLength &&
      status != OtpStatus.verifying &&
      status != OtpStatus.locked &&
      status != OtpStatus.success;

  OtpState copyWith({
    OtpChallenge? challenge,
    DateTime? now,
    String? code,
    OtpStatus? status,
    int? attemptsLeft,
    int? lockMinutes,
    bool? isResending,
    Failure? failure,
    int? resendCount,
  }) => OtpState(
    challenge: challenge ?? this.challenge,
    now: now ?? this.now,
    code: code ?? this.code,
    status: status ?? this.status,
    attemptsLeft: attemptsLeft ?? this.attemptsLeft,
    lockMinutes: lockMinutes ?? this.lockMinutes,
    isResending: isResending ?? this.isResending,
    failure: failure,
    resendCount: resendCount ?? this.resendCount,
  );

  @override
  List<Object?> get props => [
    challenge,
    now,
    code,
    status,
    attemptsLeft,
    lockMinutes,
    isResending,
    failure,
    resendCount,
  ];
}

class OtpCubit extends Cubit<OtpState> {
  OtpCubit({
    required OtpChallenge challenge,
    required this._verifyOtp,
    required this._resendOtp,
    DateTime Function()? clock,
    Stream<void>? ticker,
  }) : _clock = clock ?? DateTime.now,
       super(OtpState(challenge: challenge, now: (clock ?? DateTime.now)())) {
    _ticks = (ticker ?? Stream<void>.periodic(const Duration(seconds: 1)))
        .listen((_) => emit(state.copyWith(now: _clock())));
  }

  final VerifyOtp _verifyOtp;
  final ResendOtp _resendOtp;
  final DateTime Function() _clock;
  late final StreamSubscription<void> _ticks;

  void codeChanged(String code) {
    if (state.status == OtpStatus.success) return;
    emit(
      state.copyWith(
        code: code,
        // Editing after a wrong code clears the red state.
        status: state.status == OtpStatus.invalid
            ? OtpStatus.editing
            : state.status,
      ),
    );
    if (code.length == state.challenge.codeLength &&
        state.status == OtpStatus.editing) {
      unawaited(verify());
    }
  }

  Future<void> verify() async {
    if (!state.canVerify) return;
    emit(state.copyWith(status: OtpStatus.verifying));
    final result = await _verifyOtp((
      challenge: state.challenge,
      code: state.code,
    ));
    if (isClosed) return;
    emit(switch (result) {
      Ok() => state.copyWith(status: OtpStatus.success),
      Err(
        failure: RuleFailure(code: AuthFailureCodes.otpInvalid, :final data),
      ) =>
        state.copyWith(
          status: OtpStatus.invalid,
          attemptsLeft: data[AuthFailureCodes.attemptsLeft] as int?,
        ),
      Err(
        failure: RuleFailure(code: AuthFailureCodes.otpLocked, :final data),
      ) =>
        state.copyWith(
          status: OtpStatus.locked,
          lockMinutes: data[AuthFailureCodes.lockMinutes] as int?,
        ),
      Err(:final failure) => state.copyWith(
        status: OtpStatus.editing,
        failure: failure,
      ),
    });
  }

  Future<void> resend() async {
    if (!state.canResend) return;
    emit(state.copyWith(isResending: true));
    final result = await _resendOtp(state.challenge);
    if (isClosed) return;
    emit(switch (result) {
      Ok(:final value) => OtpState(
        challenge: value,
        now: _clock(),
        resendCount: state.resendCount + 1,
      ),
      Err(:final failure) => state.copyWith(
        isResending: false,
        failure: failure,
      ),
    });
  }

  @override
  Future<void> close() async {
    await _ticks.cancel();
    return super.close();
  }
}
