"use client";

// رحلة العميل — موبايل واحد بيعرض الخطوات بالتتابع: اختار صالون ← أكّد ← تابع لايف ← حان دورك

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getAppName } from "@/lib/data/constants/app.constants";
import { formatDistance, formatFrom, formatPrice } from "@/lib/utils/format/price.utils";

/** شريط الحالة العلوي الواقعي للآيفون مع Dynamic Island */
function PhoneStatusBar() {
  return (
    <div
      className="relative z-20 flex w-full select-none items-center justify-between bg-white px-5 pt-2.5 pb-1"
      style={{ direction: "ltr" }}
    >
      {/* الوقت */}
      <span className="text-[11.5px] font-extrabold tracking-tight text-[#0E0F11]">
        9:41
      </span>

      {/* جزيرة ديناميكية واقعية */}
      <div
        className="flex items-center justify-between rounded-full bg-black px-2"
        style={{ width: 72, height: 18 }}
      >
        <div
          className="rounded-full"
          style={{ width: 6, height: 6, background: "#111827", border: "1px solid #1F2937" }}
        />
        <div
          className="rounded-full"
          style={{ width: 3, height: 3, background: "#10B981" }}
        />
      </div>

      {/* أيقونات النظام: شبكة + واي فاي + بطارية */}
      <div className="flex items-center gap-1 text-[#0E0F11]">
        <svg width="11" height="9" viewBox="0 0 16 12" fill="currentColor">
          <rect x="0" y="8" width="2.8" height="4" rx="0.8" />
          <rect x="4.2" y="5.5" width="2.8" height="6.5" rx="0.8" />
          <rect x="8.4" y="3" width="2.8" height="9" rx="0.8" />
          <rect x="12.6" y="0" width="2.8" height="12" rx="0.8" />
        </svg>
        <svg width="10" height="9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.28 19.64 10.59 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
        </svg>
        <div className="flex items-center gap-[1px]">
          <div
            className="flex items-center rounded-[3px] border-[1.5px] border-[#0E0F11] p-[1px]"
            style={{ width: 17, height: 9 }}
          >
            <div className="h-full rounded-[1px] bg-[#0E0F11]" style={{ width: "85%" }} />
          </div>
          <div className="rounded-r-xs bg-[#0E0F11]" style={{ width: 1, height: 3 }} />
        </div>
      </div>
    </div>
  );
}

type MockupT = ReturnType<typeof useTranslations>;

