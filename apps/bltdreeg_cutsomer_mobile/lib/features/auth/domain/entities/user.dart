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

  User copyWith({
    String? firstName,
    String? lastName,
    String? email,
    bool clearEmail = false,
    DateTime? birthDate,
    bool clearBirthDate = false,
    String? areaName,
  }) => User(
    id: id,
    firstName: firstName ?? this.firstName,
    lastName: lastName ?? this.lastName,
    phone: phone,
    email: clearEmail ? null : email ?? this.email,
    birthDate: clearBirthDate ? null : birthDate ?? this.birthDate,
    areaName: areaName ?? this.areaName,
    phoneVerified: phoneVerified,
  );

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

/// Editable profile fields (frame 36). The phone is the account identity
/// and changes through its own verified path, never this form.
final class ProfileUpdate extends Equatable {
  const ProfileUpdate({
    required this.firstName,
    required this.lastName,
    this.email,
    this.birthDate,
    this.areaName,
  });

  final String firstName;
  final String lastName;
  final String? email;
  final DateTime? birthDate;
  final String? areaName;

  @override
  List<Object?> get props => [firstName, lastName, email, birthDate, areaName];
}
