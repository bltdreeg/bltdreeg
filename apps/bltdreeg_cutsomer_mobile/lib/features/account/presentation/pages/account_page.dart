import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/config/app_environment.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/locale_cubit.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/domain/entities/user.dart';
import '../../../auth/presentation/session/auth_session_cubit.dart';
import '../account_cubit.dart';

/// Frames 16, 17 and 43: the signed-in account, its sign-out confirmation,
/// and the guest state.
class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<AccountCubit>(),
      child: const _AccountView(),
    );
  }
}

class _AccountView extends StatelessWidget {
  const _AccountView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final session = context.watch<AuthSessionCubit>().state;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.gutter,
            8,
            AppSpacing.gutter,
            24,
          ),
          children: [
            PageTitle(l10n.accountTitle),
            const SizedBox(height: 16),
            switch (session.user) {
              final user? when session.isAuthenticated => _SignedIn(user: user),
              _ => const _Guest(),
            },
          ],
        ),
      ),
    );
  }
}

class _SignedIn extends StatelessWidget {
  const _SignedIn({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final state = context.watch<AccountCubit>().state;
    final locale = context.watch<LocaleCubit>().state.languageCode;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 18),
          child: Row(
            children: [
              AppAvatar(name: user.fullName, size: 64),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.fullName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.titleLg.copyWith(fontSize: 17),
                    ),
                    const SizedBox(height: 3),
                    Text(fmt.phone(user.phone), style: AppTypography.meta),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              AppButton(
                label: l10n.accountEdit,
                variant: AppButtonVariant.secondary,
                size: AppButtonSize.sm,
                expand: false,
                fontSize: 13,
                onPressed: context.pushEditProfile,
              ),
            ],
          ),
        ),
        Row(
          children: [
            Expanded(
              child: _StatCard(
                value: fmt.number(state.completedVisits),
                label: l10n.statCompletedCuts,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _StatCard(
                value: fmt.number(state.favorites),
                label: l10n.statFavoriteSalons,
              ),
            ),
          ],
        ),
        const SizedBox(height: 22),
        GroupLabel(l10n.groupAccount),
        SettingsGroup(
          children: [
            SettingsRow(
              title: l10n.rowProfile,
              icon: AppAssets.iconUser,
              onTap: context.pushEditProfile,
            ),
            SettingsRow(
              title: l10n.rowBookings,
              icon: AppAssets.iconCalendarCheck,
              value: state.active.isEmpty
                  ? null
                  : l10n.activeBookingsValue(state.active.length),
              onTap: context.goBookings,
            ),
            SettingsRow(
              title: l10n.rowFavorites,
              icon: AppAssets.iconHeart,
              value: state.favorites == 0 ? null : fmt.number(state.favorites),
              onTap: context.pushFavorites,
            ),
          ],
        ),
        GroupLabel(l10n.groupApp),
        SettingsGroup(
          children: [
            SettingsRow(
              title: l10n.rowLanguage,
              icon: AppAssets.iconGlobe,
              value: locale == 'ar'
                  ? l10n.languageArabic
                  : l10n.languageEnglish,
              onTap: context.pushLanguage,
            ),
            SettingsRow(
              title: l10n.rowNotifications,
              icon: AppAssets.iconBell,
              onTap: context.pushNotificationSettings,
            ),
          ],
        ),
        GroupLabel(l10n.groupHelp),
        SettingsGroup(
          children: [
            SettingsRow(
              title: l10n.rowHelp,
              icon: AppAssets.iconHelpCircle,
              onTap: context.pushHelp,
            ),
          ],
        ),
        const SizedBox(height: 6),
        AppButton(
          label: l10n.signOut,
          variant: AppButtonVariant.dangerOutline,
          icon: AppAssets.iconLogout,
          height: 50,
          fontSize: 15,
          onPressed: () => _confirmSignOut(context, state),
        ),
        const SizedBox(height: 18),
        Text(
          l10n.appVersionLine(AppInfo.version),
          textAlign: TextAlign.center,
          style: AppTypography.caption.copyWith(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textDisabled,
          ),
        ),
      ],
    );
  }

  /// Frame 17: the confirmation states the consequence for a live turn
  /// instead of just asking "are you sure?".
  Future<void> _confirmSignOut(BuildContext context, AccountState state) async {
    final l10n = context.l10n;
    final cubit = context.read<AuthSessionCubit>();
    final queue = state.activeQueue;
    final confirmed = await showAppConfirmDialog(
      context,
      title: l10n.signOutDialogTitle,
      message: switch (queue) {
        final booking? => l10n.signOutDialogBodyInQueue(booking.salonName),
        null => l10n.signOutDialogBody,
      },
      icon: AppAssets.iconLogout,
      confirmLabel: l10n.signOutConfirm,
      cancelLabel: l10n.signOutCancel,
    );
    if (confirmed) await cubit.signOut();
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surf,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: AppTypography.titleLg.copyWith(fontSize: 19)),
          const SizedBox(height: 2),
          Text(label, style: AppTypography.caption),
        ],
      ),
    );
  }
}

