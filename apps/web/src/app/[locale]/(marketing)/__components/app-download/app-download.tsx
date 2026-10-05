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

/* ————————— Sub-components ————————— */

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

/** الهاتف الأمامي — متابعة الدور الحية (مطابق للفريم ٢٧ في mobile.html) */
function PhoneFront({ t, locale }: { t: MockupT; locale: string }) {
  return (
    <div
      className="absolute z-2 select-none"
      style={{
        left: 10,
        top: 6,
        width: 262,
        height: 524,
        borderRadius: 48,
        border: "3.5px solid #1E2328",
        background: "#0F1316",
        padding: 3,
        boxShadow: "none",
      }}
    >
      {/* الشاشة الداخلية البيضاء */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#0E0F11]"
        style={{
          borderRadius: 42,
        }}
      >
        {/* شريط الحالة والـ Dynamic Island */}
        <PhoneStatusBar />

        {/* محتوى الشاشة (FRAME 27) */}
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
              <span className="text-[10.5px] font-black text-[#0B5A54]">{t("front.peopleAhead", { count: 3 })}</span>
            </div>
          </div>

          {/* خطوات التقدم في الطابور */}
          <div className="mb-2 px-0.5">
            <div className="mb-1 flex gap-1">
              <span className="h-1 flex-1 rounded-full bg-[#0F766E]" />
              <span className="h-1 flex-1 rounded-full bg-[#E5E7EB]" />
              <span className="h-1 flex-1 rounded-full bg-[#E5E7EB]" />
              <span className="h-1 flex-1 rounded-full bg-[#E5E7EB]" />
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
              <div className="text-[13.5px] font-black leading-tight text-[#0E0F11]">{t("front.estimatedTimeValue", { minutes: 28 })}</div>
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

          {/* Home indicator bar */}
          <div
            className="mx-auto mt-auto"
            style={{ width: 68, height: 3.5, background: "#0E0F11", borderRadius: 2 }}
          />
        </div>
      </div>
    </div>
  );
}

/** الهاتف الخلفي — الرئيسية / اكتشف الصالونات (مطابق للفريم ٠٧ في mobile.html) */
function PhoneBack({ t, tNav, locale }: { t: MockupT; tNav: MockupT; locale: string }) {
  return (
    <div
      className="absolute z-1 select-none"
      style={{
        right: 8,
        top: 18,
        width: 250,
        height: 504,
        borderRadius: 46,
        border: "3.5px solid #22272E",
        background: "#111519",
        padding: 3,
        boxShadow: "none",
        transform: "perspective(1200px) rotateY(-8deg) rotateZ(3.5deg) scale(0.96)",
      }}
    >
      {/* الشاشة الداخلية البيضاء */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden bg-white text-[#0E0F11]"
        style={{ borderRadius: 40 }}
      >
        {/* شريط الحالة والـ Dynamic Island */}
        <PhoneStatusBar />

        {/* محتوى الشاشة (FRAME 07) */}
        <div
          className="flex flex-1 flex-col overflow-hidden font-[Cairo]"
          dir={locale === "en" ? "ltr" : "rtl"}
          style={{ padding: "4px 11px 8px" }}
        >
          {/* هيدر الموقع والإشعارات */}
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
            className="mb-2 rounded-xl bg-white overflow-hidden"
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

          {/* Home indicator bar */}
          <div
            className="mx-auto mt-0.5"
            style={{ width: 62, height: 3, background: "#0E0F11", borderRadius: 2 }}
          />
        </div>
      </div>
    </div>
  );
}

import { useLocale, useTranslations } from "next-intl";
import { getAppName } from "@/lib/data/constants/app.constants";
import { formatDistance, formatFrom, formatPrice } from "@/lib/utils/format/price.utils";

const QR_PATH =
  "M0,0h1v1h-1zM1,0h1v1h-1zM2,0h1v1h-1zM3,0h1v1h-1zM4,0h1v1h-1zM5,0h1v1h-1zM6,0h1v1h-1zM12,0h1v1h-1zM13,0h1v1h-1zM15,0h1v1h-1zM16,0h1v1h-1zM18,0h1v1h-1zM19,0h1v1h-1zM20,0h1v1h-1zM21,0h1v1h-1zM22,0h1v1h-1zM23,0h1v1h-1zM24,0h1v1h-1zM0,1h1v1h-1zM6,1h1v1h-1zM8,1h1v1h-1zM10,1h1v1h-1zM12,1h1v1h-1zM16,1h1v1h-1zM18,1h1v1h-1zM24,1h1v1h-1zM0,2h1v1h-1zM2,2h1v1h-1zM3,2h1v1h-1zM4,2h1v1h-1zM6,2h1v1h-1zM8,2h1v1h-1zM9,2h1v1h-1zM11,2h1v1h-1zM16,2h1v1h-1zM18,2h1v1h-1zM20,2h1v1h-1zM21,2h1v1h-1zM22,2h1v1h-1zM24,2h1v1h-1zM0,3h1v1h-1zM2,3h1v1h-1zM3,3h1v1h-1zM4,3h1v1h-1zM6,3h1v1h-1zM10,3h1v1h-1zM11,3h1v1h-1zM12,3h1v1h-1zM13,3h1v1h-1zM16,3h1v1h-1zM18,3h1v1h-1zM20,3h1v1h-1zM21,3h1v1h-1zM22,3h1v1h-1zM24,3h1v1h-1zM0,4h1v1h-1zM2,4h1v1h-1zM3,4h1v1h-1zM4,4h1v1h-1zM6,4h1v1h-1zM10,4h1v1h-1zM11,4h1v1h-1zM12,4h1v1h-1zM15,4h1v1h-1zM16,4h1v1h-1zM18,4h1v1h-1zM20,4h1v1h-1zM21,4h1v1h-1zM22,4h1v1h-1zM24,4h1v1h-1zM0,5h1v1h-1zM6,5h1v1h-1zM8,5h1v1h-1zM9,5h1v1h-1zM11,5h1v1h-1zM12,5h1v1h-1zM13,5h1v1h-1zM14,5h1v1h-1zM18,5h1v1h-1zM24,5h1v1h-1zM0,6h1v1h-1zM1,6h1v1h-1zM2,6h1v1h-1zM3,6h1v1h-1zM4,6h1v1h-1zM5,6h1v1h-1zM6,6h1v1h-1zM8,6h1v1h-1zM10,6h1v1h-1zM12,6h1v1h-1zM14,6h1v1h-1zM16,6h1v1h-1zM18,6h1v1h-1zM19,6h1v1h-1zM20,6h1v1h-1zM21,6h1v1h-1zM22,6h1v1h-1zM23,6h1v1h-1zM24,6h1v1h-1zM8,7h1v1h-1zM9,7h1v1h-1zM10,7h1v1h-1zM11,7h1v1h-1zM12,7h1v1h-1zM14,7h1v1h-1zM2,8h1v1h-1zM5,8h1v1h-1zM6,8h1v1h-1zM7,8h1v1h-1zM8,8h1v1h-1zM11,8h1v1h-1zM13,8h1v1h-1zM14,8h1v1h-1zM15,8h1v1h-1zM16,8h1v1h-1zM17,8h1v1h-1zM18,8h1v1h-1zM20,8h1v1h-1zM21,8h1v1h-1zM23,8h1v1h-1zM24,8h1v1h-1zM0,9h1v1h-1zM4,9h1v1h-1zM7,9h1v1h-1zM8,9h1v1h-1zM15,9h1v1h-1zM16,9h1v1h-1zM17,9h1v1h-1zM18,9h1v1h-1zM19,9h1v1h-1zM21,9h1v1h-1zM23,9h1v1h-1zM2,10h1v1h-1zM3,10h1v1h-1zM5,10h1v1h-1zM6,10h1v1h-1zM7,10h1v1h-1zM8,10h1v1h-1zM11,10h1v1h-1zM12,10h1v1h-1zM16,10h1v1h-1zM18,10h1v1h-1zM19,10h1v1h-1zM23,10h1v1h-1zM0,11h1v1h-1zM1,11h1v1h-1zM2,11h1v1h-1zM4,11h1v1h-1zM7,11h1v1h-1zM8,11h1v1h-1zM9,11h1v1h-1zM12,11h1v1h-1zM14,11h1v1h-1zM18,11h1v1h-1zM19,11h1v1h-1zM20,11h1v1h-1zM23,11h1v1h-1zM0,12h1v1h-1zM1,12h1v1h-1zM2,12h1v1h-1zM3,12h1v1h-1zM5,12h1v1h-1zM6,12h1v1h-1zM10,12h1v1h-1zM11,12h1v1h-1zM14,12h1v1h-1zM16,12h1v1h-1zM18,12h1v1h-1zM19,12h1v1h-1zM20,12h1v1h-1zM21,12h1v1h-1zM22,12h1v1h-1zM2,13h1v1h-1zM3,13h1v1h-1zM5,13h1v1h-1zM7,13h1v1h-1zM10,13h1v1h-1zM11,13h1v1h-1zM12,13h1v1h-1zM13,13h1v1h-1zM17,13h1v1h-1zM18,13h1v1h-1zM20,13h1v1h-1zM24,13h1v1h-1zM2,14h1v1h-1zM4,14h1v1h-1zM6,14h1v1h-1zM8,14h1v1h-1zM9,14h1v1h-1zM10,14h1v1h-1zM11,14h1v1h-1zM12,14h1v1h-1zM13,14h1v1h-1zM15,14h1v1h-1zM16,14h1v1h-1zM17,14h1v1h-1zM18,14h1v1h-1zM20,14h1v1h-1zM21,14h1v1h-1zM0,15h1v1h-1zM1,15h1v1h-1zM2,15h1v1h-1zM3,15h1v1h-1zM4,15h1v1h-1zM5,15h1v1h-1zM10,15h1v1h-1zM12,15h1v1h-1zM14,15h1v1h-1zM15,15h1v1h-1zM16,15h1v1h-1zM18,15h1v1h-1zM19,15h1v1h-1zM20,15h1v1h-1zM21,15h1v1h-1zM22,15h1v1h-1zM0,16h1v1h-1zM3,16h1v1h-1zM5,16h1v1h-1zM6,16h1v1h-1zM7,16h1v1h-1zM11,16h1v1h-1zM16,16h1v1h-1zM17,16h1v1h-1zM18,16h1v1h-1zM19,16h1v1h-1zM20,16h1v1h-1zM22,16h1v1h-1zM23,16h1v1h-1zM8,17h1v1h-1zM10,17h1v1h-1zM13,17h1v1h-1zM15,17h1v1h-1zM16,17h1v1h-1zM20,17h1v1h-1zM22,17h1v1h-1zM23,17h1v1h-1zM0,18h1v1h-1zM1,18h1v1h-1zM2,18h1v1h-1zM3,18h1v1h-1zM4,18h1v1h-1zM5,18h1v1h-1zM6,18h1v1h-1zM9,18h1v1h-1zM11,18h1v1h-1zM13,18h1v1h-1zM14,18h1v1h-1zM15,18h1v1h-1zM16,18h1v1h-1zM18,18h1v1h-1zM20,18h1v1h-1zM23,18h1v1h-1zM0,19h1v1h-1zM6,19h1v1h-1zM8,19h1v1h-1zM9,19h1v1h-1zM10,19h1v1h-1zM11,19h1v1h-1zM14,19h1v1h-1zM15,19h1v1h-1zM16,19h1v1h-1zM20,19h1v1h-1zM22,19h1v1h-1zM23,19h1v1h-1zM0,20h1v1h-1zM2,20h1v1h-1zM3,20h1v1h-1zM4,20h1v1h-1zM6,20h1v1h-1zM8,20h1v1h-1zM13,20h1v1h-1zM14,20h1v1h-1zM15,20h1v1h-1zM16,20h1v1h-1zM17,20h1v1h-1zM18,20h1v1h-1zM19,20h1v1h-1zM20,20h1v1h-1zM23,20h1v1h-1zM0,21h1v1h-1zM2,21h1v1h-1zM3,21h1v1h-1zM4,21h1v1h-1zM6,21h1v1h-1zM10,21h1v1h-1zM14,21h1v1h-1zM15,21h1v1h-1zM16,21h1v1h-1zM18,21h1v1h-1zM19,21h1v1h-1zM21,21h1v1h-1zM22,21h1v1h-1zM0,22h1v1h-1zM2,22h1v1h-1zM3,22h1v1h-1zM4,22h1v1h-1zM6,22h1v1h-1zM11,22h1v1h-1zM13,22h1v1h-1zM19,22h1v1h-1zM20,22h1v1h-1zM22,22h1v1h-1zM24,22h1v1h-1zM0,23h1v1h-1zM6,23h1v1h-1zM8,23h1v1h-1zM9,23h1v1h-1zM10,23h1v1h-1zM11,23h1v1h-1zM12,23h1v1h-1zM13,23h1v1h-1zM14,23h1v1h-1zM15,23h1v1h-1zM18,23h1v1h-1zM19,23h1v1h-1zM22,23h1v1h-1zM0,24h1v1h-1zM1,24h1v1h-1zM2,24h1v1h-1zM3,24h1v1h-1zM4,24h1v1h-1zM5,24h1v1h-1zM6,24h1v1h-1zM8,24h1v1h-1zM11,24h1v1h-1zM12,24h1v1h-1zM14,24h1v1h-1zM16,24h1v1h-1zM17,24h1v1h-1zM18,24h1v1h-1zM19,24h1v1h-1zM22,24h1v1h-1zM23,24h1v1h-1z";

/** مصفوفة QR Code واقعية بدون أي ظلال */
function QrMatrix({ ariaLabel }: { ariaLabel?: string }) {
  return (
    <div
      className="qrcode flex shrink-0 items-center justify-center rounded-xl bg-white p-1.5"
      aria-label={ariaLabel}
      style={{
        width: 68,
        height: 68,
        border: "1px solid #E5E7EB",
      }}
    >
      <svg
        viewBox="0 0 25 25"
        className="h-full w-full"
        style={{ shapeRendering: "crispEdges" }}
      >
        <path d={QR_PATH} fill="#111827" />
      </svg>
    </div>
  );
}

/* ————————— Main Component ————————— */

function AppDownload() {
  const t = useTranslations("marketing.home.appDownload");
  const tMockup = useTranslations("marketing.home.appDownload.mockup");
  const tNav = useTranslations("common.bottomNav");
  const locale = useLocale();

  return (
    <section className="mt-10 bg-white md:mt-14">
      <div
        className="relative mx-auto grid max-w-[1312px] items-center gap-10 overflow-hidden px-4 py-[50px] max-md:grid-cols-1 max-md:gap-9 max-md:py-10 md:grid-cols-[1.05fr_1fr] md:px-16"
      >
        {/* ————— النصوص + QR + أزرار المتاجر ————— */}
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

          {/* QR + أزرار المتاجر */}
          <div className="mt-2.5 flex flex-wrap items-center gap-5 border-t border-border pt-4 max-md:flex-col max-md:items-center">
            {/* بطاقة QR */}
            <div className="flex h-full min-h-[98px] items-center gap-3.5 rounded-2xl border border-border bg-muted px-4 py-2.5">
              <QrMatrix ariaLabel={t("qrAria")} />
              <div className="flex flex-col text-start">
                <span className="text-[13px] font-extrabold text-foreground">{t("scanCode")}</span>
                <span className="mt-0.5 text-[11.5px] font-semibold text-muted-foreground">{t("availableOn")}</span>
              </div>
            </div>

            {/* أزرار المتاجر */}
            <div className="flex flex-col gap-2.5 sm:flex-row max-md:w-full max-md:justify-center">
              {/* Google Play */}
              <a
                href="#"
                className="inline-flex min-w-[150px] items-center justify-center gap-2.5 rounded-xl bg-foreground px-[18px] py-2 text-white no-underline transition-all hover:bg-[#262B30]"
                style={{ direction: "ltr" }}
              >
                <GooglePlayIcon className="h-[22px] w-[22px] shrink-0 fill-white" />
                <div className="flex flex-col leading-[1.15]" style={{ direction: "ltr", textAlign: "left" }}>
                  <span className="text-[9.5px] font-medium uppercase tracking-wide opacity-80">GET IT ON</span>
                  <span className="text-[14px] font-extrabold" style={{ letterSpacing: "-0.2px" }}>Google Play</span>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#"
                className="inline-flex min-w-[150px] items-center justify-center gap-2.5 rounded-xl bg-foreground px-[18px] py-2 text-white no-underline transition-all hover:bg-[#262B30]"
                style={{ direction: "ltr" }}
              >
                <AppleIcon className="h-[22px] w-[22px] shrink-0 fill-white" />
                <div className="flex flex-col leading-[1.15]" style={{ direction: "ltr", textAlign: "left" }}>
                  <span className="text-[9.5px] font-medium uppercase tracking-wide opacity-80">Download on the</span>
                  <span className="text-[14px] font-extrabold" style={{ letterSpacing: "-0.2px" }}>App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ————— شاشات الموبايل ————— */}
        <div
          className="relative flex items-center justify-center overflow-hidden max-md:order-2 max-md:min-h-[460px] md:order-2"
          aria-label={t("screensAria")}
          style={{ minHeight: 540, direction: "ltr" }}
        >
          <div className="relative h-[536px] w-[430px] max-w-full shrink-0 origin-center scale-[0.72] xs:scale-[0.82] sm:scale-95 md:scale-[0.9] lg:scale-100 transition-transform">
            <PhoneBack t={tMockup} tNav={tNav} locale={locale} />
            <PhoneFront t={tMockup} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

export { AppDownload };

