import assert from "node:assert/strict";
import { test } from "node:test";
import {
  groupSlotsByDay,
  isActiveReservation,
  isCancellable,
  mapBranchBarbers,
  mapChairSlots,
  mapReservation,
  toCreateReservationBody,
  type RawReservation,
} from "./reservation-mapper.ts";

const raw: RawReservation = {
  id: 12,
  type: "join_now",
  status: "queued",
  join_time: "2026-10-18T14:00:00+00:00",
  slot: null,
  branch: {
    id: 1,
    name: "Downtown",
    address: null,
    phone: "0100",
    maps_url: null,
    lat: 30,
    lng: 31,
    cover_image_url: null,
    salon: { id: 3, name: "Bloom" },
  },
  chair_id: 4,
  barber: { id: 5, name: "Karim", photo_url: null },
  services: [{ service_id: 9, name: "Haircut", price: 100, duration_minutes: 30 }],
  total_price: 100,
  total_duration_minutes: 30,
  currency: "EGP",
  position: { people_ahead: 2, expected_wait_minutes: 40, is_your_turn: false, in_service: false },
  created_at: null,
  cancel_at: null,
  started_at: null,
  served_at: null,
};

test("maps a reservation with its live position", () => {
  const reservation = mapReservation(raw);
  assert.equal(reservation.id, "12");
  assert.equal(reservation.chairId, "4");
  assert.equal(reservation.branch.salon.id, "3");
  assert.deepEqual(reservation.barber, { id: "5", name: "Karim", photoUrl: null });
  assert.deepEqual(reservation.services[0], { serviceId: "9", name: "Haircut", price: 100, durationMinutes: 30 });
  assert.deepEqual(reservation.position, { peopleAhead: 2, expectedWaitMinutes: 40, isYourTurn: false, inService: false });
});

test("a booked slot has no position yet", () => {
  const reservation = mapReservation({
    ...raw,
    type: "slot",
    status: "booked",
    join_time: null,
    slot: { id: 7, starts_at: "2026-10-19T15:00:00+00:00" },
    position: null,
  });
  assert.equal(reservation.position, null);
  assert.deepEqual(reservation.slot, { id: "7", startsAt: "2026-10-19T15:00:00+00:00" });
});

test("maps barbers and slots", () => {
  const barbers = mapBranchBarbers({
    branch: { id: 1, name: "Downtown", is_open: true },
    data: [
      {
        chair_id: 2,
        barber: { id: 3, name: "Karim", photo_url: null },
        can_join_now: true,
        queue: { people_in_queue: 1, expected_wait_minutes: 30 },
      },
    ],
  });
  assert.equal(barbers.branch.isOpen, true);
  assert.deepEqual(barbers.barbers[0].queue, { peopleInQueue: 1, expectedWaitMinutes: 30 });

  assert.deepEqual(mapChairSlots({ data: [{ id: 8, starts_at: "x", day: "2026-10-19", time: "18:00", remaining: 1 }] }), [
    { id: "8", startsAt: "x", day: "2026-10-19", time: "18:00", remaining: 1 },
  ]);
});

test("builds the create body for each type", () => {
  assert.deepEqual(toCreateReservationBody({ type: "join_now", chairId: "4", serviceIds: ["9", "10"] }), {
    type: "join_now",
    chair_id: 4,
    service_ids: [9, 10],
  });
  assert.deepEqual(toCreateReservationBody({ type: "slot", slotId: "7", serviceIds: ["9"] }), {
    type: "slot",
    slot_id: 7,
    service_ids: [9],
  });
});

test("status helpers", () => {
  assert.equal(isActiveReservation("in_service"), true);
  assert.equal(isActiveReservation("served"), false);
  assert.equal(isCancellable("booked"), true);
  assert.equal(isCancellable("in_service"), false);
});

test("groups slots by day in order", () => {
  const slot = (id: string, day: string) => ({ id, startsAt: "", day, time: "10:00", remaining: 1 });
  assert.deepEqual(
    groupSlotsByDay([slot("1", "2026-10-18"), slot("2", "2026-10-18"), slot("3", "2026-10-19")]).map((g) => [
      g.day,
      g.slots.map((s) => s.id),
    ]),
    [
      ["2026-10-18", ["1", "2"]],
      ["2026-10-19", ["3"]],
    ],
  );
});
