import assert from "node:assert/strict";
import { test } from "node:test";
import { dayKey } from "../../utils/day-keys.ts";
import { mapBooking } from "../../utils/booking/booking-mappers.ts";
import { createBookings, QUEUE_STEP_MS } from "./bookings.mock.ts";
import { MockHttpError } from "./router.ts";
import { createSalonDetails } from "./salon-details.mock.ts";
import { createCatalog } from "./salons.mock.ts";

function setup() {
  const clock = { now: Date.UTC(2026, 9, 7, 9) };
  const catalog = createCatalog(() => clock.now, () => 0.5); // 0.5 = الطابور مابيتحركش من نفسه
  const store = createBookings(catalog, createSalonDetails(catalog, () => clock.now), () => clock.now);
  const step = (n = 1) => (clock.now += n * QUEUE_STEP_MS);
  return { clock, catalog, store, step };
}

const ruleCode = (code: string) => (e: unknown) => e instanceof MockHttpError && e.body.code === `booking.${code}`;
const join = (store: ReturnType<typeof createBookings>, body: Record<string, unknown> = {}) =>
  store.confirm({ request_id: "r1", salon_id: "s3", service_ids: ["s3-haircut", "s3-beard"], barber_id: null, ...body });

test("join adds you to the salon queue; it moves every step until your turn", () => {
  const { catalog, store, step } = setup();
  const b = join(store);
  assert.deepEqual([b.status, b.ticket_number, b.people_ahead], ["waiting", 3, 2]);
  assert.equal(catalog.salon("s3")!.queue.people_ahead, 3);
  step();
  assert.deepEqual([store.get(b.id).people_ahead, store.get(b.id).wait_minutes], [1, 8]);
  step();
  const turn = store.get(b.id);
  assert.equal(turn.status, "yourTurn");
  assert.ok(turn.turn_started_at);
});

test("no-show: postponed once after 5 minutes, then missed", () => {
  const { store, step } = setup();
  const b = join(store);
  step(2);
  step(15);
  const late = store.get(b.id);
  assert.deepEqual([late.status, late.people_ahead, late.postpone_used], ["waiting", 1, true]);
  step();
  assert.equal(store.get(b.id).status, "yourTurn");
  step(15);
  assert.equal(store.get(b.id).status, "missed");
  assert.throws(() => store.postpone(b.id), ruleCode("finished"));
});

test("check in → in service → completed after 3 steps; postpone only once", () => {
  const { store, step } = setup();
  const b = join(store);
  assert.throws(() => store.checkIn(b.id), ruleCode("not_your_turn"));
  step(2);
  store.postpone(b.id);
  step();
  assert.throws(() => store.postpone(b.id), ruleCode("postpone_used"));
  assert.equal(store.checkIn(b.id).status, "inService");
  assert.throws(() => store.leave(b.id), ruleCode("finished"));
  step(2);
  assert.equal(store.get(b.id).status, "inService");
  step();
  assert.equal(store.get(b.id).status, "completed");
});

test("rules: one queue at a time, same request id → same booking, closed salon, barber off", () => {
  const { store } = setup();
  const b = join(store);
  assert.equal(join(store).id, b.id, "retrying the same request doesn't join twice");
  assert.throws(() => join(store, { request_id: "r2", salon_id: "s1", service_ids: ["s1-haircut"] }), (e) => ruleCode("already_in_queue")(e) && (e as MockHttpError).body.data?.booking_id === b.id);
  store.leave(b.id);
  assert.throws(() => join(store, { request_id: "r3", salon_id: "s8", service_ids: ["s8-haircut"] }), ruleCode("salon_closed"));
  assert.throws(() => join(store, { request_id: "r4", salon_id: "s1", service_ids: ["s1-haircut"], barber_id: "s1-b3" }), ruleCode("barber_unavailable"));
});

