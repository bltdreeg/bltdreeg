import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import { ROUTE_HOME, ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

export default function NotFound() {
  const t = useTranslations("common.notFoundPage");
  const locale = useLocale();

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-[480px] overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm">
        {/* Brand bar */}
        <div className="flex h-[46px] items-center bg-[#0F766E] px-[22px]">
          <span className="font-black text-[16px] leading-none text-white tracking-wide">
            {getAppName(locale)}
          </span>
        </div>

        {/* Content area */}
        <div className="flex flex-col items-center gap-4 p-8 sm:p-[44px_36px] text-center">
          {/* Custom Search & Missing Card Graphic from FRAME 14 */}
          <div
            className="relative h-[92px] w-[150px] my-1"
            aria-hidden="true"
          >
            {/* Card outline */}
            <div className="absolute right-[26px] top-[6px] h-[62px] w-[84px] rounded-[10px] border-[1.5px] border-[#0F766E] bg-[#F0FAF8]" />
            <div className="absolute right-[26px] top-[24px] h-[1.5px] w-[84px] bg-[#9FCFC9]" />
            <div className="absolute right-[34px] top-[13px] h-[1.5px] w-[8px] bg-[#0F766E]" />
            <div className="absolute right-[46px] top-[13px] h-[1.5px] w-[8px] bg-[#9FCFC9]" />
            <div className="absolute right-[38px] top-[38px] h-[1.5px] w-[32px] bg-[#CFE6E3]" />
            <div className="absolute right-[38px] top-[50px] h-[1.5px] w-[20px] bg-[#CFE6E3]" />

            {/* Magnifying glass */}
            <div className="absolute left-[14px] top-[44px] h-[38px] w-[38px] rounded-full border-[1.5px] border-[#0F766E] bg-white" />
            <div className="absolute left-[8px] top-[80px] h-[1.5px] w-[16px] rotate-45 bg-[#0F766E]" />
            <div className="absolute left-[24px] top-[60px] h-[1.5px] w-[14px] -rotate-[20deg] bg-[#9FCFC9]" />
          </div>

          <h1 className="text-[24px] font-extrabold leading-[1.35] text-[#0E0F11]">
            {t("title")}
          </h1>

          <p className="max-w-[380px] text-[14px] leading-[1.8] text-[#6B7280]">
            {t("description")}
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href={ROUTE_SEARCH}
              className="inline-flex h-[44px] flex-none items-center justify-center whitespace-nowrap rounded-[10px] bg-[#0F766E] px-5 font-bold text-[14px] leading-none text-white transition-all hover:bg-[#0D655E] active:scale-95 shadow-sm"
            >
              {t("salonsInMaadi")}
            </Link>
            <Link
              href={ROUTE_HOME}
              className="inline-flex h-[44px] flex-none items-center justify-center whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white px-[18px] font-bold text-[14px] leading-none text-[#0E0F11] transition-all hover:bg-[#F7F8FA] active:scale-95 shadow-xs"
            >
              {t("home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
