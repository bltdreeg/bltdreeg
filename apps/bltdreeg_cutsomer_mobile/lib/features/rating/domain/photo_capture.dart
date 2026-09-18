/// Contracts for attaching photos to a rating. The presentation layer drives
/// both; the implementations (`image_picker`, the app documents directory)
/// live in `data/`.
library;

enum PhotoSource { camera, gallery }

/// Picks one photo; null when the customer cancels.
abstract interface class PhotoPicker {
  Future<String?> pick(PhotoSource source);
}

/// Keeps attached photos alive until the rating is sent: picker files live
/// in a temp folder the OS may clear before an offline rating is replayed.
abstract interface class RatingPhotoStore {
  Future<String> keep(String bookingId, String sourcePath, int index);
}
