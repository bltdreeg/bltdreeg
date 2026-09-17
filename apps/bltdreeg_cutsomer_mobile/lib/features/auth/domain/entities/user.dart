import 'package:equatable/equatable.dart';

final class User extends Equatable {
  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.phone,
    this.email,
    this.birthDate,
    this.areaName,
    this.phoneVerified = true,
  });

  final String id;
  final String firstName;
  final String lastName;

  /// Local 11-digit Egyptian mobile (`01XXXXXXXXX`), the account identity.
  final String phone;
  final String? email;
  final DateTime? birthDate;
  final String? areaName;
  final bool phoneVerified;

  String get fullName => '$firstName $lastName'.trim();

  @override
  List<Object?> get props => [
    id,
    firstName,
    lastName,
    phone,
    email,
    birthDate,
    areaName,
    phoneVerified,
  ];
}
