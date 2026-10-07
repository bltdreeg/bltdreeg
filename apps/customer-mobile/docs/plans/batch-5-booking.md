# Batch 5: Booking → queue (frames 24–30)

## Context

The salon's "ادخل الطابور" leads to: when (Flutter "امتى تحب تيجي؟", step 1: now or a day + time) → choose a barber (24) → review (25) → confirmed with a queue number or the appointment (26) → the live queue screen (27 waiting, 28 almost, 29 your turn, or an upcoming appointment), plus the leave / cancel confirmation (30).

**D7 decided by the user (2026-10-07, mid-batch): Flutter's slot step comes before the barber.** The first build followed the board (no slot step); task 5b adds it. The board's "الخطوة ٢ من ٣" on the barber step matches Flutter's numbering (slot = step 1).

The queue moves on its own in the mock, ported from Flutter's `FakeBookingRemoteDataSource`: every 20 s the person at the front finishes. At the front the customer has 5 minutes to check in; "أجّلني واحد" works once; after that the booking is missed. A checked-in service completes after 3 steps.

User approval: standing ("work without waiting for approvals", 2026-10-06).

## Board vs Flutter (goes to GAPS §2e)

| Frame | Difference | Board | Flutter | Outcome |
|---|---|---|---|---|
| — | Step 1 "امتى تحب تيجي؟" | not drawn | now / pick day + time | Flutter (D7 = B, user 2026-10-07) |
| 24 | Steps | "الخطوة ٢ من ٣" | step 2 of 3 (slot = step 1) | Same bar; slot = step 1 |
| 24 | Barber at a slot | not drawn | "فاضي · ٧:٣٠ م" / "مش فاضي في المعاد ده" | Flutter |
| 25 | Time row | none | "المعاد · النهارده … غيّر" | Flutter (D7) |
| 25/26/27 | Scheduled booking | not drawn | slot wait card + policy, "أكّد الحجز", appointment card, upcoming + "الغي الحجز" | Flutter (D7) |
| 25 | Discount line | "باقة قصة + دقن" | "خصم الباقة" | Flutter (offer titles carry prices; one generic label) |
| 26 | After confirming | note says it moves to tracking by itself | stays, "تابع دورك" button | Flutter (the board frame itself draws the button) |
| 29 | Way out | no leave action, no back | quiet "اطلع من الطابور" link | Flutter (otherwise no way out) |
| — | In service / completed / missed / left | not drawn | full-screen states | Flutter |

## Tasks

