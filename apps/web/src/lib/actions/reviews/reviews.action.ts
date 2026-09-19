// أفعال التقييمات على السيرفر — قراءة فقط حالياً
"use server";

import { reviewsByShop } from "@/lib/data/reviews.constants";
import type { Review } from "@/lib/types/review";

export async function getShopReviews(shopId: string): Promise<Review[]> {
  return reviewsByShop(shopId);
}
