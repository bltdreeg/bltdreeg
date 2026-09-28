// "بلتدريج للصالونات" في الهوم — نفس توزيعة Fresha for business: نص في البداية، ولوحة الصالون طالعة لآخر الشاشة
// ومقصوصة من تحت، وموبايل بصفحة صالون راكب على طرفها. الألوان والخط بتوعنا.

import Image from "next/image";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Home,
  Megaphone,
  Navigation,
  Phone,
  Plus,
  Settings,
  Share2,
  Tag,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Avatar } from "@/components/atoms/avatar";
import { PageContainer } from "@/components/atoms/page-container";
import { Rating } from "@/components/atoms/rating";
import { Link } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import { ROUTE_PARTNER } from "@/lib/data/constants/routes.constants";
import { services } from "@/lib/data/services.constants";
import { shops } from "@/lib/data/shops.constants";
import { formatDistance, formatPrice } from "@/lib/utils/format/price.utils";
import { PhoneStatusBar } from "../app-download/journey-demo";

const POINTS = ["queue", "notify", "payouts"] as const;

/* ————— بيانات لوحة الديمو — زخرفة، مش بيانات حقيقية ————— */

const STAFF = ["one", "two", "three", "four"] as const;
const FIRST_HOUR = 9;
const HOURS = 6;
const HOUR_PX = 72;
/** خط "دلوقتي" على الجدول — 10:40 */
const NOW = 1 + 40 / 60;

type Tone = "tint" | "muted" | "primary" | "warning";

const TONE: Record<Tone, string> = {
  tint: "border-tint-border bg-tint text-primary-pressed",
  muted: "border-border bg-muted text-foreground",
  primary: "border-primary bg-primary text-primary-foreground",
  warning: "border-warning-bg bg-warning-bg text-warning-fg",
};

/** start و dur بالساعات من أول الجدول */
const APPOINTMENTS: { key: string; col: number; start: number; dur: number; tone: Tone }[] = [
  { key: "a", col: 0, start: 0, dur: 1, tone: "tint" },
  { key: "b", col: 1, start: 0, dur: 1, tone: "muted" },
  { key: "c", col: 2, start: 1, dur: 1, tone: "primary" },
  { key: "d", col: 3, start: 0.75, dur: 1.25, tone: "warning" },
  { key: "e", col: 1, start: 2.5, dur: 1, tone: "tint" },
  { key: "f", col: 3, start: 2, dur: 1.25, tone: "muted" },
  { key: "g", col: 0, start: 3.5, dur: 1, tone: "tint" },
  { key: "h", col: 2, start: 4, dur: 1, tone: "muted" },
];

/** 1.5 → "10:30" بنظام الـ 12 ساعة */
function clock(offset: number) {
  const total = FIRST_HOUR + offset;
  const h = Math.floor(total);
  const m = Math.round((total - h) * 60);
  return `${((h - 1) % 12) + 1}:${String(m).padStart(2, "0")}`;
}

