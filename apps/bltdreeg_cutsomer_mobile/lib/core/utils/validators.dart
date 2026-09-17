import 'digits.dart';

/// Validation outcomes. Validators return codes, never copy; the
/// presentation layer maps each code to a localized message.
enum ValidationError {
  required,
  invalidEmail,
  invalidPhone,
  passwordTooShort,
  passwordNeedsDigit,
  invalidOtp,
  nameTooShort,
}

/// Live password rule checklist shown under the field (frame 06).
final class PasswordChecks {
  const PasswordChecks({required this.hasMinLength, required this.hasDigit});

  final bool hasMinLength;
  final bool hasDigit;

  bool get isValid => hasMinLength && hasDigit;
}

abstract final class Validators {
  static const passwordMinLength = 8;
  static const otpLength = 4;

  static final _email = RegExp(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$",
  );

  /// Egyptian mobile in local 11-digit form: 010 / 011 / 012 / 015 + 8 digits.
  static final _egyptMobile = RegExp(r'^01[0125]\d{8}$');

  static ValidationError? required(String? value) =>
      (value == null || value.trim().isEmpty) ? ValidationError.required : null;

  static ValidationError? name(String? value) {
    if (required(value) != null) return ValidationError.required;
    return value!.trim().length < 2 ? ValidationError.nameTooShort : null;
  }

  static ValidationError? email(String? value, {bool optional = false}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return optional ? null : ValidationError.required;
    return _email.hasMatch(v) ? null : ValidationError.invalidEmail;
  }

  /// Normalizes user input to the local 11-digit form (`01XXXXXXXXX`).
  ///
  /// Accepts Arabic-Indic digits, spaces/dashes, and international prefixes
  /// (`+20`, `0020`, `20`). Returns null if the result isn't a valid Egyptian
  /// mobile number.
  static String? normalizeEgyptianMobile(String input) {
    var digits = Digits.onlyDigits(input);
    if (digits.startsWith('0020')) {
      digits = '0${digits.substring(4)}';
    } else if (digits.startsWith('20') && digits.length == 12) {
      digits = '0${digits.substring(2)}';
    } else if (digits.length == 10 && digits.startsWith('1')) {
      digits = '0$digits';
    }
    return _egyptMobile.hasMatch(digits) ? digits : null;
  }

  static ValidationError? egyptianMobile(String? value) {
    if (value == null || Digits.onlyDigits(value).isEmpty) {
      return ValidationError.required;
    }
    return normalizeEgyptianMobile(value) == null
        ? ValidationError.invalidPhone
        : null;
  }

  static PasswordChecks passwordChecks(String value) => PasswordChecks(
    hasMinLength: value.length >= passwordMinLength,
    hasDigit: RegExp('[0-9]').hasMatch(Digits.toLatin(value)),
  );

  static ValidationError? password(String? value) {
    final checks = passwordChecks(value ?? '');
    if (!checks.hasMinLength) return ValidationError.passwordTooShort;
    if (!checks.hasDigit) return ValidationError.passwordNeedsDigit;
    return null;
  }

  static ValidationError? otp(String? value, {int length = otpLength}) {
    final digits = Digits.onlyDigits(value ?? '');
    return RegExp('^\\d{$length}\$').hasMatch(digits)
        ? null
        : ValidationError.invalidOtp;
  }
}
