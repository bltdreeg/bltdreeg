import 'package:image_picker/image_picker.dart';

enum PhotoSource { camera, gallery }

/// Picks one photo; null when the customer cancels.
abstract interface class PhotoPicker {
  Future<String?> pick(PhotoSource source);
}

final class ImagePickerPhotoPicker implements PhotoPicker {
  ImagePickerPhotoPicker([ImagePicker? picker])
    : _picker = picker ?? ImagePicker();

  final ImagePicker _picker;

  @override
  Future<String?> pick(PhotoSource source) async {
    final file = await _picker.pickImage(
      source: switch (source) {
        PhotoSource.camera => ImageSource.camera,
        PhotoSource.gallery => ImageSource.gallery,
      },
      // Reviews don't need full-resolution originals.
      maxWidth: 1600,
      imageQuality: 82,
    );
    return file?.path;
  }
}
