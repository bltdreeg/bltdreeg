"use client";

import React from "react";
import { useOnline } from "@/lib/hooks/use-online.hook";

export interface OfflineBannerProps {
  forceVisible?: boolean;
  lastUpdated?: string;
  onRetry?: () => void;
  className?: string;
}

export function OfflineBanner({
  forceVisible,
  lastUpdated,
  onRetry,
  className = "",
}: OfflineBannerProps) {
  const { isOnline, lastOnlineTime, checkOnline } = useOnline();

  const showBanner = forceVisible ?? !isOnline;

  if (!showBanner) return null;

  const displayTime = lastUpdated || lastOnlineTime;

  const handleRetry = () => {
    checkOnline();
    onRetry?.();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      dir="rtl"
      className={`w-full min-h-[46px] bg-[#FEF3C7] border-b border-[#FDE68A] text-[#92400E] flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Custom disconnect icon matching design */}
        <div
          className="relative flex h-[22px] w-[22px] flex-none items-center justify-center"
          aria-hidden="true"
        >
          <div className="absolute right-0 h-[2px] w-[9px] bg-[#92400E] rounded-full" />
          <div className="absolute left-0 h-[2px] w-[9px] bg-[#92400E] rounded-full" />
          <div className="absolute right-[9px] top-1 h-[8px] w-[2px] rotate-[30deg] bg-[#92400E] rounded-full" />
        </div>

        <span className="font-bold text-[13.5px] leading-relaxed font-mono tabular-nums truncate">
          مفيش نت — المواعيد دي آخر تحديث الساعة {displayTime}
        </span>
      </div>

      <button
        type="button"
        onClick={handleRetry}
        className="flex-none inline-flex items-center justify-center h-8 px-3.5 rounded-lg bg-white border border-[#FDE68A] text-[#92400E] font-bold text-[12.5px] leading-none whitespace-nowrap hover:bg-[#FFFBEB] active:scale-95 transition-all shadow-xs cursor-pointer"
      >
        جرّب تاني
      </button>
    </div>
  );
}

