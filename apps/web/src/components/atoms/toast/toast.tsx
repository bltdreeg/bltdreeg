"use client";

import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useToast, ToastItem } from "./toast-context";

export function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const { type, title, description, action } = toast;

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-r-[#16A34A]";
      case "error":
        return "border-r-[#EF4444]";
      case "info":
      default:
        return "border-r-[#0F766E]";
    }
  };

  const renderIcon = () => {
    switch (type) {
      case "success":
        return (
          <div
            className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-[#16A34A]"
            aria-hidden="true"
          >
            <div className="-mt-0.5 h-[4.5px] w-[9px] -rotate-45 border-b-2 border-l-2 border-white" />
          </div>
        );
      case "error":
        return (
          <div
            className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-[#EF4444] font-bold text-white text-[13px] leading-none"
            aria-hidden="true"
          >
            !
          </div>
        );
      case "info":
      default:
        return (
          <div
            className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-[1.5px] border-[#0F766E] bg-[#F0FAF8] font-bold text-[#0B5A54] text-[12px] leading-none"
            aria-hidden="true"
          >
            i
          </div>
        );
    }
  };

  const getActionColor = () => {
    switch (type) {
      case "error":
        return "text-[#EF4444] hover:text-[#DC2626]";
      case "success":
      case "info":
      default:
        return "text-[#0F766E] hover:text-[#0D655E]";
    }
  };

  return (
    <div
      role="status"
      aria-live={type === "error" ? "assertive" : "polite"}
      dir="rtl"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-[#E5E7EB] border-r-4 bg-white p-[15px_17px] shadow-[0_8px_22px_rgba(14,15,17,0.09)] transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${getBorderColor()}`}
    >
      {renderIcon()}

      <div className="flex flex-1 min-w-0 flex-col gap-1.5">
        <span className="font-bold text-[14px] leading-snug text-[#0E0F11]">
          {title}
        </span>
        <span className="font-normal text-[12.5px] leading-relaxed text-[#6B7280] font-mono tabular-nums">
          {description}
        </span>
      </div>

      {action && (
        <div className="flex-none pt-0.5">
          {action.href ? (
            <Link
              href={action.href}
              onClick={() => onDismiss()}
              className={`whitespace-nowrap font-bold text-[12.5px] leading-none transition-colors ${getActionColor()}`}
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                action.onClick?.();
                onDismiss();
              }}
              className={`whitespace-nowrap font-bold text-[12.5px] leading-none transition-colors ${getActionColor()}`}
            >
              {action.label}
            </button>
          )}
        </div>
      )}

      {/* Dismiss button for persistent / error toasts */}
      {type === "error" && !action && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="إغلاق التنبيه"
          className="flex-none text-muted-foreground/60 hover:text-foreground p-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      aria-label="التنبيهات"
      className="pointer-events-none fixed bottom-6 left-6 z-50 flex w-full max-w-[360px] flex-col gap-3 sm:max-w-[400px]"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </aside>
  );
}

