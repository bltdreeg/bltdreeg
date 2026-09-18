import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/config/app_environment.dart';
import '../../../../core/dev/demo_credentials.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/router/app_routes.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/entities/otp_challenge.dart';
import '../widgets/auth_widgets.dart';
import 'otp_cubit.dart';

/// Frames 19 (enter code) and 20 (wrong code + resend).
class OtpPage extends StatelessWidget {
  const OtpPage({required this.challenge, this.from, super.key});

  final OtpChallenge challenge;
  final String? from;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<OtpCubit>(param1: challenge),
      child: _OtpView(from: from),
    );
  }
}

class _OtpView extends StatefulWidget {
  const _OtpView({required this.from});

  final String? from;

  @override
  State<_OtpView> createState() => _OtpViewState();
}

class _OtpViewState extends State<_OtpView> {
  final _code = TextEditingController();

  static const _successHold = Duration(milliseconds: 650);

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  Future<void> _onState(BuildContext context, OtpState state) async {
    final l10n = context.l10n;
    switch (state.status) {
      case OtpStatus.success:
        unawaited(AppHaptics.success());
        // Let the green confirmation register before leaving.
        await Future<void>.delayed(_successHold);
        if (context.mounted) context.go(widget.from ?? AppRoutes.home.path);
      case OtpStatus.invalid || OtpStatus.locked:
        unawaited(AppHaptics.alert());
      case OtpStatus.editing || OtpStatus.verifying:
        break;
    }
    if (state.failure != null && context.mounted) {
      context.showToast(authFailureMessage(state.failure!, l10n));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final cubit = context.read<OtpCubit>();

    return MultiBlocListener(
      listeners: [
        BlocListener<OtpCubit, OtpState>(
          listenWhen: (a, b) => a.status != b.status || b.failure != null,
          listener: _onState,
        ),
        BlocListener<OtpCubit, OtpState>(
          listenWhen: (a, b) => a.resendCount != b.resendCount,
          listener: (context, _) {
            _code.clear();
            context.showToast(l10n.otpResent);
          },
        ),
      ],
      child: BlocBuilder<OtpCubit, OtpState>(
        builder: (context, state) {
          final wrong =
              state.status == OtpStatus.invalid ||
              state.status == OtpStatus.locked;
          final phone = Text(
            fmt.phone(state.challenge.phone),
            style: AppTypography.bodyStrong.copyWith(
              fontSize: 14,
              fontWeight: FontWeight.w800,
            ),
          );

          return AuthScaffold(
            children: [
              AuthHeader(
                topPadding: 28,
                leading: AnimatedSwitcher(
                  duration: AppMotion.medium,
                  transitionBuilder: (child, a) =>
                      ScaleTransition(scale: a, child: child),
                  child: _HeaderIcon(key: ValueKey(wrong), wrong: wrong),
                ),
                title: wrong ? l10n.otpWrongTitle : l10n.otpTitle,
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        wrong
                            ? l10n.otpWrongSubtitle
                            : l10n.otpSentTo(state.challenge.codeLength),
                        style: AppTypography.bodyLong,
                      ),
                      Row(
                        children: [
                          phone,
                          if (!wrong) ...[
                            const SizedBox(width: 8),
                            AppLinkButton(
                              label: l10n.otpChangeNumber,
                              onPressed: () => context.pop(),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 30),
              AppOtpInput(
                controller: _code,
                length: state.challenge.codeLength,
                hasError: wrong,
                isSuccess: state.status == OtpStatus.success,
                enabled:
                    state.status != OtpStatus.locked &&
                    state.status != OtpStatus.success,
                onChanged: cubit.codeChanged,
              ),
              AnimatedSize(
                duration: AppMotion.fast,
                alignment: Alignment.topCenter,
                child: switch (state.status) {
                  OtpStatus.invalid when state.attemptsLeft != null => Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Center(
                      child: FieldErrorText(
                        l10n.otpAttemptsLeft(state.attemptsLeft!),
                      ),
                    ),
                  ),
                  OtpStatus.locked => Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Center(
                      child: FieldErrorText(
                        l10n.otpLocked(state.lockMinutes ?? 10),
                      ),
                    ),
                  ),
                  _ => const SizedBox(width: double.infinity),
                },
              ),
              const SizedBox(height: 22),
              if (!state.canResend && state.resendIn > Duration.zero)
                _ResendCountdown(text: fmt.mmss(state.resendIn)),
              const SizedBox(height: 4),
              AppButton(
                label: l10n.otpConfirm,
                isLoading: state.status == OtpStatus.verifying,
                onPressed: state.canVerify ? cubit.verify : null,
              ),
              AnimatedSize(
                duration: AppMotion.medium,
                alignment: Alignment.topCenter,
                child: state.canResend || state.isResending
                    ? Padding(
                        padding: const EdgeInsets.only(top: 10),
                        child: AppButton(
                          label: l10n.otpResend,
                          variant: AppButtonVariant.secondary,
                          icon: AppAssets.iconRefresh,
                          height: 48,
                          fontSize: 14.5,
                          isLoading: state.isResending,
                          onPressed: cubit.resend,
                        ),
                      )
                    : const SizedBox(width: double.infinity),
              ),
              if (!wrong) ...[
                const SizedBox(height: 22),
                AppNotice(message: l10n.otpHelp),
              ],
              if (kDebugMode && sl<AppEnvironment>().usesFakeBackend)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    'Demo code: ${DemoCredentials.otp}',
                    textAlign: TextAlign.center,
                    style: AppTypography.caption,
                  ),
                ),
              const SizedBox(height: 24),
            ],
          );
        },
      ),
    );
  }
}

class _HeaderIcon extends StatelessWidget {
  const _HeaderIcon({required this.wrong, super.key});

  final bool wrong;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        color: wrong ? AppColors.errTint : AppColors.tealTint,
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      alignment: Alignment.center,
      child: AppIcon(
        wrong ? AppAssets.iconAlertCircle : AppAssets.iconMessage,
        size: AppSizes.iconLg,
        color: wrong ? AppColors.error : AppColors.tealDark,
      ),
    );
  }
}

class _ResendCountdown extends StatelessWidget {
  const _ResendCountdown({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final style = AppTypography.label.copyWith(color: AppColors.textSecondary);
    // Render the template with the time in bold.
    const marker = '';
    final parts = l10n.otpResendIn(marker).split(marker);
    return Padding(
      padding: const EdgeInsets.only(bottom: 22),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const AppIcon(
            AppAssets.iconClock,
            size: AppSizes.iconSm,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text.rich(
              TextSpan(
                children: [
                  TextSpan(text: parts.first),
                  TextSpan(
                    text: '\u2066$text\u2069',
                    style: style.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                      fontFeatures: const [FontFeature.tabularFigures()],
                    ),
                  ),
                  if (parts.length > 1) TextSpan(text: parts.last),
                ],
              ),
              style: style,
            ),
          ),
        ],
      ),
    );
  }
}
