import assert from "node:assert/strict";
import { test } from "node:test";
import { mapNearbyBranchesPage } from "./branch-mapper.ts";

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
