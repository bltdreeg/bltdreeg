// نوع التقييم
export interface Review {
  id: string;
  shopId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
}
