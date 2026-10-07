import assert from "node:assert/strict";
import { test } from "node:test";
import { fmt, localizeDigits } from "./number-format.utils.ts";

test("arabic uses arabic-indic digits with a latin decimal point", () => {
  const f = fmt("ar");
  assert.equal(f.rating(4.8), "٤.٨");
  assert.equal(f.price(70), "٧٠ ج.م");
  assert.equal(f.distance(0.8), "٠.٨ كم");
  assert.equal(f.distance(2), "٢ كم");
  assert.equal(f.minutes(15, true), "١٥ د");
  assert.equal(f.countdown(38), "٠٠:٣٨");
  assert.equal(localizeDigits("فاضل 2 أنفار", "ar"), "فاضل ٢ أنفار");
  assert.equal(f.phone("01023456789"), "⁦٠١٠٢ ٣٤٥ ٦٧٨٩⁩");
});

test("english keeps western digits", () => {
  const f = fmt("en");
  assert.equal(f.price(70), "70 EGP");
  assert.equal(f.distance(1.25), "1.3 km");
  assert.equal(f.countdown(272), "04:32");
  assert.equal(f.count(214), "214");
});
