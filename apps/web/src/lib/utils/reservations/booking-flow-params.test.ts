import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingStep, parseBookingSelection, toBookingQuery } from "./booking-flow-params.ts";

const parse = (query: string) => parseBookingSelection(new URLSearchParams(query));

test("services only → barber step", () => {
  const selection = parse("service=1&service=2&service=1");
  assert.deepEqual(selection, { serviceIds: ["1", "2"], chairId: null, when: null, slotId: null });
  assert.equal(bookingStep(selection), "barber");
});

test("chair picked → when step", () => {
  assert.equal(bookingStep(parse("service=1&chair=3")), "when");
});

test("join now or a slot → review", () => {
  assert.deepEqual(parse("service=1&chair=3&when=now"), { serviceIds: ["1"], chairId: "3", when: "join_now", slotId: null });
  assert.deepEqual(parse("service=1&chair=3&when=slot&slot=8"), { serviceIds: ["1"], chairId: "3", when: "slot", slotId: "8" });
  assert.equal(bookingStep(parse("chair=3&when=now")), "review");
});

test("incomplete or inconsistent params fall back a step", () => {
  assert.equal(parse("chair=3&when=slot").when, null);
  assert.equal(parse("when=now").when, null);
  assert.equal(parse("chair=3&when=now&slot=8").slotId, null);
});

test("serializes and round-trips", () => {
  const query = toBookingQuery({ serviceIds: ["1", "2"], chairId: "3", when: "slot", slotId: "8" });
  assert.equal(query, "service=1&service=2&chair=3&when=slot&slot=8");
  assert.deepEqual(parse(query), { serviceIds: ["1", "2"], chairId: "3", when: "slot", slotId: "8" });
  assert.equal(toBookingQuery({ serviceIds: ["1"], chairId: null, when: "join_now", slotId: null }), "service=1");
});
