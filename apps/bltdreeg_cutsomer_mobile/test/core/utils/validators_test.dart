import 'package:bltdreeg_cutsomer_mobile/core/utils/validators.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Egyptian mobile', () {
    test('accepts 010 / 011 / 012 / 015 with 11 digits', () {
      for (final n in [
        '01023456789',
        '01123456789',
        '01223456789',
        '01523456789',
      ]) {
        expect(Validators.egyptianMobile(n), isNull, reason: n);
      }
    });

    test('rejects wrong prefix or length (frame 05 error)', () {
      expect(
        Validators.egyptianMobile('0102 345 67'),
        ValidationError.invalidPhone,
      );
      expect(
        Validators.egyptianMobile('01323456789'),
        ValidationError.invalidPhone,
      );
      expect(
        Validators.egyptianMobile('010234567890'),
        ValidationError.invalidPhone,
      );
    });

    test('empty is required, not invalid', () {
      expect(Validators.egyptianMobile(''), ValidationError.required);
      expect(Validators.egyptianMobile('  '), ValidationError.required);
    });

    test('normalizes Arabic-Indic digits, spaces and country codes', () {
      const expected = '01023456789';
      expect(Validators.normalizeEgyptianMobile('٠١٠٢ ٣٤٥ ٦٧٨٩'), expected);
      expect(Validators.normalizeEgyptianMobile('+20 102 345 6789'), expected);
      expect(Validators.normalizeEgyptianMobile('00201023456789'), expected);
      expect(Validators.normalizeEgyptianMobile('1023456789'), expected);
    });
  });

  group('email', () {
    test('valid and invalid', () {
      expect(Validators.email('karim.abdelrahman@gmail.com'), isNull);
      expect(Validators.email('karim@'), ValidationError.invalidEmail);
      expect(Validators.email(''), ValidationError.required);
    });

    test('optional email allows empty but still validates content', () {
      expect(Validators.email('', optional: true), isNull);
      expect(
        Validators.email('nope', optional: true),
        ValidationError.invalidEmail,
      );
    });
  });

  group('password rules (frame 06 live checklist)', () {
    test('checks length and digit independently', () {
      final short = Validators.passwordChecks('abc1');
      expect(short.hasMinLength, isFalse);
      expect(short.hasDigit, isTrue);

      final noDigit = Validators.passwordChecks('abcdefgh');
      expect(noDigit.hasMinLength, isTrue);
      expect(noDigit.hasDigit, isFalse);
      expect(noDigit.isValid, isFalse);

      expect(Validators.passwordChecks('abcdefg1').isValid, isTrue);
    });

    test('Arabic-Indic digit counts as a digit', () {
      expect(Validators.passwordChecks('كلمةسر٧٧').hasDigit, isTrue);
    });

    test('password() reports the first failing rule', () {
      expect(Validators.password('a1'), ValidationError.passwordTooShort);
      expect(
        Validators.password('abcdefgh'),
        ValidationError.passwordNeedsDigit,
      );
      expect(Validators.password('abcdefg1'), isNull);
    });
  });

  group('OTP', () {
    test('requires exactly 4 digits', () {
      expect(Validators.otp('7319'), isNull);
      expect(Validators.otp('٧٣١٩'), isNull);
      expect(Validators.otp('731'), ValidationError.invalidOtp);
      expect(Validators.otp('73190'), ValidationError.invalidOtp);
    });
  });

  test('name', () {
    expect(Validators.name('كريم'), isNull);
    expect(Validators.name('ك'), ValidationError.nameTooShort);
    expect(Validators.name(''), ValidationError.required);
  });
}
