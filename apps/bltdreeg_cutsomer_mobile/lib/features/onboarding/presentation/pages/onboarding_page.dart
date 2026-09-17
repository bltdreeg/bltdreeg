import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/di/injection.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/presentation/session/auth_session_cubit.dart';
import '../onboarding_cubit.dart';
import '../widgets/onboarding_illustrations.dart';
import '../widgets/page_dots.dart';

/// Frames 01–03.
class OnboardingPage extends StatelessWidget {
  const OnboardingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<OnboardingCubit>(),
      child: const _OnboardingView(),
    );
  }
}

class _OnboardingView extends StatefulWidget {
  const _OnboardingView();

  @override
  State<_OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<_OnboardingView> {
  final _pages = PageController();

  @override
  void dispose() {
    _pages.dispose();
    super.dispose();
  }

  Future<void> _goTo(int index) => _pages.animateToPage(
    index,
    duration: AppMotion.slow,
    curve: Curves.easeInOutCubic,
  );

  /// "ادخل على الصالونات": browse as a guest.
  Future<void> _browse() async {
    final cubit = context.read<OnboardingCubit>();
    final session = context.read<AuthSessionCubit>();
    await cubit.complete();
    if (!session.state.isAuthenticated) await session.continueAsGuest();
    if (mounted) context.goHome();
  }

  /// "عندي حساب": login is pushed so its back button returns here.
  Future<void> _signIn() async {
    await context.read<OnboardingCubit>().complete();
    if (mounted) await context.pushLogin();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final page = context.watch<OnboardingCubit>().state;
    const last = OnboardingCubit.pageCount - 1;

    final slides = [
      (
        title: l10n.onboarding1Title,
        body: l10n.onboarding1Body,
        art: (bool active) => FindSalonsIllustration(active: active),
      ),
      (
        title: l10n.onboarding2Title,
        body: l10n.onboarding2Body,
        art: (bool active) => LiveQueueIllustration(active: active),
      ),
      (
        title: l10n.onboarding3Title,
        body: l10n.onboarding3Body,
        art: (bool active) => ChooseBarberIllustration(active: active),
      ),
    ];

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 6, 20, 0),
              child: SizedBox(
                height: 40,
                child: Row(
                  children: [
                    const BrandLockup(),
                    const Spacer(),
                    AnimatedOpacity(
                      duration: AppMotion.fast,
                      opacity: page == last ? 0 : 1,
                      child: IgnorePointer(
                        ignoring: page == last,
                        child: AppLinkButton(
                          label: l10n.onboardingSkip,
                          color: AppColors.textSecondary,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          // Skip jumps to the last slide so both entry
                          // choices (browse / sign in) are still offered.
                          onPressed: () => _goTo(last),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pages,
                itemCount: slides.length,
                onPageChanged: context.read<OnboardingCubit>().pageChanged,
                itemBuilder: (context, i) => _Slide(
                  title: slides[i].title,
                  body: slides[i].body,
                  art: slides[i].art(i == page),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 26),
              child: Column(
                children: [
                  PageDots(count: slides.length, index: page),
                  const SizedBox(height: 18),
                  AnimatedSize(
                    duration: AppMotion.medium,
                    curve: AppMotion.standard,
                    alignment: Alignment.topCenter,
                    child: page == last
                        ? Column(
                            children: [
                              AppButton(
                                label: l10n.onboarding3Cta,
                                onPressed: _browse,
                              ),
                              const SizedBox(height: 14),
                              AppButton(
                                label: l10n.onboarding3Login,
                                variant: AppButtonVariant.secondary,
                                height: 46,
                                fontSize: 14.5,
                                onPressed: _signIn,
                              ),
                            ],
                          )
                        : AppButton(
                            label: page == 0
                                ? l10n.onboarding1Cta
                                : l10n.onboarding2Cta,
                            onPressed: () => _goTo(page + 1),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Slide extends StatelessWidget {
  const _Slide({required this.title, required this.body, required this.art});

  final String title;
  final String body;
  final Widget art;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 290),
                child: art,
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(
                header: true,
                child: Text(title, style: AppTypography.headline),
              ),
              const SizedBox(height: 12),
              Text(body, style: AppTypography.bodyLong),
            ],
          ),
        ),
      ],
    );
  }
}
