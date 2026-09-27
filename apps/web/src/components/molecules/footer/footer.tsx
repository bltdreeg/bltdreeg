import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/atoms/page-container";
import { Link } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import {
  EXTERNAL_SALON_LOGIN,
  EXTERNAL_SALON_REGISTER,
  ROUTE_BOOKINGS,
  ROUTE_HOME,
  ROUTE_PRIVACY,
  ROUTE_REFUND_POLICY,
  ROUTE_SEARCH,
  ROUTE_TERMS,
} from "@/lib/data/constants/routes.constants";

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

