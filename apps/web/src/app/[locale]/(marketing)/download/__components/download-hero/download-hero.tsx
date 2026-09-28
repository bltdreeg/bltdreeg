"use client";

// الهيرو — بطاقة أساسية حسب جهاز الزائر وبطاقة تانية باهتة. الكشف تلميح مش قفل: المتجرين الاتنين ظاهرين دايماً.

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getAppName } from "@/lib/data/constants/app.constants";
import {
  ANDROID_APP_SIZE_MB,
  ANDROID_MIN_VERSION,
  IOS_APP_SIZE_MB,
  IOS_MIN_VERSION,
} from "@/lib/data/constants/app.constants";
import { StoreButton, StoreIcon, STORE_LABEL, STORE_URL, type Store } from "../store-assets";
import { useDetectedStore } from "../use-detected-store";

const REQUIREMENT: Record<Store, { platform: string; version: string; size: number }> = {
  ios: { platform: "iOS", version: IOS_MIN_VERSION, size: IOS_APP_SIZE_MB },
  android: { platform: "Android", version: ANDROID_MIN_VERSION, size: ANDROID_APP_SIZE_MB },
};

const DEVICE_LABEL: Record<Store, string> = {
  ios: "iPhone",
  android: "Android",
};

function DownloadHero() {
  const t = useTranslations("marketing.download");
  const locale = useLocale();
  const detected = useDetectedStore();
  const [overridden, setOverridden] = useState(false);

  // من غير كشف (ديسكتوب أو جهاز مش معروف) بنرجع للترتيب الافتراضي من غير شريط
  const primary: Store = overridden ? (detected === "ios" ? "android" : "ios") : (detected ?? "ios");
  const secondary: Store = primary === "ios" ? "android" : "ios";
  const showDetectedBar = detected !== null;

  return (
    <section className="bg-background">
      {showDetectedBar && (
        <div className="border-b border-border bg-muted">
          <div className="mx-auto flex max-w-328 flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-3 text-center text-sm font-semibold text-muted-foreground md:px-16">
            <svg
              className="size-4 shrink-0 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
            <span>
              {t.rich(detected === "ios" ? "detected.ios" : "detected.android", {
                strong: (chunks) => <strong className="font-extrabold text-foreground">{chunks}</strong>,
              })}
            </span>
            <button
              type="button"
              onClick={() => setOverridden((v) => !v)}
              className="h-9 rounded-full border border-border px-3.5 text-xs font-bold text-foreground transition-colors hover:bg-background"
            >
              {t("detected.change")}
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-328 flex-col items-center px-4 pt-12 pb-4 md:px-16 md:pt-14">
        {/* العنوان */}
        <div className="flex max-w-190 flex-col items-center gap-3.5 text-center">
          <span className="inline-flex h-8 items-center gap-2 rounded-full border border-tint-border bg-tint px-3.5 text-[13px] font-bold text-primary">
            <span className="size-1.75 rounded-full bg-success" />
            {t("badge")}
          </span>
          <h1 className="text-[30px] font-black leading-[1.3] tracking-tight text-foreground md:text-[46px] md:leading-tight">
            {t.rich("title", {
              appName: getAppName(locale),
              brand: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h1>
          <p className="max-w-155 text-[15px] leading-[1.8] text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
        </div>

        {/* البطاقتين */}
        <div className="mt-10 grid w-full max-w-295 gap-5 md:mt-11 md:grid-cols-2 md:items-stretch">
          {/* الأساسية */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-tint-border bg-tint p-6 md:p-8 md:pb-0">
            <div className="flex h-6 items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-pressed">
                <StoreIcon store={primary} tone="color" className="size-4 shrink-0" />
                {t("yourDevice", { device: DEVICE_LABEL[primary] })}
              </span>
              <span className="inline-flex h-6 items-center rounded-md bg-primary px-2.5 text-[11px] font-extrabold text-primary-foreground">
                {t("primaryBadge")}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground md:min-h-11 md:text-[28px]">
              {t("appTitle")}
            </h2>
            <p className="mt-2 text-sm leading-[1.75] text-primary-pressed md:min-h-[50px]">
              {t("appDescription")}
            </p>

            <StoreButton
              store={primary}
              label={STORE_LABEL[primary]}
              prefix={t("downloadOn")}
              className="mt-3 w-full"
            />

            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary-pressed">
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4.5M12 16h.01" />
              </svg>
              {t("requirement", REQUIREMENT[primary])}
            </p>

            <QueuePreview className="mt-6 hidden md:flex" />
          </div>

          {/* التانية */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-muted p-6 md:p-8 md:pb-0">
            <span className="inline-flex h-6 items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <StoreIcon store={secondary} tone="color" className="size-4 shrink-0" />
              {t("otherDevice", { store: STORE_LABEL[secondary] })}
            </span>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground md:min-h-11 md:text-[28px]">
              {t("sameApp", { store: STORE_LABEL[secondary] })}
            </h2>
            <p className="mt-2 text-sm leading-[1.75] text-muted-foreground md:min-h-[50px]">
              {t("sameAppDescription")}
            </p>

            <StoreButton
              store={secondary}
              label={STORE_LABEL[secondary]}
              prefix={t("downloadOn")}
              variant="secondary"
              className="mt-3 w-full"
            />

            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <svg
                className="size-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4.5M12 16h.01" />
              </svg>
              {t("requirement", REQUIREMENT[secondary])}
            </p>

            <SalonListPreview className="mt-6 hidden md:flex" />
          </div>
        </div>

        {/* مفيش تطبيق ديسكتوب */}
        <p className="mt-7 flex max-w-155 items-center justify-center gap-2.5 text-center text-[13.5px] font-semibold text-muted-foreground">
          <svg
            className="hidden size-4 shrink-0 sm:block"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8" />
          </svg>
          {t("noDesktop")}
        </p>
      </div>
    </section>
  );
}

/** لقطة شاشة متابعة الدور — زخرفة، مخفية عن قارئ الشاشة */
function QueuePreview({ className = "" }: { className?: string }) {
  const t = useTranslations("marketing.home.appDownload.mockup");
  return (
    <div className={`mt-auto justify-center ${className}`} aria-hidden>
      <div className="flex h-49 w-51.5 flex-col gap-2 overflow-hidden rounded-t-[30px] border-[6px] border-b-0 border-foreground bg-background px-3 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-foreground">{t("front.headerTitle")}</span>
          <span className="rounded-full bg-success-bg px-1.5 py-0.5 text-[8px] font-black text-success-strong">
            {t("front.live")}
          </span>
        </div>
        <div className="rounded-xl border border-tint-border bg-tint p-2.5 text-center">
          <div className="text-[9px] font-bold text-primary-pressed">{t("front.queueNumberLabel")}</div>
          <div className="text-[34px] font-black leading-[1.1] text-primary">4</div>
          <span className="inline-block rounded-full border border-tint-border bg-background px-2 py-0.5 text-[8.5px] font-black text-primary-pressed">
            {t("front.peopleAhead", { count: 3 })}
          </span>
        </div>
        <div className="flex gap-0.5">
          <span className="h-1 flex-1 rounded-full bg-primary" />
          <span className="h-1 flex-1 rounded-full bg-border" />
          <span className="h-1 flex-1 rounded-full bg-border" />
        </div>
      </div>
    </div>
  );
}

/** لقطة قائمة الصالونات — باهتة عشان تاخد وزن أقل من الأساسية */
function SalonListPreview({ className = "" }: { className?: string }) {
  const t = useTranslations("marketing.home.appDownload.mockup");
  const locale = useLocale();
  return (
    <div className={`mt-auto justify-center opacity-55 ${className}`} aria-hidden>
      <div className="flex h-42.5 w-51.5 flex-col gap-2 overflow-hidden rounded-t-[30px] border-[6px] border-b-0 border-muted-foreground bg-background px-3 pt-3">
        <div className="text-[10px] font-black text-foreground">{t("back.sectionTitle")}</div>
        <div className="rounded-[10px] border border-border p-2">
          <div className="truncate text-[9.5px] font-black text-foreground">{t("demoSalonName")}</div>
          <div className="text-[8px] font-semibold text-muted-foreground">
            {t("back.availableNow")} · {locale === "en" ? "0.8 km" : "٠.٨ كم"}
          </div>
        </div>
        <div className="rounded-[10px] border border-border p-2">
          <div className="truncate text-[9.5px] font-black text-foreground">{t("back.demoAreaShort")}</div>
          <div className="text-[8px] font-semibold text-muted-foreground">
            {t("front.peopleAhead", { count: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}

export { DownloadHero, STORE_URL };
