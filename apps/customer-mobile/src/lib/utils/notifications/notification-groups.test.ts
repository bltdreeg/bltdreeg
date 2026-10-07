import assert from "node:assert/strict";
import { test } from "node:test";
import type { AppNotification } from "../../types/notification/app-notification.interface.ts";
import { groupNotifications } from "./notification-groups.ts";

const now = new Date(2026, 9, 7, 12).getTime();
const n = (id: string, hoursAgo: number): AppNotification => ({ id, kind: "offer", title: "", body: "", createdAt: new Date(now - hoursAgo * 3_600_000).toISOString(), isRead: false, bookingId: null, salonId: null });

test("groups by age, newest first, skips empty groups", () => {
  const groups = groupNotifications([n("old", 24 * 9), n("week", 24 * 2), n("today2", 3), n("today1", 1)], now);
  assert.deepEqual(groups.map(([g, items]) => [g, items.map((x) => x.id)]), [["today", ["today1", "today2"]], ["thisWeek", ["week"]], ["earlier", ["old"]]]);
  assert.deepEqual(groupNotifications([n("a", 13)], now).map(([g]) => g), ["thisWeek"]); // yesterday evening
});
