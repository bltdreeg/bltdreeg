// منطق صفحة الصالون من غير واجهة (بيتختبر بـ node): ترتيب المواعيد، الأيام الفاضلة، فلتر التقييمات، إجمالي الخدمات
import type { DayHours, SalonReview } from "@/lib/types/salon";

const DAY_MS = 86_400_000;
const startOfDay = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

/** كام يوم من النهارده لليوم ده (0 = النهارده، 1 = بكرة) */
export const daysFromToday = (iso: string, now: number) => Math.round((startOfDay(Date.parse(iso)) - startOfDay(now)) / DAY_MS);

/** المواعيد ٧ أيام بادئة بالنهارده (فريم 23) */
export function hoursFromToday(hours: DayHours[], now: number): (DayHours & { today: boolean })[] {
  const today = new Date(now).getDay();
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const weekday = (today + i) % 7;
    const h = hours.find((x) => x.weekday === weekday) ?? { weekday, opensAt: null, closesAt: null };
    return { ...h, today: i === 0 };
  });
}

/** دقايق من نص الليل → ISO للنهارده بالساعة دي (25×60 = ١ ص) عشان fmt.hour */
export function timeOfDayIso(minutes: number, now: number): string {
  const d = new Date(now);
  d.setHours(0, minutes % 1440, 0, 0);
  return d.toISOString();
}

export type ReviewFilter = { kind: "all" } | { kind: "five" } | { kind: "photos" } | { kind: "barber"; barberId: string };

export function filterReviews(reviews: SalonReview[], f: ReviewFilter): SalonReview[] {
  switch (f.kind) {
    case "all":
      return reviews;
    case "five":
      return reviews.filter((r) => r.stars === 5);
    case "photos":
      return reviews.filter((r) => r.photoCount > 0);
    case "barber":
      return reviews.filter((r) => r.barberId === f.barberId);
  }
}

export const draftTotal = (services: { price: number }[]) => services.reduce((sum, s) => sum + s.price, 0);
