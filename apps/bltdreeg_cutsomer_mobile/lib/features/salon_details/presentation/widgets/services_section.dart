import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../../domain/salon_details.dart';
import '../salon_details_cubit.dart';

/// Frame 21 services list. "+" adds a service to the booking draft.
class ServicesSection extends StatelessWidget {
  const ServicesSection({required this.details, super.key});

  final SalonDetails details;

  @override
  Widget build(BuildContext context) {
    final draft = context.select((SalonDetailsCubit c) => c.state.draft);
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final (g, group) in details.serviceGroups.indexed) ...[
            GroupLabel(
              group.title,
              padding: EdgeInsetsDirectional.fromSTEB(4, g == 0 ? 0 : 18, 4, 4),
            ),
            for (final (i, service) in group.services.indexed)
              _ServiceRow(
                service: service,
                selected: draft.contains(service.id),
                showDivider: i < group.services.length - 1,
              ),
          ],
        ],
      ),
    );
  }
}

class _ServiceRow extends StatelessWidget {
  const _ServiceRow({
    required this.service,
    required this.selected,
    required this.showDivider,
  });

  final SalonService service;
  final bool selected;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<SalonDetailsCubit>();
    return AppPressable(
      onTap: () => cubit.toggleService(service),
      pressedScale: 0.985,
      semanticLabel: selected
          ? l10n.a11yRemoveService(service.name)
          : l10n.a11yAddService(service.name),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          border: showDivider
              ? const Border(bottom: BorderSide(color: AppColors.divider))
              : null,
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(service.name, style: AppTypography.bodyStrong),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      const AppIcon(
                        AppAssets.iconClock,
                        size: 13,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        l10n.durationMinutes(service.durationMinutes),
                        style: AppTypography.meta,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Text(
              SalonLabels.price(context, service.price),
              style: AppTypography.itemTitle.copyWith(
                fontSize: 15,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(width: 12),
            ExcludeSemantics(child: _AddToggle(selected: selected)),
          ],
        ),
      ),
    );
  }
}

class _AddToggle extends StatelessWidget {
  const _AddToggle({required this.selected});

  final bool selected;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: AppMotion.fast,
      curve: AppMotion.standard,
      width: 34,
      height: 34,
      decoration: BoxDecoration(
        color: selected ? AppColors.primary : AppColors.bg,
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: AppColors.primary, width: 1.5),
      ),
      alignment: Alignment.center,
      child: AnimatedSwitcher(
        duration: AppMotion.fast,
        transitionBuilder: (child, a) => ScaleTransition(
          scale: a,
          child: RotationTransition(
            turns: Tween(begin: -0.1, end: 0.0).animate(a),
            child: child,
          ),
        ),
        child: AppIcon(
          selected ? AppAssets.iconCheckBold : AppAssets.iconPlus,
          key: ValueKey(selected),
          size: 18,
          color: selected ? AppColors.onPrimary : AppColors.primary,
        ),
      ),
    );
  }
}
