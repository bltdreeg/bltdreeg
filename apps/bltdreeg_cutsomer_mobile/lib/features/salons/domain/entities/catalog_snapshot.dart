import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import 'salon_summary.dart';

/// What the app knows about an area's salons at a moment in time.
final class CatalogSnapshot extends Equatable {
  const CatalogSnapshot({
    this.salons,
    this.updatedAt,
    this.isLive = false,
    this.isRefreshing = false,
    this.failure,
  });

  /// Null until something is cached or fetched.
  final List<SalonSummary>? salons;
  final DateTime? updatedAt;

  /// Online and receiving live queue updates. When false, wait numbers are
  /// stale and the UI must not present them as current (board frame 08).
  final bool isLive;
  final bool isRefreshing;

  /// Last fetch failure, if any (data may still be available from cache).
  final Failure? failure;

  bool get hasData => salons != null;

  CatalogSnapshot copyWith({
    List<SalonSummary>? salons,
    DateTime? updatedAt,
    bool? isLive,
    bool? isRefreshing,
    Failure? failure,
    bool clearFailure = false,
  }) => CatalogSnapshot(
    salons: salons ?? this.salons,
    updatedAt: updatedAt ?? this.updatedAt,
    isLive: isLive ?? this.isLive,
    isRefreshing: isRefreshing ?? this.isRefreshing,
    failure: clearFailure ? null : failure ?? this.failure,
  );

  @override
  List<Object?> get props => [salons, updatedAt, isLive, isRefreshing, failure];
}
