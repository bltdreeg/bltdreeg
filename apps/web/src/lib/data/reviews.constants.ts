// بيانات تجريبية: التقييمات
import type { Review } from "@/lib/types/review";

export const reviews: Review[] = [
  {
    id: "rv-1",
    shopId: "shop-1",
    authorName: "محمد",
    rating: 5,
    comment: "ملتزمين بالمواعيد والقصة ممتازة",
    createdAt: "2026-09-10T18:00:00.000Z",
  },
  {
    id: "rv-2",
    shopId: "shop-1",
    authorName: "عمر",
    rating: 4,
    comment: "المكان نضيف بس الانتظار كان 10 دقايق",
    createdAt: "2026-09-08T16:30:00.000Z",
  },

  // shop-2 — بربر لاونج المعادي — الأربع تقييمات من FRAME 04
  {
    id: "rv-3",
    shopId: "shop-2",
    authorName: "يوسف حسني",
    rating: 5,
    comment:
      "كريم بيفهم الشكل اللي أنا عايزه من أول مرة. حجزت 7:15 ودخلت 7:20، يعني تقريبًا مفيش انتظار. السعر غالي شوية بس الشغل نضيف.",
    createdAt: "2026-09-12T19:15:00.000Z",
    barberName: "كريم مصطفى",
    serviceName: "قص شعر بالمقص",
  },
  {
    id: "rv-4",
    shopId: "shop-2",
    authorName: "عمرو طلعت",
    rating: 4,
    comment:
      "المكان نضيف والتكييف شغال، ودي حاجة مهمة في الصيف. خدوني بعد ميعادي بعشر دقايق بس التطبيق كان قالي إنهم متأخرين فمشيت متأخر من البيت.",
    createdAt: "2026-09-08T17:00:00.000Z",
    barberName: "أحمد مجدي",
    serviceName: "قص شعر بالماكينة",
  },
  {
    id: "rv-5",
    shopId: "shop-2",
    authorName: "طارق صابر",
    rating: 3,
    comment:
      "الحلاقة كانت عادية، طلبت تحديد الدقن خفيف وطلع أقصر من اللي طلبته. الدور كان ماشي مظبوط على الأقل، ومحصلش تأخير.",
    createdAt: "2026-08-30T18:00:00.000Z",
    barberName: "أحمد مجدي",
    serviceName: "تحديد دقن",
  },
  {
    id: "rv-6",
    shopId: "shop-2",
    authorName: "هاني فؤاد",
    rating: 5,
    comment:
      "بقيت بحجز هنا كل أسبوعين. أهم حاجة إنهم مابيزوّدوش حد في الدور على المزاج، الرقم اللي بيطلعلك هو اللي بتلاقيه فعلًا لما توصل.",
    createdAt: "2026-08-21T18:00:00.000Z",
    barberName: "محمود عبد العال",
    serviceName: "قص شعر + تحديد دقن",
  },
];

export function reviewsByShop(shopId: string): Review[] {
  return reviews.filter((r) => r.shopId === shopId);
}