test("named barber: his own queue; bundle discount; nobody ahead → your turn at once", () => {
  const { store } = setup();
  const named = join(store, { salon_id: "s1", service_ids: ["s1-haircut", "s1-beard"], barber_id: "s1-b1" });
  assert.deepEqual([named.people_ahead, named.barber_name, named.subtotal, named.discounts[0].amount], [2, "أحمد مجدي", 120, 20]);
  store.leave(named.id);
  const free = join(store, { request_id: "r2", salon_id: "s1", service_ids: ["s1-haircut"], barber_id: "s1-b2" });
  assert.deepEqual([free.status, free.ticket_number], ["yourTurn", 1]);
});

test("slots follow the salon hours and lead time; a confirmed slot is held; cancel frees it", () => {
  const { clock, catalog, store } = setup();
  const tomorrow = dayKey(clock.now + 86_400_000);
  const day = store.schedule("s1", tomorrow, 40);
  assert.ok(day.slots.length > 0);
  // ٣٠ دقيقة بين كل ميعاد، والأخير لازم يخلص قبل القفل
  assert.equal(Date.parse(day.slots[1].start) - Date.parse(day.slots[0].start), 30 * 60_000);
  const today = store.schedule("s1", dayKey(clock.now), 40);
  assert.ok(today.slots.every((s) => Date.parse(s.start) >= clock.now + 20 * 60_000));

  const slot = day.slots.find((s) => s.free_barber_ids.includes("s1-b2"))!;
  const body = { request_id: "slot1", salon_id: "s1", service_ids: ["s1-haircut", "s1-beard"], barber_id: "s1-b2", start_at: slot.start };
  const queueBefore = catalog.salon("s1")!.queue.people_ahead;
  const b = store.confirm(body);
  assert.deepEqual([b.status, b.start_at, b.ticket_number], ["upcoming", slot.start, 0]);
  assert.equal(catalog.salon("s1")!.queue.people_ahead, queueBefore); // الميعاد مش في الطابور
  const after = store.schedule("s1", tomorrow, 40).slots.find((s) => s.start === slot.start)!;
  assert.ok(!after.free_barber_ids.includes("s1-b2"));
  assert.throws(() => store.confirm({ ...body, request_id: "slot2" }), ruleCode("slot_taken"));
  // ميعاد مايمنعش الطابور
  assert.equal(join(store).status, "waiting");

  assert.equal(store.leave(b.id).status, "cancelled");
  assert.ok(store.schedule("s1", tomorrow, 40).slots.find((s) => s.start === slot.start)!.free_barber_ids.includes("s1-b2"));
});

test("off barber has no slots before he returns", () => {
  const { clock, store } = setup();
  const today = store.schedule("s1", dayKey(clock.now), 25);
  assert.ok(today.slots.every((s) => !s.free_barber_ids.includes("s1-b3")));
});

test("my bookings: seeded history + new booking", () => {
  const { store } = setup();
  assert.deepEqual(store.mine().map((b) => [b.id, b.status, b.rating]), [
    ["bk-past-1", "completed", null],
    ["bk-past-2", "completed", 5],
    ["bk-past-3", "missed", null],
  ]);
  join(store);
  assert.equal(store.mine().length, 4);
});

test("rating: completed only, once; quoted vs actual wait for frame 31", () => {
  const { store, step } = setup();
  const b = join(store);
  assert.throws(() => store.rate(b.id, { overall: 4 }), ruleCode("not_completed"));
  step(2);
  store.checkIn(b.id);
  step(3);
  const done = mapBooking(store.get(b.id));
  assert.deepEqual([done.quotedWaitMinutes, done.actualWaitMinutes], [b.wait_minutes, Math.round((2 * QUEUE_STEP_MS) / 60_000)]);
  assert.equal(store.rate(b.id, { overall: 4 }).rating, 4);
  assert.throws(() => store.rate(b.id, { overall: 5 }), ruleCode("already_rated"));
  const seeded = mapBooking(store.get("bk-past-1"));
  assert.deepEqual([seeded.quotedWaitMinutes, seeded.actualWaitMinutes], [20, 25]);
});
