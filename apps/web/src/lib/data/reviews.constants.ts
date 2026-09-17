// بيانات تجريبية: التقييمات
import type { Review } from "@/lib/types/review";

export const reviews: Review[] = [
  { id: "rv-1", shopId: "shop-1", authorName: "محمد", rating: 5, comment: "ملتزمين بالمواعيد والقصة ممتازة", createdAt: "2026-09-10T18:00:00.000Z" },
  { id: "rv-2", shopId: "shop-1", authorName: "عمر", rating: 4, comment: "المكان نضيف بس الانتظار كان 10 دقايق", createdAt: "2026-09-08T16:30:00.000Z" },
  { id: "rv-3", shopId: "shop-2", authorName: "يوسف", rating: 5, comment: "أحسن دقن اتعملتلي", createdAt: "2026-09-05T20:00:00.000Z" },
];
