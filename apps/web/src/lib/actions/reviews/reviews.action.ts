// أفعال التقييمات على السيرفر — قراءة فقط حالياً
"use server";

import { reviews } from "@/lib/data/reviews.constants";
import type { Review } from "@/lib/types/review";

export async function getShopReviews(shopId: string): Promise<Review[]> {
  return reviews.filter((r) => r.shopId === shopId);
}