/** متابعة الدور الحية (فريم ٢٧ في mobile.html) — `ahead` بينزل من ٣ لـ ١ */
function TrackingScreen({ t, locale, ahead }: { t: MockupT; locale: string; ahead: number }) {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden font-[Cairo]"
      dir={locale === "en" ? "ltr" : "rtl"}
      style={{ padding: "4px 12px 10px" }}
    >
      {/* Header bar */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center justify-center rounded-lg bg-white"
            style={{ width: 26, height: 26, border: "1px solid #E5E7EB", color: "#0E0F11" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
          <span className="text-[13.5px] font-black text-[#0E0F11]">{t("front.headerTitle")}</span>
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{ background: "#E7F4EA", border: "1px solid #CBE7D3" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
          </span>
          <span className="text-[9.5px] font-black text-[#15803D]">{t("front.live")}</span>
        </div>
      </div>

      {/* بطاقة رقم الدور الرئيسية (FRAME 27) */}
      <div
        className="mb-2 rounded-2xl text-center"
        style={{
          background: "#E6F0EF",
          border: "1px solid #D3E5E3",
          padding: "9px 10px 8px",
        }}
      >
        <div className="text-[10.5px] font-bold text-[#0B5A54]">{t("front.queueNumberLabel")}</div>
        <div className="my-0.5 font-[Cairo] text-[46px] font-black leading-[1.02] text-[#0F766E]">
          4
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5"
          style={{ border: "1px solid #D3E5E3" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0B5A54" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8.5" r="3.2" />
            <path d="M3.5 19c.7-3.2 2.9-4.8 5.5-4.8s4.8 1.6 5.5 4.8" />
            <path d="M16 5.6a3.2 3.2 0 0 1 0 6" />
            <path d="M17.5 14.6c1.8.5 3 2 3.4 4.4" />
          </svg>
          <span className="text-[10.5px] font-black text-[#0B5A54]">{t("front.peopleAhead", { count: ahead })}</span>
        </div>
      </div>

      {/* خطوات التقدم في الطابور */}
      <div className="mb-2 px-0.5">
        <div className="mb-1 flex gap-1">
          {[3, 2, 1, 0].map((n) => (
            <span
              key={n}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${n >= ahead ? "bg-[#0F766E]" : "bg-[#E5E7EB]"}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[9px] font-bold">
          <span className="text-[#0F766E]">{t("front.stepJoined")}</span>
          <span className="text-[#6B7280]">{t("front.stepApproaching")}</span>
          <span className="text-[#6B7280]">{t("front.stepNow")}</span>
        </div>
      </div>

      {/* كارت الوقت والتحرك */}
      <div
        className="mb-2 flex items-center justify-between rounded-xl px-2.5 py-1.5 text-center"
        style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}
      >
        <div className="flex-1">
          <div className="text-[8.5px] font-bold text-[#6B7280]">{t("front.estimatedTimeLabel")}</div>
          <div className="text-[13.5px] font-black leading-tight text-[#0E0F11]">{t("front.estimatedTimeValue", { minutes: ahead * 9 + 1 })}</div>
        </div>
        <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />
        <div className="flex-1">
          <div className="text-[8.5px] font-bold text-[#6B7280]">{t("front.leaveAtLabel")}</div>
          <div className="text-[13.5px] font-black leading-tight text-[#0E0F11]" style={{ direction: "ltr" }}>10:05</div>
        </div>
      </div>

      {/* كارت الصالون والشيفت */}
      <div
        className="mb-2 rounded-xl bg-white p-2"
        style={{ border: "1px solid #E5E7EB" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex shrink-0 items-center justify-center rounded-lg"
            style={{ width: 30, height: 30, background: "#E6F0EF", color: "#0F766E" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 9.5V20h16V9.5" />
              <path d="M3 9.5 5 4h14l2 5.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-black text-[#0E0F11]">
              {t("demoSalonName")}
            </div>
            <div className="text-[8.5px] font-semibold text-[#6B7280]">
              {t("front.serviceLine")} • {formatPrice(100, locale)}
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex gap-1.5">
          <div className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#E5E7EB] bg-[#F7F8FA] py-1 text-[9px] font-bold text-[#0E0F11]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
            <span>{t("front.directions")}</span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-1 rounded-md border border-[#E5E7EB] bg-[#F7F8FA] py-1 text-[9px] font-bold text-[#0E0F11]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{t("front.call")}</span>
          </div>
        </div>
      </div>

      {/* زر الخروج من الطابور */}
      <div
        className="flex items-center justify-center rounded-lg text-[9.5px] font-bold text-[#EF4444]"
        style={{ border: "1px solid #F3CFCF", height: 26, background: "#FFFBFB" }}
      >
        {t("front.leaveQueue")}
      </div>
    </div>
  );
}

/** الرئيسية / اكتشف الصالونات (فريم ٠٧ في mobile.html) — `picked` بيعلّم الكارت كأنه اتداس */
function HomeScreen({ t, tNav, locale, picked }: { t: MockupT; tNav: MockupT; locale: string; picked: boolean }) {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden font-[Cairo]"
      dir={locale === "en" ? "ltr" : "rtl"}
      style={{ padding: "4px 11px 8px" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[8px] font-semibold text-[#6B7280]">{t("back.nearYou")}</div>
          <div className="flex items-center gap-1 text-[11px] font-black text-[#0E0F11]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.4">
              <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
            <span className="truncate max-w-[130px]">{t("back.demoArea")}</span>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        <div
          className="relative flex items-center justify-center rounded-lg bg-white"
          style={{ width: 26, height: 26, border: "1px solid #E5E7EB" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E0F11" strokeWidth="2">
            <path d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" />
            <path d="M10 19a2.2 2.2 0 0 0 4 0" />
          </svg>
          <span className="absolute top-1 left-1 h-1.5 w-1.5 rounded-full border border-white bg-[#EF4444]" />
        </div>
      </div>

      {/* حقل البحث */}
      <div
        className="mb-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5"
        style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4.5 4.5" />
        </svg>
        <span className="text-[9px] font-semibold text-[#9CA3AF]">{t("back.searchPlaceholder")}</span>
      </div>

      {/* شرائح الفلترة */}
      <div className="mb-2 flex items-center gap-1 overflow-hidden">
        <div
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-bold text-white"
          style={{ background: "#0F766E" }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 1.8" />
          </svg>
          <span>{t("back.filterShortestWait")}</span>
        </div>
        <div
          className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[8.5px] font-bold text-[#0E0F11]"
          style={{ border: "1px solid #E5E7EB" }}
        >
          {t("back.filterNearest")}
        </div>
      </div>

      {/* عنوان القسم */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-black text-[#0E0F11]">{t("back.sectionTitle")}</span>
        <span className="text-[9px] font-extrabold text-[#0F766E]">{t("back.viewAll")}</span>
      </div>

      {/* كارت الصالون المتاح */}
      <div
        className={`mb-2 overflow-hidden rounded-xl bg-white transition-[box-shadow,transform] duration-300 ${picked ? "scale-[0.97] ring-2 ring-[#0F766E]/40" : ""}`}
        style={{ border: "1px solid #E5E7EB" }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ height: 56, background: "#F1F5F9", borderBottom: "1px solid #E5E7EB" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8">
            <path d="M4 9.5V20h16V9.5" />
            <path d="M3 9.5 5 4h14l2 5.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
          </svg>
          <div
            className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full bg-white/95 px-1.5 py-0.5"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            <span className="text-[8px] font-black text-[#15803D]">{t("back.availableNow")}</span>
          </div>
        </div>

        <div className="p-1.5">
          <div className="truncate text-[11px] font-black text-[#0E0F11]">
            {t("demoSalonName")}
          </div>
          <div className="text-[8.5px] font-semibold text-[#6B7280]">{t("back.demoAreaShort")} • {formatDistance(0.8, locale)}</div>
          <div className="mt-0.5 flex items-center justify-between">
            <div className="flex items-center gap-0.5 text-[8.5px] font-black text-[#D97706]">
              <span>★</span>
              <span>4.8</span>
              <span className="font-normal text-[#9CA3AF]">(214)</span>
            </div>
            <div className="text-[9px] font-extrabold text-[#0F766E]">{formatFrom(70, locale)}</div>
          </div>
        </div>
      </div>

      {/* شريط التنقل السفلي */}
      <div
        className="mt-auto mb-1 flex items-center justify-around rounded-xl bg-[#F7F8FA] py-1 text-center"
        style={{ border: "1px solid #E5E7EB" }}
      >
        <div className="flex flex-col items-center text-[#0F766E]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5.5 9.5V20h13V9.5" />
          </svg>
          <span className="text-[7.5px] font-black">{tNav("home")}</span>
        </div>
        <div className="flex flex-col items-center text-[#6B7280]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
            <path d="M3.5 9.5h17M8 3v4M16 3v4" />
          </svg>
          <span className="text-[7.5px] font-semibold">{tNav("bookings")}</span>
        </div>
        <div className="flex flex-col items-center text-[#6B7280]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4.5 4.5" />
          </svg>
          <span className="text-[7.5px] font-semibold">{tNav("search")}</span>
        </div>
        <div className="flex flex-col items-center text-[#6B7280]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20c.9-4 3.8-6 7.5-6s6.6 2 7.5 6" />
          </svg>
          <span className="text-[7.5px] font-semibold">{tNav("account")}</span>
        </div>
      </div>
    </div>
  );
}

/** صفحة الصالون والخدمات (فريم ٢١) — `added` عدد الخدمات اللي اتزوّدت */
function SalonScreen({ t, locale, added }: { t: MockupT; locale: string; added: number }) {
  const services = [
    { key: "haircut", label: t("salon.haircut"), min: 25, price: 70 },
    { key: "beard", label: t("salon.beard"), min: 15, price: 50 },
    { key: "haircutWash", label: t("salon.haircutWash"), min: 35, price: 90 },
  ];
  const total = services.slice(0, added).reduce((sum, s) => sum + s.price, 0);

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden font-[Cairo]"
      dir={locale === "en" ? "ltr" : "rtl"}
    >
      {/* معرض الصور */}
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ height: 96, background: "#F1F5F9", borderBottom: "1px solid #E5E7EB" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.6">
          <rect x="3" y="6" width="18" height="14" rx="2.5" />
          <circle cx="12" cy="13" r="3.4" />
          <path d="M8 6l1.4-2h5.2L16 6" />
        </svg>
        <div className="absolute bottom-1.5 flex gap-1 ltr:left-3 rtl:right-3">
          <span className="h-1 w-3.5 rounded-full bg-[#6B7280]" />
          <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
          <span className="h-1 w-1 rounded-full bg-[#E5E7EB]" />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-3 pt-2">
        <div className="text-[14px] font-black">{t("demoSalonName")}</div>
        <div className="mt-0.5 flex items-center gap-1 text-[8.5px] font-semibold text-[#6B7280]">
          <span className="font-black text-[#D97706]">★ 4.8</span>
          <span>{t("salon.reviews", { count: 214 })}</span>
          <span>• {t("back.demoAreaShort")}</span>
          <span>• {formatDistance(0.8, locale)}</span>
        </div>

        {/* حالة الطابور */}
        <div className="mt-2 flex items-center gap-2 rounded-xl px-2.5 py-1.5" style={{ background: "#E7F4EA" }}>
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />
          <div className="min-w-0">
            <div className="text-[10.5px] font-black text-[#15803D]">{t("salon.openNow")}</div>
            <div className="truncate text-[8.5px] font-semibold text-[#2E7D46]">{t("salon.openSub")}</div>
          </div>
        </div>

        {/* تابات */}
        <div className="mt-2 flex gap-3 border-b border-[#E5E7EB] text-[9.5px]">
          <span className="border-b-2 border-[#0F766E] pb-1.5 font-black text-[#0F766E]">{t("salon.tabServices")}</span>
          <span className="pb-1.5 font-semibold text-[#6B7280]">{t("salon.tabBarbers")}</span>
          <span className="pb-1.5 font-semibold text-[#6B7280]">{t("salon.tabOffers")}</span>
        </div>

        {/* الخدمات */}
        <div className="mt-1.5 min-h-0 flex-1 overflow-hidden">
          <div className="text-[8.5px] font-bold text-[#6B7280]">{t("salon.groupHair")}</div>
          {services.map((s, i) => {
            const on = i < added;
            return (
              <div key={s.key} className="flex items-center gap-2 border-b border-[#E5E7EB] py-1.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10.5px] font-bold">{s.label}</div>
                  <div className="text-[8px] font-semibold text-[#6B7280]">{t("salon.minutes", { count: s.min })}</div>
                </div>
                <span className="text-[10.5px] font-black">{formatPrice(s.price, locale)}</span>
                <span
                  className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg text-[13px] font-black transition-colors duration-300 ${on ? "bg-[#0F766E] text-white" : "border-[1.5px] border-[#0F766E] bg-white text-[#0F766E]"}`}
                >
                  {on ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  ) : (
                    "+"
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* شريط سفلي ثابت */}
        <div className="-mx-3 mt-auto flex items-center gap-2 border-t border-[#E5E7EB] bg-white px-3 pt-2 pb-2">
          <div className="shrink-0">
            <div className="text-[8px] font-semibold text-[#6B7280]">{t("salon.selectedCount", { count: added })}</div>
            <div className="text-[12px] font-black">{formatPrice(total, locale)}</div>
          </div>
          <div className="flex h-8 flex-1 items-center justify-center rounded-lg bg-[#0F766E] text-[10.5px] font-black text-white">
            {t("salon.joinQueue")}
          </div>
        </div>
      </div>
    </div>
  );
}

/** اختيار الحلاق (فريم ٢٤) — `picked` بيوضّح إن "أي حلاق متاح" مختار */
function BarberScreen({ t, locale, picked }: { t: MockupT; locale: string; picked: boolean }) {
  const named = [
    { key: "ahmed", initials: "أ", name: t("barber.ahmedName"), skill: t("barber.ahmedSkill"), rate: "4.9", wait: t("barber.ahmedWait"), sub: t("barber.ahmedAhead"), warn: true },
    { key: "mahmoud", initials: "م", name: t("barber.mahmoudName"), skill: t("barber.mahmoudSkill"), rate: "4.6", wait: t("barber.now"), sub: t("barber.mahmoudFree"), warn: false },
  ];

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden font-[Cairo]"
      dir={locale === "en" ? "ltr" : "rtl"}
      style={{ padding: "4px 12px 12px" }}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <div
          className="flex items-center justify-center rounded-lg bg-white"
          style={{ width: 26, height: 26, border: "1px solid #E5E7EB" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ltr:rotate-180">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
        <span className="text-[13.5px] font-black">{t("barber.title")}</span>
      </div>

      <div className="flex gap-1">
        <span className="h-1 flex-1 rounded-full bg-[#0F766E]" />
        <span className="h-1 flex-1 rounded-full bg-[#0F766E]" />
        <span className="h-1 flex-1 rounded-full bg-[#E5E7EB]" />
      </div>
      <div className="mt-1.5 text-[8.5px] font-semibold text-[#6B7280]">{t("barber.stepOf", { step: 2, total: 3 })}</div>

      {/* أي حلاق متاح — مختار افتراضياً */}
      <div
        className={`mt-3 rounded-xl p-3 transition-[border-color,background-color] duration-300 ${picked ? "border-2 border-[#0F766E] bg-[#E6F0EF]" : "border border-[#E5E7EB] bg-white"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`h-[15px] w-[15px] shrink-0 rounded-full bg-white transition-[border-width] duration-300 ${picked ? "border-[5px] border-[#0F766E]" : "border-[1.8px] border-[#E5E7EB]"}`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11.5px] font-black text-[#0B5A54]">{t("barber.anyBarber")}</span>
              <span className="rounded bg-[#0F766E] px-1.5 py-px text-[8px] font-black text-white">{t("barber.fastest")}</span>
            </div>
            <div className="mt-0.5 truncate text-[8.5px] font-semibold text-[#0B5A54]">{t("barber.anyBarberSub")}</div>
          </div>
          <div className="shrink-0 text-center">
            <div className="text-[10px] font-black text-[#15803D]">{t("barber.now")}</div>
            <div className="text-[8px] font-semibold text-[#2E7D46]">{t("barber.noQueue")}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-[8.5px] font-bold text-[#6B7280]">{t("barber.orByName")}</div>

      {named.map((b) => (
        <div key={b.key} className="mt-2 flex items-center gap-2 rounded-xl bg-white p-2.5" style={{ border: "1px solid #E5E7EB" }}>
          <span className="h-[15px] w-[15px] shrink-0 rounded-full border-[1.8px] border-[#E5E7EB]" />
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-[#6B7280]"
            style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}
          >
            {b.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[10.5px] font-bold">{b.name}</span>
              <span className="shrink-0 text-[9px] font-black text-[#D97706]">★ {b.rate}</span>
            </div>
            <div className="truncate text-[8.5px] font-semibold text-[#6B7280]">{b.skill}</div>
          </div>
          <div className="shrink-0 text-center">
            <div className={`text-[10px] font-black ${b.warn ? "text-[#B45309]" : "text-[#15803D]"}`}>{b.wait}</div>
            <div className="text-[8px] font-semibold text-[#6B7280]">{b.sub}</div>
          </div>
        </div>
      ))}

      <div className="mt-auto flex h-9 items-center justify-center rounded-lg bg-[#0F766E] text-[11px] font-black text-white">
        {t("barber.next")}
      </div>
    </div>
  );
}

/** راجع الحجز (فريم ٢٥) — `pressed` بيدوس زرار التأكيد */
function ReviewScreen({ t, locale, pressed }: { t: MockupT; locale: string; pressed: boolean }) {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden font-[Cairo]"
      dir={locale === "en" ? "ltr" : "rtl"}
      style={{ padding: "4px 12px 12px" }}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <div
          className="flex items-center justify-center rounded-lg bg-white"
          style={{ width: 26, height: 26, border: "1px solid #E5E7EB" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ltr:rotate-180">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
        <span className="text-[13.5px] font-black">{t("review.title")}</span>
      </div>

      <div className="mb-2.5 flex gap-1">
        <span className="h-1 flex-1 rounded-full bg-[#0F766E]" />
        <span className="h-1 flex-1 rounded-full bg-[#0F766E]" />
        <span className="h-1 flex-1 rounded-full bg-[#0F766E]" />
      </div>

      {/* الصالون */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
        <div
          className="flex shrink-0 items-center justify-center rounded-lg"
          style={{ width: 34, height: 34, background: "#F1F5F9", color: "#94A3B8" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 9.5V20h16V9.5" />
            <path d="M3 9.5 5 4h14l2 5.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="truncate text-[11.5px] font-black">{t("demoSalonName")}</div>
          <div className="text-[8.5px] font-semibold text-[#6B7280]">
            {t("back.demoAreaShort")} • {formatDistance(0.8, locale)}
          </div>
        </div>
      </div>

      {/* الخدمات والحلاق */}
      {[
        [t("review.haircut"), formatPrice(70, locale)],
        [t("review.beard"), formatPrice(50, locale)],
        [t("review.barberLabel"), t("review.anyBarber")],
      ].map(([label, value]) => (
        <div key={label} className="flex items-center justify-between border-b border-[#E5E7EB] py-1.5 text-[10px]">
          <span className="font-bold">{label}</span>
          <span className="font-extrabold">{value}</span>
        </div>
      ))}

      {/* الوقت المتوقع */}
      <div className="mt-2 rounded-xl px-2.5 py-2" style={{ background: "#E6F0EF" }}>
        <div className="text-[11px] font-black text-[#0B5A54]">{t("review.eta", { min: 10, max: 15 })}</div>
        <div className="mt-0.5 text-[9px] font-semibold text-[#0B5A54]">{t("review.etaSub", { count: 1 })}</div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[12px] font-black">
        <span>{t("review.total")}</span>
        <span>{formatPrice(100, locale)}</span>
      </div>

      <div
        className={`mt-auto flex h-9 items-center justify-center rounded-lg text-[11px] font-black text-white transition-[transform,background-color] duration-200 ${pressed ? "scale-95 bg-[#0B5A54]" : "bg-[#0F766E]"}`}
      >
        {t("review.confirm")}
      </div>
    </div>
  );
}

/** حان دورك (فريم ٢٩) — `secondsLeft` عدّاد الحضور */
function TurnScreen({ t, locale, secondsLeft }: { t: MockupT; locale: string; secondsLeft: number }) {
  const countdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden font-[Cairo]"
      dir={locale === "en" ? "ltr" : "rtl"}
      style={{ padding: "4px 12px 12px" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13.5px] font-black">{t("front.headerTitle")}</span>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{ background: "#E7F4EA", border: "1px solid #CBE7D3" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
          <span className="text-[9.5px] font-black text-[#15803D]">{t("front.live")}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-[#16A34A] px-3 py-4 text-center text-white">
        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </div>
        <div className="text-[20px] font-black leading-tight">{t("turn.title")}</div>
        <div className="mt-1 text-[10px] font-semibold opacity-90">{t("turn.sub")}</div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl py-2" style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}>
          <div className="text-[8.5px] font-bold text-[#6B7280]">{t("turn.numberLabel")}</div>
          <div className="text-[20px] font-black leading-tight text-[#0F766E]">4</div>
        </div>
        <div className="rounded-xl py-2" style={{ background: "#F7F8FA", border: "1px solid #E5E7EB" }}>
          <div className="text-[8.5px] font-bold text-[#6B7280]">{t("turn.remainingLabel")}</div>
          <div className="tabular text-[20px] font-black leading-tight" style={{ direction: "ltr" }}>{countdown}</div>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-white p-2" style={{ border: "1px solid #E5E7EB" }}>
        <div className="truncate text-[11px] font-black">{t("demoSalonName")}</div>
        <div className="text-[8.5px] font-semibold text-[#6B7280]">
          {t("front.serviceLine")} • {formatPrice(100, locale)}
        </div>
      </div>

      <div className="mt-auto flex h-9 items-center justify-center rounded-lg bg-[#0F766E] text-[11px] font-black text-white">
        {t("turn.arrived")}
      </div>
    </div>
  );
}

/* ————————— الرحلة ————————— */

const TICK_MS = 1200;
const STEPS = ["discover", "salon", "barber", "join", "track", "turn"] as const;
/** كل خطوة بتبدأ عند أنهي تكة — التكات بتلف من الأول بعد TOTAL_TICKS */
const STEP_START = [0, 2, 6, 9, 11, 14];
const TOTAL_TICKS = 17;

const floatCard =
  "absolute z-10 hidden items-center gap-2.5 rounded-2xl border border-border bg-background py-2.5 ps-2.5 pe-3.5 text-[13px] leading-snug shadow-[0_12px_32px_-12px_rgba(14,15,17,0.18)] xl:flex";

function BellIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

function JourneyDemo() {
  const t = useTranslations("marketing.home.appDownload.mockup");
  const tNav = useTranslations("common.bottomNav");
  const locale = useLocale();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => (n + 1) % TOTAL_TICKS), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const step = STEP_START.filter((s) => tick >= s).length - 1;
  const local = tick - STEP_START[step];
  const stepMs = ((STEP_START[step + 1] ?? TOTAL_TICKS) - STEP_START[step]) * TICK_MS;
  const dir = locale === "en" ? "ltr" : "rtl";

  const screens = [
    <HomeScreen key="discover" t={t} tNav={tNav} locale={locale} picked={step === 0 && local === 1} />,
    <SalonScreen key="salon" t={t} locale={locale} added={step === 1 ? Math.min(local, 2) : 0} />,
    <BarberScreen key="barber" t={t} locale={locale} picked={step === 2 && local >= 1} />,
    <ReviewScreen key="join" t={t} locale={locale} pressed={step === 3 && local === 1} />,
    <TrackingScreen key="track" t={t} locale={locale} ahead={step === 4 ? 3 - local : 3} />,
    <TurnScreen key="turn" t={t} locale={locale} secondsLeft={272 - (step === 5 ? local : 0)} />,
  ];

  return (
    <div role="img" aria-label={t("journey.aria")} className="relative isolate grid justify-items-center">
      <div aria-hidden className="relative flex w-[262px] select-none justify-center xl:w-[660px]">
        {/* موجات بتنبض وانت مستني دورك */}
        <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
          {[0, 0.7, 1.4].map((delay) => (
            <span
              key={delay}
              className={`absolute aspect-square w-[310px] rounded-full border border-[#0F766E]/35 opacity-0 motion-reduce:hidden ${step >= 4 ? "animate-ring-wave" : ""}`}
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>

        {/* كروت جانبية — الشاشات الواسعة بس عشان ما تغطيش الموبايل */}
        <div className={`${floatCard} start-0 top-[15%] w-[185px]`}>
          <span className="grid size-9 place-items-center rounded-[10px] bg-tint text-primary">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 1.8" />
            </svg>
          </span>
          <span>
            <span className="block font-bold text-foreground">{t("journey.floatLive.title")}</span>
            <span className="block text-muted-foreground">{t("journey.floatLive.sub")}</span>
          </span>
        </div>
        <div
          className={`${floatCard} end-0 bottom-[19%] w-[185px] transition-[opacity,transform] duration-500 motion-reduce:transition-none ${step === 5 ? "opacity-100" : "translate-y-3 scale-95 opacity-0"}`}
        >
          <span className="grid size-9 place-items-center rounded-[10px] bg-success-bg text-success-strong">
            <BellIcon width={17} height={17} />
          </span>
          <span>
            <span className="block font-bold text-foreground">{t("journey.floatNotify.title")}</span>
            <span className="block text-muted-foreground">{t("journey.floatNotify.sub")}</span>
          </span>
        </div>

        {/* الموبايل */}
        <div
          className="relative"
          style={{
            width: 262,
            height: 524,
            borderRadius: 48,
            border: "3.5px solid #1E2328",
            background: "#0F1316",
            padding: 3,
          }}
        >
          <div className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#0E0F11]" style={{ borderRadius: 42 }}>
            <PhoneStatusBar />

            {/* إشعار حان دورك */}
            <div
              className={`absolute inset-x-2 top-9 z-30 flex items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-[0_10px_28px_-8px_rgba(14,15,17,0.3)] transition-[opacity,transform] duration-500 motion-reduce:transition-none ${step === 5 && local < 2 ? "opacity-100" : "-translate-y-4 opacity-0"}`}
              style={{ border: "1px solid #E5E7EB" }}
              dir={dir}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#0F766E] text-white">
                <BellIcon width={14} height={14} />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-black">{getAppName(locale)}</span>
                <span className="block truncate text-[9px] font-semibold text-[#6B7280]">{t("turn.notifyBody")}</span>
              </span>
            </div>

            <div className="relative flex-1">
              {screens.map((screen, i) => (
                <div
                  key={STEPS[i]}
                  className={`absolute inset-0 flex flex-col transition-[opacity,transform] duration-500 ease-[cubic-bezier(.22,.8,.22,1)] motion-reduce:transition-none ${i === step ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
                >
                  {screen}
                </div>
              ))}
            </div>

            {/* Home indicator bar */}
            <div className="mx-auto mb-1.5" style={{ width: 68, height: 3.5, background: "#0E0F11", borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* شريط الخطوات */}
      <div aria-hidden className="mt-6 w-[300px] max-w-full">
        <div className="grid grid-cols-6 gap-1.5">
          {STEPS.map((key, i) => (
            <span key={key} className="relative h-[3px] overflow-hidden rounded-full bg-border">
              <span
                className={`absolute inset-0 rounded-full bg-primary ltr:origin-left rtl:origin-right ${i < step ? "" : i === step ? "animate-step-fill motion-reduce:animate-none" : "scale-x-0"}`}
                style={i === step ? { animationDuration: `${stepMs}ms` } : undefined}
              />
            </span>
          ))}
        </div>
        <div className="mt-3 grid text-center text-sm font-bold text-foreground">
          {STEPS.map((key, i) => (
            <span
              key={key}
              className={`col-start-1 row-start-1 transition-[opacity,transform] duration-300 motion-reduce:transition-none ${i === step ? "opacity-100" : "translate-y-1.5 opacity-0"}`}
            >
              {t(`journey.steps.${key}`)}
            </span>
          ))}
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">{t("journey.caption")}</p>
      </div>
    </div>
  );
}

export { JourneyDemo, PhoneStatusBar };
