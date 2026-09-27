// المميزات — أربع بطاقات، كل واحدة برقم حقيقي من التطبيق تحتها

import { useLocale, useTranslations } from "next-intl";
import { formatDistance } from "@/lib/utils/format/price.utils";

function ClockIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3.2 1.9" />
    </svg>
  );
}

function BellIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M6.5 10a5.5 5.5 0 1 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

function PinIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function BarberIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="9" cy="8.5" r="3.4" />
      <path d="M3.4 19.2c.8-3.4 3.1-5.1 5.6-5.1s4.8 1.7 5.6 5.1" />
      <path d="M16.2 5.6a3.2 3.2 0 0 1 0 6" />
    </svg>
  );
}

function DownloadFeatures() {
  const t = useTranslations("marketing.download.features");
  const locale = useLocale();

  const items = [
    { key: "live", Icon: ClockIcon, stat: "4", statTone: "text-primary" },
    { key: "notify", Icon: BellIcon, stat: "10:05", statTone: "text-primary" },
    { key: "nearby", Icon: PinIcon, stat: formatDistance(0.8, locale), statTone: "text-primary" },
    { key: "barber", Icon: BarberIcon, stat: locale === "en" ? "+20 min" : "+٢٠ د", statTone: "text-warning-fg" },
  ] as const;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-328 px-4 py-14 md:px-16 md:py-16">
        <div className="max-w-160">
          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-[34px]">{t("title")}</h2>
          <p className="mt-2.5 text-[15px] leading-[1.8] text-muted-foreground md:text-base">{t("subtitle")}</p>
        </div>

        <ul className="mt-9 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, Icon, stat, statTone }) => (
            <li
              key={key}
              className="flex flex-col gap-3.5 rounded-[20px] border border-border bg-background p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-tint text-primary">
                <Icon className="size-[22px]" />
              </span>
              <h3 className="text-lg font-black leading-snug text-foreground">{t(`${key}.title`)}</h3>
              <p className="text-sm leading-[1.8] text-muted-foreground">{t(`${key}.body`)}</p>
              <div className="mt-auto flex items-baseline gap-1.5 border-t border-border pt-3.5">
                <span className={`text-[22px] font-black ${statTone}`}>{stat}</span>
                <span className="text-xs font-bold text-muted-foreground">{t(`${key}.statLabel`)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { DownloadFeatures };
