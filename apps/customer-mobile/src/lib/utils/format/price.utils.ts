// تنسيق السعر والمسافة — الأرقام لاتينية في كل حالة
export function formatPrice(egp: number, locale = "ar") {
  return locale === "en" ? `${egp} EGP` : `${egp} ج.م`;
}

/** السعر «من» — معلومة مساعدة مش بطل */
export function formatFrom(egp: number, locale = "ar") {
  return locale === "en" ? `From ${formatPrice(egp, locale)}` : `من ${formatPrice(egp, locale)}`;
}

export function formatDistance(km: number, locale = "ar") {
  return locale === "en" ? `${km} km` : `${km} كم`;
}

