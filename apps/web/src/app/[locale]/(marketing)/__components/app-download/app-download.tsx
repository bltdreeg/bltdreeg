// حمّل الأبليكيشن — بانر تحميل التطبيق (التصميم الجديد بالموبايلين)

/* ————————— SVG Icons ————————— */

function AppleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.2 12.5c0-2.4 1.95-3.55 2.04-3.61-1.11-1.63-2.84-1.85-3.46-1.88-1.47-.15-2.87.86-3.62.86-.74 0-1.9-.84-3.12-.82-1.6.02-3.08.93-3.9 2.36-1.66 2.88-.42 7.15 1.2 9.49.79 1.14 1.74 2.43 2.98 2.38 1.2-.05 1.65-.77 3.1-.77 1.44 0 1.85.77 3.11.75 1.29-.02 2.1-1.16 2.89-2.31.91-1.33 1.29-2.61 1.31-2.68-.03-.01-2.51-.96-2.53-3.77zM14.1 5.4c.66-.8 1.1-1.9.98-3-.95.04-2.1.63-2.78 1.42-.61.7-1.14 1.83-1 2.9 1.06.08 2.14-.53 2.8-1.32z" />
    </svg>
  );
}

function GooglePlayIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3.6 2.4c-.2.2-.4.6-.4 1.1v17c0 .5.2.9.4 1.1l9.6-9.6L3.6 2.4zM16.8 9.3l-2.4 2.4 2.4 2.4 3-1.7c.9-.5.9-1.3 0-1.8l-3-1.3zM14.4 13.1l-9 9 10.2-5.9-1.2-3.1zm0-2.2l1.2-3.1L5.4 1.9l9 9z" />
    </svg>
  );
}

import { useLocale, useTranslations } from "next-intl";
import { getAppName } from "@/lib/data/constants/app.constants";
import { StoreBadges } from "../store-badges";
import { JourneyDemo } from "./journey-demo";

/* ————————— Main Component ————————— */

function AppDownload() {
  const t = useTranslations("marketing.home.appDownload");
  const locale = useLocale();

  return (
    <section id="download" className="scroll-mt-20 bg-white">
      <div
        className="relative mx-auto grid max-w-[1312px] items-center gap-10 overflow-hidden px-4 max-md:grid-cols-1 md:grid-cols-[1.05fr_1fr] md:px-16"
      >
        {/* ————— النصوص + أزرار المتاجر ————— */}
        <div className="flex flex-col gap-[18px] text-start max-md:order-1 max-md:items-center max-md:text-center md:order-1">
          {/* شارة التوفر */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-tint px-[14px] py-1.5 text-[13px] font-bold text-primary">
            <div className="flex items-center gap-1">
              <GooglePlayIcon className="h-3.5 w-3.5 fill-current" />
              <AppleIcon className="h-3.5 w-3.5 fill-current" />
            </div>
            <span>{t("badge")}</span>
          </div>

          {/* العنوان الرئيسي */}
          <h2 className="text-[38px] font-black leading-[1.25] tracking-tight text-foreground max-md:text-[30px]">
            {t.rich("title", {
              appName: getAppName(locale),
              brand: (chunks) => <span className="inline-block text-primary">{chunks}</span>,
            })}
          </h2>

          {/* الوصف */}
          <p className="max-w-[440px] text-[15.5px] leading-[1.75] text-muted-foreground max-md:max-w-full">
            {t("description")}
          </p>

          {/* أزرار المتاجر */}
          <div className="mt-2.5 flex w-full justify-start border-t border-border pt-4 max-md:justify-center">
            <StoreBadges />
          </div>
        </div>

        {/* ————— رحلة العميل على الموبايل ————— */}
        <div className="flex justify-center max-md:order-2 md:order-2">
          <JourneyDemo />
        </div>
      </div>
    </section>
  );
}

export { AppDownload };

