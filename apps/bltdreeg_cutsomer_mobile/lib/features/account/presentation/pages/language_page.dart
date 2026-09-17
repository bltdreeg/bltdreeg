import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/localization/locale_cubit.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';

/// Frame 38: switching language flips the whole interface, so it's
/// confirmed before the screen turns around under the customer's hand.
class LanguagePage extends StatelessWidget {
  const LanguagePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final current = context.watch<LocaleCubit>().state.languageCode;

    return Scaffold(
      appBar: AppTopBar(title: l10n.languageTitle),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.gutter,
          20,
          AppSpacing.gutter,
          24,
        ),
        children: [
          SettingsGroup(
            children: [
              for (final (code, name) in [
                ('ar', l10n.languageArabic),
                ('en', l10n.languageEnglish),
              ])
                SettingsRow(
                  title: name,
                  subtitle: code == current
                      ? l10n.languageCurrent
                      : code == 'ar'
                      ? l10n.languageArabicDirection
                      : l10n.languageEnglishDirection,
                  trailing: AppRadio(selected: code == current),
                  onTap: code == current
                      ? null
                      : () => _confirm(context, code: code, name: name),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _confirm(
    BuildContext context, {
    required String code,
    required String name,
  }) async {
    final l10n = context.l10n;
    final cubit = context.read<LocaleCubit>();
    final confirmed = await showAppConfirmDialog(
      context,
      title: l10n.languageDialogTitle(name),
      message: l10n.languageDialogBody,
      icon: AppAssets.iconGlobe,
      tone: AppTone.primary,
      confirmLabel: l10n.languageDialogConfirm(name),
      cancelLabel: l10n.languageDialogCancel,
      confirmVariant: AppButtonVariant.primary,
    );
    if (confirmed) await cubit.setLocale(Locale(code));
  }
}
