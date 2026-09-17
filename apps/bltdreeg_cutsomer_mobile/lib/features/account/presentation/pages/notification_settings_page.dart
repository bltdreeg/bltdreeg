import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_tone.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../notification_settings_cubit.dart';

/// Frame 37: queue notifications are locked on; everything else is optional.
class NotificationSettingsPage extends StatelessWidget {
  const NotificationSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<NotificationSettingsCubit>(),
      child: const _NotificationSettingsView(),
    );
  }
}

class _NotificationSettingsView extends StatelessWidget {
  const _NotificationSettingsView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<NotificationSettingsCubit>().state;
    final cubit = context.read<NotificationSettingsCubit>();

    SettingsRow row(
      NotificationSetting setting,
      String title, {
      String? subtitle,
      String? icon,
    }) => SettingsRow(
      title: title,
      subtitle: subtitle,
      icon: icon,
      trailing: AppToggle(
        value: state[setting] ?? setting.defaultOn,
        semanticLabel: title,
        onChanged: (value) => cubit.toggle(setting, value: value),
      ),
    );

    return Scaffold(
      appBar: AppTopBar(title: l10n.notificationSettingsTitle),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.gutter,
          20,
          AppSpacing.gutter,
          24,
        ),
        children: [
          GroupLabel(l10n.notifGroupQueue),
          SettingsGroup(
            margin: const EdgeInsets.only(bottom: 4),
            children: [
              SettingsRow(
                title: l10n.notifQueueUpdates,
                subtitle: l10n.notifQueueUpdatesBody,
                trailing: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    AppToggle(
                      value: true,
                      locked: true,
                      semanticLabel: l10n.notifQueueUpdates,
                      onChanged: null,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      l10n.notifAlwaysOn,
                      style: AppTypography.micro.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 18),
            child: AppNotice(
              tone: AppTone.primary,
              emphasized: true,
              message: l10n.notifQueueLockedNote,
            ),
          ),
          GroupLabel(l10n.notifGroupOffers),
          SettingsGroup(
            children: [
              row(
                NotificationSetting.favoriteOffers,
                l10n.notifFavoriteOffers,
                subtitle: l10n.notifFavoriteOffersBody,
              ),
              row(
                NotificationSetting.favoriteFree,
                l10n.notifFavoriteFree,
                subtitle: l10n.notifFavoriteFreeBody,
              ),
              row(NotificationSetting.rateReminder, l10n.notifRateReminder),
              row(NotificationSetting.newSalons, l10n.notifNewSalons),
            ],
          ),
          GroupLabel(l10n.notifGroupChannels),
          SettingsGroup(
            children: [
              row(
                NotificationSetting.push,
                l10n.notifChannelPush,
                subtitle: l10n.notifChannelPushBody,
                icon: AppAssets.iconBell,
              ),
              row(
                NotificationSetting.sms,
                l10n.notifChannelSms,
                subtitle: l10n.notifChannelSmsBody,
                icon: AppAssets.iconMessage,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
