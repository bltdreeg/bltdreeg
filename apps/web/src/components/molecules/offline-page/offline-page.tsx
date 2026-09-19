"use client";

import React from "react";
import Link from "next/link";
import { useOnline } from "@/lib/hooks/use-online.hook";

export interface OfflinePageProps {
  onRetry?: () => void;
  onBrowseCached?: () => void;
  cachedHref?: string;
  className?: string;
}

export function OfflinePage({
  onRetry,
  onBrowseCached,
  cachedHref,
  className = "",
}: OfflinePageProps) {
  const { checkOnline } = useOnline();

  const handleRetry = () => {
    checkOnline();
    if (onRetry) {
      onRetry();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div
      dir="rtl"
      role="region"
      aria-label="صفحة انقطاع الاتصال بالإنترنت"
      className={`flex flex-col items-center justify-center rounded-[14px] border border-[#E5E7EB] bg-[#F7F8FA] p-8 sm:p-14 text-center transition-all ${className}`}
    >
      {/* Custom Disconnected Plug Graphic from FRAME 14 */}
      <div
        className="relative h-[96px] w-[168px] my-2"
        aria-hidden="true"
      >
        {/* Right plug socket */}
        <div className="absolute right-0 top-[38px] h-[20px] w-[54px] rounded-r-[10px] border-[1.5px] border-l-0 border-[#0F766E] bg-[#F0FAF8]" />
        <div className="absolute right-[54px] top-[44px] h-[8px] w-[16px] border-[1.5px] border-l-0 border-[#0F766E] bg-[#F0FAF8]" />

        {/* Left plug socket */}
        <div className="absolute left-0 top-[38px] h-[20px] w-[54px] rounded-l-[10px] border-[1.5px] border-r-0 border-[#0F766E] bg-[#F0FAF8]" />
        <div className="absolute left-[54px] top-[44px] h-[8px] w-[16px] border-[1.5px] border-r-0 border-[#0F766E] bg-[#F0FAF8]" />

        {/* Spark/break indicators in #9FCFC9 */}
        <div className="absolute right-[82px] top-[22px] h-[14px] w-[1.5px] rotate-[28deg] bg-[#9FCFC9] rounded-full" />
        <div className="absolute right-[96px] top-[28px] h-[12px] w-[1.5px] bg-[#9FCFC9] rounded-full" />
        <div className="absolute right-[70px] top-[28px] h-[12px] w-[1.5px] -rotate-[28deg] bg-[#9FCFC9] rounded-full" />
        <div className="absolute right-[82px] top-[62px] h-[14px] w-[1.5px] -rotate-[28deg] bg-[#9FCFC9] rounded-full" />
        <div className="absolute right-[70px] top-[60px] h-[12px] w-[1.5px] rotate-[28deg] bg-[#9FCFC9] rounded-full" />
      </div>

      {/* Heading */}
      <h1 className="mt-2 text-[26px] font-extrabold leading-[1.35] text-[#0E0F11]">
        النت فاصل
      </h1>

      {/* Subtitle */}
      <p className="mt-1 max-w-[540px] text-[14.5px] leading-[1.9] text-[#6B7280]">
        المواعيد اللي شايفها ممكن تكون اتغيّرت، وتأكيد أي حجز جديد محتاج نت.
        حجوزاتك المؤكدة ورقمك في الدور محفوظين ومش هيضيعوا.
      </p>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex h-[46px] flex-none cursor-pointer items-center justify-center whitespace-nowrap rounded-[10px] bg-[#0F766E] px-[22px] font-bold text-[14.5px] leading-none text-white transition-all hover:bg-[#0D655E] active:scale-95 shadow-sm"
        >
          إعادة المحاولة
        </button>

        {cachedHref ? (
          <Link
            href={cachedHref}
            className="inline-flex h-[46px] flex-none items-center justify-center whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white px-[22px] font-bold text-[14.5px] leading-none text-[#0E0F11] transition-all hover:bg-[#F7F8FA] active:scale-95 shadow-xs"
          >
            تصفح آخر البيانات المحفوظة
          </Link>
        ) : (
          <button
            type="button"
            onClick={onBrowseCached}
            className="inline-flex h-[46px] flex-none cursor-pointer items-center justify-center whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white px-[22px] font-bold text-[14.5px] leading-none text-[#0E0F11] transition-all hover:bg-[#F7F8FA] active:scale-95 shadow-xs"
          >
            تصفح آخر البيانات المحفوظة
          </button>
        )}
      </div>
    </div>
  );
}

