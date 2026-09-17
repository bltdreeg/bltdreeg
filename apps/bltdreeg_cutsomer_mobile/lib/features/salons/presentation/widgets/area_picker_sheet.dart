import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/usecase/usecase.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/utils/result.dart';
import '../../../../core/widgets/widgets.dart';
import '../../domain/entities/area.dart';
import '../../domain/services/salon_matcher.dart';
import '../../domain/usecases.dart';

/// Frame 40. Resolves when the user confirms or dismisses.
/// Returns the chosen area, or null when dismissed.
Future<Area?> showAreaPicker(BuildContext context) {
  return showModalBottomSheet<Area>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => const _AreaPicker(),
  );
}

class _AreaPicker extends StatefulWidget {
  const _AreaPicker();

  @override
  State<_AreaPicker> createState() => _AreaPickerState();
}

class _AreaPickerState extends State<_AreaPicker> {
  final _getAreas = sl<GetAreas>();
  final _selectArea = sl<SelectArea>();
  late String _selectedId = sl<WatchSelectedArea>().current;

  Result<List<Area>>? _areas;
  String _query = '';
  bool _locating = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    unawaited(_load());
  }

  Future<void> _load() async {
    final result = await _getAreas(const NoParams());
    if (mounted) setState(() => _areas = result);
  }

  /// Location permission and geocoding plug in here. Until then this picks
  /// the nearest known area after a short "locating" delay.
  Future<void> _useLocation(List<Area> areas) async {
    setState(() => _locating = true);
    await Future<void>.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;
    final nearest = areas.firstWhere(
      (a) => a.isNearby,
      orElse: () => areas.first,
    );
    setState(() {
      _locating = false;
      _selectedId = nearest.id;
    });
    context.showToast(
      context.l10n.areaLocated(nearest.name.of(context.l10n.localeName)),
    );
  }

  Future<void> _confirm() async {
    setState(() => _saving = true);
    await _selectArea(_selectedId);
    if (!mounted) return;
    final chosen = switch (_areas) {
      Ok(:final value) => value.where((a) => a.id == _selectedId).firstOrNull,
      _ => null,
    };
    Navigator.of(context).pop(chosen);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final lang = l10n.localeName;
    final result = _areas;

    final Widget body = switch (result) {
      null => const Padding(
        padding: EdgeInsets.symmetric(vertical: 60),
        child: Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
      ),
      Err(:final failure) => EmptyStateView(
        padding: const EdgeInsets.symmetric(vertical: 24),
        illustration: const AppIllustration(
          AppAssets.illustrationNoInternet,
          width: 120,
        ),
        title: l10n.loadErrorTitle,
        message: failure.message(l10n),
        primaryLabel: l10n.actionRetry,
        onPrimary: () {
          setState(() => _areas = null);
          unawaited(_load());
        },
      ),
      Ok(value: final areas) => _AreaList(
        areas: [
          for (final a in areas)
            if (_query.isEmpty ||
                SalonMatcher.normalize(a.name.of(lang))
                    .contains(SalonMatcher.normalize(_query)))
              a,
        ],
        allAreas: areas,
        selectedId: _selectedId,
        locating: _locating,
        onSearch: (q) => setState(() => _query = q),
        onSelect: (id) => setState(() => _selectedId = id),
        onUseLocation: () => _useLocation(areas),
      ),
    };

    return AppSheetScaffold(
      title: l10n.areaSheetTitle,
      body: body,
      footer: result is Ok<List<Area>>
          ? AppButton(
              label: l10n.areaConfirm,
              height: 50,
              isLoading: _saving,
              onPressed: _confirm,
            )
          : null,
    );
  }
}

class _AreaList extends StatelessWidget {
  const _AreaList({
    required this.areas,
    required this.allAreas,
    required this.selectedId,
    required this.locating,
    required this.onSearch,
    required this.onSelect,
    required this.onUseLocation,
  });

  final List<Area> areas;
  final List<Area> allAreas;
  final String selectedId;
  final bool locating;
  final ValueChanged<String> onSearch;
  final ValueChanged<String> onSelect;
  final VoidCallback onUseLocation;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final lang = l10n.localeName;
    final nearby = [
      for (final a in areas)
        if (a.isNearby) a,
    ];
    final others = [
      for (final a in areas)
        if (!a.isNearby) a,
    ];
    final city = allAreas.isEmpty ? '' : allAreas.first.city.of(lang);

    Widget group(List<Area> list) => SettingsGroup(
      margin: const EdgeInsets.only(bottom: 18),
      children: [
        for (final a in list)
          SettingsRow(
            icon: AppAssets.iconMapPin,
            title: a.name.of(lang),
            titleStyle: AppTypography.bodyStrong,
            subtitle: l10n.areaSalonsCount(a.salonsCount),
            showChevron: false,
            onTap: () => onSelect(a.id),
            trailing: AnimatedScale(
              duration: AppMotion.fast,
              curve: AppMotion.emphasized,
              scale: a.id == selectedId ? 1 : 0,
              child: const AppIcon(
                AppAssets.iconCheckBold,
                size: AppSizes.iconSm + 2,
                color: AppColors.primary,
              ),
            ),
          ),
      ],
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AppSearchField(
          hint: l10n.areaSearchHint,
          height: 46,
          onChanged: onSearch,
        ),
        const SizedBox(height: 16),
        AppCard(
          color: AppColors.tealTint,
          borderColor: AppColors.primary,
          borderWidth: 1.5,
          radius: AppRadius.md,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
          onTap: locating ? null : onUseLocation,
          semanticLabel: l10n.areaUseLocation,
          child: Row(
            children: [
              if (locating)
                const SizedBox.square(
                  dimension: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: AppColors.tealDark,
                  ),
                )
              else
                const AppIcon(
                  AppAssets.iconNavigation,
                  color: AppColors.tealDark,
                ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.areaUseLocation,
                      style: AppTypography.bodyStrong.copyWith(
                        color: AppColors.tealDark,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      l10n.areaUseLocationHint,
                      style: AppTypography.metaStrong.copyWith(
                        color: AppColors.tealDark,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        if (nearby.isNotEmpty) ...[GroupLabel(l10n.areaNearby), group(nearby)],
        if (others.isNotEmpty) ...[
          GroupLabel(l10n.areaOthers(city)),
          group(others),
        ],
      ],
    );
  }
}
