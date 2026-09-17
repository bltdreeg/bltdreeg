import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:go_router/go_router.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/utils/validators.dart';
import '../../../../core/widgets/widgets.dart';
import '../login/login_cubit.dart' show SubmitStatus;
import '../widgets/auth_widgets.dart';
import 'register_cubit.dart';

/// Frame 06.
class RegisterPage extends StatelessWidget {
  const RegisterPage({this.from, super.key});

  final String? from;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<RegisterCubit>(),
      child: _RegisterView(from: from),
    );
  }
}

class _RegisterView extends StatelessWidget {
  const _RegisterView({required this.from});

  final String? from;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<RegisterCubit>();

    return BlocListener<RegisterCubit, RegisterState>(
      listenWhen: (a, b) =>
          a.status != b.status && b.status == SubmitStatus.success,
      listener: (context, state) =>
          context.pushOtp(state.challenge!, from: from),
      child: AuthScaffold(
        children: [
          AuthHeader(
            topPadding: 20,
            title: l10n.registerTitle,
            subtitle: Text(
              l10n.registerSubtitle,
              style: AppTypography.bodyLong,
            ),
          ),
          const SizedBox(height: 22),
          BlocBuilder<RegisterCubit, RegisterState>(
            builder: (context, state) => AutofillGroup(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: AppTextField(
                          label: l10n.fieldFirstName,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.givenName],
                          errorText: state.firstNameError?.message(l10n),
                          onChanged: cubit.firstNameChanged,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: AppTextField(
                          label: l10n.fieldLastName,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.familyName],
                          errorText: state.lastNameError?.message(l10n),
                          onChanged: cubit.lastNameChanged,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  AppPhoneField(
                    label: l10n.fieldPhone,
                    textInputAction: TextInputAction.next,
                    errorText: state.phoneError?.message(l10n),
                    onChanged: cubit.phoneChanged,
                  ),
                  const SizedBox(height: 14),
                  AppTextField(
                    label: l10n.fieldEmail,
                    optional: true,
                    hint: 'karim@example.com',
                    keyboardType: TextInputType.emailAddress,
                    textDirection: TextDirection.ltr,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.email],
                    errorText: state.emailError?.message(l10n),
                    onChanged: cubit.emailChanged,
                  ),
                  const SizedBox(height: 14),
                  AppTextField(
                    label: l10n.fieldPassword,
                    isPassword: true,
                    textInputAction: TextInputAction.done,
                    autofillHints: const [AutofillHints.newPassword],
                    onChanged: cubit.passwordChanged,
                    // The live checklist below is the error UI for passwords.
                    helper: Wrap(
                      spacing: 14,
                      runSpacing: 6,
                      children: [
                        PasswordRuleIndicator(
                          label: l10n.passwordRuleLength(
                            Validators.passwordMinLength,
                          ),
                          met: state.passwordChecks.hasMinLength,
                          highlightUnmet: state.submitted,
                        ),
                        PasswordRuleIndicator(
                          label: l10n.passwordRuleDigit,
                          met: state.passwordChecks.hasDigit,
                          highlightUnmet: state.submitted,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  TermsAgreement(
                    accepted: state.termsAccepted,
                    showError: state.termsError,
                    onChanged: (v) => cubit.termsChanged(accepted: v),
                  ),
                  const SizedBox(height: 20),
                  if (state.status == SubmitStatus.failure &&
                      state.failure != null) ...[
                    AuthErrorBanner(
                      message: authFailureMessage(state.failure!, l10n),
                    ),
                    const SizedBox(height: 14),
                  ],
                  AppButton(
                    label: l10n.registerSubmit,
                    isLoading: state.status == SubmitStatus.submitting,
                    onPressed: cubit.submit,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 22),
          OrDivider(label: l10n.registerOrSocial),
          const SizedBox(height: 16),
          const SocialAuthButtons(compact: true),
          AuthFooterPrompt(
            text: l10n.registerHaveAccount,
            action: l10n.registerSignIn,
            onAction: () =>
                context.canPop() ? context.pop() : context.goLogin(from: from),
          ),
        ],
      ),
    );
  }
}
