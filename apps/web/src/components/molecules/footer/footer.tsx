import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/atoms/page-container";
import { Link } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import {
  EXTERNAL_FACEBOOK,
  EXTERNAL_INSTAGRAM,
  EXTERNAL_SALON_LOGIN,
  EXTERNAL_SALON_REGISTER,
  EXTERNAL_TIKTOK,
  ROUTE_BOOKINGS,
  ROUTE_HOME,
  ROUTE_PRIVACY,
  ROUTE_REFUND_POLICY,
  ROUTE_SEARCH,
  ROUTE_TERMS,
} from "@/lib/data/constants/routes.constants";

// lucide-react شال أيقونات البراندات — مسارات SVG مباشرة
const socials = [
  {
    label: "Facebook",
    href: EXTERNAL_FACEBOOK,
    icon: (
      <path
        fill="currentColor"
        d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
      />
    ),
  },
  {
    label: "Instagram",
    href: EXTERNAL_INSTAGRAM,
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" />
      </g>
    ),
  },
  {
    label: "TikTok",
    href: EXTERNAL_TIKTOK,
    icon: (
      <path
        fill="currentColor"
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      />
    ),
  },
];

async function Footer() {
  const t = await getTranslations("common.footer");
  const locale = await getLocale();
  const appName = getAppName(locale);

  const columns = [
    {
      title: t("aboutTitle", { appName }),
      links: [
        { label: t("whoWeAre"), href: ROUTE_HOME },
        { label: t("howItWorks"), href: ROUTE_HOME },
        { label: t("careers"), href: ROUTE_HOME },
      ],
    },
    {
      title: t("contactTitle"),
      links: [
        { label: t("help"), href: ROUTE_HOME },
        { label: t("complaint"), href: ROUTE_BOOKINGS },
        { label: t("whatsapp"), href: ROUTE_HOME },
      ],
    },
    {
      title: t("termsTitle"),
      links: [
        { label: t("terms"), href: ROUTE_TERMS },
        { label: t("privacy"), href: ROUTE_PRIVACY },
        { label: t("refund"), href: ROUTE_REFUND_POLICY },
      ],
    },
    {
      title: t("salonsTitle"),
      links: [
        { label: t("addSalon"), href: EXTERNAL_SALON_REGISTER },
        { label: t("pricing"), href: ROUTE_SEARCH },
        { label: t("salonLogin"), href: EXTERNAL_SALON_LOGIN },
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-foreground">
      <PageContainer className="pb-24 pt-11 md:pb-7">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:gap-14">
          <div className="flex w-full shrink-0 flex-col gap-3.5 lg:w-[300px]">
            <Link href={ROUTE_HOME} className="flex w-fit items-center gap-2.5">
              {/* الماركة تيل — على بلاطة بيضا زي الهيدر عشان تبان على الخلفية الغامقة */}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                <Image
                  src="/logo-mark.png"
                  alt=""
                  width={496}
                  height={521}
                  className="h-full w-auto object-contain"
                />
              </span>
              <span className="text-[21px] font-black text-background">{appName}</span>
            </Link>
            <p className="text-[13.5px] leading-[1.8] text-disabled-fg">
              {t("tagline")}
            </p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-full bg-background/10 text-disabled-fg transition-colors hover:bg-background/20 hover:text-background"
                >
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:flex lg:gap-12 xl:gap-18">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="text-[13px] font-bold text-background">{col.title}</span>
                {col.links.map((l) =>
                  l.href.startsWith("http") ? (
                    <a
                      key={l.label}
                      href={l.href}
                      className="text-[13px] text-disabled-fg transition-colors hover:text-background"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="text-[13px] text-disabled-fg transition-colors hover:text-background"
                    >
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between gap-5 border-t border-background/10 pt-5">
          <span className="tabular text-[12.5px] text-muted-foreground">
            {appName} © {new Date().getFullYear()}
          </span>
          <span className="text-[12.5px] text-muted-foreground">{t("location")}</span>
        </div>
      </PageContainer>
    </footer>
  );
}

export { Footer };

