"use client";

import { useEffect, useState } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [timestamp, setTimestamp] = useState("17/09/2026 21:14");

  useEffect(() => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    setTimestamp(`${day}/${month}/${year} ${hours}:${minutes}`);
  }, []);

  const errorCode = error?.digest ? `ERR-${error.digest.slice(0, 5)}` : "ERR-5031";

  return (
    <section
      role="alert"
      dir="rtl"
      className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-[480px] overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm">
        {/* Brand bar */}
        <div className="flex h-[46px] items-center bg-[#0F766E] px-[22px]">
          <span className="font-black text-[16px] leading-none text-white tracking-wide">
            بالتدريج
          </span>
        </div>

        {/* Content area */}
        <div className="flex flex-col items-center gap-4 p-8 sm:p-[44px_36px] text-center">
          {/* Custom Error Exclamation Graphic from FRAME 14 */}
          <div
            className="relative h-[92px] w-[150px] my-1"
            aria-hidden="true"
          >
            <div className="absolute right-[40px] top-[8px] h-[70px] w-[70px] rounded-full border-[1.5px] border-[#0F766E] bg-[#F0FAF8]" />
            <div className="absolute right-[74px] top-[24px] h-[22px] w-[2px] rounded-full bg-[#0F766E]" />
            <div className="absolute right-[74px] top-[52px] h-[2px] w-[2px] rounded-full bg-[#0F766E]" />
            <div className="absolute right-[20px] top-[34px] h-[1.5px] w-[18px] rounded-full bg-[#9FCFC9]" />
            <div className="absolute right-[16px] top-[46px] h-[1.5px] w-[12px] rounded-full bg-[#CFE6E3]" />
            <div className="absolute left-[18px] top-[34px] h-[1.5px] w-[18px] rounded-full bg-[#9FCFC9]" />
            <div className="absolute left-[14px] top-[46px] h-[1.5px] w-[12px] rounded-full bg-[#CFE6E3]" />
          </div>

          <h1 className="text-[24px] font-extrabold leading-[1.35] text-[#0E0F11]">
            حصلت مشكلة عندنا
          </h1>

          <p className="max-w-[380px] text-[14px] leading-[1.8] text-[#6B7280]">
            مش مشكلة في النت بتاعك — الخدمة عندنا مش ردّت. حجوزاتك المؤكدة ورقمك في الدور مأمّنين.
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-[44px] flex-none cursor-pointer items-center justify-center whitespace-nowrap rounded-[10px] bg-[#0F766E] px-5 font-bold text-[14px] leading-none text-white transition-all hover:bg-[#0D655E] active:scale-95 shadow-sm"
            >
              جرّب تاني
            </button>
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[44px] flex-none items-center justify-center whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white px-[18px] font-bold text-[14px] leading-none text-[#0E0F11] transition-all hover:bg-[#F7F8FA] active:scale-95 shadow-xs"
            >
              كلّم الدعم
            </a>
          </div>

          <span className="mt-2 text-[12px] font-normal leading-none text-[#6B7280] font-mono tabular-nums ltr [direction:ltr]">
            {errorCode} · {timestamp}
          </span>
        </div>
      </div>
    </section>
  );
}
