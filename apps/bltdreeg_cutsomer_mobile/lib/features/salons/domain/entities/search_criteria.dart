import 'package:equatable/equatable.dart';

import 'salon_summary.dart';

enum SalonSort { leastWait, nearest, topRated, cheapest, newest }

/// Everything the search screen can filter and sort by (frames 13–14).
final class SearchCriteria extends Equatable {
  const SearchCriteria({
    this.query = '',
    this.sort,
    this.services = const {},
    this.day,
    this.minPrice = priceFloor,
    this.maxPrice = priceCeiling,
    this.openNowOnly = false,
    this.radiusKm = defaultRadiusKm,
  });

  static const priceFloor = 40;
  static const priceCeiling = 150;
  static const defaultRadiusKm = 5.0;
  static const expandedRadiusKm = 10.0;

  final String query;
  final SalonSort? sort;
  final Set<ServiceCategory> services;

  /// Calendar day (date only) the salon must be open on.
  final DateTime? day;
  final int minPrice;
  final int maxPrice;
  final bool openNowOnly;
  final double radiusKm;

  bool get hasPriceFilter => minPrice > priceFloor || maxPrice < priceCeiling;

  /// Number of applied filter groups, shown on the filter button badge.
  int get activeFilterCount =>
      (sort != null ? 1 : 0) +
      services.length +
      (day != null ? 1 : 0) +
      (hasPriceFilter ? 1 : 0) +
      (openNowOnly ? 1 : 0);

  bool get hasFilters => activeFilterCount > 0;

  SearchCriteria copyWith({
    String? query,
    SalonSort? sort,
    bool clearSort = false,
    Set<ServiceCategory>? services,
    DateTime? day,
    bool clearDay = false,
    int? minPrice,
    int? maxPrice,
    bool? openNowOnly,
    double? radiusKm,
  }) => SearchCriteria(
    query: query ?? this.query,
    sort: clearSort ? null : sort ?? this.sort,
    services: services ?? this.services,
    day: clearDay ? null : day ?? this.day,
    minPrice: minPrice ?? this.minPrice,
    maxPrice: maxPrice ?? this.maxPrice,
    openNowOnly: openNowOnly ?? this.openNowOnly,
    radiusKm: radiusKm ?? this.radiusKm,
  );

  /// Same query and radius, no filters.
  SearchCriteria withoutFilters() =>
      SearchCriteria(query: query, radiusKm: radiusKm);

  @override
  List<Object?> get props => [
    query,
    sort,
    services,
    day,
    minPrice,
    maxPrice,
    openNowOnly,
    radiusKm,
  ];
}
