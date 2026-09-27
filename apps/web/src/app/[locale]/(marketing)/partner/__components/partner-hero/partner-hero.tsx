// هيرو صفحة الشراكة — قرار واحد: سجّل صالونك. ومعاه لقطة من لوحة الصالون عشان اللي بيقرأ يشوف بيشتغل إزاي.

import { useLocale, useTranslations } from "next-intl";
import { getAppName } from "@/lib/data/constants/app.constants";
import { EXTERNAL_SALON_REGISTER } from "@/lib/data/constants/routes.constants";

/** أرقام الديمو في لقطة اللوحة — زخرفة، مش بيانات حقيقية */
const QUEUE = [
  { key: "one", time: "4:10", state: "onChair" },
  { key: "two", time: "4:35", state: "waiting" },
  { key: "three", time: "4:50", state: "waiting" },
  { key: "four", time: "5:15", state: "booked" },
] as const;

function PartnerHero() {
  const t = useTranslations("marketing.partner");
  const locale = useLocale();

  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-328 items-center gap-10 px-4 pt-12 pb-14 md:grid-cols-[1.05fr_1fr] md:gap-16 md:px-16 md:pt-14 md:pb-16">
        {/* النصوص */}
        <div className="flex flex-col gap-4.5">
          <span className="inline-flex h-8 w-fit items-center gap-2 rounded-full border border-tint-border bg-tint px-3.5 text-[13px] font-bold text-primary">
            <svg
              className="size-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {t("badge")}
          </span>

          <h1 className="text-[30px] font-black leading-[1.3] tracking-tight text-foreground md:text-[46px] md:leading-tight">
            {t.rich("title", {
              appName: getAppName(locale),
              brand: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h1>

          <p className="max-w-120 text-[15px] leading-[1.8] text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={EXTERNAL_SALON_REGISTER}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-extrabold text-primary-foreground transition-colors hover:bg-primary-pressed"
            >
              {t("cta.register")}
              <svg
                className="size-4.5 shrink-0 rtl:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#how"
              className="inline-flex h-13 items-center justify-center rounded-xl border border-border px-6 text-base font-bold text-foreground transition-colors hover:bg-muted"
            >
              {t("cta.how")}
            </a>
          </div>

          {/* الأرقام */}
          <dl className="mt-3.5 grid grid-cols-3 gap-4 border-t border-border pt-5">
            <div>
              <dt className="text-xs font-bold text-muted-foreground md:text-[12.5px]">{t("stats.commissionLabel")}</dt>
              <dd className="tabular mt-1 text-xl font-black text-foreground md:text-[26px]">
                {t("stats.commissionValue")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground md:text-[12.5px]">{t("stats.activationLabel")}</dt>
              <dd className="tabular mt-1 text-xl font-black text-foreground md:text-[26px]">
                {t("stats.activationValue")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground md:text-[12.5px]">{t("stats.monthlyLabel")}</dt>
              <dd className="mt-1 text-xl font-black text-success md:text-[26px]">{t("stats.monthlyValue")}</dd>
            </div>
          </dl>
        </div>

        {/* لقطة لوحة الصالون */}
        <PanelPreview />
      </div>
    </section>
  );
}

/** لقطة من لوحة الصالون — زخرفة توضيحية، مخفية عن قارئ الشاشة */
function PanelPreview() {
  const t = useTranslations("marketing.partner.panel");

  return (
    <div className="flex justify-center" aria-hidden>
      <div className="w-full max-w-140 overflow-hidden rounded-3xl border border-border bg-background shadow-lg">
        {/* شريط اللوحة */}
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-4.5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6.5 items-center justify-center rounded-md bg-primary text-[13px] font-black text-primary-foreground">
              {t("mark")}
            </span>
            <span className="text-[13.5px] font-extrabold text-foreground">{t("title")}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-[11.5px] font-extrabold text-success-strong">
            <span className="size-1.75 rounded-full bg-success" />
            {t("open")}
          </span>
        </div>

        {/* ملخص اليوم */}
        <div className="grid grid-cols-3 gap-3 p-4.5">
          <div className="rounded-xl border border-tint-border bg-tint p-3.5">
            <div className="tabular text-2xl font-black text-primary">{t("todayValue")}</div>
            <div className="mt-0.5 text-[11.5px] font-bold text-primary-pressed">{t("todayLabel")}</div>
          </div>
          <div className="rounded-xl border border-border bg-muted p-3.5">
            <div className="tabular text-2xl font-black text-foreground">{t("queueValue")}</div>
            <div className="mt-0.5 text-[11.5px] font-bold text-muted-foreground">{t("queueLabel")}</div>
          </div>
          <div className="rounded-xl border-0 bg-warning-bg p-3.5">
            <div className="tabular text-2xl font-black text-warning-fg">{t("delayValue")}</div>
            <div className="mt-0.5 text-[11.5px] font-bold text-warning-fg">{t("delayLabel")}</div>
          </div>
        </div>

        {/* الدور */}
        <div className="flex flex-col gap-2.5 px-4.5 pb-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-extrabold text-foreground">{t("currentQueue")}</span>
            <span className="text-xs font-bold text-primary">{t("viewAll")}</span>
          </div>

          {QUEUE.map(({ key, time, state }, i) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5"
            >
              <span className="tabular flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[12.5px] font-extrabold text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-extrabold text-foreground">{t(`rows.${key}.name`)}</div>
                <div className="mt-0.5 truncate text-[11.5px] font-semibold text-muted-foreground">
                  {t(`rows.${key}.service`)}
                </div>
              </div>
              <span className="tabular shrink-0 text-[13px] font-extrabold text-foreground">{time}</span>
              <span className="hidden shrink-0 rounded-full bg-tint px-2.5 py-1 text-[11px] font-extrabold text-primary-pressed sm:inline">
                {t(`state.${state}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { PartnerHero };
