import React from "react";
import { cn } from "@/lib/utils/cn.utils";

export interface TicketCardSkeletonProps {
  className?: string;
}

export function TicketCardSkeleton({ className }: TicketCardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-[308px] max-w-full rounded-[14px] border border-[#E5E7EB] bg-white overflow-hidden animate-pulse flex-none",
        className
      )}
    >
      {/* Cover image placeholder */}
      <div className="h-[200px] w-full bg-[#F1F3F5]" />

      {/* Info lines */}
      <div className="flex flex-col gap-[9px] p-[15px_17px_0]">
        <div className="h-[15px] w-[72%] rounded-[5px] bg-[#EDEFF2]" />
        <div className="h-[11px] w-[44%] rounded-[4px] bg-[#F1F3F5]" />
        <div className="h-[11px] w-[56%] rounded-[4px] bg-[#F1F3F5]" />
      </div>

      {/* Perforation line */}
      <div className="mt-[15px] border-t border-dashed border-[#E5E7EB]" />

      {/* Footer / slot & price placeholder */}
      <div className="flex items-end justify-between gap-3 p-[14px_17px_16px]">
        <div className="flex flex-col gap-[7px]">
          <div className="h-[9px] w-[86px] rounded-[4px] bg-[#F1F3F5]" />
          <div className="h-[26px] w-[104px] rounded-[6px] bg-[#EDEFF2]" />
        </div>
        <div className="mb-1 h-[12px] w-[62px] rounded-[4px] bg-[#F1F3F5]" />
      </div>
    </div>
  );
}

