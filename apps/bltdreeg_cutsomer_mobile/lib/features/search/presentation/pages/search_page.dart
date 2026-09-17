import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/assets/app_assets.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/router/app_navigation.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_dimens.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/context_extensions.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../salons/domain/entities/salon_summary.dart';
import '../../../salons/domain/entities/search_criteria.dart';
import '../../../salons/presentation/widgets/salon_items.dart';
import '../../../salons/presentation/widgets/salon_labels.dart';
import '../search_bloc.dart';
import '../widgets/filter_sheet.dart';

/// Frames 12 (default), 13 (results + filters), 14 (sheet), 15 (no results).
class SearchPage extends StatelessWidget {
  const SearchPage({this.sort, this.openNowOnly = false, super.key});

  /// Pre-applied from the URL (home "see all").
  final SalonSort? sort;
  final bool openNowOnly;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<SearchBloc>(),
      child: _SearchView(sort: sort, openNowOnly: openNowOnly),
    );
  }
}

class _SearchView extends StatefulWidget {
  const _SearchView({required this.sort, required this.openNowOnly});

  final SalonSort? sort;
  final bool openNowOnly;

  @override
  State<_SearchView> createState() => _SearchViewState();
}

class _SearchViewState extends State<_SearchView> {
  final _query = TextEditingController();

  @override
  void initState() {
    super.initState();
    _launch();
  }

  @override
  void didUpdateWidget(covariant _SearchView oldWidget) {
    super.didUpdateWidget(oldWidget);
    // The tab stays mounted; a new "see all" link arrives as new params.
    if (oldWidget.sort != widget.sort ||
        oldWidget.openNowOnly != widget.openNowOnly) {
      _launch();
    }
  }

  void _launch() => context.read<SearchBloc>().add(
    SearchLaunched(sort: widget.sort, openNowOnly: widget.openNowOnly),
  );

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  void _setQuery(String q) {
    _query.value = TextEditingValue(
      text: q,
      selection: TextSelection.collapsed(offset: q.length),
    );
    context.read<SearchBloc>()
      ..add(SearchQueryChanged(q))
      ..add(SearchQueryCommitted(q));
  }

