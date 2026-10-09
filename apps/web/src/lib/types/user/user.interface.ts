// نوع المستخدم
export interface User {
  id: string;
  name: string;
  phone: string;
  cityId: string | null;
  joinedDate?: string;
  completedBookingsCount?: number;
  favoriteShopIds?: string[];
}

