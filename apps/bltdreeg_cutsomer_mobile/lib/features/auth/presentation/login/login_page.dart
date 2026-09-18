import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/config/app_environment.dart';
import '../../../../core/dev/demo_credentials.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/router/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../session/auth_session_cubit.dart';
import '../widgets/auth_widgets.dart';
import 'login_cubit.dart';

/// Frames 04 (email) and 05 (mobile + inline validation).
class LoginPage extends StatelessWidget {
  const LoginPage({
    this.from,
    this.initialMethod = LoginMethod.email,
    super.key,
  });

  /// Location to return to after signing in (guarded deep links).
  final String? from;
  final LoginMethod initialMethod;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<LoginCubit>(param1: initialMethod),
      child: _LoginView(from: from),
    );
  }
}

class _LoginView extends StatefulWidget {
  const _LoginView({required this.from});

  final String? from;

  @override
  State<_LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<_LoginView> {
  final _phoneFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    _phoneFocus.addListener(() {
      if (!_phoneFocus.hasFocus) context.read<LoginCubit>().phoneFocusLost();
    });
  }

  @override
  void dispose() {
    _phoneFocus.dispose();
    super.dispose();
  }

  Future<void> _browseAsGuest() async {
    await context.read<AuthSessionCubit>().continueAsGuest();
    if (mounted) context.goHome();
  }

  void _onState(BuildContext context, LoginState state) {
    if (state.status != SubmitStatus.success) return;
    final challenge = state.challenge;
    if (challenge != null) {
      context.pushOtp(challenge, from: widget.from);
    } else {
      context.go(widget.from ?? AppRoutes.home.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return BlocListener<LoginCubit, LoginState>(
      listenWhen: (a, b) => a.status != b.status,
      listener: _onState,
      child: AuthScaffold(
        trailing: AppLinkButton(
          label: l10n.authBrowseAsGuest,
          fontSize: 14,
          onPressed: _browseAsGuest,
        ),
        children: [
          AuthHeader(
            leading: const BrandMark(size: 52),
            title: l10n.loginTitle,
            subtitle: Text(l10n.loginSubtitle, style: AppTypography.bodyLong),
          ),
          const SizedBox(height: 24),
          BlocSelector<LoginCubit, LoginState, LoginMethod>(
            selector: (s) => s.method,
            builder: (context, method) => SegmentedTabs(
              labels: [l10n.loginTabEmail, l10n.loginTabPhone],
              selectedIndex: method.index,
              onChanged: (i) {
                FocusScope.of(context).unfocus();
                context.read<LoginCubit>().methodChanged(LoginMethod.values[i]);
              },
            ),
          ),
          const SizedBox(height: 22),
          BlocSelector<LoginCubit, LoginState, LoginMethod>(
            selector: (s) => s.method,
            builder: (context, method) => AnimatedSwitcher(
              duration: AppMotion.medium,
              switchInCurve: AppMotion.standard,
              transitionBuilder: (child, animation) => FadeTransition(
                opacity: animation,
                child: SizeTransition(
                  sizeFactor: animation,
                  alignment: Alignment.topCenter,
                  child: child,
                ),
              ),
              child: method == LoginMethod.email
                  ? const _EmailForm(key: ValueKey('email'))
                  : _PhoneForm(
                      key: const ValueKey('phone'),
                      focusNode: _phoneFocus,
                    ),
            ),
          ),
          const SizedBox(height: 24),
          OrDivider(label: l10n.orDivider),
          const SizedBox(height: 18),
          const SocialAuthButtons(),
          AuthFooterPrompt(
            text: l10n.loginNoAccount,
            action: l10n.loginCreateAccount,
            onAction: () => context.pushRegister(from: widget.from),
          ),
          if (kDebugMode && sl<AppEnvironment>().usesFakeBackend)
            Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Text(
                'Demo: ${DemoCredentials.email} / '
                '${DemoCredentials.password} · '
                '${DemoCredentials.phone} · '
                'OTP ${DemoCredentials.otp}',
                textAlign: TextAlign.center,
                textDirection: TextDirection.ltr,
                style: AppTypography.caption,
              ),
            ),
        ],
      ),
    );
  }
}

class _EmailForm extends StatelessWidget {
  const _EmailForm({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<LoginCubit>();
    return BlocBuilder<LoginCubit, LoginState>(
      builder: (context, state) => AutofillGroup(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AppTextField(
              direction: TextDirection.ltr,
              label: l10n.fieldEmail,
              hint: 'karim@example.com',
              prefixIcon: AppAssets.iconUser,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              textDirection: TextDirection.ltr,
              autofillHints: const [AutofillHints.email],
              errorText: state.visibleEmailError?.message(l10n),
              onChanged: cubit.emailChanged,
            ),
            const SizedBox(height: 14),
            AppTextField(
              direction: TextDirection.ltr,
              label: l10n.fieldPassword,
              isPassword: true,
              textInputAction: TextInputAction.done,
              autofillHints: const [AutofillHints.password],
              errorText: state.visiblePasswordError?.message(l10n),
              onChanged: cubit.passwordChanged,
              onSubmitted: (_) => cubit.submitEmail(),
            ),
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: Padding(
                padding: const EdgeInsets.only(top: 6, bottom: 18),
                // Per product decision: goes to home until reset exists.
                child: AppLinkButton(
                  label: l10n.loginForgotPassword,
                  onPressed: context.goHome,
                ),
              ),
            ),
            if (state.status == SubmitStatus.failure &&
                state.failure != null) ...[
              AuthErrorBanner(
                message: authFailureMessage(state.failure!, l10n),
              ),
              const SizedBox(height: 14),
            ],
            AppButton(
              label: l10n.loginSubmit,
              isLoading: state.isSubmitting,
              onPressed: cubit.submitEmail,
            ),
          ],
        ),
      ),
    );
  }
}

class _PhoneForm extends StatelessWidget {
  const _PhoneForm({required this.focusNode, super.key});

  final FocusNode focusNode;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<LoginCubit>();
    return BlocBuilder<LoginCubit, LoginState>(
      builder: (context, state) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Focus(
            focusNode: focusNode,
            skipTraversal: true,
            child: AppPhoneField(
              direction: TextDirection.ltr,
              label: l10n.fieldPhone,
              errorText: state.visiblePhoneError?.message(l10n),
              textInputAction: TextInputAction.send,
              onChanged: cubit.phoneChanged,
              onSubmitted: (_) => cubit.submitPhone(),
            ),
          ),
          const SizedBox(height: 20),
          AppNotice(
            message: l10n.loginOtpNotice,
            icon: AppAssets.iconCheck,
            iconColor: AppColors.primary,
          ),
          const SizedBox(height: 20),
          if (state.status == SubmitStatus.failure &&
              state.failure != null) ...[
            AuthErrorBanner(message: authFailureMessage(state.failure!, l10n)),
            const SizedBox(height: 14),
          ],
          // Disabled until the number is valid (board note on frame 05).
          AppButton(
            label: l10n.loginSendOtp,
            isLoading: state.isSubmitting,
            onPressed: state.isPhoneValid ? cubit.submitPhone : null,
          ),
        ],
      ),
    );
  }
}