function PartnerBanner() {
  const t = useTranslations("marketing.home.partnerBanner");
  const tPartner = useTranslations("marketing.partner");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden bg-background">
      <PageContainer className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        {/* ————— النص ————— */}
        <div className="relative z-10 flex flex-col gap-10 pt-14 pb-10 md:justify-between md:pt-20 md:pb-20">
          <div className="flex flex-col items-start gap-5">
            <h2 className="text-[34px] font-black leading-[1.2] tracking-tight text-foreground md:text-[52px]">
              {t("title", { appName: getAppName(locale) })}
            </h2>
            <p className="max-w-115 text-base leading-[1.8] text-foreground/80 md:text-lg">{t("body")}</p>
            <Link
              href={ROUTE_PARTNER}
              className="mt-1 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary-pressed"
            >
              {t("cta")}
              <ChevronLeft aria-hidden className="size-4 ltr:rotate-180" />
            </Link>
          </div>

          {/* مكان "Excellent 5/5" عند Fresha — عندنا وقائع مش تقييمات */}
          <div>
            <p className="text-xl font-black text-foreground md:text-[22px]">{t("proofTitle")}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {POINTS.map((key) => (
                <li key={key} className="flex items-center gap-2 text-[13.5px] font-semibold text-foreground">
                  <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg
                      className="size-2.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  {tPartner(`features.${key}.title`)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12.5px] font-semibold text-muted-foreground">{t("proofNote")}</p>
          </div>
        </div>

        {/* ————— اللوحة + الموبايل ————— */}
        <div className="relative h-[420px] md:h-auto md:min-h-[600px]" aria-hidden>
          {/* الهالة ورا الموبايل — نفس دور الأخضر الفسفوري عند Fresha بلون التيل */}
          <div className="pointer-events-none absolute -start-24 top-16 size-[520px] rounded-full bg-primary/25 blur-[110px]" />

          <Board />
          <PhoneCard />
        </div>
      </PageContainer>
    </section>
  );
}

/** لوحة الصالون بنظام الجدول — أعرض من العمود عشان تطلع لآخر الشاشة، والسكشن بيقصها */
function Board() {
  const t = useTranslations("marketing.home.partnerBanner.board");
  const tPanel = useTranslations("marketing.partner.panel");
  const locale = useLocale();
  const today = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="absolute top-8 start-0 flex w-[960px] overflow-hidden rounded-ss-[22px] border-s border-t border-border bg-background shadow-2xl md:top-16 md:start-20">
      {/* الشريط الجانبي */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-5 border-e border-border bg-muted pt-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
          {tPanel("mark")}
        </span>
        {[Home, CalendarDays, Tag, Users, Megaphone, Settings].map((Icon, i) => (
          <Icon key={i} className={`size-[18px] ${i === 1 ? "text-primary" : "text-muted-foreground"}`} />
        ))}
      </div>

      <div className="min-w-0 flex-1">
        {/* شريط الأدوات */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3 text-xs font-bold text-foreground">
          <Pill>
            {shops[0].name}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Pill>
          <Pill>
            {t("allStaff")}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Pill>
          <span className="flex items-center overflow-hidden rounded-full border border-border">
            <ChevronRight className="mx-2 size-3.5 text-muted-foreground ltr:rotate-180" />
            <span className="border-x border-border bg-muted px-3 py-1.5">{t("today")}</span>
            <span className="px-3 py-1.5 whitespace-nowrap">{today}</span>
            <ChevronLeft className="mx-2 size-3.5 text-muted-foreground ltr:rotate-180" />
          </span>
          <Pill>
            {t("day")}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Pill>
          <span className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 whitespace-nowrap text-primary-foreground">
            <Plus className="size-3.5" />
            {t("addNew")}
          </span>
        </div>

        {/* الحلاقين */}
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          {STAFF.map((key) => (
            <div key={key} className="flex flex-1 flex-col items-center gap-1.5 py-3">
              <Avatar name={t(`staff.${key}`)} size={40} />
              <span className="text-[11.5px] font-bold text-foreground">{t(`staff.${key}`)}</span>
            </div>
          ))}
        </div>

        {/* الجدول */}
        <div className="relative flex" style={{ height: HOURS * HOUR_PX }}>
          {/* عمود الساعات */}
          <div className="w-14 shrink-0">
            {Array.from({ length: HOURS }, (_, i) => (
              <div
                key={i}
                className="tabular pt-1.5 text-center text-[11px] font-bold text-muted-foreground"
                style={{ height: HOUR_PX }}
              >
                {clock(i)}
              </div>
            ))}
          </div>

          {/* الأعمدة */}
          <div className="relative flex-1">
            {Array.from({ length: HOURS }, (_, i) => (
              <div key={i} className="absolute inset-x-0 border-t border-border" style={{ top: i * HOUR_PX }} />
            ))}
            <div className="absolute inset-0 grid grid-cols-4">
              {STAFF.map((key) => (
                <div key={key} className="border-s border-border" />
              ))}
            </div>

            {APPOINTMENTS.map(({ key, col, start, dur, tone }) => (
              <div
                key={key}
                className={`absolute flex flex-col gap-0.5 overflow-hidden rounded-lg border px-2.5 py-2 text-[11px] ${TONE[tone]}`}
                style={{
                  insetInlineStart: `calc(${col * 25}% + 4px)`,
                  width: "calc(25% - 8px)",
                  top: start * HOUR_PX + 3,
                  height: dur * HOUR_PX - 6,
                }}
              >
                {/* ltr عشان الـ bidi ما يقلبش "9:00 - 10:00" لـ "10:00 - 9:00" في العربي */}
                <span dir="ltr" className="tabular self-start font-semibold opacity-80">
                  {clock(start)} - {clock(start + dur)}
                </span>
                <span className="truncate font-extrabold">{t(`appointments.${key}.name`)}</span>
                <span className="truncate font-semibold opacity-80">{t(`appointments.${key}.service`)}</span>
              </div>
            ))}

            {/* خط دلوقتي */}
            <div className="absolute inset-x-0 flex items-center" style={{ top: NOW * HOUR_PX }}>
              <span className="-ms-1 size-2 rounded-full bg-destructive" />
              <span className="h-px flex-1 bg-destructive" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 whitespace-nowrap">
      {children}
    </span>
  );
}

const SCREEN_SCALE = 249 / 390;

function PhoneCard() {
  const t = useTranslations("marketing.home.partnerBanner.phone");
  const tSalon = useTranslations("marketing.salon");
  const locale = useLocale();
  const shop = shops[0];
  const shopServices = services.filter((s) => s.shopId === shop.id);
  const first = shopServices[0];

  return (
    // نفس إطار موبايل سكشن التحميل (JourneyDemo)
    <div className="absolute bottom-8 -start-6 hidden h-[524px] w-[262px] rounded-[48px] border-[3.5px] border-[#1E2328] bg-[#0F1316] p-[3px] shadow-2xl md:block">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-white text-[#0E0F11]">
        <PhoneStatusBar />
        <div className="relative min-h-0 flex-1">
          {/* 249px جوه الإطار ÷ 390px عرض التصميم */}
          <div
            className="absolute top-0 flex w-[390px] flex-col ltr:left-0 ltr:origin-top-left rtl:right-0 rtl:origin-top-right"
            style={{
              height: `${100 / SCREEN_SCALE}%`,
              transform: `scale(${SCREEN_SCALE})`,
            }}
          >
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {/* الجاليري */}
              <div className="relative h-[170px] border-b border-border">
                <Image src={shop.coverImage} alt="" fill sizes="249px" className="object-cover" />
                <div className="absolute inset-x-4 top-2.5 flex justify-between">
                  <PhoneIconButton>
                    <ChevronRight className="size-5 ltr:rotate-180" />
                  </PhoneIconButton>
                  <div className="flex gap-2">
                    <PhoneIconButton>
                      <Share2 className="size-5" />
                    </PhoneIconButton>
                    <PhoneIconButton>
                      <Heart className="size-5 fill-destructive text-destructive" />
                    </PhoneIconButton>
                  </div>
                </div>
                <div className="absolute bottom-3 end-4 flex gap-1">
                  <span className="h-1 w-4 rounded-sm bg-background" />
                  <span className="size-1 rounded-sm bg-background/60" />
                  <span className="size-1 rounded-sm bg-background/60" />
                </div>
              </div>

              <div className="px-5 pt-4">
                <h3 className="text-[21px] leading-[1.35] font-extrabold text-foreground">{shop.name}</h3>
                <div className="mt-2 flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
                  <Rating value={shop.rating} count={shop.reviewCount} starSize={14} />
                  <span className="h-[11px] w-px bg-border" />
                  <span>{shop.areaName}</span>
                  <span className="h-[11px] w-px bg-border" />
                  <span>{formatDistance(shop.distanceKm, locale)}</span>
                </div>

                {/* حالة الطابور مثبّتة تحت الاسم */}
                <div className="mt-3.5 flex items-center gap-[11px] rounded-xl bg-success-bg px-3.5 py-[13px]">
                  <span className="size-2.5 shrink-0 rounded-full bg-success" />
                  <div className="flex-1">
                    <div className="text-[14.5px] font-extrabold text-success-strong">{t("status")}</div>
                    <div className="mt-px text-[12.5px] font-semibold text-success-strong/85">{t("statusMeta")}</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {[
                    { Icon: Navigation, label: tSalon("info.directions") },
                    { Icon: Phone, label: tSalon("info.call") },
                  ].map(({ Icon, label }) => (
                    <span
                      key={label}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] border border-border text-[13.5px] font-bold text-foreground"
                    >
                      <Icon className="size-[15px]" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* التابات */}
              <div className="flex gap-1.5 overflow-hidden border-b border-border px-5 pt-4 text-[14px] whitespace-nowrap">
                {(["services", "barbers", "offers", "reviews", "hours"] as const).map((key, i) => (
                  <span
                    key={key}
                    className={
                      i === 0
                        ? "border-b-[2.5px] border-primary px-3 pb-3 font-extrabold text-primary"
                        : "px-3 pb-3 font-semibold text-muted-foreground"
                    }
                  >
                    {tSalon(`tabs.${key}`)}
                  </span>
                ))}
              </div>

              <div className="px-5 pt-4">
                <div className="mx-1 mb-1 text-[12.5px] font-bold text-muted-foreground">{first.category}</div>
                {shopServices.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 border-b border-border py-[15px] last:border-b-0">
                    <div className="flex-1">
                      <div className="text-[14.5px] font-bold text-foreground">{s.name}</div>
                      <div className="mt-[3px] flex items-center gap-2 text-[12.5px] font-medium text-muted-foreground">
                        <Clock className="size-[15px]" />
                        {tSalon("services.durationMinutes", {
                          count: s.durationMinutes,
                        })}
                      </div>
                    </div>
                    <span className="tabular ms-2.5 text-[15px] font-extrabold text-foreground">
                      {formatPrice(s.price, locale)}
                    </span>
                    <span className="flex size-[34px] items-center justify-center rounded-[9px] border-[1.5px] border-primary text-primary">
                      <Plus className="size-[19px]" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* زرار الطابور ثابت تحت مع السعر */}
            <div className="flex shrink-0 items-center gap-3 border-t border-border bg-background px-5 pt-3 pb-3 shadow-[0_-6px_24px_rgba(14,15,17,.07)]">
              <div className="shrink-0">
                <div className="text-[12px] font-semibold text-muted-foreground">
                  {tSalon("bookingSidebar.servicesCount", { count: 1 })}
                </div>
                <div className="tabular text-[17px] font-extrabold text-foreground">
                  {formatPrice(first.price, locale)}
                </div>
              </div>
              <span className="flex h-[52px] flex-1 items-center justify-center rounded-[10px] bg-primary text-[16px] font-bold text-primary-foreground">
                {tSalon("bookingBar.joinQueue")}
              </span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-1 mb-1.5 h-[3.5px] w-[68px] rounded-xs bg-[#0E0F11]" />
      </div>
    </div>
  );
}

function PhoneIconButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-[38px] items-center justify-center rounded-[11px] border border-border bg-background text-foreground">
      {children}
    </span>
  );
}

export { PartnerBanner };
