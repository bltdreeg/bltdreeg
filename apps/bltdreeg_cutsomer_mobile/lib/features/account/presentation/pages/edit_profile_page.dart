import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/domain/entities/user.dart';
import '../../../auth/presentation/session/auth_session_cubit.dart';
import '../../../salons/presentation/widgets/area_picker_sheet.dart';
import '../edit_profile_cubit.dart';

/// Frame 36: editable details, with the phone locked because it's the
/// account identity.
class EditProfilePage extends StatelessWidget {
  const EditProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthSessionCubit>().state.user;
    if (user == null) {
      // Signed out from another screen (or the account was deleted).
      return Scaffold(appBar: AppTopBar(title: context.l10n.profileTitle));
    }
    return BlocProvider(
      create: (_) => sl<EditProfileCubit>(param1: user),
      child: _EditProfileView(user: user),
    );
  }
}

class _EditProfileView extends StatelessWidget {
  const _EditProfileView({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final state = context.watch<EditProfileCubit>().state;
    final cubit = context.read<EditProfileCubit>();

    return BlocListener<EditProfileCubit, EditProfileState>(
      listenWhen: (a, b) => a.status != b.status || a.failure != b.failure,
      listener: (context, state) {
        switch (state.status) {
          case EditProfileStatus.saved:
            unawaited(AppHaptics.success());
            context.showToast(l10n.profileSaved);
            cubit.acknowledgeSaved();
            context.popOrGoHome();
          case EditProfileStatus.deleted:
            context.goHome();
          case _ when state.failure != null:
            context.showToast(state.failure!.message(l10n));
          case _:
            break;
        }
      },
      child: Scaffold(
        appBar: AppTopBar(title: l10n.profileTitle),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.gutter,
            22,
            AppSpacing.gutter,
            24,
          ),
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          children: [
            _Avatar(user: user),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: AppTextField(
                    label: l10n.firstNameLabel,
                    controller: TextEditingController(text: state.firstName)
                      ..selection = TextSelection.collapsed(
                        offset: state.firstName.length,
                      ),
                    errorText: state.firstName.trim().isEmpty
                        ? l10n.nameRequired
                        : null,
                    textInputAction: TextInputAction.next,
                    onChanged: cubit.setFirstName,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: AppTextField(
                    label: l10n.lastNameLabel,
                    controller: TextEditingController(text: state.lastName)
                      ..selection = TextSelection.collapsed(
                        offset: state.lastName.length,
                      ),
                    textInputAction: TextInputAction.next,
                    onChanged: cubit.setLastName,
                  ),
                ),
              ],
            ),
            // A plain locked field, not [AppPhoneField]: this one only
            // displays the grouped number, it never accepts typing.
            AppTextField(
              label: l10n.phoneLabel,
              locked: true,
              readOnly: true,
              prefix: const CountryCodePrefix(muted: true),
              controller: TextEditingController(text: fmt.phone(user.phone)),
              suffix: user.phoneVerified
                  ? AppBadge(
                      label: l10n.phoneVerifiedBadge,
                      style: AppBadgeStyle.success,
                      icon: AppAssets.iconCheck,
                      height: 24,
                      fontSize: 11,
                    )
                  : null,
              helper: Row(
                children: [
                  Expanded(
                    child: Text(
                      l10n.phoneIsIdentity,
                      style: AppTypography.caption,
                    ),
                  ),
                  AppLinkButton(
                    label: l10n.changePhoneAction,
                    fontSize: 12.5,
                    // Changing the identity number needs verification, so it
                    // runs through support rather than this form.
                    onPressed: context.pushHelp,
                  ),
                ],
              ),
            ),
            AppTextField(
              label: l10n.emailLabel,
              optional: true,
              controller: TextEditingController(text: state.email)
                ..selection = TextSelection.collapsed(
                  offset: state.email.length,
                ),
              keyboardType: TextInputType.emailAddress,
              direction: TextDirection.ltr,
              autofillHints: const [AutofillHints.email],
              onChanged: cubit.setEmail,
            ),
            _PickerField(
              label: l10n.birthDateLabel,
              optional: true,
              icon: AppAssets.iconCalendar,
              value: switch (state.birthDate) {
                final date? => fmt.fullDate(date),
                null => null,
              },
              helper: l10n.birthDateNote,
              onTap: () async {
                final now = DateTime.now();
                final picked = await showDatePicker(
                  context: context,
                  initialDate:
                      state.birthDate ?? DateTime(now.year - 25, now.month),
                  firstDate: DateTime(now.year - 90),
                  lastDate: DateTime(now.year - 10, now.month, now.day),
                );
                if (picked != null) cubit.setBirthDate(picked);
              },
            ),
            _PickerField(
              label: l10n.areaLabel,
              icon: AppAssets.iconMapPin,
              value: state.areaName,
              onTap: () async {
                final area = await showAreaPicker(context);
                if (area == null || !context.mounted) return;
                cubit.setAreaName(
                  l10n.areaWithCity(
                    area.name.of(l10n.localeName),
                    area.city.of(l10n.localeName),
                  ),
                );
              },
            ),
            const SizedBox(height: 8),
            AppButton(
              label: l10n.saveChanges,
              isLoading: state.status == EditProfileStatus.saving,
              onPressed: state.canSave ? cubit.save : null,
            ),
            const SizedBox(height: 22),
            const SectionDivider(),
            const SizedBox(height: 22),
            AppButton(
              label: l10n.deleteAccount,
              variant: AppButtonVariant.dangerOutline,
              icon: AppAssets.iconTrash,
              height: 48,
              fontSize: 14.5,
              isLoading: state.status == EditProfileStatus.deleting,
              onPressed: state.isBusy
                  ? null
                  : () async {
                      final confirmed = await showAppConfirmDialog(
                        context,
                        title: l10n.deleteAccountTitle,
                        message: l10n.deleteAccountBody,
                        icon: AppAssets.iconTrash,
                        confirmLabel: l10n.deleteAccountConfirm,
                        cancelLabel: l10n.deleteAccountCancel,
                      );
                      if (confirmed) await cubit.deleteAccount();
                    },
            ),
          ],
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.user});

  final User user;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      children: [
        Stack(
          clipBehavior: Clip.none,
          children: [
            AppAvatar(name: user.fullName, size: 84),
            PositionedDirectional(
              bottom: -2,
              start: -2,
              child: AppPressable(
                onTap: () => context.showToast(l10n.photoNotSupportedYet),
                semanticLabel: l10n.changePhoto,
                child: Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.bg, width: 2.5),
                  ),
                  alignment: Alignment.center,
                  child: const AppIcon(
                    AppAssets.iconCamera,
                    size: 14,
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        AppLinkButton(
          label: l10n.changePhoto,
          onPressed: () => context.showToast(l10n.photoNotSupportedYet),
        ),
      ],
    );
  }
}

/// Read-only field that opens a picker (date, area).
class _PickerField extends StatelessWidget {
  const _PickerField({
    required this.label,
    required this.icon,
    required this.onTap,
    this.value,
    this.helper,
    this.optional = false,
  });

  final String label;
  final String icon;
  final String? value;
  final String? helper;
  final bool optional;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      label: label,
      optional: optional,
      readOnly: true,
      onTap: onTap,
      prefixIcon: icon,
      hint: label,
      controller: TextEditingController(text: value ?? ''),
      suffix: const AppIcon(
        AppAssets.iconChevronDown,
        size: AppSizes.iconSm,
        color: AppColors.textSecondary,
      ),
      helper: helper == null
          ? null
          : Text(helper!, style: AppTypography.caption),
    );
  }
}
