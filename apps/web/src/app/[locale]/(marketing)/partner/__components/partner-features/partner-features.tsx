// اللي بيشتغل بيه صاحب الصالون كل يوم — ٦ مميزات. الأيقونات inline عشان مش محتاجة أي لايبرري.

import { useTranslations } from "next-intl";

type Feature = { key: string; icon: React.ReactNode };

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "size-5.5",
};

const FEATURES: Feature[] = [
  {
    key: "queue",
    icon: (
      <svg {...iconProps}>
        <path d="M8 2v4M16 2v4" />
        <rect x="3" y="6" width="18" height="16" rx="2" />
        <path d="M3 11h18" />
      </svg>
    ),
  },
  {
    key: "notify",
    icon: (
      <svg {...iconProps}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
  {
    key: "barbers",
    icon: (
      <svg {...iconProps}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "reports",
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="m18 9-5 5-3-3-4 4" />
      </svg>
    ),
  },
  {
    key: "reviews",
    icon: (
      <svg {...iconProps}>
        <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z" />
      </svg>
    ),
  },
  {
    key: "payouts",
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
];

function PartnerFeatures() {
  const t = useTranslations("marketing.partner.features");

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-328 px-4 py-14 md:px-16 md:py-16">
        <h2 className="text-2xl font-black tracking-tight text-foreground md:text-[34px]">{t("title")}</h2>
        <p className="mt-2.5 text-[15px] leading-[1.8] text-muted-foreground md:text-base">{t("subtitle")}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-9 lg:grid-cols-3">
          {FEATURES.map(({ key, icon }) => (
            <div key={key} className="rounded-2xl border border-border bg-background p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-tint text-primary">{icon}</span>
              <h3 className="mt-4 text-[17.5px] font-extrabold text-foreground">{t(`${key}.title`)}</h3>
              <p className="mt-1.5 text-sm leading-[1.75] text-muted-foreground">{t(`${key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { PartnerFeatures };
