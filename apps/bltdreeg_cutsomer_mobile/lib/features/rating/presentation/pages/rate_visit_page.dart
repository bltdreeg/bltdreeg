import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/localization/generated/app_localizations.dart';
import '../../../../core/localization/l10n_mappers.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../booking/domain/booking.dart';
import '../../../booking/domain/booking_draft.dart';
import '../../../booking/presentation/widgets/booking_widgets.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../../data/photo_picker.dart';
import '../../domain/rating.dart';
import '../rating_cubits.dart';

/// Frame 31. Open only after a completed visit; "دقة الوقت المتوقع" is its
/// own row because it feeds salon ranking.
class RateVisitPage extends StatelessWidget {
  const RateVisitPage({required this.bookingId, super.key});

  final String bookingId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<RateVisitCubit>(param1: bookingId),
      child: const _RateVisitView(),
    );
  }
}

class _RateVisitView extends StatelessWidget {
  const _RateVisitView();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final state = context.watch<RateVisitCubit>().state;
    final cubit = context.read<RateVisitCubit>();

    final Widget body;
    if (state.isLoading) {
      body = const Center(child: CircularProgressIndicator());
    } else if (state.loadFailure case final failure?) {
      body = Center(
        child: EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationEmptyBookings,
            width: 170,
          ),
          title: l10n.bookingLoadFailed,
          message: failure.message(l10n),
          primaryLabel: l10n.actionRetry,
          onPrimary: cubit.load,
        ),
      );
    } else if (!state.canRate) {
      body = Center(
        child: EmptyStateView(
          illustration: const AppIllustration(
            AppAssets.illustrationEmptyBookings,
            width: 170,
          ),
          title: l10n.rateNotAvailableTitle,
          message: l10n.rateNotAvailableBody,
          primaryLabel: l10n.backToHome,
          onPrimary: context.goHome,
        ),
      );
    } else {
      body = _RateForm(state: state, booking: state.booking!);
    }

    return MultiBlocListener(
      listeners: [
        BlocListener<RateVisitCubit, RateVisitState>(
          listenWhen: (a, b) =>
              a.status != b.status && b.status == RateSubmitStatus.done ||
              a.existing == null && b.existing != null,
          listener: (context, state) {
            // Rated now, or already rated earlier: show the confirmation.
            if (state.status == RateSubmitStatus.done) {
              unawaited(AppHaptics.success());
            }
            context.goRatingSent(state.bookingId);
          },
        ),
        BlocListener<RateVisitCubit, RateVisitState>(
          listenWhen: (a, b) => b.photoFailed && !a.photoFailed,
          listener: (context, _) => context.showToast(l10n.photoPickFailed),
        ),
      ],
      child: Scaffold(
        appBar: AppTopBar(
          title: l10n.rateVisitTitle,
          leading: TopBarLeading.close,
          onLeadingPressed: context.popOrGoHome,
          actions: [
            AppLinkButton(
              label: l10n.rateLater,
              color: AppColors.textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w600,
              onPressed: context.popOrGoHome,
            ),
          ],
        ),
        body: AnimatedSwitcher(duration: AppMotion.medium, child: body),
        bottomNavigationBar: state.canRate && state.existing == null
            ? StickyBottomBar(
                child: AppButton(
                  label: l10n.rateSubmit,
                  height: 52,
                  isLoading: state.status == RateSubmitStatus.submitting,
                  onPressed: state.canSubmit ? cubit.submit : null,
                ),
              )
            : null,
      ),
    );
  }
}

class _RateForm extends StatelessWidget {
  const _RateForm({required this.state, required this.booking});

