// شريط التنقل السفلي: الرئيسية · حجوزاتي · البحث · حسابي — موبايل بس
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  ROUTE_ACCOUNT,
  ROUTE_BOOKINGS,
  ROUTE_HOME,
  ROUTE_SEARCH,
} from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

const TABS = [
  { href: ROUTE_HOME, label: "الرئيسية", shape: "rounded-[4px]" },
  { href: ROUTE_BOOKINGS, label: "حجوزاتي", shape: "rounded-[4px]" },
  { href: ROUTE_SEARCH, label: "البحث", shape: "rounded-full" },
  { href: ROUTE_ACCOUNT, label: "حسابي", shape: "rounded-full" },
] as const;

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="sticky bottom-0 z-40 border-t border-border bg-background px-2 pb-2.5 pt-2 md:hidden"
    >
      <ul className="flex gap-1">
        {TABS.map((tab) => {
          const active = tab.href === ROUTE_HOME ? pathname === ROUTE_HOME : pathname.startsWith(tab.href);

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-1.5 rounded-xl transition-colors",
                  active ? "bg-tint" : "hover:bg-muted",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-[18px] border-[1.5px]",
                    tab.shape,
                    active ? "border-primary-pressed" : "border-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px]",
                    active ? "font-bold text-primary-pressed" : "font-semibold text-muted-foreground",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { BottomNav };
