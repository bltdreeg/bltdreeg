// تخطيط التطبيق: هيدر وفوتر وشريط تنقل سفلي للموبايل — الهيدر وشريط التنقل بيتخفوا في مسار الحجز
"use client";

import { usePathname } from "@/i18n/navigation";
import { BottomNav } from "@/components/molecules/bottom-nav";
import { Header } from "@/components/molecules/header";
import { OfflineBanner } from "@/components/molecules/offline-banner";
import { ROUTE_BOOK_ROOT } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inBookingFlow = pathname.startsWith(ROUTE_BOOK_ROOT) && !pathname.includes("/confirmation/");

  return (
    <div className="flex min-h-screen flex-col">
      {!inBookingFlow && <Header />}
      <OfflineBanner />
      <main className={cn("flex-1", !inBookingFlow && "pb-20 md:pb-0")}>{children}</main>
      {!inBookingFlow && <BottomNav />}
    </div>
  );
}
