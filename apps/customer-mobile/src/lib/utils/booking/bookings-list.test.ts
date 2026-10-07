import assert from "node:assert/strict";
import { test } from "node:test";
import type { QueueBooking } from "../../types/booking/index.ts";
import { splitBookings } from "./bookings-list.ts";

const b = (id: string, status: QueueBooking["status"], createdAt: string, startAt: string | null = null) => ({ id, status, createdAt, startAt }) as QueueBooking;

test("queue first, then appointments soonest first; past newest first", () => {
  const { active, past } = splitBookings([
    b("slot-late", "upcoming", "2026-10-07T08:00:00Z", "2026-10-09T10:00:00Z"),
    b("old", "completed", "2026-09-01T08:00:00Z"),
    b("slot-soon", "upcoming", "2026-10-07T09:00:00Z", "2026-10-08T10:00:00Z"),
    b("queue", "waiting", "2026-10-07T10:00:00Z"),
    b("missed", "missed", "2026-09-20T08:00:00Z"),
    b("left-slot", "cancelled", "2026-09-10T08:00:00Z", "2026-09-25T08:00:00Z"),
  ]);
  assert.deepEqual(active.map((x) => x.id), ["queue", "slot-soon", "slot-late"]);
  assert.deepEqual(past.map((x) => x.id), ["left-slot", "missed", "old"]);
});
