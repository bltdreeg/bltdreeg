// إعداد اللغات والمسارات: عربي فقط حالياً
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar"],
  defaultLocale: "ar",
});

export type Locale = (typeof routing.locales)[number];
