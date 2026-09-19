import type { User } from "@/lib/types/user/user.interface";

// بيانات تجريبية: كريم مصطفى · 0102 345 6789 · المعادي
export const currentUser: User = {
  id: "user-1",
  name: "كريم مصطفى",
  phone: "01023456789",
  areaId: "maadi",
  joinedDate: "يونيو 2025",
  completedBookingsCount: 12,
  favoriteShopIds: ["shop-2", "shop-1", "shop-5", "shop-16"],
};

export const user = [currentUser];

