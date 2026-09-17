import '../error/failures.dart';
import '../utils/validators.dart';
import 'generated/app_localizations.dart';

extension ValidationErrorL10n on ValidationError {
  String message(AppLocalizations l10n) => switch (this) {
    ValidationError.required => l10n.validationRequired,
    ValidationError.invalidEmail => l10n.validationEmail,
    ValidationError.invalidPhone => l10n.validationPhone,
    ValidationError.passwordTooShort => l10n.validationPasswordShort,
    ValidationError.passwordNeedsDigit => l10n.validationPasswordDigit,
    ValidationError.invalidOtp => l10n.validationOtp,
    ValidationError.nameTooShort => l10n.validationNameShort,
  };
}

extension FailureL10n on Failure {
  /// Generic message; features override for their own [RuleFailure] codes.
  String message(AppLocalizations l10n) => switch (this) {
    NetworkFailure() => l10n.errorNetwork,
    ServerFailure() => l10n.errorServer,
    UnauthorizedFailure() => l10n.errorUnauthorized,
    NotFoundFailure() ||
    RuleFailure() ||
    CacheFailure() ||
    UnexpectedFailure() => l10n.errorGeneric,
  };
}

extension RatingLabelL10n on AppLocalizations {
  String ratingLabel(int stars) => switch (stars) {
    1 => ratingLabel1,
    2 => ratingLabel2,
    3 => ratingLabel3,
    4 => ratingLabel4,
    _ => ratingLabel5,
  };
}