- [x] **1. Types + mapper:** `lib/types/booking/queue-booking.interface.ts` (`QueueBooking`, `QueueBookingStatus`, `QueueStage`, `AppliedDiscount`) ported from Flutter `booking.dart` (queue fields only). The web `Booking` is a scheduled appointment (startAt, bookingCode) and doesn't fit → GAPS. Raw snake_case + `mapBooking` in `lib/utils/booking/booking-mappers.ts`.
- [x] **2. Pure logic + test:** `lib/utils/booking/booking-pricing.ts`: `quoteBooking(services, offers)` (bundles, a service in one bundle at most), `waitRange(minutes)` (Flutter `WaitEstimate.around`), `queueStage(booking)`, `travelMinutes(km)`, `turnTimeLeft(booking, now)`. One test file.
- [x] **3. Mock:** `bookings.mock.ts`: `POST /bookings` (auth, idempotent by `request_id`, salon closed / already in queue / barber off → 422 with Flutter's codes; joining adds a person to the salon queue), `GET /bookings/:id` (advances the queue by elapsed 20 s steps, like the catalog drift), `POST /bookings/:id/{check-in,postpone,leave}`. Catalog gets `join(id)` / `leave(id)`. Test: join → steps → your turn → postpone → missed; check-in → completed; already in queue; idempotency.
- [x] **4. Data path:** `booking.action.ts` (`confirmBooking`, `getBooking`, `queueAction`); hooks `useBooking(id)` (refetch 5 s while active), `useConfirmBooking()`, `useQueueAction(id)`. Query key `QK_BOOKING`.
- [x] **5. Copy:** `ar.json` `mobile.booking.*` and `mobile.queue.*` (board text; Flutter arb for the rest).
- [x] **6. Barber (24):** `screens/booking-barber/`: step bar, "أي حلاق متاح" card (الأسرع, فوراً / ~N د), named barbers (+N د extra / فوراً / قدامه N; off = faded "مش موجود النهارده"), note, footer → review with `barber` param. Radio group on `@rn-primitives`. States: empty draft → "الحجز لسه مش كامل"; loading; offline / error. Guest → login first (salon bar).
- [x] **7. Review (25):** `screens/booking-review/`: salon header (address, distance + drive minutes), services, barber row with "غيّر" (back), wait card (range, people ahead, duration), policy notice, totals with bundle discount, cash note. Confirm: loading, haptic, clears the draft, replaces the route with confirmed. Errors: offline notice, already in queue (+ "تابع دورك"), barber off (+ "اختار حلاق"), salon closed.
- [x] **8. Confirmed (26):** `screens/booking-confirmed/`: close → home, `queue_joined` illustration, title, salon · area, ticket card (number, ahead, expected), "تابع دورك" + "الاتجاهات", note. Loading / error.
- [x] **9. Queue (27–30):** `screens/queue/`: live badge, ticket card (teal → amber when one is left), `QueueProgress`, stats (expected + leave-at, or distance), "اللي شغّال دلوقتي" card, salon card (directions / call), "افتح الاتجاهات" when almost, move-now banner, leave button → alert dialog (30). Your turn (29): green illustration, countdown, "أنا في المحل", "أجّلني واحد" (once), leave link. In service, completed, missed, cancelled states. Keep awake while active, haptics on stage change, toast for postpone/errors.
- [x] **10. Dialog:** `components/organs/confirm-dialog/` on `@rn-primitives/alert-dialog` (new dep + portal host).
- [x] **5b. Slot step (D7 → Flutter, user 2026-10-07):** `screens/booking-slot/` (now / schedule radio cards, 7 day chips, closed days off, slots by الصبح/بعد الضهر/بالليل in 3 columns, taken = struck; loading / error / closed / full; duration note), `useDaySchedule` + `GET /salons/:id/slots` (mock port of `_schedule`: 30 min steps, 20 min lead, holds, stable "busy" hash, off barbers), `start_at` on confirm (`upcoming`, `slot_taken`, hold, cancel frees it), barber per slot (`start` + `free` params), review time row + slot card/policy/"أكّد الحجز", confirmed appointment card + "حجوزاتي", queue upcoming view + cancel dialog, salon bar → slot. Tests: slot groups, mock slots/hold/cancel.
- [x] **11. GAPS + device checks (emulator-5554) + review + checks**, review summary below.

## Files

| Task | Files |
|---|---|
| 1–2 | `src/lib/types/booking/queue-booking.interface.ts`, `src/lib/utils/booking/{booking-mappers,booking-pricing}.ts` + test |
| 3 | `src/lib/api/mock/bookings.mock.ts` + test, `salons.mock.ts`, `adapter.ts` |
| 4 | `src/lib/actions/booking/booking.action.ts`, `src/lib/hooks/booking/*`, `query-keys.constants.ts` |
| 5 | `src/i18n/messages/ar.json` |
| 5b | `src/screens/booking-slot/*`, `src/lib/hooks/booking/use-booking-labels.hook.ts`, mock + action + hook + types above |
| 6–9 | `src/screens/{booking-barber,booking-review,booking-confirmed,queue}/*` |
| 10 | `src/components/organs/confirm-dialog/*`, `src/app/_layout.tsx`, `package.json` |
| 11 | `GAPS.md` |

## Verification

- `tsc`, lint (0 errors), `pnpm test` (new: pricing, bookings mock).
- Emulator: salon → 2 services → join (guest → login → back) → barber (any preselected; named shows extra minutes; off disabled) → review (range, bundle −٢٠, total ١٠٠) → confirm → confirmed number → track → queue moves by itself (waiting → almost amber + banner → your turn countdown) → postpone once → check in → in service → completed. Leave dialog → left state. Offline on review (confirm blocked) and on the queue (not live). Already in queue error.
- Screenshots: 6 sizes + 140% for barber, review, confirmed, queue (waiting, almost, your turn), dialog.
- One recording of the journey.

## Review summary

**Files:** types/mapper/pricing (`lib/types/booking/queue-booking.interface.ts`, `lib/utils/booking/*`), mock (`lib/api/mock/bookings.mock.ts` + catalog `join/leave`), data path (`lib/actions/booking/booking.action.ts`, `lib/hooks/booking/{use-booking,use-booking-labels}.hook.ts`, `QK_BOOKING`, `QK_SLOTS`), screens (`screens/{booking-slot,booking-barber,booking-review,booking-confirmed,queue}/*`), shared (`organs/booking-step`, `organs/confirm-dialog`, `molecules/toast`, `RadioCard`/`RadioDot`, `SalonThumb`/`salonName`, `utils/external-links.ts`, `fmt.dayMonth/date`, sun/sunset/moon icons), `PortalHost` in `app/_layout.tsx`, `@rn-primitives/alert-dialog` + `portal`, copy in `ar.json` (`mobile.booking.*`, `mobile.queue.*`), salon bar → slot step. Emulator scripts: `steps-booking.sh`, `matrix-booking.sh`.

**Mid-batch decision:** the user chose Flutter's slot step (D7 = B) → task 5b.

**Found and fixed in review / on device:** confirm didn't navigate (mutate callbacks skipped after the draft clear unmounted the footer → `mutateAsync`); address digits; "·" beside ٠ read as a digit (→ "الساعة"); "~N" not isolated; × under the status bar; directions truncated (min width); confirmed title clipped (Android centered text → `alignSelf: stretch`); queue bottom inset; progress label clipped after a weight change (keyed); confirmed CTA below the fold at 320/360 (compact layout on short screens); empty style; `Date.now()` in render (leave-at uses `dataUpdatedAt`).

**Checks:** `tsc` ✅ · lint 0 errors (8 old warnings) · tests 72/72 (pricing, mock queue/slots/holds, slot groups, queue labels). Device: GAPS §9.

**Left open:** barber selection isn't reset when a named barber goes off while the screen is open (server answers `barber_unavailable` → "اختار حلاق"); avatar initials "م ا" vs board "م س"; the live queue is polling (push with the backend); bookings list ("حجوزاتي") is batch 6.
