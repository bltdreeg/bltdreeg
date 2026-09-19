// نوع التقييم
export interface Review {
  id: string;
  shopId: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  /** الحلاق اللي اتقيّم — بيتعرض جنب اسم العميل */
  barberName?: string;
  /** الخدمة اللي اتقيّمت */
  serviceName?: string;
}
