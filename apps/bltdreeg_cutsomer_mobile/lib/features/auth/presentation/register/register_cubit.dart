import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/utils/result.dart';
import '../../../../core/utils/validators.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/usecases/auth_usecases.dart';
import '../login/login_cubit.dart' show SubmitStatus;

final class RegisterState extends Equatable {
  const RegisterState({
    this.firstName = '',
    this.lastName = '',
    this.phone = '',
    this.email = '',
    this.password = '',
    this.termsAccepted = false,
    this.submitted = false,
    this.status = SubmitStatus.idle,
    this.failure,
    this.challenge,
  });

  final String firstName;
  final String lastName;
  final String phone;
  final String email;
  final String password;
  final bool termsAccepted;

  /// Errors are shown after the first submit attempt; the password checklist
  /// is always live (frame 06).
  final bool submitted;
  final SubmitStatus status;
  final Failure? failure;
  final OtpChallenge? challenge;

  PasswordChecks get passwordChecks => Validators.passwordChecks(password);

  ValidationError? get firstNameError =>
      submitted ? Validators.name(firstName) : null;
  ValidationError? get lastNameError =>
      submitted ? Validators.name(lastName) : null;
  ValidationError? get phoneError =>
      submitted ? Validators.egyptianMobile(phone) : null;
  ValidationError? get emailError =>
      submitted ? Validators.email(email, optional: true) : null;
  ValidationError? get passwordError =>
      submitted ? Validators.password(password) : null;
  bool get termsError => submitted && !termsAccepted;

  bool get isValid =>
      Validators.name(firstName) == null &&
      Validators.name(lastName) == null &&
      Validators.egyptianMobile(phone) == null &&
      Validators.email(email, optional: true) == null &&
      Validators.password(password) == null &&
      termsAccepted;

  RegisterState copyWith({
    String? firstName,
    String? lastName,
    String? phone,
    String? email,
    String? password,
    bool? termsAccepted,
    bool? submitted,
    SubmitStatus? status,
    Failure? failure,
    OtpChallenge? challenge,
  }) => RegisterState(
    firstName: firstName ?? this.firstName,
    lastName: lastName ?? this.lastName,
    phone: phone ?? this.phone,
    email: email ?? this.email,
    password: password ?? this.password,
    termsAccepted: termsAccepted ?? this.termsAccepted,
    submitted: submitted ?? this.submitted,
    status: status ?? SubmitStatus.idle,
    failure: failure,
    challenge: challenge,
  );

  @override
  List<Object?> get props => [
    firstName,
    lastName,
    phone,
    email,
    password,
    termsAccepted,
    submitted,
    status,
    failure,
    challenge,
  ];
}

class RegisterCubit extends Cubit<RegisterState> {
  RegisterCubit({required this._startRegistration})
    : super(const RegisterState());

  final StartRegistration _startRegistration;

  void firstNameChanged(String v) => emit(state.copyWith(firstName: v));
  void lastNameChanged(String v) => emit(state.copyWith(lastName: v));
  void phoneChanged(String v) => emit(state.copyWith(phone: v));
  void emailChanged(String v) => emit(state.copyWith(email: v));
  void passwordChanged(String v) => emit(state.copyWith(password: v));
  void termsChanged({required bool accepted}) =>
      emit(state.copyWith(termsAccepted: accepted));

  Future<void> submit() async {
    if (state.status == SubmitStatus.submitting) return;
    final next = state.copyWith(submitted: true);
    if (!next.isValid) {
      emit(next);
      return;
    }
    emit(next.copyWith(status: SubmitStatus.submitting));
    final email = state.email.trim();
    final result = await _startRegistration(
      RegistrationRequest(
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim(),
        phone: Validators.normalizeEgyptianMobile(state.phone)!,
        email: email.isEmpty ? null : email,
        password: state.password,
      ),
    );
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
