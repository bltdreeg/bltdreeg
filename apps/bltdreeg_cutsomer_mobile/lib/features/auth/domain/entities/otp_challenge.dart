import 'package:equatable/equatable.dart';

enum OtpPurpose { login, register }

/// A code sent to [phone]; the server owns the timing rules.
final class OtpChallenge extends Equatable {
  const OtpChallenge({
    required this.phone,
    required this.purpose,
    required this.codeLength,
    required this.resendAvailableAt,
    required this.attemptsLeft,
  });

  final String phone;
  final OtpPurpose purpose;
  final int codeLength;
  final DateTime resendAvailableAt;
  final int attemptsLeft;

  @override
  List<Object?> get props => [
    phone,
    purpose,
    codeLength,
    resendAvailableAt,
    attemptsLeft,
  ];
}

final class RegistrationRequest extends Equatable {
  const RegistrationRequest({
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.password,
    this.email,
  });

  final String firstName;
  final String lastName;
  final String phone;
  final String password;
  final String? email;

  @override
  List<Object?> get props => [firstName, lastName, phone, password, email];
}
