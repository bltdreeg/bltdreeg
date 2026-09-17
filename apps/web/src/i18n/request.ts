// تحميل الرسائل لكل طلب حسب اللغة
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { ar } from "./ar";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: ar };
});
