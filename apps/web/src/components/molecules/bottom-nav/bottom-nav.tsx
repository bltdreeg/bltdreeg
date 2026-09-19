// شريط التنقل السفلي: الرئيسية · حجوزاتي · البحث · حسابي — موبايل بس
"use client";

import { Home, Calendar, Search, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ROUTE_ACCOUNT,
  ROUTE_BOOKINGS,
  ROUTE_HOME,
  ROUTE_SALON_ROOT,
  ROUTE_SEARCH,
} from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

const TABS = [
  { href: ROUTE_HOME, label: "الرئيسية", icon: Home },
  { href: ROUTE_BOOKINGS, label: "حجوزاتي", icon: Calendar },
  { href: ROUTE_SEARCH, label: "البحث", icon: Search },
  { href: ROUTE_ACCOUNT, label: "حسابي", icon: User },
] as const;

function BottomNav() {
  const pathname = usePathname();

  // صفحة الصالون عندها شريط حجز ثابت في الأسفل بيغني عن التنقل الرئيسي
  if (pathname.startsWith(ROUTE_SALON_ROOT)) return null;

  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background px-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
    >
      <ul className="flex gap-1">
        {TABS.map((tab) => {
          const active = tab.href === ROUTE_HOME ? pathname === ROUTE_HOME : pathname.startsWith(tab.href);

          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                  active ? "bg-tint" : "hover:bg-muted",
                )}
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "size-[20px] transition-transform",
                    active ? "text-primary-pressed stroke-[2.5]" : "text-muted-foreground stroke-[1.75]",
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
