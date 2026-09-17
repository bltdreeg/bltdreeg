import 'dart:async';

import '../domain/booking_draft.dart';

/// Drafts live for the app session; a half-built booking isn't worth
/// restoring after a restart because wait times will have changed.
final class InMemoryBookingDraftRepository implements BookingDraftRepository {
  final _drafts = <String, BookingDraft>{};
  final _changes = StreamController<BookingDraft>.broadcast();

  @override
  BookingDraft draftFor(String salonId) =>
      _drafts[salonId] ?? BookingDraft(salonId: salonId);

  @override
  Stream<BookingDraft> watch(String salonId) => Stream.multi((listener) {
    listener.add(draftFor(salonId));
    final sub = _changes.stream
        .where((d) => d.salonId == salonId)
        .listen(listener.add);
    listener.onCancel = sub.cancel;
  });

  @override
  void save(BookingDraft draft) {
    _drafts[draft.salonId] = draft;
    _changes.add(draft);
  }

  @override
  void clear(String salonId) => save(BookingDraft(salonId: salonId));
}
