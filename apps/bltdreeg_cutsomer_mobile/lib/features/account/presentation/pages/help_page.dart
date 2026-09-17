import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/config/app_environment.dart';
import '../../../../core/localization/generated/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/utils/external_links.dart';
import '../../../../core/widgets/widgets.dart';

/// Frame 42. The first answer is the one support will hear most: a turn
/// cancelled while the customer was standing in the salon.
class HelpPage extends StatefulWidget {
  const HelpPage({super.key});

  @override
  State<HelpPage> createState() => _HelpPageState();
}

class _HelpPageState extends State<HelpPage> {
  String _query = '';
  int? _openIndex;

  static List<(String question, String answer)> _faqs(AppLocalizations l10n) =>
      [
        (l10n.faqCancelledWhileThereQ, l10n.faqCancelledWhileThereA),
        (l10n.faqWrongEstimateQ, l10n.faqWrongEstimateA),
        (l10n.faqNoTurnAlertQ, l10n.faqNoTurnAlertA),
        (l10n.faqLeaveQueueQ, l10n.faqLeaveQueueA),
        (l10n.faqPriceMismatchQ, l10n.faqPriceMismatchA),
        (l10n.faqChangePhoneQ, l10n.faqChangePhoneA),
      ];

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final query = _query.trim().toLowerCase();
    final all = _faqs(l10n);
    final faqs = query.isEmpty
        ? all
        : [
            for (final faq in all)
              if (faq.$1.toLowerCase().contains(query) ||
                  faq.$2.toLowerCase().contains(query))
                faq,
          ];

    return Scaffold(
      appBar: AppTopBar(title: l10n.helpTitle),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.gutter,
          20,
          AppSpacing.gutter,
          24,
        ),
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        children: [
          AppSearchField(
            hint: l10n.helpSearchHint,
            onChanged: (value) => setState(() {
              _query = value;
              _openIndex = null;
            }),
          ),
          const SizedBox(height: 20),
          const _LiveHelpCard(),
          const SizedBox(height: 22),
          GroupLabel(l10n.helpFaqHeader),
          if (faqs.isEmpty)
            AppNotice(message: l10n.helpNoResults)
          else
            SettingsGroup(
              children: [
                for (final (index, faq) in faqs.indexed)
                  _FaqRow(
                    question: faq.$1,
                    answer: faq.$2,
                    expanded: _openIndex == index,
                    onTap: () => setState(
                      () => _openIndex = _openIndex == index ? null : index,
                    ),
                  ),
              ],
            ),
          GroupLabel(l10n.helpContactHeader),
          SettingsGroup(
            children: [
              SettingsRow(
                title: l10n.helpCallUs,
                subtitle: l10n.helpCallUsValue(AppInfo.supportNumber),
                icon: AppAssets.iconPhone,
                onTap: () => ExternalLinks.open(
                  context,
                  Uri(scheme: 'tel', path: AppInfo.supportNumber),
                ),
              ),
            ],
          ),
          GroupLabel(l10n.helpAboutHeader),
          SettingsGroup(
            children: [
              SettingsRow(
                title: l10n.helpTerms,
                onTap: () =>
                    ExternalLinks.open(context, Uri.parse(AppInfo.termsUrl)),
              ),
              SettingsRow(
                title: l10n.helpPrivacy,
                onTap: () =>
                    ExternalLinks.open(context, Uri.parse(AppInfo.privacyUrl)),
              ),
              SettingsRow(
                title: l10n.helpVersion,
                value: AppInfo.version,
                showChevron: false,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LiveHelpCard extends StatelessWidget {
  const _LiveHelpCard();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: AppColors.tealTint,
        borderRadius: AppRadius.cardAll,
      ),
      child: Row(
        children: [
          const AppIcon(
            AppAssets.iconMessage,
            size: AppSizes.iconLg,
            color: AppColors.tealDark,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.helpLiveTitle,
                  style: AppTypography.bodyStrong.copyWith(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.tealDark,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  l10n.helpLiveBody,
                  style: AppTypography.metaStrong.copyWith(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.tealDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FaqRow extends StatelessWidget {
  const _FaqRow({
    required this.question,
    required this.answer,
    required this.expanded,
    required this.onTap,
  });

  final String question;
  final String answer;
  final bool expanded;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SettingsRow(
          title: question,
          trailing: AnimatedRotation(
            duration: AppMotion.fast,
            turns: expanded ? 0.5 : 0,
            child: const AppIcon(
              AppAssets.iconChevronDown,
              size: AppSizes.iconSm,
              color: AppColors.textDisabled,
            ),
          ),
          onTap: onTap,
        ),
        AnimatedSize(
          duration: AppMotion.medium,
          curve: AppMotion.standard,
          alignment: Alignment.topCenter,
          child: expanded
              ? Padding(
                  padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                  child: Text(answer, style: AppTypography.bodyLong),
                )
              : const SizedBox(width: double.infinity),
        ),
      ],
    );
  }
}
