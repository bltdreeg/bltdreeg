import 'package:flutter/widgets.dart';
import 'package:url_launcher/url_launcher.dart';

import 'context_extensions.dart';

abstract final class ExternalLinks {
  /// Opens [uri] in its app (maps, dialer), or toasts when nothing can.
  static Future<void> open(BuildContext context, Uri uri) async {
    final message = context.l10n.cantOpenApp;
    final opened = await launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
    ).catchError((Object _) => false);
    if (!opened && context.mounted) context.showToast(message);
  }

  static Future<void> directions(
    BuildContext context, {
    required double latitude,
    required double longitude,
  }) => open(
    context,
    Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude',
    ),
  );
}
