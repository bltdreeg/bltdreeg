/** "كريم عبد الرحمن" → "ك ع"، "محمود السيد" → "م س" (أول حرف من أول كلمتين، من غير "ال" — زي البورد) */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w.length > 3 && w.startsWith("ال") ? w[2] : w[0]))
    .join(" ");
}
