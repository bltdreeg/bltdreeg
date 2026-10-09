import assert from "node:assert/strict";
import { test } from "node:test";
import type { SalonOffer } from "../../types/offer/offer.interface.ts";
import { queueStage, quoteBooking, travelMinutes, turnTimeLeft } from "./booking-pricing.ts";

const bundle = (id: string, serviceIds: string[], price: number): SalonOffer => ({ id, shopId: "s1", kind: "bundle", title: "", price, serviceIds });

test("bundles apply when all their services are picked, each service once", () => {
  const services = [
    { id: "cut", price: 70 },
    { id: "beard", price: 50 },
  ];
  assert.deepEqual(quoteBooking(services, [bundle("o1", ["cut", "beard"], 100)]), { subtotal: 120, discounts: [{ offerId: "o1", amount: 20 }], total: 100 });
  assert.equal(quoteBooking(services, [bundle("o1", ["cut", "beard"], 100), bundle("o2", ["cut"], 60)]).discounts.length, 1);
  assert.equal(quoteBooking([services[0]], [bundle("o1", ["cut", "beard"], 100)]).total, 70);
  assert.equal(quoteBooking(services, [bundle("o1", ["cut", "beard"], 130)]).discounts.length, 0, "no saving, no discount");
});

test("stage, travel time, turn countdown", () => {
  assert.equal(queueStage({ status: "waiting", peopleAhead: 3 }), "waiting");
  assert.equal(queueStage({ status: "waiting", peopleAhead: 1 }), "approaching");
  assert.equal(queueStage({ status: "yourTurn", peopleAhead: 0 }), "yourTurn");
  assert.equal(travelMinutes(0.8), 4);
  assert.equal(travelMinutes(0), 1);
  const start = Date.UTC(2026, 9, 7, 9);
  assert.equal(turnTimeLeft({ turnStartedAt: new Date(start).toISOString() }, start + 28_000), 272_000);
  assert.equal(turnTimeLeft({ turnStartedAt: new Date(start).toISOString() }, start + 400_000), 0);
  assert.equal(turnTimeLeft({ turnStartedAt: null }, start), 0);
});
