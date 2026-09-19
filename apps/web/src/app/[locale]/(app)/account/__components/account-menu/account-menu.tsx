// قائمة حسابي: الحساب / التطبيق / المساعدة — شبكة من 3 كروت مطابقة للتصميم
"use client";

import {
  User,
  Heart,
  Calendar,
  Globe,
  Bell,
  Sliders,
  HelpCircle,
  FileText,
  Info,
  ChevronLeft,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/atoms/sheet";
import {
  ROUTE_BOOKINGS,
  ROUTE_FAVORITES,
} from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

type AccountMenuProps = {
  favoriteCount?: number;
  upcomingBookingsCount?: number;
};

export function AccountMenu({
  favoriteCount = 4,
  upcomingBookingsCount = 2,
}: AccountMenuProps) {
  const COMING_SOON = (
    <p className="text-sm text-muted-foreground">قريباً في التحديث القادم</p>
  );

  return (
    <nav
      aria-label="خيارات الحساب"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      {/* 1 — الحساب */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-[18px] py-[14px]">
          <h3 className="text-[13px] font-bold text-muted-foreground">الحساب</h3>
        </div>

        <div className="divide-y divide-border/60">
          {/* الملف الشخصي */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <User className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                الملف الشخصي
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title="الملف الشخصي">{COMING_SOON}</SheetContent>
          </Sheet>

          {/* الصالونات المفضلة */}
          <Link
            href={ROUTE_FAVORITES}
            className="flex items-center gap-3.5 px-[18px] py-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
              <Heart className="size-4 text-primary" />
            </div>
            <div className="flex flex-1 items-center gap-2.5">
              <span className="text-[14.5px] font-semibold text-foreground">
                الصالونات المفضلة
              </span>
              <span className="flex h-5.5 items-center justify-center rounded-md border border-tint-border bg-tint px-2 text-[11.5px] font-bold text-primary-pressed">
                {favoriteCount}
              </span>
            </div>
            <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          </Link>

          {/* حجوزاتي */}
          <Link
            href={ROUTE_BOOKINGS}
            className="flex items-center gap-3.5 px-[18px] py-4 transition-colors hover:bg-muted/40"
          >
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
              <Calendar className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-1 items-center gap-2.5">
              <span className="text-[14.5px] font-semibold text-foreground">
                حجوزاتي
              </span>
              <span className="text-[12.5px] text-muted-foreground">
                {upcomingBookingsCount} قادمة
              </span>
            </div>
            <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </div>
      </div>

      {/* 2 — التطبيق */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-[18px] py-[14px]">
          <h3 className="text-[13px] font-bold text-muted-foreground">التطبيق</h3>
        </div>

        <div className="divide-y divide-border/60">
          {/* لغة التطبيق */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <Globe className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                لغة التطبيق
              </span>
              <span className="text-[13.5px] font-semibold text-muted-foreground">
                العربية
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title="لغة التطبيق">{COMING_SOON}</SheetContent>
          </Sheet>

          {/* الإشعارات */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <Bell className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[14.5px] font-semibold text-foreground">
                  الإشعارات
                </span>
                <span className="text-[12.5px] text-muted-foreground">
                  واتساب والتطبيق
                </span>
              </div>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title="الإشعارات">{COMING_SOON}</SheetContent>
          </Sheet>

          {/* الإعدادات */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <Sliders className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                الإعدادات
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title="الإعدادات">{COMING_SOON}</SheetContent>
          </Sheet>
        </div>
      </div>

      {/* 3 — المساعدة */}
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-[18px] py-[14px]">
          <h3 className="text-[13px] font-bold text-muted-foreground">
            المساعدة
          </h3>
        </div>

        <div className="divide-y divide-border/60">
          {/* الدعم والمساعدة */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <HelpCircle className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[14.5px] font-semibold text-foreground">
                  الدعم والمساعدة
                </span>
                <span className="text-[12.5px] text-muted-foreground">
                  شكوى على حجز أو مشكلة في الدور
                </span>
              </div>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title="الدعم والمساعدة">{COMING_SOON}</SheetContent>
          </Sheet>

          {/* الشروط والخصوصية */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                الشروط والخصوصية
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title="الشروط والخصوصية">{COMING_SOON}</SheetContent>
          </Sheet>

          {/* عن بالتدريج */}
          <Sheet>
            <SheetTrigger className="flex w-full items-center gap-3.5 px-[18px] py-4 text-start transition-colors hover:bg-muted/40 cursor-pointer">
              <div className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border bg-muted/50">
                <Info className="size-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14.5px] font-semibold text-foreground">
                عن بالتدريج
              </span>
              <ChevronLeft className="size-4 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
            </SheetTrigger>
            <SheetContent title="عن بالتدريج">{COMING_SOON}</SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
