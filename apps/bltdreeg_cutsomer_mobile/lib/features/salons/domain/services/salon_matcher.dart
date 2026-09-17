import 'dart:math' as math;

import '../../../../core/utils/digits.dart';
import '../entities/salon_summary.dart';
import '../entities/search_criteria.dart';

/// Pure search/filter/sort logic over a list of salons.
///
/// Used for instant local results (and offline search over the cache) and
/// for the "show N results" preview in the filter sheet. A real backend can
/// run the same criteria server-side; this stays as the offline fallback.
abstract final class SalonMatcher {
  static final _diacritics = RegExp('[ً-ٰٟـ]');
  static final _spaces = RegExp(r'\s+');

  /// Generic words that shouldn't have to match ("صالون الورد" → "ورد").
  static const _stopWords = {
    'صالون',
    'صالونات',
    'حلاق',
    'للحلاقه',
    'salon',
    'barbershop',
  };

  /// Folds Arabic spelling variants so "الدهّان" matches "الدهان" and
  /// "وردة" matches "ورده".
  static String normalize(String input) =>
      Digits.toLatin(input)
          .toLowerCase()
          .replaceAll(_diacritics, '')
          .replaceAll(RegExp('[أإآٱ]'), 'ا')
          .replaceAll('ة', 'ه')
          .replaceAll('ى', 'ي')
          .replaceAll('ؤ', 'و')
          .replaceAll('ئ', 'ي')
          .replaceAll(_spaces, ' ')
          .trim();

  static List<String> _tokens(String query) =>
      normalize(query)
          .split(' ')
          .where((t) => t.isNotEmpty && !_stopWords.contains(t))
          .map((t) => t.length > 3 && t.startsWith('ال') ? t.substring(2) : t)
          .toList();

  /// Arabic/English spellings people use interchangeably in salon names.
  static const _aliases = {
    'بربر': ['barber'],
    'barber': ['بربر'],
    'كلاسيك': ['classic'],
    'classic': ['كلاسيك'],
  };

  static bool matchesQuery(SalonSummary salon, String query) {
    final tokens = _tokens(query);
    if (tokens.isEmpty) return true;
    final haystack =
        '${normalize(salon.name)} ${normalize(salon.areaName.ar)} '
        '${normalize(salon.areaName.en)}';
    return tokens.every(
      (t) =>
          haystack.contains(t) ||
          (_aliases[t]?.any(haystack.contains) ?? false),
    );
  }

  static List<SalonSummary> apply(
    List<SalonSummary> salons,
    SearchCriteria criteria, {
    required DateTime now,
  }) {
    final serviceForPrice = criteria.services.length == 1
        ? criteria.services.first
        : null;
    final results = salons.where((s) {
      if (s.distanceKm > criteria.radiusKm) return false;
      if (!matchesQuery(s, criteria.query)) return false;
      if (!criteria.services.every(s.services.contains)) return false;
      if (criteria.openNowOnly && !s.isOpen) return false;
      if (criteria.day != null && !s.openOn(criteria.day!)) return false;
      if (criteria.hasPriceFilter) {
        final price = s.priceFor(serviceForPrice);
        if (price < criteria.minPrice || price > criteria.maxPrice) {
          return false;
        }
      }
      return true;
    }).toList();
    return sort(results, criteria.sort ?? SalonSort.nearest, now: now);
  }

  static List<SalonSummary> sort(
    List<SalonSummary> salons,
    SalonSort sort, {
    required DateTime now,
  }) {
    int byWait(SalonSummary a, SalonSummary b) {
      // Open salons first, then shortest wait, then distance.
      if (a.isOpen != b.isOpen) return a.isOpen ? -1 : 1;
      final wait = a.queue.waitMinutes.compareTo(b.queue.waitMinutes);
      return wait != 0 ? wait : a.distanceKm.compareTo(b.distanceKm);
    }

    final sorted = [...salons];
    sorted.sort(switch (sort) {
      SalonSort.leastWait => byWait,
      SalonSort.nearest => (a, b) => a.distanceKm.compareTo(b.distanceKm),
      SalonSort.topRated => (a, b) => (b.rating ?? 0).compareTo(a.rating ?? 0),
      SalonSort.cheapest => (a, b) => a.priceFrom.compareTo(b.priceFrom),
      SalonSort.newest => (a, b) => b.openedOn.compareTo(a.openedOn),
    });
    return sorted;
  }

  /// Closest names for "يمكن تكون بتقصد" when nothing matched.
  static List<SalonSummary> suggestions(
    List<SalonSummary> salons,
    String query, {
    int limit = 3,
  }) {
    final q = normalize(query);
    if (q.length < 2) return const [];
    final scored = [
      for (final s in salons) (salon: s, score: _similarity(q, s.name)),
    ]..sort((a, b) => b.score.compareTo(a.score));
    return [
      for (final e in scored.take(limit))
        if (e.score > 0) e.salon,
    ];
  }

  static double _similarity(String normalizedQuery, String name) {
    Set<String> grams(String s) {
      final padded = ' $s ';
      return {
        for (var i = 0; i < math.max(0, padded.length - 1); i++)
          padded.substring(i, i + 2),
      };
    }

    final a = grams(normalizedQuery);
    final b = grams(normalize(name));
    if (a.isEmpty || b.isEmpty) return 0;
    return a.intersection(b).length / a.union(b).length;
  }
}