/// Frame 43: says what needs an account instead of walling the app off.
class _Guest extends StatelessWidget {
  const _Guest();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AppCard(
          padding: const EdgeInsets.all(18),
          child: Column(
            children: [
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  color: AppColors.surf,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.border),
                ),
                alignment: Alignment.center,
                child: const AppIcon(
                  AppAssets.iconUser,
                  size: AppSizes.iconLg,
                  color: AppColors.textDisabled,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                l10n.guestTitle,
                textAlign: TextAlign.center,
                style: AppTypography.titleLg.copyWith(fontSize: 17),
              ),
              const SizedBox(height: 6),
              Text(
                l10n.guestBody,
                textAlign: TextAlign.center,
                style: AppTypography.bodySm.copyWith(
                  fontSize: 13.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              AppButton(
                label: l10n.guestSignInCta,
                height: 48,
                onPressed: () => context.goLogin(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 22),
        GroupLabel(l10n.guestLockedHeader),
        SettingsGroup(
          children: [
            for (final (icon, title) in [
              (AppAssets.iconUsers, l10n.guestLockedQueue),
              (AppAssets.iconCalendarCheck, l10n.guestLockedBookings),
              (AppAssets.iconHeart, l10n.guestLockedFavorites),
              (AppAssets.iconStar, l10n.guestLockedRating),
            ])
              SettingsRow(
                title: title,
                icon: icon,
                dimmed: true,
                trailing: AppBadge(
                  label: l10n.guestLockedBadge,
                  height: 24,
                  fontSize: 11,
                ),
              ),
          ],
        ),
        GroupLabel(l10n.guestAvailableHeader),
        SettingsGroup(
          children: [
            for (final (icon, title) in [
              (AppAssets.iconSearch, l10n.guestAllowedBrowse),
              (AppAssets.iconClock, l10n.guestAllowedWait),
            ])
              SettingsRow(
                title: title,
                icon: icon,
                iconColor: AppColors.okDark,
                showChevron: false,
              ),
          ],
        ),
        GroupLabel(l10n.groupApp),
        SettingsGroup(
          children: [
            SettingsRow(
              title: l10n.rowLanguage,
              icon: AppAssets.iconGlobe,
              value: context.watch<LocaleCubit>().state.languageCode == 'ar'
                  ? l10n.languageArabic
                  : l10n.languageEnglish,
              onTap: context.pushLanguage,
            ),
            SettingsRow(
              title: l10n.rowHelp,
              icon: AppAssets.iconHelpCircle,
              onTap: context.pushHelp,
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          l10n.appVersionLine(AppInfo.version),
          textAlign: TextAlign.center,
          style: AppTypography.caption.copyWith(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textDisabled,
          ),
        ),
      ],
    );
  }
}
