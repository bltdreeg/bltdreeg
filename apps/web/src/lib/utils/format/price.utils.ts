// تنسيق السعر والمسافة — الأرقام لاتينية في كل حالة، والعملة رقم ثم ج.م
export function formatPrice(egp: number) {
  return `${egp} ج.م`;
}

/** السعر «من» — معلومة مساعدة مش بطل */
export function formatFrom(egp: number) {
  return `من ${formatPrice(egp)}`;
}

export function formatDistance(km: number) {
  return `${km} كم`;
}
