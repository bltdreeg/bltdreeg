// شريط تبويبات صفحة الصالون الثابت — بيتبع مكان السكرول (فريم ٢١-٢٣)
"use client";

import { useEffect, useState } from "react";
import { HEADER_HEIGHT_PX } from "@/lib/data/constants/app.constants";
import { cn } from "@/lib/utils/cn.utils";

const TABS = [
  { id: "services", label: "الخدمات" },
  { id: "barbers", label: "الحلاقين" },
  { id: "offers", label: "العروض" },
  { id: "reviews", label: "التقييمات" },
  { id: "hours", label: "المواعيد" },
] as const;

export function SalonTabs() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);

  useEffect(() => {
    const sections = TABS.map((t) => document.getElementById(t.id)).filter(
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
  }, []);

  return (
    <nav
      aria-label="أقسام الصفحة"
      className="sticky z-30 flex w-full gap-1.5 overflow-x-auto border-b border-border bg-background px-4 sm:px-8 scrollbar-none lg:px-0"
      style={{ top: HEADER_HEIGHT_PX }}
    >
      {TABS.map((tab) => {
        const active = tab.id === activeId;
        return (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap px-3 pb-3 text-sm transition-colors",
              active
                ? "border-b-[2.5px] border-primary font-extrabold text-primary"
                : "font-semibold text-muted-foreground",
            )}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}
