import 'package:flutter/material.dart';

import '../assets/app_assets.dart';
import '../theme/app_colors.dart';
import '../theme/app_dimens.dart';
import '../theme/app_tone.dart';
import '../theme/app_typography.dart';
import '../utils/context_extensions.dart';
import 'app_button.dart';
import 'app_icon.dart';

/// Sticky footer with the float shadow (booking CTA, salon "join queue").
class StickyBottomBar extends StatelessWidget {
  const StickyBottomBar({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(
        color: AppColors.bg,
        border: Border(top: BorderSide(color: AppColors.divider)),
        boxShadow: AppShadows.float,
      ),
      child: SafeArea(
        top: false,
        minimum: const EdgeInsets.only(bottom: 22),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
          child: child,
        ),
      ),
    );
  }
}

/// Opens a modal sheet built with [AppSheetScaffold]. Every sheet has a grab
/// handle, a ✕ close button, drag-to-dismiss and a scrim tap to dismiss.
Future<T?> showAppBottomSheet<T>(
  BuildContext context, {
  required String title,
  required Widget Function(BuildContext context) bodyBuilder,
  Widget Function(BuildContext context)? footerBuilder,
}) {
  return showModalBottomSheet<T>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (sheetContext) => AppSheetScaffold(
      title: title,
      body: bodyBuilder(sheetContext),
      footer: footerBuilder?.call(sheetContext),
    ),
  );
}

class AppSheetScaffold extends StatelessWidget {
  const AppSheetScaffold({
    required this.title,
    required this.body,
    this.footer,
    super.key,
  });

  final String title;
  final Widget body;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final maxHeight = MediaQuery.sizeOf(context).height * 0.88;
    return ConstrainedBox(
      constraints: BoxConstraints(maxHeight: maxHeight),
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.viewInsetsOf(context).bottom,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 38,
                height: 4,
                margin: const EdgeInsets.only(top: 10),
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 14),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.divider)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Semantics(
                      header: true,
                      child: Text(title, style: AppTypography.titleMd),
                    ),
                  ),
                  AppIconButton(
                    icon: AppAssets.iconClose,
                    size: 32,
                    iconSize: AppSizes.iconSm,
                    style: AppIconButtonStyle.filled,
                    onPressed: () => Navigator.of(context).maybePop(),
                    semanticLabel: context.l10n.actionClose,
                  ),
                ],
              ),
            ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 8),
                child: body,
              ),
            ),
            if (footer != null)
              Container(
                padding: EdgeInsets.fromLTRB(
                  20,
                  14,
                  20,
                  MediaQuery.viewPaddingOf(context).bottom + 14,
                ),
                decoration: const BoxDecoration(
                  color: AppColors.bg,
                  border: Border(top: BorderSide(color: AppColors.divider)),
                ),
                child: footer,
              ),
          ],
        ),
      ),
    );
  }
}

/// Consequence-first confirmation dialog (frames 17, 30, 38).
///
/// Returns true when confirmed. Scrim tap and back dismiss as "cancel".
/// Enters with a short scale + fade so the interruption reads as
/// intentional rather than abrupt.
Future<bool> showAppConfirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  required String cancelLabel,
  String icon = AppAssets.iconAlertCircle,
  AppTone tone = AppTone.danger,
  String? note,
  AppButtonVariant confirmVariant = AppButtonVariant.danger,
}) async {
  final result = await showGeneralDialog<bool>(
    context: context,
    barrierDismissible: true,
    barrierLabel: cancelLabel,
    barrierColor: AppColors.scrim,
    transitionDuration: AppMotion.medium,
    pageBuilder: (dialogContext, _, _) => SafeArea(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Material(
            color: AppColors.bg,
            borderRadius: AppRadius.dialogAll,
            child: Container(
              decoration: const BoxDecoration(
                borderRadius: AppRadius.dialogAll,
                boxShadow: AppShadows.pop,
              ),
              padding: const EdgeInsets.fromLTRB(22, 24, 22, 18),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: tone.background,
                      borderRadius: AppRadius.mdAll,
                    ),
                    alignment: Alignment.center,
                    child: AppIcon(
                      icon,
                      color: tone == AppTone.danger
                          ? AppColors.error
                          : tone.foreground,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Semantics(
                    header: true,
                    child: Text(title, style: AppTypography.dialogTitle),
                  ),
                  const SizedBox(height: 8),
                  Text(message, style: AppTypography.bodyLong),
                  if (note != null) ...[
                    const SizedBox(height: 16),
                    AppNoticeBox(message: note),
                  ],
                  const SizedBox(height: 20),
                  AppButton(
                    label: confirmLabel,
                    variant: confirmVariant,
                    size: AppButtonSize.md,
                    onPressed: () => Navigator.of(dialogContext).pop(true),
                  ),
                  const SizedBox(height: 9),
                  AppButton(
                    label: cancelLabel,
                    variant: AppButtonVariant.secondary,
                    size: AppButtonSize.md,
                    onPressed: () => Navigator.of(dialogContext).pop(false),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
    transitionBuilder: (context, animation, _, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: AppMotion.emphasized,
        reverseCurve: Curves.easeIn,
      );
      return FadeTransition(
        opacity: animation,
        child: ScaleTransition(
          scale: Tween<double>(begin: 0.92, end: 1).animate(curved),
          child: child,
        ),
      );
    },
  );
  return result ?? false;
}

/// Compact grey note used inside dialogs.
class AppNoticeBox extends StatelessWidget {
  const AppNoticeBox({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: const BoxDecoration(
        color: AppColors.surf,
        borderRadius: AppRadius.fieldAll,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 3),
            child: AppIcon(
              AppAssets.iconAlertCircle,
              size: AppSizes.iconSm,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Text(
              message,
              style: AppTypography.note.copyWith(fontSize: 12.5),
            ),
          ),
        ],
      ),
    );
  }
}
