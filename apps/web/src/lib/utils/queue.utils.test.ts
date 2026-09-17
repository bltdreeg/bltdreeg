// اختبار حسابات الدور: الرقم، اللي قدامك، حد التأخير، وحالة أول واحد في الدور
import assert from "node:assert/strict";
import { test } from "node:test";
import { Punctuality } from "../types/queue/punctuality.enum.ts";
import {
  buildQueueStatus,
  computePeopleAhead,
  computePunctuality,
  computeQueueNumber,
  RUNNING_LATE_THRESHOLD_MINUTES,
} from "./queue.utils.ts";

const day = (h: number, m = 0) => `2026-09-17T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`;

test("queue number is 1 + bookings that start earlier the same day", () => {
  const others = [day(17), day(18), day(18, 30), day(19)];
  assert.equal(computeQueueNumber(day(18, 30), others.filter((t) => t !== day(18, 30))), 3);
  assert.equal(computeQueueNumber(day(16), others), 1);
  assert.equal(computeQueueNumber(day(20), others), 5);
});

test("queue number is 1 when nobody else booked", () => {
  assert.equal(computeQueueNumber(day(18), []), 1);
});

test("people ahead never goes negative and hits 0 when it's your turn", () => {
  assert.equal(computePeopleAhead(3, 0), 2);
  assert.equal(computePeopleAhead(3, 2), 0);
  assert.equal(computePeopleAhead(1, 0), 0);
  assert.equal(computePeopleAhead(2, 5), 0);
});

test("running-late threshold is inclusive", () => {
  assert.equal(computePunctuality(0), Punctuality.ON_TIME);
  assert.equal(computePunctuality(RUNNING_LATE_THRESHOLD_MINUTES - 1), Punctuality.ON_TIME);
  assert.equal(computePunctuality(RUNNING_LATE_THRESHOLD_MINUTES), Punctuality.RUNNING_LATE);
  assert.equal(computePunctuality(5, 5), Punctuality.RUNNING_LATE);
});

test("first in line with no delay is on time and it's their turn", () => {
  const status = buildQueueStatus({ id: "b1", startAt: day(18), queueNumber: 1 }, { completedCount: 0, delayMinutes: 0 });
  assert.equal(status.peopleAhead, 0);
  assert.equal(status.isYourTurn, true);
  assert.equal(status.punctuality, Punctuality.ON_TIME);
  assert.equal(status.estimatedStartAt, day(18));
});

test("delay pushes the estimated start and flips punctuality", () => {
  const status = buildQueueStatus({ id: "b2", startAt: day(18), queueNumber: 3 }, { completedCount: 0, delayMinutes: 15 });
  assert.equal(status.peopleAhead, 2);
  assert.equal(status.isYourTurn, false);
  assert.equal(status.punctuality, Punctuality.RUNNING_LATE);
  assert.equal(status.estimatedStartAt, day(18, 15));
});
