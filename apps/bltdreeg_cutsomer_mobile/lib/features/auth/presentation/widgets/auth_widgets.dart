import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/localization/generated/app_localizations.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/auth_failure_codes.dart';

/// Localized message for auth failures, including auth rule codes.
String authFailureMessage(Failure failure, AppLocalizations l10n) =>
    switch (failure) {
      RuleFailure(code: AuthFailureCodes.invalidCredentials) =>
        l10n.authInvalidCredentials,
      RuleFailure(code: AuthFailureCodes.phoneNotRegistered) =>
        l10n.authPhoneNotRegistered,
      RuleFailure(code: AuthFailureCodes.phoneTaken) => l10n.authPhoneTaken,
      _ => failure.message(l10n),
    };

/// Scrollable page body with the board's top row: back button on the start
/// side and an optional action on the end side.
class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    required this.children,
    this.trailing,
    this.onBack,
    super.key,
  });

  final List<Widget> children;
  final Widget? trailing;

  /// Defaults to pop, or home when there's nothing to pop.
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 0),
                child: Row(
                  children: [
                    AppIconButton(
                      icon: AppAssets.iconChevronLeft,
                      matchTextDirection: true,
                      semanticLabel: context.l10n.actionBack,
                      onPressed: onBack ?? context.popOrGoHome,
                    ),
                    const Spacer(),
                    ?trailing,
                  ],
                ),
              ),
              Padding(
                padding: AppSpacing.pageH,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: children,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Icon tile + title + subtitle at the top of auth screens.
class AuthHeader extends StatelessWidget {
  const AuthHeader({
    required this.title,
    required this.subtitle,
    this.leading,
    this.topPadding = 26,
    super.key,
  });

  final String title;
  final Widget subtitle;
  final Widget? leading;
  final double topPadding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: topPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (leading != null) ...[leading!, const SizedBox(height: 18)],
          Semantics(
            header: true,
            child: Text(title, style: AppTypography.headline),
          ),
          const SizedBox(height: 6),
          subtitle,
        ],
      ),
    );
  }
}

class OrDivider extends StatelessWidget {
  const OrDivider({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider()),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(label, style: AppTypography.caption),
        ),
        const Expanded(child: Divider()),
      ],
    );
  }
}

/// Google / Apple buttons. Per product decision they currently take the
/// user straight to home; real OAuth plugs in behind these callbacks.
class SocialAuthButtons extends StatelessWidget {
  const SocialAuthButtons({this.compact = false, super.key});

  /// Side-by-side "Google" / "Apple" (register) vs stacked full labels.
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final google = AppButton(
      label: compact ? 'Google' : l10n.continueWithGoogle,
      variant: AppButtonVariant.secondary,
      height: 50,
      fontSize: compact ? 14 : 14.5,
      leading: const AppIcon(AppAssets.iconGoogle, multicolor: true),
      onPressed: context.goHome,
    );
    final apple = AppButton(
      label: compact ? 'Apple' : l10n.continueWithApple,
      variant: AppButtonVariant.secondary,
      height: 50,
      fontSize: compact ? 14 : 14.5,
      leading: const AppIcon(AppAssets.iconApple, color: AppColors.textPrimary),
      onPressed: context.goHome,
    );
    if (compact) {
      return Row(
        children: [
          Expanded(child: google),
          const SizedBox(width: 10),
          Expanded(child: apple),
        ],
      );
    }
    return Column(children: [google, const SizedBox(height: 10), apple]);
  }
}

/// "لسه معندكش حساب؟ اعمل واحد دلوقتي".
class AuthFooterPrompt extends StatelessWidget {
  const AuthFooterPrompt({
    required this.text,
    required this.action,
    required this.onAction,
    super.key,
  });

  final String text;
  final String action;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Wrap(
        alignment: WrapAlignment.center,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 4,
        children: [
          Text(
            text,
            style: AppTypography.label.copyWith(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          AppLinkButton(label: action, fontSize: 14, onPressed: onAction),
        ],
      ),
    );
  }
}

