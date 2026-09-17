// Debug-only QA surface. Copy here is intentionally not localized.
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../assets/app_assets.dart';
import '../localization/locale_cubit.dart';
import '../network/connectivity_cubit.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_tone.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import '../widgets/widgets.dart';

/// Renders every design-system token and component for visual review.
/// Registered only in debug builds at `/dev/design-system`.
class DesignSystemGalleryPage extends StatefulWidget {
  const DesignSystemGalleryPage({super.key});

  @override
  State<DesignSystemGalleryPage> createState() =>
      _DesignSystemGalleryPageState();
}

class _DesignSystemGalleryPageState extends State<DesignSystemGalleryPage> {
  int _segment = 0;
  int _underline = 0;
  int _stars = 4;
  bool _toggle = true;
  bool _check = true;
  bool _chip = true;
  bool _loading = false;
  final _phone = TextEditingController(text: '0102345');

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LocaleCubit>();
    final online = context.watchIsOnline;
    return Scaffold(
      appBar: AppTopBar(
        title: 'Design system',
        subtitle: 'tokens · components · assets',
        actions: [
          AppIconButton(
            icon: AppAssets.iconGlobe,
            semanticLabel: 'Toggle locale',
            onPressed: () =>
                locale.setLocale(Locale(locale.isArabic ? 'en' : 'ar')),
          ),
          AppIconButton(
            icon: AppAssets.iconWifiOff,
            style: online
                ? AppIconButtonStyle.outline
                : AppIconButtonStyle.active,
            semanticLabel: 'Toggle offline',
            onPressed: () =>
                context.read<ConnectivityCubit>().toggleSimulatedOffline(),
          ),
        ],
      ),
      body: Column(
        children: [
          OfflineBanner(
            visible: !online,
            lastUpdated: DateTime.now(),
            onRetry: () {},
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 40),
              children: [
                const _H('Colors'),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final c in [
                      AppColors.teal,
                      AppColors.tealDark,
                      AppColors.tealTint,
                      AppColors.tealTint2,
                      AppColors.surf,
                      AppColors.tx,
                      AppColors.tx2,
                      AppColors.line,
                      AppColors.dis,
                      AppColors.dist,
                      AppColors.ok,
                      AppColors.okTint,
                      AppColors.warn,
                      AppColors.warnTint,
                      AppColors.err,
                      AppColors.errTint,
                    ])
                      _Swatch(c),
                  ],
                ),
                const _H('Typography'),
                Text(
                  '4',
                  style: AppTypography.queueNumber.copyWith(
                    color: AppColors.primary,
                  ),
                ),
                Text('استنى دورك وانت في مكانك', style: AppTypography.headline),
                Text('حجوزاتي', style: AppTypography.pageTitle),
                Text('صالون الكابتن حسام 4.8', style: AppTypography.itemTitle),
                Text(
                  'دوّر على أقرب صالون لبيتك أو لشغلك، وشوف أسعاره وخدماته وتقييم الزباين قبل ما تتحرك. تُجرِّب التشكيل؟',
                  style: AppTypography.bodyLong,
                ),
                Text('المعادي · 0.8 كم', style: AppTypography.meta),
                Text('from 120 EGP — Barber Point', style: AppTypography.body),
                Text(
                  'Formatters: ${context.fmt.number(1200)} · ${context.fmt.time(DateTime(2026, 9, 11, 19, 20))} · ${context.fmt.weekdayDayMonth(DateTime(2026, 9, 11))} · ${context.fmt.phone('01023456789')}',
                  style: AppTypography.caption,
                ),
                const _H('Buttons'),
                AppButton(
                  label: 'ادخل الطابور',
                  isLoading: _loading,
                  onPressed: () async {
                    setState(() => _loading = true);
                    await Future<void>.delayed(const Duration(seconds: 2));
                    if (mounted) setState(() => _loading = false);
                  },
                ),
                const Gap(10),
                AppButton(
                  label: 'تفاصيل الحجز',
                  variant: AppButtonVariant.secondary,
                  icon: AppAssets.iconNavigation,
                  onPressed: () {},
                ),
                const Gap(10),
                AppButton(
                  label: 'احجز تاني بنفس الاختيارات',
                  variant: AppButtonVariant.ghost,
                  icon: AppAssets.iconRepeat,
                  size: AppButtonSize.sm,
                  onPressed: () {},
                ),
                const Gap(10),
                Row(
                  children: [
                    Expanded(
                      child: AppButton(
                        label: 'اطلع من الطابور',
                        variant: AppButtonVariant.dangerOutline,
                        size: AppButtonSize.sm,
                        onPressed: () {},
                      ),
                    ),
                    const Gap(10),
                    Expanded(
                      child: AppButton(
                        label: 'أنا في المحل',
                        variant: AppButtonVariant.success,
                        size: AppButtonSize.sm,
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
                const Gap(10),
                const AppButton(label: 'ابعت كود التأكيد', onPressed: null),
                const Gap(10),
                Row(
                  children: [
                    AppIconButton(
                      icon: AppAssets.iconBell,
                      size: 42,
                      showDot: true,
                      semanticLabel: 'bell',
                      onPressed: () {},
                    ),
                    const Gap(10),
                    AppIconButton(
                      icon: AppAssets.iconFilter,
                      size: 48,
                      count: 2,
                      style: AppIconButtonStyle.active,
                      semanticLabel: 'filter',
                      onPressed: () {},
                    ),
                    const Gap(10),
                    AppLinkButton(label: 'نسيت كلمة السر؟', onPressed: () {}),
                  ],
                ),
                const _H('Chips'),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    AppChip(
                      label: 'أقل انتظار دلوقتي',
                      icon: AppAssets.iconClock,
                      selected: _chip,
                      onTap: () => setState(() => _chip = !_chip),
                    ),
                    AppChip(label: 'الأقرب ليك', onTap: () {}),
                    AppChip(
                      label: 'قصة شعر',
                      style: AppChipStyle.applied,
                      onRemove: () {},
                    ),
                    AppChip(
                      label: 'قصة شعر',
                      selected: true,
                      showCheckWhenSelected: true,
                      onTap: () {},
                    ),
                    AppChip(
                      label: 'امسح الكل',
                      style: AppChipStyle.plain,
                      onTap: () {},
                    ),
                    AppDateChip(
                      topLabel: 'النهارده',
                      bottomLabel: '15',
                      selected: true,
                      onTap: () {},
                    ),
                    AppDateChip(
                      topLabel: 'بكرة',
                      bottomLabel: '16',
                      selected: false,
                      onTap: () {},
                    ),
                  ],
                ),
                const _H('Fields'),
                const AppTextField(
                  label: 'البريد الإلكتروني',
                  hint: 'karim@example.com',
                  prefixIcon: AppAssets.iconUser,
                  optional: true,
                ),
                const Gap(14),
                const AppTextField(label: 'كلمة السر', isPassword: true),
                const Gap(14),
                AppPhoneField(
                  controller: _phone,
                  label: 'رقم الموبايل',
                  errorText: context.l10n.validationPhone,
                ),
                const Gap(14),
                AppPhoneField(
                  controller: TextEditingController(text: '01023456789'),
                  label: 'رقم الموبايل',
                  locked: true,
                  suffix: const AppBadge(
                    label: 'متأكّد',
                    style: AppBadgeStyle.success,
                    icon: AppAssets.iconCheck,
                    height: 24,
                    fontSize: 11,
                  ),
                ),
                const Gap(14),
                const AppSearchField(hint: 'دوّر باسم الصالون أو الخدمة'),
                const Gap(14),
                const AppTextField(
                  hint: 'اكتب رأيك عشان تساعد اللي بعدك…',
                  maxLines: 4,
                  minLines: 3,
                ),
                const Gap(14),
                const AppOtpInput(autofocus: false),
                const Gap(10),
                AppOtpInput(
                  autofocus: false,
                  hasError: true,
                  controller: TextEditingController(text: '7319'),
                ),
                const _H('Selection'),
                Row(
                  children: [
                    AppToggle(
                      value: _toggle,
                      onChanged: (v) => setState(() => _toggle = v),
                    ),
                    const Gap(12),
                    const AppToggle(value: true, onChanged: null, locked: true),
                    const Gap(12),
                    AppCheckbox(
                      value: _check,
                      onChanged: (v) => setState(() => _check = v),
                    ),
                    const Gap(12),
                    const AppRadio(selected: true),
                    const Gap(8),
                    const AppRadio(selected: false),
                    const Gap(8),
                    const AppRadio(selected: false, enabled: false),
                  ],
                ),
                const Gap(14),
                SegmentedTabs(
                  labels: const ['الحالية', 'السابقة'],
                  selectedIndex: _segment,
                  onChanged: (i) => setState(() => _segment = i),
                ),
                const Gap(8),
                UnderlineTabs(
                  labels: const ['الخدمات', 'الحلاقين', 'العروض', 'التقييمات'],
                  selectedIndex: _underline,
                  onChanged: (i) => setState(() => _underline = i),
                ),
                const Gap(14),
                const StepProgress(current: 1, total: 3),
                const _H('Status'),
                const Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    AppBadge(
                      label: 'مستني تأكيد الصالون',
                      style: AppBadgeStyle.soon,
                      icon: AppAssets.iconClock,
                    ),
                    AppBadge(
                      label: 'خدمة تمّت',
                      icon: AppAssets.iconCheck,
                      iconColor: AppColors.okDark,
                    ),
                    AppBadge(
                      label: 'اتلغى — ما حضرتش',
                      style: AppBadgeStyle.missed,
                      icon: AppAssets.iconClose,
                    ),
                    WaitStatusPill(
                      label: 'فاضي دلوقتي — ادخل على طول',
                      level: WaitLevel.free,
                      icon: AppAssets.iconCheck,
                    ),
                    WaitStatusPill(
                      label: 'فاضل 2 أنفار — استنى ~15 د',
                      level: WaitLevel.moderate,
                      icon: AppAssets.iconUsers,
                    ),
                    WaitStatusPill(
                      label: 'فاضل 5 أنفار — استنى ~45 د',
                      level: WaitLevel.busy,
                      icon: AppAssets.iconUsers,
                    ),
                    WaitStatusPill(
                      label: 'بيفتح الساعة 12 م',
                      level: WaitLevel.closed,
                      icon: AppAssets.iconClock,
                    ),
                    AvailabilityPin(
                      label: 'فاضي دلوقتي',
                      level: WaitLevel.free,
                    ),
                    LiveIndicator(),
                  ],
                ),
                const Gap(12),
                const RatingLabel(rating: 4.8, reviewsCount: 214),
                const Gap(8),
                StarRatingInput(
                  value: _stars,
                  onChanged: (v) => setState(() => _stars = v),
                ),
                const Gap(8),
                const RatingBar(label: 'دقة الوقت', value: 4.2),
                const _H('Cards & rows'),
                SalonListTile(
                  name: 'بربر لاونج المعادي',
                  rating: 4.6,
                  reviewsCount: 138,
                  meta: const MetaRow(
                    items: [
                      'المعادي الجديدة',
                      '1.2 كم',
                      PriceMeta(prefix: 'من', amount: '90 ج.م'),
                    ],
                  ),
                  status: const WaitStatusPill(
                    label: 'فاضل 2 أنفار — استنى ~15 د',
                    level: WaitLevel.moderate,
                    icon: AppAssets.iconUsers,
                  ),
                  onTap: () {},
                ),
                SalonListTile(
                  name: 'بربر هاوس الأوتوستراد',
                  rating: 4.1,
                  reviewsCount: 18,
                  closedTag: context.l10n.closedTag,
                  meta: const MetaRow(items: ['الأوتوستراد', '3.7 كم']),
                  showDivider: false,
                ),
                const Gap(12),
                HorizontalRail(
                  height: 190,
                  itemCount: 3,
                  itemBuilder: (_, i) => SalonRailCard(
                    name: 'صالون الكابتن حسام',
                    pin: const AvailabilityPin(
                      label: 'فاضي دلوقتي',
                      level: WaitLevel.free,
                    ),
                    meta: const MetaRow(items: ['المعادي', '0.8 كم']),
                    bottom: const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        RatingLabel(rating: 4.8, reviewsCount: 214),
                        PriceMeta(prefix: 'من', amount: '70 ج.م'),
                      ],
                    ),
                    onTap: () {},
                  ),
                ),
                const Gap(12),
                const AppNotice(
                  message: 'هنبعتلك كود تأكيد في رسالة على نفس الرقم.',
                  icon: AppAssets.iconCheck,
                ),
                const Gap(8),
                const AppNotice(
                  message: 'لما يجي دورك عندك 5 دقايق تحضر.',
                  tone: AppTone.warning,
                  emphasized: true,
                ),
                const Gap(8),
                const AppNotice(
                  message: 'هنبعتلك إشعار لما يفضل قدامك اتنين.',
                  tone: AppTone.primary,
                  icon: AppAssets.iconBell,
                  emphasized: true,
                ),
                const Gap(14),
                const GroupLabel('حسابي'),
                SettingsGroup(
                  children: [
                    SettingsRow(
                      title: 'بياناتي الشخصية',
                      icon: AppAssets.iconUser,
                      onTap: () {},
                    ),
                    SettingsRow(
                      title: 'اللغة',
                      icon: AppAssets.iconGlobe,
                      value: 'العربية',
                      onTap: () {},
                    ),
                    SettingsRow(
                      title: 'تحديثات الطابور',
                      subtitle: 'فاضلك اتنين · حان دورك',
                      trailing: AppToggle(
                        value: _toggle,
                        onChanged: (v) => setState(() => _toggle = v),
                      ),
                    ),
                  ],
                ),
                const Row(
                  children: [
                    AppAvatar(name: 'كريم عبد الرحمن', size: 64),
                    Gap(10),
                    AppAvatar(
                      name: 'محمد طارق',
                      size: 36,
                      tone: AppAvatarTone.neutral,
                    ),
                    Gap(10),
                    BrandMark(size: 52),
                    Gap(10),
                    BrandLockup(),
                  ],
                ),
                const _H('Overlays'),
                AppButton(
                  label: 'Dialog',
                  variant: AppButtonVariant.secondary,
                  onPressed: () => showAppConfirmDialog(
                    context,
                    title: 'تطلع من الطابور؟',
                    message: 'دورك رقم 4 هيروح لحد تاني ومش هينفع ترجعه.',
                    note: 'الخروج المتكرر من الطوابير بيقلّل تقييم الالتزام بتاعك.',
                    icon: AppAssets.iconLogout,
                    confirmLabel: 'أيوه، اطلعني',
                    cancelLabel: 'خليني في الطابور',
                  ),
                ),
                const Gap(10),
                AppButton(
                  label: 'Bottom sheet',
                  variant: AppButtonVariant.secondary,
                  onPressed: () => showAppBottomSheet<void>(
                    context,
                    title: 'فلترة وترتيب',
                    bodyBuilder: (_) => const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        GroupLabel('رتّب النتايج بـ'),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            AppChip(label: 'أقل انتظار دلوقتي', selected: true),
                            AppChip(label: 'الأقرب ليك'),
                            AppChip(label: 'الأعلى تقييماً'),
                          ],
                        ),
                        SizedBox(height: 300),
                      ],
                    ),
                    footerBuilder: (_) =>
                        AppButton(label: 'اعرض 4 نتايج', onPressed: () {}),
                  ),
                ),
                const Gap(10),
                AppButton(
                  label: 'Toast',
                  variant: AppButtonVariant.secondary,
                  onPressed: () => context.showToast('اتضاف للمفضلة'),
                ),
                const _H('Skeletons'),
                const Shimmer(
                  child: Column(
                    children: [
                      SalonListTileSkeleton(),
                      SalonListTileSkeleton(),
                    ],
                  ),
                ),
                const _H('Icons'),
                Wrap(
                  spacing: 14,
                  runSpacing: 14,
                  children: [
                    for (final icon in AppAssets.allIcons)
                      AppIcon(
                        icon,
                        size: 28,
                        multicolor: icon == AppAssets.iconGoogle,
                      ),
                  ],
                ),
                const _H('Illustrations'),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    for (final a in AppAssets.allIllustrations)
                      if (!a.contains('/onboarding_choose_barber/'))
                        Container(
                          color: AppColors.bg,
                          child: AppIllustration(a, width: 150),
                        ),
                  ],
                ),
                const _H('Layered canvas (alignment check)'),
                IllustrationCanvas(
                  viewBox: const Size(280, 240),
                  children: [
                    const IllustrationLayer(
                      AppAssets.illustrationOnboardingChooseBarberBackground,
                    ),
                    const IllustrationLayer(
                      AppAssets.illustrationOnboardingChooseBarberChair,
                    ),
                    const IllustrationLayer(
                      AppAssets.illustrationOnboardingChooseBarberStarLeft,
                    ),
                    const IllustrationLayer(
                      AppAssets.illustrationOnboardingChooseBarberStarRight,
                    ),
                    const IllustrationLayer(
                      AppAssets
                          .illustrationOnboardingChooseBarberScissorsBladeTop,
                    ),
                    const IllustrationLayer(
                      AppAssets
                          .illustrationOnboardingChooseBarberScissorsBladeBottom,
                    ),
                    IllustrationLabel(
                      center: const Offset(56, 155),
                      child: Text('85 ج.م', style: AppTypography.micro),
                    ),
                  ],
                ),
                const _H('Empty state'),
                EmptyStateView(
                  illustration: const AppIllustration(
                    AppAssets.illustrationEmptyBookings,
                    width: 190,
                  ),
                  title: 'لسه ما حجزتش أي حاجة',
                  message: 'أول ما تدخل طابور صالون، هتلاقي دورك ورقمك والوقت المتوقع هنا على طول.',
                  primaryLabel: 'دوّر على صالون قريب منك',
                  onPrimary: () {},
                ),
                const _H('No connection'),
                SizedBox(
                  height: 760,
                  child: NoConnectionView(
                    onRetry: () {},
                    onOpenLastBooking: () {},
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

class _H extends StatelessWidget {
  const _H(this.text);

  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 28, bottom: 12),
    child: Text(text.toUpperCase(), style: AppTypography.groupLabel),
  );
}

class _Swatch extends StatelessWidget {
  const _Swatch(this.color);

  final Color color;

  @override
  Widget build(BuildContext context) => Container(
    width: 34,
    height: 34,
    decoration: BoxDecoration(
      color: color,
      borderRadius: AppRadius.smAll,
      border: Border.all(color: const Color(0x14000000)),
    ),
  );
}
