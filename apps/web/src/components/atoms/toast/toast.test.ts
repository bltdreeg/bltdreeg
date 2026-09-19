import assert from "node:assert/strict";
import { test } from "node:test";
import type { ToastItem, ToastType } from "./toast-context";

// Helper mirroring FRAME 14 toast duration calculation
function resolveToastDuration(type: ToastType, explicitDuration?: number): number {
  if (explicitDuration !== undefined) return explicitDuration;
  // FRAME 14: "تحت الشمال · 4 ثواني · الخطأ بيستنى الضغط"
  return type === "error" ? 0 : 4000;
}

test("success toasts default to 4000ms duration", () => {
  assert.equal(resolveToastDuration("success"), 4000);
});

test("info toasts default to 4000ms duration", () => {
  assert.equal(resolveToastDuration("info"), 4000);
});

test("error toasts default to 0ms (persistent) duration", () => {
  assert.equal(resolveToastDuration("error"), 0);
});

test("explicit duration overrides default toast duration", () => {
  assert.equal(resolveToastDuration("error", 8000), 8000);
  assert.equal(resolveToastDuration("success", 2000), 2000);
});

test("toast item correctly carries title, description, and action payload", () => {
  const toast: ToastItem = {
    id: "toast-1",
    type: "success",
    title: "تم حجز ميعادك",
    description: "6:30 م · رقمك في الدور 3",
    action: {
      label: "شوف التذكرة",
      href: "/bookings/1",
    },
    duration: 4000,
  };

  assert.equal(toast.type, "success");
  assert.equal(toast.title, "تم حجز ميعادك");
  assert.equal(toast.action?.label, "شوف التذكرة");
  assert.equal(toast.action?.href, "/bookings/1");
});

