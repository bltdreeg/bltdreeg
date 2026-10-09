// منطق شاشة الطابور من غير واجهة (بيتختبر بـ node): وقت الحركة، أسماء الشيفت، العدّاد

/** "تتحرك الساعة" (فريم 27): الدور ناقص المشوار. null = اتحرك دلوقتي */
export function leaveAt(waitMinutes: number, travelMinutes: number, now: number): number | null {
  const at = now + (waitMinutes - travelMinutes) * 60_000;
  return at > now ? at : null;
}

/** "أحمد مجدي ومحمود السيد" — زي _joinNames في Flutter: الكل بفاصلة والأخير بـ "و" */
export function joinNames(names: string[], separator: string, two: (a: string, b: string) => string): string {
  if (names.length < 2) return names[0] ?? "";
  return two(names.slice(0, -1).join(separator), names[names.length - 1]);
}

/** عدّاد "حان دورك" زي البورد: ٤:٣٢ (من غير صفر قبل الدقايق) */
export function clock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
