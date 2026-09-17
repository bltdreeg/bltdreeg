import 'generated/app_localizations.dart';

/// "من 3 أيام" style relative times for reviews and notifications.
extension TimeAgoL10n on AppLocalizations {
  String timeAgo(DateTime then, DateTime now) {
    final diff = now.difference(then);
    if (diff.inMinutes < 60) return timeAgoMinutes(diff.inMinutes.clamp(0, 59));
    if (diff.inHours < 24) return timeAgoHours(diff.inHours);
    if (diff.inDays < 7) return timeAgoDays(diff.inDays);
    if (diff.inDays < 30) return timeAgoWeeks(diff.inDays ~/ 7);
    return timeAgoMonths(diff.inDays ~/ 30);
  }
}
