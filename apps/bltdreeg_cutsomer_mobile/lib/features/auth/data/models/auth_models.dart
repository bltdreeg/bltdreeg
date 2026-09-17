import '../../domain/entities/auth_session.dart';
import '../../domain/entities/otp_challenge.dart';
import '../../domain/entities/user.dart';

/// JSON mapping for auth payloads. Field names follow the planned REST
/// contract (snake_case).
abstract final class UserModel {
  static User fromJson(Map<String, Object?> json) => User(
    id: json['id']! as String,
    firstName: json['first_name']! as String,
    lastName: json['last_name']! as String,
    phone: json['phone']! as String,
    email: json['email'] as String?,
    birthDate: switch (json['birth_date']) {
      final String s => DateTime.parse(s),
      _ => null,
    },
    areaName: json['area_name'] as String?,
    phoneVerified: json['phone_verified'] as bool? ?? true,
  );

  static Map<String, Object?> toJson(User user) => {
    'id': user.id,
    'first_name': user.firstName,
    'last_name': user.lastName,
    'phone': user.phone,
    'email': user.email,
    'birth_date': user.birthDate?.toIso8601String(),
    'area_name': user.areaName,
    'phone_verified': user.phoneVerified,
  };
}

abstract final class AuthSessionModel {
  static AuthSession fromJson(Map<String, Object?> json) => AuthSession(
    accessToken: json['access_token']! as String,
    user: UserModel.fromJson(json['user']! as Map<String, Object?>),
  );
}

abstract final class OtpChallengeModel {
  static OtpChallenge fromJson(Map<String, Object?> json) => OtpChallenge(
    phone: json['phone']! as String,
    purpose: OtpPurpose.values.byName(json['purpose']! as String),
    codeLength: json['code_length']! as int,
    resendAvailableAt: DateTime.parse(json['resend_available_at']! as String),
    attemptsLeft: json['attempts_left']! as int,
  );
}
