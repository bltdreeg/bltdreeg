import 'package:equatable/equatable.dart';

import '../../../../core/l10n_data/localized_text.dart';

final class Area extends Equatable {
  const Area({
    required this.id,
    required this.name,
    required this.city,
    required this.salonsCount,
    this.isNearby = false,
  });

  final String id;
  final LocalizedText name;
  final LocalizedText city;
  final int salonsCount;

  /// Listed under "مناطق قريبة منك".
  final bool isNearby;

  @override
  List<Object?> get props => [id, name, city, salonsCount, isNearby];
}
