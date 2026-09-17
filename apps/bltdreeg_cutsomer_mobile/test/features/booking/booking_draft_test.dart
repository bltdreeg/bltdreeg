import 'package:bltdreeg_cutsomer_mobile/features/booking/data/in_memory_booking_draft_repository.dart';
import 'package:bltdreeg_cutsomer_mobile/features/booking/domain/booking_draft.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const haircut = SelectedService(
    id: 'h',
    name: 'قصة شعر',
    durationMinutes: 25,
    price: 70,
  );
  const beard = SelectedService(
    id: 'b',
    name: 'حلاقة دقن',
    durationMinutes: 15,
    price: 50,
  );

  test('toggle adds and removes services, totals follow', () {
    var draft = const BookingDraft(salonId: 's1');
    expect(draft.isEmpty, isTrue);
    draft = draft.toggle(haircut).toggle(beard);
    expect(draft.totalPrice, 120);
    expect(draft.totalMinutes, 40);
    draft = draft.toggle(haircut);
    expect(draft.services, [beard]);
  });

  test('repository streams drafts per salon', () async {
    final repo = InMemoryBookingDraftRepository();
    final updates = repo.watch('s1').take(2).toList();
    repo
      ..save(const BookingDraft(salonId: 's2').toggle(beard))
      ..save(const BookingDraft(salonId: 's1').toggle(haircut));
    final seen = await updates;
    expect(seen.first.isEmpty, isTrue);
    expect(seen.last.services, [haircut]);
    expect(repo.draftFor('s2').services, [beard]);
  });
}
