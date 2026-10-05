// نوع المستخدم
export interface User {
  id: string;
  name: string;
  phone: string;
  areaId: string | null;
  joinedDate?: string;
  completedBookingsCount?: number;
  favoriteShopIds?: string[];
}

