// شريط تبويبات صفحة الصالون الثابت — بيتبع مكان السكرول (فريم ٢١-٢٣)
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HEADER_HEIGHT_PX } from "@/lib/data/constants/app.constants";
import { cn } from "@/lib/utils/cn.utils";

/** الأقسام اللي ليها بيانات من الـ API دلوقتي؛ الحلاقين والعروض والتقييمات بترجع لما يبقى ليها API */
export type SalonTabKey = "services" | "info";

const DEFAULT_TABS: readonly SalonTabKey[] = ["services", "info"];

export function SalonTabs({ tabs = DEFAULT_TABS }: { tabs?: readonly SalonTabKey[] }) {
  const t = useTranslations("marketing.salon.tabs");
  const [activeId, setActiveId] = useState<string>(tabs[0]);

  useEffect(() => {
    const sections = tabs.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: `-${HEADER_HEIGHT_PX + 49}px 0px -70% 0px`, threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <nav
      aria-label={t("navAria")}
      className="sticky z-30 flex w-full gap-1.5 overflow-x-auto border-b border-border bg-background px-4 sm:px-8 scrollbar-none lg:px-0"
      style={{ top: HEADER_HEIGHT_PX }}
    >
      {tabs.map((key) => {
        const active = key === activeId;
        return (
          <a
            key={key}
            href={`#${key}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap px-3 pb-3 text-sm transition-colors",
              active
                ? "border-b-[2.5px] border-primary font-extrabold text-primary"
                : "font-semibold text-muted-foreground",
            )}
          >
            {t(key)}
          </a>
        );
      })}
    </nav>
  );
}
