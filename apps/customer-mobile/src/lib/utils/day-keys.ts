// أيام كـ "YYYY-MM-DD" بتوقيت الجهاز — خطوة الميعاد، فلتر "متاح في يوم"، ومواعيد الـ mock

export const dayKey = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** n يوم بادئة بالنهارده */
export function nextDays(now: number, n = 7): string[] {
  const d = new Date(now);
  return Array.from({ length: n }, (_, i) => dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i).getTime()));
}

/** نص اليوم (ms) — للتنسيق ولمعرفة اليوم في الأسبوع */
export const dayMs = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d, 12).getTime();
};
