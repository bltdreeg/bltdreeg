import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/utils/digits.dart';
import '../../../../core/utils/result.dart';
import '../../../../core/utils/validators.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/usecases/auth_usecases.dart';

enum LoginMethod { email, phone }

enum SubmitStatus { idle, submitting, success, failure }

final class LoginState extends Equatable {
  const LoginState({
    this.method = LoginMethod.email,
    this.email = '',
    this.password = '',
    this.phone = '',
    this.phoneBlurred = false,
    this.emailSubmitted = false,
    this.status = SubmitStatus.idle,
    this.failure,
    this.challenge,
  });

  final LoginMethod method;
  final String email;
  final String password;
  final String phone;
  final bool phoneBlurred;
  final bool emailSubmitted;
  final SubmitStatus status;
  final Failure? failure;

  /// Set when a phone login succeeded and the OTP screen should open.
  final OtpChallenge? challenge;

  bool get isSubmitting => status == SubmitStatus.submitting;

  bool get isPhoneValid => Validators.egyptianMobile(phone) == null;

  /// Inline phone error (frame 05): shown as soon as the prefix can no longer
  /// become valid, or after leaving the field with an incomplete number.
  ValidationError? get visiblePhoneError {
    final digits = Digits.onlyDigits(phone);
    if (digits.isEmpty) return null;
    final prefixBroken =
        (digits.isNotEmpty && digits[0] != '0') ||
        (digits.length >= 2 && !digits.startsWith('01')) ||
        (digits.length >= 3 && !RegExp('^01[0125]').hasMatch(digits));
    if (prefixBroken || phoneBlurred || digits.length == 11) {
      return Validators.egyptianMobile(digits);
    }
    return null;
  }

  ValidationError? get visibleEmailError =>
      emailSubmitted ? Validators.email(email) : null;

  ValidationError? get visiblePasswordError =>
      emailSubmitted ? Validators.required(password) : null;

  LoginState copyWith({
    LoginMethod? method,
    String? email,
    String? password,
    String? phone,
    bool? phoneBlurred,
    bool? emailSubmitted,
    SubmitStatus? status,
    Failure? failure,
    OtpChallenge? challenge,
  }) => LoginState(
    method: method ?? this.method,
    email: email ?? this.email,
    password: password ?? this.password,
    phone: phone ?? this.phone,
    phoneBlurred: phoneBlurred ?? this.phoneBlurred,
    emailSubmitted: emailSubmitted ?? this.emailSubmitted,
    status: status ?? this.status,
    // Failure and challenge are per-submission; not carried over.
    failure: failure,
    challenge: challenge,
  );

  @override
  List<Object?> get props => [
    method,
    email,
    password,
    phone,
    phoneBlurred,
    emailSubmitted,
    status,
    failure,
    challenge,
  ];
}

class LoginCubit extends Cubit<LoginState> {
  LoginCubit({
    required this._signInWithEmail,
    required this._requestLoginOtp,
    LoginMethod initialMethod = LoginMethod.email,
  }) : super(LoginState(method: initialMethod));

  final SignInWithEmail _signInWithEmail;
  final RequestLoginOtp _requestLoginOtp;

  void methodChanged(LoginMethod method) =>
      emit(state.copyWith(method: method, status: SubmitStatus.idle));

  void emailChanged(String value) =>
      emit(state.copyWith(email: value, status: SubmitStatus.idle));

  void passwordChanged(String value) =>
      emit(state.copyWith(password: value, status: SubmitStatus.idle));

  void phoneChanged(String value) => emit(
    state.copyWith(
      phone: Digits.onlyDigits(value),
      phoneBlurred: false,
      status: SubmitStatus.idle,
    ),
  );

  void phoneFocusLost() => emit(state.copyWith(phoneBlurred: true));

  Future<void> submitEmail() async {
    if (state.isSubmitting) return;
    final next = state.copyWith(emailSubmitted: true);
    if (next.visibleEmailError != null || next.visiblePasswordError != null) {
      emit(next);
      return;
    }
    emit(next.copyWith(status: SubmitStatus.submitting));
    final result = await _signInWithEmail((
      email: state.email,
      password: state.password,
    ));
    emit(switch (result) {
      Ok() => state.copyWith(status: SubmitStatus.success),
      Err(:final failure) => state.copyWith(
        status: SubmitStatus.failure,
        failure: failure,
      ),
    });
  }

  Future<void> submitPhone() async {
    if (state.isSubmitting || !state.isPhoneValid) return;
    emit(state.copyWith(status: SubmitStatus.submitting));
    final phone = Validators.normalizeEgyptianMobile(state.phone)!;
    final result = await _requestLoginOtp(phone);
    emit(switch (result) {
      Ok(:final value) => state.copyWith(
        status: SubmitStatus.success,
        challenge: value,
      ),
      Err(:final failure) => state.copyWith(
        status: SubmitStatus.failure,
        failure: failure,
      ),
    });
  }
}
