import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import 'app_icon.dart';
import 'app_pressable.dart';

/// 44×26 switch (`.toggle`). The thumb sits at the end side when on, so it
/// mirrors correctly in RTL. [locked] renders the "always on" state from
/// notification settings (frame 37).
class AppToggle extends StatelessWidget {
  const AppToggle({
    required this.value,
    required this.onChanged,
    this.locked = false,
    this.semanticLabel,
    super.key,
  });

  final bool value;
  final ValueChanged<bool>? onChanged;
  final bool locked;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final interactive = onChanged != null && !locked;
    final track = locked
        ? AppColors.disabled
        : value
        ? AppColors.primary
        : AppColors.disabled;
    final thumb = locked ? AppColors.primary : AppColors.bg;

    return Semantics(
      toggled: value,
      label: semanticLabel,
      child: AppPressable(
        onTap: interactive ? () => onChanged!(!value) : null,
        enabled: interactive,
        isButton: false,
        pressedScale: 0.94,
        child: Opacity(
          opacity: locked ? 0.6 : 1,
          child: AnimatedContainer(
            duration: AppMotion.fast,
            width: 44,
            height: 26,
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: track,
              borderRadius: AppRadius.pillAll,
            ),
            child: AnimatedAlign(
              duration: AppMotion.fast,
              curve: AppMotion.standard,
              alignment: value
                  ? AlignmentDirectional.centerEnd
                  : AlignmentDirectional.centerStart,
              child: Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(color: thumb, shape: BoxShape.circle),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// 20px radio dot used in barber / language selection.
class AppRadio extends StatelessWidget {
  const AppRadio({required this.selected, this.enabled = true, super.key});

  final bool selected;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: AppMotion.fast,
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: enabled ? AppColors.bg : AppColors.disabled,
        border: Border.all(
          color: !enabled
              ? AppColors.disabled
              : selected
              ? AppColors.primary
              : AppColors.border,
          width: selected ? 6 : 1.8,
        ),
      ),
    );
  }
}

/// 22px rounded checkbox (terms, anonymous review).
class AppCheckbox extends StatelessWidget {
  const AppCheckbox({
    required this.value,
    required this.onChanged,
    this.semanticLabel,
    super.key,
  });

  final bool value;
  final ValueChanged<bool>? onChanged;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      checked: value,
      label: semanticLabel,
      child: AppPressable(
        onTap: onChanged == null ? null : () => onChanged!(!value),
        isButton: false,
        pressedScale: 0.9,
        child: AnimatedContainer(
          duration: AppMotion.fast,
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            color: value ? AppColors.primary : AppColors.bg,
            borderRadius: BorderRadius.circular(AppRadius.xs),
            border: Border.all(
              color: value ? AppColors.primary : AppColors.border,
              width: 1.8,
            ),
          ),
          alignment: Alignment.center,
          child: AnimatedScale(
            duration: AppMotion.fast,
            curve: AppMotion.emphasized,
            scale: value ? 1 : 0,
            child: const AppIcon(
              AppAssets.iconCheckBold,
              size: AppSizes.iconSm,
              color: AppColors.onPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
