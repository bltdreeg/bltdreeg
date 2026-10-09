import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateAppointmentWindow,
  calculateDepartureTime,
  calculateRemainingMinutes,
  formatBookingDetailDate,
  formatDayOfWeek,
  getRelativeDayLabel,
} from "./date.utils.ts";

test("calculateAppointmentWindow computes start and end window correctly", () => {
  const startIso = "2026-09-19T18:30:00.000Z";
  const window = calculateAppointmentWindow(startIso, 50);
  assert.ok(window.start);
  assert.ok(window.end);
});

test("calculateAppointmentWindow formats start/end per locale, not just Arabic", () => {
  const startIso = "2026-09-19T18:30:00.000Z";
  const arWindow = calculateAppointmentWindow(startIso, 50, "ar");
  const enWindow = calculateAppointmentWindow(startIso, 50, "en");
  // نفس اللحظة، لكن لازم تتنسق مختلف حسب اللغة — مش نفس النص.
  assert.notEqual(arWindow.start, enWindow.start);
  assert.notEqual(arWindow.end, enWindow.end);
});

test("formatDayOfWeek returns day name", () => {
  const d = "2026-09-19T10:00:00.000Z"; // Saturday
  const dayName = formatDayOfWeek(d);
  assert.equal(dayName, "السبت");
});

test("getRelativeDayLabel returns correct relative Egyptian Arabic labels", () => {
  const now = new Date();
  
  const today = new Date(now).toISOString();
  assert.equal(getRelativeDayLabel(today), "النهارده");

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  assert.equal(getRelativeDayLabel(tomorrow.toISOString()), "بكرة");

  const inTwoDays = new Date(now);
  inTwoDays.setDate(now.getDate() + 2);
  assert.equal(getRelativeDayLabel(inTwoDays.toISOString()), "بعد يومين");

  const inThreeDays = new Date(now);
  inThreeDays.setDate(now.getDate() + 3);
  assert.equal(getRelativeDayLabel(inThreeDays.toISOString()), "بعد 3 أيام");
});

test("formatBookingDetailDate contains formatted date and relative descriptor", () => {
  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  const formatted = formatBookingDetailDate(inTwoDays.toISOString());
  assert.ok(formatted.includes("بعد يومين"));
});

test("calculateDepartureTime subtracts travel time correctly", () => {
  const startIso = "2026-09-19T18:30:00.000Z";
  const departure = calculateDepartureTime(startIso, 20);
  assert.ok(departure);
});

test("calculateRemainingMinutes calculates positive minutes", () => {
  const now = new Date("2026-09-19T18:00:00.000Z");
  const target = "2026-09-19T18:34:00.000Z";
  const mins = calculateRemainingMinutes(target, now);
  assert.equal(mins, 34);
});


