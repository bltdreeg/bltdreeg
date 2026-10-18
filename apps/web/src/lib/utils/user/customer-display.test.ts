import assert from "node:assert/strict";
import { test } from "node:test";
import { customerFullName, customerInitials } from "./customer-display.ts";

test("full name joins first and last name", () => {
  assert.equal(customerFullName({ firstName: "كريم", lastName: "مصطفى" }), "كريم مصطفى");
});

test("full name skips missing or blank parts", () => {
  assert.equal(customerFullName({ firstName: "Karim", lastName: null }), "Karim");
  assert.equal(customerFullName({ firstName: "  ", lastName: "Mostafa" }), "Mostafa");
  assert.equal(customerFullName({ firstName: null, lastName: null }), "");
});

test("initials take the first letter of each name part", () => {
  assert.equal(customerInitials({ firstName: "كريم", lastName: "مصطفى" }), "ك م");
  assert.equal(customerInitials({ firstName: "karim", lastName: "mostafa" }), "K M");
  assert.equal(customerInitials({ firstName: " karim", lastName: null }), "K");
  assert.equal(customerInitials({ firstName: null, lastName: null }), "");
});