  Future<void> _openFilters(SearchState state) async {
    final bloc = context.read<SearchBloc>();
    final result = await showFilterSheet(
      context,
      initial: state.criteria,
      countFor: (draft) => bloc.state.countFor(draft, DateTime.now()),
    );
    if (result != null) bloc.add(SearchCriteriaApplied(result));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final online = context.watchIsOnline;
    final bloc = context.read<SearchBloc>();

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: BlocBuilder<SearchBloc, SearchState>(
          builder: (context, state) {
            final live = online && state.snapshot.isLive;
            final count = state.criteria.activeFilterCount;
            return Column(
              children: [
                OfflineBanner(
                  visible: !online && state.snapshot.hasData,
                  lastUpdated: state.snapshot.updatedAt,
                  onRetry: () => bloc.add(const SearchRetried()),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: AppSearchField(
                          controller: _query,
                          hint: online
                              ? l10n.searchHint
                              : l10n.offlineSearchDisabled,
                          enabled: online,
                          onChanged: (q) => bloc.add(SearchQueryChanged(q)),
                          onSubmitted: (q) => bloc.add(SearchQueryCommitted(q)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      AppIconButton(
                        icon: AppAssets.iconFilter,
                        size: AppSizes.buttonMd,
                        style: count > 0
                            ? AppIconButtonStyle.active
                            : AppIconButtonStyle.outline,
                        count: count,
                        semanticLabel: l10n.a11yFilter,
                        onPressed: online && state.snapshot.hasData
                            ? () => _openFilters(state)
                            : null,
                      ),
                    ],
                  ),
                ),
                AnimatedSize(
                  duration: AppMotion.medium,
                  curve: AppMotion.standard,
                  alignment: Alignment.topCenter,
                  child: state.criteria.hasFilters
                      ? Padding(
                          padding: const EdgeInsets.only(top: 12),
                          child: _AppliedFilters(criteria: state.criteria),
                        )
                      : const SizedBox(width: double.infinity),
                ),
                Expanded(
                  child: _SearchBody(
                    state: state,
                    live: live,
                    onPickQuery: _setQuery,
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _SearchBody extends StatelessWidget {
  const _SearchBody({
    required this.state,
    required this.live,
    required this.onPickQuery,
  });

  final SearchState state;
  final bool live;
  final ValueChanged<String> onPickQuery;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final snapshot = state.snapshot;

    if (!snapshot.hasData) {
      return switch (snapshot.failure) {
        null => const Shimmer(
          child: Padding(
            padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Column(
              children: [SalonListTileSkeleton(), SalonListTileSkeleton()],
            ),
          ),
        ),
        NetworkFailure() => NoConnectionView(
          onRetry: () => context.read<SearchBloc>().add(const SearchRetried()),
          onOpenLastBooking: context.goBookings,
        ),
        _ => Center(
          child: EmptyStateView(
            illustration: const AppIllustration(
              AppAssets.illustrationSearchNoResults,
              width: 170,
            ),
            title: l10n.loadErrorTitle,
          ),
        ),
      };
    }

    final now = DateTime.now();
    if (state.isIdle || !live) {
      return _IdleView(state: state, live: live, now: now, onPick: onPickQuery);
    }
    final results = state.results(now);
    if (results.isEmpty) {
      return _NoResults(state: state, onPick: onPickQuery);
    }
    return _Results(state: state, results: results, now: now);
  }
}

/// Frame 12: recent searches + nearby salons by wait.
class _IdleView extends StatelessWidget {
  const _IdleView({
    required this.state,
    required this.live,
    required this.now,
    required this.onPick,
  });

  final SearchState state;
  final bool live;
  final DateTime now;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final bloc = context.read<SearchBloc>();
    final nearby = state.nearby(now);

    return ListView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.only(bottom: 22),
      children: [
        if (state.recent.isNotEmpty && live) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        l10n.searchRecent,
                        style: AppTypography.sectionTitle.copyWith(
                          fontSize: 15,
                        ),
                      ),
                    ),
                    AppLinkButton(
                      label: l10n.actionClearAll,
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      onPressed: () => bloc.add(const RecentSearchesCleared()),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final q in state.recent)
                      AppChip(
                        label: q,
                        height: 34,
                        onTap: () => onPick(q),
                        onRemove: () => bloc.add(RecentSearchRemoved(q)),
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SectionDivider(),
        ],
        Padding(
          padding: AppSpacing.pageH,
          child: Column(
            children: [
              SectionHeader(
                title: l10n.searchNearbyNow,
                padding: EdgeInsets.only(
                  top: state.recent.isNotEmpty && live ? 0 : 20,
                  bottom: 12,
                ),
                trailing: Text(
                  state.area?.name.of(l10n.localeName) ?? '',
                  style: AppTypography.caption,
                ),
              ),
              for (var i = 0; i < nearby.length; i++)
                SalonListItem(
                  key: ValueKey(nearby[i].id),
                  salon: nearby[i],
                  now: now,
                  live: live,
                  showDivider: i < nearby.length - 1,
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Frame 13.
class _Results extends StatelessWidget {
  const _Results({
    required this.state,
    required this.results,
    required this.now,
  });

  final SearchState state;
  final List<SalonSummary> results;
  final DateTime now;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final criteria = state.criteria;
    final query = criteria.query.trim();
    final priceService = criteria.services.length == 1
        ? criteria.services.first
        : null;

    return ListView.builder(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 22),
      itemCount: results.length + 1,
      itemBuilder: (context, i) {
        if (i == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    query.isEmpty
                        ? l10n.searchResultsCount(results.length)
                        : l10n.searchResultsForQuery(results.length, query),
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Text(
                  l10n.withinKm(context.fmt.number(criteria.radiusKm)),
                  style: AppTypography.caption,
                ),
              ],
            ),
          );
        }
        final salon = results[i - 1];
        return FadeSlideIn(
          key: ValueKey(salon.id),
          offset: 8,
          duration: AppMotion.medium,
          delay: Duration(milliseconds: 25 * (i - 1).clamp(0, 8)),
          child: SalonListItem(
            salon: salon,
            now: now,
            priceService: priceService,
            showDivider: i < results.length,
          ),
        );
      },
    );
  }
}

/// Frame 15.
class _NoResults extends StatelessWidget {
  const _NoResults({required this.state, required this.onPick});

  final SearchState state;
  final ValueChanged<String> onPick;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final bloc = context.read<SearchBloc>();
    final criteria = state.criteria;
    final query = criteria.query.trim();
    final suggestions = state.suggestions;
    final areaName = state.area?.name.of(l10n.localeName) ?? '';

    return ListView(
      keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        EmptyStateView(
          padding: const EdgeInsets.fromLTRB(34, 34, 34, 10),
          expandActions: true,
          illustration: const AppIllustration(
            AppAssets.illustrationSearchNoResults,
            width: 180,
          ),
          title: query.isEmpty
              ? l10n.searchNoFilterResultsTitle
              : l10n.searchNoResultsTitle,
          message: query.isEmpty
              ? l10n.searchNoFilterResultsBody
              : l10n.searchNoResultsBody(query, areaName),
          primaryLabel: criteria.hasFilters
              ? l10n.searchClearFiltersShowAll
              : null,
          onPrimary: () => bloc.add(const SearchFiltersCleared()),
          secondaryLabel: state.canExpandRadius
              ? l10n.searchExpandRadius(
                  context.fmt.number(SearchCriteria.expandedRadiusKm),
                )
              : null,
          onSecondary: () => bloc.add(const SearchRadiusExpanded()),
        ),
        if (suggestions.isNotEmpty)
          Padding(
            padding: AppSpacing.pageH,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SectionHeader(title: l10n.searchDidYouMean),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final s in suggestions)
                      AppChip(label: s.name, onTap: () => onPick(s.name)),
                  ],
                ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Removable chips for each applied filter (frame 13).
class _AppliedFilters extends StatelessWidget {
  const _AppliedFilters({required this.criteria});

  final SearchCriteria criteria;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final fmt = context.fmt;
    final bloc = context.read<SearchBloc>();
    void apply(SearchCriteria next) => bloc.add(SearchCriteriaApplied(next));

    final chips = <Widget>[
      if (criteria.sort case final sort?)
        AppChip(
          label: sort.label(l10n),
          style: AppChipStyle.applied,
          onRemove: () => apply(criteria.copyWith(clearSort: true)),
        ),
      for (final service in criteria.services)
        AppChip(
          label: service.label(l10n),
          style: AppChipStyle.applied,
          onRemove: () => apply(
            criteria.copyWith(
              services: {...criteria.services}..remove(service),
            ),
          ),
        ),
      if (criteria.day case final day?)
        AppChip(
          label: l10n.dayChipLabel(_dayName(context, day), fmt.dayOfMonth(day)),
          style: AppChipStyle.applied,
          onRemove: () => apply(criteria.copyWith(clearDay: true)),
        ),
      if (criteria.hasPriceFilter)
        AppChip(
          label: l10n.priceRangeLabel(
            fmt.number(criteria.minPrice),
            SalonLabels.price(context, criteria.maxPrice),
          ),
          style: AppChipStyle.applied,
          onRemove: () => apply(
            criteria.copyWith(
              minPrice: SearchCriteria.priceFloor,
              maxPrice: SearchCriteria.priceCeiling,
            ),
          ),
        ),
      if (criteria.openNowOnly)
        AppChip(
          label: l10n.filterOpenNow,
          style: AppChipStyle.applied,
          onRemove: () => apply(criteria.copyWith(openNowOnly: false)),
        ),
      AppChip(
        label: l10n.actionClearAll,
        style: AppChipStyle.plain,
        onTap: () => bloc.add(const SearchFiltersCleared()),
      ),
    ];
    return ChipRail(children: chips);
  }

  String _dayName(BuildContext context, DateTime day) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    return switch (day.difference(today).inDays) {
      0 => context.l10n.dayToday,
      1 => context.l10n.dayTomorrow,
      _ => context.fmt.weekday(day),
    };
  }
}
