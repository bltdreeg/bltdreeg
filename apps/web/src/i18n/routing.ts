// إعداد اللغات والمسارات: العربية هي الافتراضية، والإنجليزية متاحة كخيار
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // بدون هذا، next-intl بيوجّه حسب لغة المتصفح — إحنا عايزين عربي دايمًا
  // كافتراضي، والإنجليزي بس لما المستخدم يختاره صراحة من اللغة.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