/// Live password rule chip (frame 06): ✓ green when met, ✕ grey otherwise.
class PasswordRuleIndicator extends StatelessWidget {
  const PasswordRuleIndicator({
    required this.label,
    required this.met,
    this.highlightUnmet = false,
    super.key,
  });

  final String label;
  final bool met;

  /// After a submit attempt, unmet rules turn red.
  final bool highlightUnmet;

  @override
  Widget build(BuildContext context) {
    final color = met
        ? AppColors.okDark
        : highlightUnmet
        ? AppColors.error
        : AppColors.textSecondary;
    return Semantics(
      checked: met,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedSwitcher(
            duration: AppMotion.fast,
            transitionBuilder: (child, a) =>
                ScaleTransition(scale: a, child: child),
            child: AppIcon(
              met ? AppAssets.iconCheckBold : AppAssets.iconClose,
              key: ValueKey(met),
              size: AppSizes.iconSm,
              color: color,
            ),
          ),
          const SizedBox(width: 5),
          AnimatedDefaultTextStyle(
            duration: AppMotion.fast,
            style: AppTypography.metaStrong.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
            child: Text(label),
          ),
        ],
      ),
    );
  }
}

/// Terms checkbox with inline links built from a localized template.
///
/// Links are real text spans (not widget spans): inline widgets are
/// direction-neutral placeholders, and bidi reordering would swap the two
/// links in Arabic.
class TermsAgreement extends StatefulWidget {
  const TermsAgreement({
    required this.accepted,
    required this.onChanged,
    this.showError = false,
    super.key,
  });

  final bool accepted;
  final ValueChanged<bool> onChanged;
  final bool showError;

  @override
  State<TermsAgreement> createState() => _TermsAgreementState();
}

class _TermsAgreementState extends State<TermsAgreement> {
  static const _termsMarker = '\u0001';
  static const _privacyMarker = '\u0002';

  // Legal pages live in help & support until dedicated screens exist.
  late final _termsTap = TapGestureRecognizer()..onTap = _openLegal;
  late final _privacyTap = TapGestureRecognizer()..onTap = _openLegal;

  void _openLegal() => context.pushHelp();

  @override
  void dispose() {
    _termsTap.dispose();
    _privacyTap.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final template = l10n.registerTerms(_termsMarker, _privacyMarker);
    final noteStyle = AppTypography.note.copyWith(fontSize: 13);
    final linkStyle = noteStyle.copyWith(
      color: AppColors.primary,
      fontWeight: FontWeight.w700,
    );

    final spans = <InlineSpan>[];
    final buffer = StringBuffer();
    void flush() {
      if (buffer.isEmpty) return;
      spans.add(TextSpan(text: buffer.toString()));
      buffer.clear();
    }

    for (final char in template.characters) {
      if (char == _termsMarker || char == _privacyMarker) {
        flush();
        final terms = char == _termsMarker;
        spans.add(
          TextSpan(
            text: terms ? l10n.termsOfUse : l10n.privacyPolicy,
            style: linkStyle,
            recognizer: terms ? _termsTap : _privacyTap,
          ),
        );
      } else {
        buffer.write(char);
      }
    }
    flush();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 1),
              child: AppCheckbox(
                value: widget.accepted,
                onChanged: widget.onChanged,
                semanticLabel: l10n.termsOfUse,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text.rich(TextSpan(children: spans), style: noteStyle),
            ),
          ],
        ),
        if (widget.showError)
          Padding(
            padding: const EdgeInsetsDirectional.only(top: 6, start: 32),
            child: FieldErrorText(l10n.registerTermsRequired),
          ),
      ],
    );
  }
}

/// Error banner for submit failures (wrong credentials, offline, ...).
class AuthErrorBanner extends StatelessWidget {
  const AuthErrorBanner({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return FadeSlideIn(
      offset: 6,
      duration: AppMotion.medium,
      child: Semantics(
        liveRegion: true,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: const BoxDecoration(
            color: AppColors.errTint,
            borderRadius: AppRadius.fieldAll,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(top: 3),
                child: AppIcon(
                  AppAssets.iconAlertCircle,
                  size: AppSizes.iconSm,
                  color: AppColors.errText,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  message,
                  style: AppTypography.note.copyWith(
                    color: AppColors.errText,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
