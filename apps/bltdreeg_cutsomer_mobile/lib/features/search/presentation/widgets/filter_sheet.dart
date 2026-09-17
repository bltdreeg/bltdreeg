import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salons/domain/entities/salon_summary.dart';
import '../../../salons/domain/entities/search_criteria.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';

/// Frame 14. Edits a draft and returns it on "show results"; null if
/// dismissed. [countFor] previews how many salons the draft matches.
Future<SearchCriteria?> showFilterSheet(
  BuildContext context, {
  required SearchCriteria initial,
  required int Function(SearchCriteria draft) countFor,
}) {
  return showModalBottomSheet<SearchCriteria>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => _FilterSheet(initial: initial, countFor: countFor),
  );
}

class _FilterSheet extends StatefulWidget {
  const _FilterSheet({required this.initial, required this.countFor});

  final SearchCriteria initial;
  final int Function(SearchCriteria draft) countFor;

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late SearchCriteria _draft = widget.initial;

  void _update(SearchCriteria next) => setState(() => _draft = next);

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final count = widget.countFor(_draft);

    return AppSheetScaffold(
      title: l10n.filterTitle,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GroupLabel(l10n.filterSortBy),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final sort in SalonSort.values)
                AppChip(
                  label: sort.label(l10n),
                  selected: _draft.sort == sort,
                  onTap: () => _update(
                    _draft.sort == sort
                        ? _draft.copyWith(clearSort: true)
                        : _draft.copyWith(sort: sort),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 22),
          GroupLabel(l10n.filterService),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final service in ServiceCategory.values)
                AppChip(
                  label: service.label(l10n),
                  selected: _draft.services.contains(service),
                  showCheckWhenSelected: true,
                  onTap: () {
                    final next = {..._draft.services};
                    if (!next.remove(service)) next.add(service);
                    _update(_draft.copyWith(services: next));
                  },
                ),
            ],
          ),
          const SizedBox(height: 22),
          GroupLabel(l10n.filterAvailableOn),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (var i = 0; i < 4; i++) ...[
                  if (i > 0) const SizedBox(width: 8),
                  Builder(
                    builder: (context) {
                      final day = today.add(Duration(days: i));
                      return AppDateChip(
                        topLabel: switch (i) {
                          0 => l10n.dayToday,
                          1 => l10n.dayTomorrow,
                          _ => fmt.weekday(day),
                        },
                        bottomLabel: fmt.dayOfMonth(day),
                        selected: _draft.day == day,
                        onTap: () => _update(
                          _draft.day == day
                              ? _draft.copyWith(clearDay: true)
                              : _draft.copyWith(day: day),
                        ),
                      );
                    },
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 22),
          GroupLabel(l10n.filterPrice),
          _PriceRange(
            min: _draft.minPrice,
            max: _draft.maxPrice,
            onChanged: (range) => _update(
              _draft.copyWith(minPrice: range.$1, maxPrice: range.$2),
            ),
          ),
          const SizedBox(height: 12),
          const Divider(),
          SettingsRow(
            title: l10n.filterOpenNow,
            titleStyle: AppTypography.bodyStrong,
            subtitle: l10n.filterOpenNowHint,
            trailing: AppToggle(
              value: _draft.openNowOnly,
              semanticLabel: l10n.filterOpenNow,
              onChanged: (v) => _update(_draft.copyWith(openNowOnly: v)),
            ),
          ),
        ],
      ),
      footer: Row(
        children: [
          SizedBox(
            width: 118,
            child: AppButton(
              label: l10n.actionClearAll,
              variant: AppButtonVariant.secondary,
              height: 50,
              fontSize: 14.5,
              onPressed: _draft.hasFilters
                  ? () => _update(_draft.withoutFilters())
                  : null,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: AppButton(
              label: l10n.filterShowResults(count),
              height: 50,
              onPressed: () => Navigator.of(context).pop(_draft),
            ),
          ),
        ],
      ),
    );
  }
}

class _PriceRange extends StatelessWidget {
  const _PriceRange({
    required this.min,
    required this.max,
    required this.onChanged,
  });

  final int min;
  final int max;
  final ValueChanged<(int, int)> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    String price(int v) => l10n.priceEgp(fmt.number(v));
    const floor = SearchCriteria.priceFloor;
    const ceiling = SearchCriteria.priceCeiling;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            children: [
              Text(
                price(min),
                style: AppTypography.label.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              Text(
                price(max),
                style: AppTypography.label.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            trackHeight: 4,
            activeTrackColor: AppColors.primary,
            inactiveTrackColor: AppColors.divider,
            overlayColor: AppColors.focusRing,
            rangeThumbShape: const _OutlinedRangeThumb(),
            // Divisions snap to 5 EGP steps; the board shows a clean track.
            activeTickMarkColor: const Color(0x00000000),
            inactiveTickMarkColor: const Color(0x00000000),
            showValueIndicator: ShowValueIndicator.never,
          ),
          child: RangeSlider(
            min: floor.toDouble(),
            max: ceiling.toDouble(),
            divisions: (ceiling - floor) ~/ 5,
            values: RangeValues(min.toDouble(), max.toDouble()),
            semanticFormatterCallback: (v) => price(v.round()),
            onChanged: (v) => onChanged((v.start.round(), v.end.round())),
          ),
        ),
      ],
    );
  }
}

/// White thumb with a teal ring, as on the board.
class _OutlinedRangeThumb extends RangeSliderThumbShape {
  const _OutlinedRangeThumb();

  static const _radius = 9.0;

  @override
  Size getPreferredSize(bool isEnabled, bool isDiscrete) =>
      const Size.fromRadius(_radius);

  @override
  void paint(
    PaintingContext context,
    Offset center, {
    required Animation<double> activationAnimation,
    required Animation<double> enableAnimation,
    bool isDiscrete = false,
    bool isEnabled = false,
    bool? isOnTop,
    required SliderThemeData sliderTheme,
    TextDirection? textDirection,
    Thumb? thumb,
    bool? isPressed,
  }) {
    final canvas = context.canvas;
    final radius = _radius + activationAnimation.value * 2;
    canvas
      ..drawCircle(center, radius, Paint()..color = AppColors.bg)
      ..drawCircle(
        center,
        radius - 1.25,
        Paint()
          ..color = AppColors.primary
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.5,
      );
  }
}
