import assert from "node:assert/strict";
import { test } from "node:test";
import { mapBranchDetail, mapBranchFeedPage, mapNearbyBranchesPage, toBranchFeedParams } from "./branch-mapper.ts";

const origin = {
  governorate: { id: "EG01", name: "القاهرة" },
  city: { id: "EG0111", name: "قصر النيل" },
  lat: 30.044,
  lng: 31.236,
  source: "ip" as const,
};

test("maps a laravel page to camelCase", () => {
  const page = mapNearbyBranchesPage({
    data: [
      {
        id: 7,
        name: "فرع المعادي",
        address: null,
        salon: { id: 3, name: "Salon X" },
        city: { id: "EG0111", name: "قصر النيل" },
        lat: 30.0444,
        lng: 31.2357,
        distance_km: 1.4,
        cover_image_url: null,
        maps_url: "https://maps.app.goo.gl/x",
      },
    ],
    meta: { current_page: 1, last_page: 3, per_page: 12, total: 30, origin },
  });

  assert.deepEqual(page.items[0], {
    id: "7",
    name: "فرع المعادي",
    address: null,
    salon: { id: "3", name: "Salon X" },
    city: { id: "EG0111", name: "قصر النيل" },
    lat: 30.0444,
    lng: 31.2357,
    distanceKm: 1.4,
    coverImageUrl: null,
    mapsUrl: "https://maps.app.goo.gl/x",
  });
  assert.equal(page.page, 1);
  assert.equal(page.lastPage, 3);
  assert.equal(page.total, 30);
  assert.equal(page.origin.source, "ip");
});

test("maps a feed item with price and services", () => {
  const page = mapBranchFeedPage({
    data: [
      {
        id: 1,
        name: "Downtown",
        address: "1 Main Street",
        salon: { id: 2, name: "Bloom" },
        city: { id: "EG0111", name: "Qasr Al-Nile" },
        lat: 30.04,
        lng: 31.23,
        distance_km: 0.1,
        cover_image_url: null,
        maps_url: null,
        price_from: 25,
        currency: "EGP",
        services: ["Haircut"],
        is_new: true,
      },
    ],
    meta: { current_page: 1, last_page: 1, per_page: 12, total: 1, origin },
  });

  assert.equal(page.items[0].id, "1");
  assert.equal(page.items[0].priceFrom, 25);
  assert.deepEqual(page.items[0].services, ["Haircut"]);
  assert.equal(page.items[0].isNew, true);
  assert.equal(page.total, 1);
});

test("maps a branch detail with grouped services", () => {
  const detail = mapBranchDetail({
    id: 4,
    name: "Old Town",
    address: null,
    phone: "0100",
    maps_url: null,
    lat: 30,
    lng: 31,
    distance_km: null,
    salon: { id: 2, name: "Bloom", website: null },
    city: { id: "EG0111", name: "Qasr Al-Nile" },
    governorate: { id: "EG01", name: "Cairo" },
    cover_image_url: "https://x/cover.jpg",
    images: ["https://x/cover.jpg"],
    currency: "EGP",
    price_from: 60,
    service_categories: [
      { id: null, name: null, services: [{ id: 9, name: "Trim", description: null, duration_minutes: 20, price: 60 }] },
    ],
  });

  assert.equal(detail.id, "4");
  assert.equal(detail.salon.id, "2");
  assert.equal(detail.distanceKm, null);
  assert.deepEqual(detail.serviceCategories[0], {
    id: null,
    name: null,
    services: [{ id: "9", name: "Trim", description: null, durationMinutes: 20, price: 60 }],
  });
});

test("feed params drop empty filters and the default sort", () => {
  assert.deepEqual(toBranchFeedParams({ q: "  ", sort: "nearest" }), {});
  assert.deepEqual(toBranchFeedParams({ q: " قص ", cityId: "EG0111", maxPrice: 0, sort: "price" }), {
    q: "قص",
    city_id: "EG0111",
    max_price: 0,
    sort: "price",
  });
  assert.deepEqual(toBranchFeedParams({ maxPrice: Number.NaN, governorateId: "EG01" }), { governorate_id: "EG01" });
});
