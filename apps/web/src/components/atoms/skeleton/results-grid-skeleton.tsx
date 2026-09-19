import React from "react";
import { cn } from "@/lib/utils/cn.utils";

export interface ResultsGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ResultsGridSkeleton({
  count = 3,
  className,
}: ResultsGridSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="rounded-[14px] border border-[#E5E7EB] bg-white overflow-hidden animate-pulse"
        >
          {/* Cover image placeholder */}
          <div className="h-[160px] w-full bg-[#F1F3F5]" />

          {/* Info lines */}
          <div className="flex flex-col gap-2 p-[14px_16px_0]">
            <div
              className="h-[14px] rounded-[5px] bg-[#EDEFF2]"
              style={{ width: i % 3 === 0 ? "70%" : i % 3 === 1 ? "62%" : "74%" }}
            />
            <div
              className="h-[10px] rounded-[4px] bg-[#F1F3F5]"
              style={{ width: i % 3 === 0 ? "82%" : i % 3 === 1 ? "76%" : "68%" }}
            />
            <div
              className="h-[10px] rounded-[4px] bg-[#F1F3F5]"
              style={{ width: i % 3 === 0 ? "50%" : i % 3 === 1 ? "44%" : "52%" }}
            />
          </div>

          {/* Perforation line */}
          <div className="mt-[13px] border-t border-dashed border-[#E5E7EB]" />

          {/* Available slots preview placeholders */}
          <div className="flex flex-col gap-2.5 p-[13px_16px_15px]">
            <div className="h-[9px] w-[110px] rounded-[4px] bg-[#F1F3F5]" />
            <div className="flex gap-1.5">
              <div className="h-[38px] flex-1 rounded-lg bg-[#F1F3F5]" />
              <div className="h-[38px] flex-1 rounded-lg bg-[#F1F3F5]" />
              {i % 2 === 0 && (
                <div className="h-[38px] flex-1 rounded-lg bg-[#F1F3F5]" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