  final RateVisitState state;
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<RateVisitCubit>();

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.gutter,
        20,
        AppSpacing.gutter,
        20,
      ),
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      children: [
        _VisitSummary(booking: booking),
        _OverallStars(value: state.overall, onChanged: cubit.setOverall),
        GroupLabel(
          l10n.rateDetailsHeader,
          padding: const EdgeInsetsDirectional.only(top: 18, bottom: 10),
        ),
        _DetailRow(
          label: l10n.rateQuality,
          value: state.quality,
          onChanged: cubit.setQuality,
        ),
        _DetailRow(
          label: l10n.rateCleanliness,
          value: state.cleanliness,
          onChanged: cubit.setCleanliness,
        ),
        _DetailRow(
          label: l10n.rateTimeAccuracy,
          note: switch ((
            booking.quotedWaitMinutes,
            booking.actualWaitMinutes,
          )) {
            (final quoted?, final actual?) => l10n.rateTimeAccuracyNote(
              quoted,
              actual,
            ),
            _ => null,
          },
          value: state.timeAccuracy,
          onChanged: cubit.setTimeAccuracy,
          last: true,
        ),
        GroupLabel(
          '${l10n.rateTagsHeader} ${l10n.optionalSuffix}',
          padding: const EdgeInsetsDirectional.only(top: 18, bottom: 10),
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final tag in RatingTag.values)
              AppChip(
                label: _tagLabel(l10n, tag),
                height: 34,
                fontSize: 13,
                selected: state.tags.contains(tag),
                showCheckWhenSelected: true,
                onTap: () => cubit.toggleTag(tag),
              ),
          ],
        ),
        const SizedBox(height: 20),
        AppTextField(
          label: l10n.rateCommentLabel,
          optional: true,
          hint: l10n.rateCommentHint,
          maxLines: 5,
          minLines: 3,
          maxLength: VisitRating.maxCommentLength,
          textInputAction: TextInputAction.newline,
          onChanged: cubit.setComment,
        ),
        const SizedBox(height: 16),
        _Photos(state: state),
        const SizedBox(height: 14),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppCheckbox(
              value: state.anonymous,
              semanticLabel: l10n.rateAnonymous,
              onChanged: (value) => cubit.setAnonymous(value: value),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: GestureDetector(
                onTap: () => cubit.setAnonymous(value: !state.anonymous),
                child: Text(
                  l10n.rateAnonymous,
                  style: AppTypography.note.copyWith(fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  static String _tagLabel(AppLocalizations l10n, RatingTag tag) =>
      switch (tag) {
        RatingTag.lightHand => l10n.tagLightHand,
        RatingTag.cleanPlace => l10n.tagCleanPlace,
        RatingTag.respectful => l10n.tagRespectful,
        RatingTag.fairPrice => l10n.tagFairPrice,
        RatingTag.accurateQueue => l10n.tagAccurateQueue,
      };
}

class _VisitSummary extends StatelessWidget {
  const _VisitSummary({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final when =
        booking.servedAt ??
        switch (booking.timing) {
          ScheduledSlot(:final start) => start,
          JoinNow() => booking.createdAt,
        };
    return Container(
      padding: const EdgeInsets.only(bottom: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SalonThumbnail(size: 52, radius: 11, iconSize: AppSizes.iconSm),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  booking.salonName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.itemTitle,
                ),
                const SizedBox(height: 4),
                MetaRow(
                  items: [
                    booking.services
                        .map((s) => s.name)
                        .join(l10n.servicesJoiner),
                    ?booking.barberName,
                  ],
                ),
                const SizedBox(height: 2),
                MetaRow(
                  items: [
                    l10n.slotDateTime(
                      BookingLabels.day(context, when),
                      context.fmt.time(when),
                    ),
                    Text(
                      SalonLabels.price(context, booking.quote.total),
                      style: AppTypography.metaStrong.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OverallStars extends StatelessWidget {
  const _OverallStars({required this.value, required this.onChanged});

  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final label = switch (value) {
      1 => l10n.starLabel1,
      2 => l10n.starLabel2,
      3 => l10n.starLabel3,
      4 => l10n.starLabel4,
      5 => l10n.starLabel5,
      _ => '',
    };
    return Container(
      padding: const EdgeInsets.fromLTRB(0, 22, 0, 18),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: Column(
        children: [
          Text(
            l10n.rateOverallQuestion,
            style: AppTypography.bodyStrong.copyWith(fontSize: 15),
          ),
          const SizedBox(height: 14),
          StarRatingInput(
            value: value,
            onChanged: (stars) {
              unawaited(AppHaptics.tap());
              onChanged(stars);
            },
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 22,
            child: AnimatedSwitcher(
              duration: AppMotion.fast,
              child: Text(
                label,
                key: ValueKey(value),
                style: AppTypography.bodyStrong.copyWith(
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.label,
    required this.value,
    required this.onChanged,
    this.note,
    this.last = false,
  });

  final String label;
  final String? note;
  final int value;
  final ValueChanged<int> onChanged;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 9, bottom: last ? 16 : 9),
      decoration: BoxDecoration(
        border: last
            ? const Border(bottom: BorderSide(color: AppColors.divider))
            : null,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTypography.body.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (note != null) ...[
                  const SizedBox(height: 2),
                  Text(note!, style: AppTypography.caption),
                ],
              ],
            ),
          ),
          StarRatingInput(
            value: value,
            onChanged: onChanged,
            size: 22,
            spacing: 3,
          ),
        ],
      ),
    );
  }
}

class _Photos extends StatelessWidget {
  const _Photos({required this.state});

  final RateVisitState state;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final cubit = context.read<RateVisitCubit>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (state.photos.isNotEmpty) ...[
          SizedBox(
            height: 84,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: state.photos.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) => _PhotoThumb(
                path: state.photos[i],
                onRemove: () => cubit.removePhoto(i),
              ),
            ),
          ),
          const SizedBox(height: 10),
        ],
        if (state.canAddPhoto)
          AppButton(
            label: state.photos.isEmpty
                ? l10n.rateAddPhoto
                : l10n.rateAddAnotherPhoto,
            variant: AppButtonVariant.secondary,
            icon: AppAssets.iconCamera,
            height: 46,
            fontSize: 14,
            onPressed: () async {
              final source = await _pickSource(context);
              if (source != null) await cubit.addPhoto(source);
            },
          ),
      ],
    );
  }

  static Future<PhotoSource?> _pickSource(BuildContext context) {
    final l10n = context.l10n;
    return showAppBottomSheet<PhotoSource>(
      context,
      title: l10n.rateAddPhoto,
      bodyBuilder: (sheet) => SettingsGroup(
        children: [
          SettingsRow(
            title: l10n.photoFromCamera,
            icon: AppAssets.iconCamera,
            onTap: () => Navigator.of(sheet).pop(PhotoSource.camera),
          ),
          SettingsRow(
            title: l10n.photoFromGallery,
            icon: AppAssets.iconPlus,
            onTap: () => Navigator.of(sheet).pop(PhotoSource.gallery),
          ),
        ],
      ),
    );
  }
}

class _PhotoThumb extends StatelessWidget {
  const _PhotoThumb({required this.path, required this.onRemove});

  final String path;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        ClipRRect(
          borderRadius: AppRadius.fieldAll,
          child: Image.file(
            File(path),
            width: 84,
            height: 84,
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => const SizedBox.square(
              dimension: 84,
              child: ColoredBox(color: AppColors.surf),
            ),
          ),
        ),
        PositionedDirectional(
          top: 4,
          end: 4,
          child: AppPressable(
            onTap: onRemove,
            semanticLabel: context.l10n.a11yRemovePhoto,
            child: Container(
              width: 24,
              height: 24,
              decoration: const BoxDecoration(
                color: AppColors.scrim,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const AppIcon(
                AppAssets.iconClose,
                size: 14,
                color: AppColors.onPrimary,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
