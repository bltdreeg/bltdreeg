import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_typography.dart';
import 'app_pressable.dart';

/// Pill segmented control with a sliding white indicator (`.tabs`).
class SegmentedTabs extends StatelessWidget {
  const SegmentedTabs({
    required this.labels,
    required this.selectedIndex,
    required this.onChanged,
    super.key,
  });

  final List<String> labels;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  static const _pad = 4.0;
  static const _gap = 4.0;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      padding: const EdgeInsets.all(_pad),
      decoration: const BoxDecoration(
        color: AppColors.surf,
        borderRadius: AppRadius.mdAll,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final count = labels.length;
          final segment = (constraints.maxWidth - _gap * (count - 1)) / count;
          return Stack(
            children: [
              AnimatedPositionedDirectional(
                duration: AppMotion.medium,
                curve: AppMotion.standard,
                start: selectedIndex * (segment + _gap),
                top: 0,
                bottom: 0,
                width: segment,
                child: Container(
                  decoration: const BoxDecoration(
                    color: AppColors.bg,
                    borderRadius: BorderRadius.all(Radius.circular(9)),
                    boxShadow: AppShadows.segment,
                  ),
                ),
              ),
              Row(
                children: [
                  for (var i = 0; i < count; i++) ...[
                    if (i > 0) const SizedBox(width: _gap),
                    Expanded(
                      child: AppPressable(
                        onTap: () => onChanged(i),
                        semanticLabel: labels[i],
                        child: Semantics(
                          selected: i == selectedIndex,
                          child: Center(
                            child: AnimatedDefaultTextStyle(
                              duration: AppMotion.fast,
                              style: AppTypography.label.copyWith(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: i == selectedIndex
                                    ? AppColors.textPrimary
                                    : AppColors.textSecondary,
                              ),
                              child: Text(labels[i], maxLines: 1),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          );
        },
      ),
    );
  }
}

/// Scrollable underline tabs on the salon page (Services / Barbers / ...).
class UnderlineTabs extends StatelessWidget {
  const UnderlineTabs({
    required this.labels,
    required this.selectedIndex,
    required this.onChanged,
    super.key,
  });

  final List<String> labels;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsetsDirectional.only(start: 20, end: 20, top: 14),
        child: Row(
          children: [
            for (var i = 0; i < labels.length; i++)
              AppPressable(
                onTap: () => onChanged(i),
                semanticLabel: labels[i],
                child: Semantics(
                  selected: i == selectedIndex,
                  child: AnimatedContainer(
                    duration: AppMotion.fast,
                    margin: const EdgeInsetsDirectional.only(end: 6),
                    padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: i == selectedIndex
                              ? AppColors.primary
                              : const Color(0x000F766E),
                          width: 2.5,
                        ),
                      ),
                    ),
                    child: AnimatedDefaultTextStyle(
                      duration: AppMotion.fast,
                      style: AppTypography.label.copyWith(
                        fontSize: 14,
                        fontWeight: i == selectedIndex
                            ? FontWeight.w800
                            : FontWeight.w600,
                        color: i == selectedIndex
                            ? AppColors.primary
                            : AppColors.textSecondary,
                      ),
                      child: Text(labels[i]),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
