import assert from "node:assert/strict";
import { test } from "node:test";
import { isEgyptianMobile, showPhoneError } from "./phone-field.utils.ts";

test("valid egyptian mobiles: 11 digits starting 010/011/012/015", () => {
  for (const p of ["01023456789", "01123456789", "01223456789", "01523456789", "٠١٠٢٣٤٥٦٧٨٩"]) assert.ok(isEgyptianMobile(p), p);
  for (const p of ["01323456789", "0102345678", "010234567890", "11023456789", ""]) assert.ok(!isEgyptianMobile(p), p);
});

test("inline error timing follows Flutter", () => {
  assert.equal(showPhoneError("", true), false);
  assert.equal(showPhoneError("0102", false), false); // still typing a valid prefix
  assert.equal(showPhoneError("013", false), true); // prefix can't become valid
  assert.equal(showPhoneError("2", false), true);
  assert.equal(showPhoneError("010234567", true), true); // left the field incomplete
  assert.equal(showPhoneError("01023456789", true), false);
});
