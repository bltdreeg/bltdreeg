import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';

import '../../../core/database/app_database.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/fake_server.dart';
import '../../../core/sync/outbox_processor.dart';
import '../../../core/utils/result.dart';
import '../domain/rating.dart';

abstract final class VisitRatingModel {
  static Map<String, Object?> toJson(VisitRating r) => {
    'booking_id': r.bookingId,
    'salon_id': r.salonId,
    'overall': r.overall,
    'quality': r.quality,
    'cleanliness': r.cleanliness,
    'time_accuracy': r.timeAccuracy,
    'tags': [for (final t in r.tags) t.name],
    'comment': r.comment,
    'anonymous': r.anonymous,
    'photo_paths': r.photoPaths,
    'submitted_at': r.submittedAt.toIso8601String(),
  };

  static VisitRating fromJson(Map<String, Object?> j) => VisitRating(
    bookingId: j['booking_id']! as String,
    salonId: j['salon_id']! as String,
    overall: j['overall']! as int,
    quality: j['quality'] as int? ?? 0,
    cleanliness: j['cleanliness'] as int? ?? 0,
    timeAccuracy: j['time_accuracy'] as int? ?? 0,
    tags: {
      for (final t in j['tags'] as List<Object?>? ?? const [])
        ?RatingTag.values.asNameMap()[t],
    },
    comment: j['comment'] as String? ?? '',
    anonymous: j['anonymous'] as bool? ?? false,
    photoPaths: [
      for (final p in j['photo_paths'] as List<Object?>? ?? const [])
        p! as String,
    ],
    submittedAt: DateTime.parse(j['submitted_at']! as String),
  );
}

abstract interface class RatingRemoteDataSource {
  Future<void> submit(VisitRating rating);

  /// Ratings the customer already sent, by booking id.
  Future<Map<String, VisitRating>> fetchMine();
}

final class ApiRatingRemoteDataSource implements RatingRemoteDataSource {
  const ApiRatingRemoteDataSource(this._api);

  final ApiClient _api;

  @override
  Future<Map<String, VisitRating>> fetchMine() async {
    final json = await _api.getJson('/me/ratings');
    return {
      for (final r in json['ratings']! as List<Object?>)
        if (VisitRatingModel.fromJson(r! as Map<String, Object?>)
            case final rating)
          rating.bookingId: rating,
    };
  }

  @override
  Future<void> submit(VisitRating rating) async {
    final fields = VisitRatingModel.toJson(rating)..remove('photo_paths');
    await _api.postMultipart(
      '/bookings/${rating.bookingId}/rating',
      fields: {'rating': jsonEncode(fields)},
      fileField: 'photos',
      filePaths: [
        for (final p in rating.photoPaths)
          if (File(p).existsSync()) p,
      ],
    );
  }
}

final class FakeRatingRemoteDataSource implements RatingRemoteDataSource {
  FakeRatingRemoteDataSource(this._server, {DateTime Function()? clock})
    : received = {
        // The older seeded visit was already rated (frame 10).
        'bk-past-2': VisitRating(
          bookingId: 'bk-past-2',
          salonId: 's3',
          overall: 4,
          quality: 4,
          cleanliness: 4,
          timeAccuracy: 3,
          submittedAt: (clock ?? DateTime.now)().subtract(
            const Duration(days: 18),
          ),
        ),
      };

  final FakeServer _server;
  final Map<String, VisitRating> received;

  @override
  Future<Map<String, VisitRating>> fetchMine() => _server(() => {...received});

  @override
  Future<void> submit(VisitRating rating) => _server(
    () => received[rating.bookingId] = rating,
    latency: const Duration(milliseconds: 900),
  );
}

/// Keeps attached photos alive until the rating is sent: picker files live
/// in a temp folder the OS may clear before an offline rating is replayed.
abstract interface class RatingPhotoStore {
  Future<String> keep(String bookingId, String sourcePath, int index);
}

final class AppDocumentsRatingPhotoStore implements RatingPhotoStore {
  const AppDocumentsRatingPhotoStore();

  @override
  Future<String> keep(String bookingId, String sourcePath, int index) async {
    final docs = await getApplicationDocumentsDirectory();
    final dir = Directory('${docs.path}/ratings/$bookingId');
    await dir.create(recursive: true);
    final extension = sourcePath.contains('.')
        ? sourcePath.substring(sourcePath.lastIndexOf('.'))
        : '.jpg';
    final copy = await File(sourcePath)
        .copy('${dir.path}/photo_$index$extension');
    return copy.path;
  }
}

final class RatingRepositoryImpl implements RatingRepository {
  RatingRepositoryImpl({
    required this._remote,
    required AppDatabase database,
    required this._outbox,
  }) : _db = database {
    _outbox.register(outboxType, (payload) async {
      await _remote.submit(VisitRatingModel.fromJson(payload));
    });
  }

  static const outboxType = 'rating.submit';

  final RatingRemoteDataSource _remote;
  final AppDatabase _db;
  final OutboxProcessor _outbox;

  static String _key(String bookingId) => 'rating:$bookingId';

  @override
  Future<Result<VisitRating>> submit(VisitRating rating) =>
      guardResult(() async {
        final json = VisitRatingModel.toJson(rating);
        await _db.writeCache(_key(rating.bookingId), jsonEncode(json));
        await _outbox.enqueue(outboxType, json);
        return rating;
      });

  @override
  Future<Map<String, VisitRating>> ratingsFor(
    Iterable<String> bookingIds,
  ) async {
    final result = <String, VisitRating>{};
    final missing = <String>[];
    for (final id in bookingIds) {
      final local = await ratingFor(id);
      if (local != null) {
        result[id] = local;
      } else {
        missing.add(id);
      }
    }
    if (missing.isEmpty) return result;
    // Ratings sent from another device, or before a reinstall.
    final remote = await guardResult(_remote.fetchMine);
    for (final id in missing) {
      if (remote.valueOrNull?[id] case final rating?) {
        await _db.writeCache(
          _key(id),
          jsonEncode(VisitRatingModel.toJson(rating)),
        );
        result[id] = rating;
      }
    }
    return result;
  }

  @override
  Future<VisitRating?> ratingFor(String bookingId) async {
    final row = await _db.readCache(_key(bookingId));
    if (row == null) return null;
    return VisitRatingModel.fromJson(
      jsonDecode(row.payload) as Map<String, Object?>,
    );
  }

  @override
  Future<bool> isPending(String bookingId) async {
    for (final entry in await _db.pendingOutbox()) {
      if (entry.type != outboxType) continue;
      final payload = jsonDecode(entry.payload) as Map<String, Object?>;
      if (payload['booking_id'] == bookingId) return true;
    }
    return false;
  }
}
