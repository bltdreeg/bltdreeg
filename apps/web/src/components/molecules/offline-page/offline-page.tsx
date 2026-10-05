"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { ROUTE_BOOKINGS } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

export interface OfflinePageProps {
  onRetry?: () => void;
  onBrowseCached?: () => void;
  cachedHref?: string;
  className?: string;
  title?: string;
  description?: string;
}

export function OfflinePage({
  onRetry,
  onBrowseCached,
  cachedHref = ROUTE_BOOKINGS,
  className = "",
  title,
  description,
}: OfflinePageProps) {
  const t = useTranslations("common.offlinePage");
  const { checkOnline } = useOnline();

  const pageTitle = title ?? t("defaultTitle");
  const pageDescription = description ?? t("defaultDescription");

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
      role="region"
      aria-label={t("ariaLabel")}
      className={cn(
        "flex min-h-[68vh] w-full flex-col items-center justify-center px-4 py-8 text-center sm:px-6",
        className
      )}
    >
      <div className="flex w-full max-w-[390px] flex-col items-center">
        {/* رسمة انقطاع النت الفيكتورية المطابقة تماماً لـ mobile.html Frame 18 */}
        <svg
          viewBox="0 0 200 170"
          className="w-[190px] h-auto shrink-0"
          aria-hidden="true"
        >
          {/* النقطة السفلية */}
          <path
            d="M100 138h.01"
            stroke="#0E0F11"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* القوس الأول (بترولي) */}
          <path
            d="M78 114a30 30 0 0 1 44 0"
            fill="none"
            stroke="#0F766E"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* القوس الثاني */}
          <path
            d="M58 90a58 58 0 0 1 84 0"
            fill="none"
            stroke="#9FB6B4"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* القوس الثالث الخارجي */}
          <path
            d="M38 66a86 86 0 0 1 124 0"
            fill="none"
            stroke="#DCE4E4"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* الخط المائل الأبيض كطبقة تفريغ */}
          <path
            d="M34 26 168 152"
            stroke="#ffffff"
            strokeWidth="13"
            strokeLinecap="round"
          />
          {/* الخط المائل الأحمر */}
          <path
            d="M34 26 168 152"
            stroke="#EF4444"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* العنوان */}
        <h2 className="mt-5 text-[20px] font-extrabold text-foreground md:text-[22px]">
          {pageTitle}
        </h2>

        {/* الوصف الموجه للمستخدم */}
        <p className="mt-2 mb-6 text-[14px] leading-[1.8] text-muted-foreground">
          {pageDescription}
        </p>

        {/* زر المحاولة من جديد البترولي مع الأيقونة */}
        <button
          type="button"
          onClick={handleRetry}
          className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-primary text-[15px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-pressed active:scale-[0.99]"
        >
          <svg
            className="size-[17px] shrink-0 stroke-[2.2]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 12a8 8 0 1 1-2.6-5.9" />
            <path d="M20.5 4v4.5H16" />
          </svg>
          <span>{t("retry")}</span>
        </button>

        {/* زر تصفح آخر حجز */}
        {cachedHref ? (
          <Link
            href={cachedHref}
            className="mt-2.5 flex h-[48px] w-full items-center justify-center rounded-[10px] border border-border bg-card text-[14.5px] font-bold text-foreground transition-colors hover:bg-muted active:scale-[0.99]"
          >
            {t("browseCached")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onBrowseCached}
            className="mt-2.5 flex h-[48px] w-full cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card text-[14.5px] font-bold text-foreground transition-colors hover:bg-muted active:scale-[0.99]"
          >
            {t("browseCached")}
          </button>
        )}

        {/* نصائح حل المشكلة (Frame 18) */}
        <div className="mt-7 w-full rounded-[14px] border border-border bg-muted/60 p-4 text-start">
          <div className="mb-2.5 text-[13.5px] font-bold text-foreground">
            {t("tipsTitle")}
          </div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="size-[5px] shrink-0 rounded-full bg-muted-foreground" />
            <span className="text-[13px] font-medium text-muted-foreground">
              {t("tip1")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="size-[5px] shrink-0 rounded-full bg-muted-foreground" />
            <span className="text-[13px] font-medium text-muted-foreground">
              {t("tip2")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

