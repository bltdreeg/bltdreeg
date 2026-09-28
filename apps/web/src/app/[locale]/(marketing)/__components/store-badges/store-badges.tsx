// زراير المتاجر السودا (Google Play + App Store) — مشتركة بين الهيرو وقسم التحميل
import { useLocale, useTranslations } from "next-intl";
import { APP_STORE_URL, getAppName, GOOGLE_PLAY_URL } from "@/lib/data/constants/app.constants";
import { cn } from "@/lib/utils/cn.utils";

const BADGE =
  "inline-flex h-12.5 min-w-0 items-center justify-center gap-2 rounded-[13px] border border-white/25 bg-[#0a0d14] px-2 text-white no-underline select-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-13.5 sm:min-w-42 sm:justify-start sm:gap-3 sm:px-4";

function StoreBadges({ className }: { className?: string }) {
  const t = useTranslations("marketing.home.appDownload");
  const appName = getAppName(useLocale());

  return (
    // موبايل: عمودين متساويين جنب بعض — من sm وطالع: صف عادي
    <div className={cn("grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto", className)}>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("googlePlayAria", { appName })}
        className={BADGE}
      >
        <svg viewBox="0 0 24 24" aria-hidden focusable="false" className="size-5 shrink-0 sm:size-6">
          <path d="M3.6 2.3 13.2 12l-9.6 9.7a1.6 1.6 0 0 1-.6-1.3V3.6c0-.5.2-1 .6-1.3Z" fill="#00C4FF" />
          <path d="M16.5 8.7 13.2 12 3.6 2.3c.5-.4 1.2-.4 1.9 0l11 6.4Z" fill="#00E676" />
          <path d="M16.5 15.3 5.5 21.7c-.7.4-1.4.4-1.9 0L13.2 12l3.3 3.3Z" fill="#FF3D47" />
          <path d="m16.5 8.7 4 2.3c1 .6 1 1.5 0 2l-4 2.3L13.2 12l3.3-3.3Z" fill="#FFD400" />
        </svg>
        <span className="flex flex-col text-start leading-none">
          <span className="text-[0.6rem] font-medium tracking-wide whitespace-nowrap opacity-85 sm:text-[0.66rem]">{t("googlePlayEyebrow")}</span>
          <span dir="ltr" className="mt-1 text-[0.9rem] leading-none font-semibold tracking-tight whitespace-nowrap sm:text-[1.12rem]">Google Play</span>
        </span>
      </a>

      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("appStoreAria", { appName })}
        className={BADGE}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" className="size-5 shrink-0 sm:size-[26px]">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
        <span className="flex flex-col text-start leading-none">
          <span className="text-[0.6rem] font-medium tracking-wide whitespace-nowrap opacity-85 sm:text-[0.66rem]">{t("appStoreEyebrow")}</span>
          <span dir="ltr" className="mt-1 text-[0.9rem] leading-none font-semibold tracking-tight whitespace-nowrap sm:text-[1.12rem]">App Store</span>
        </span>
      </a>
    </div>
  );
}

export { StoreBadges };
