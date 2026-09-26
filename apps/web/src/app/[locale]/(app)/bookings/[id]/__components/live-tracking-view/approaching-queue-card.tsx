"use client";

// كارت "قرّب دورك" — مطابق 1:1 لتصميم شاشة الموبايل المرفقة
import { Navigation, Users } from "lucide-react";
import { useTranslations } from "next-intl";

interface ApproachingQueueCardProps {
  queueNumber?: number;
  peopleAhead?: number;
  travelMinutes?: number;
  estimatedMinutes?: number;
  distanceText?: string;
  salonName?: string;
  onLeaveQueue: () => void;
}

export function ApproachingQueueCard({
  queueNumber = 2,
  peopleAhead = 1,
  travelMinutes = 6,
  estimatedMinutes = 9,
  distanceText = "1.2 كم",
  salonName = "صالون بربر لاونج",
  onLeaveQueue,
}: ApproachingQueueCardProps) {
  const t = useTranslations("app.liveTracking.approaching");
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(salonName)}`;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 1. الشريط العلوي البرتقالي التنبيهي: اتحرّك دلوقتي */}
      <div className="flex items-center justify-between rounded-2xl bg-[#EA580C] px-5 py-4 text-white shadow-sm">
        <div className="flex flex-col gap-0.5 text-start">
          <span className="text-base sm:text-lg font-black tracking-tight leading-tight">
            {t("moveNow")}
          </span>
          <span className="text-xs sm:text-[13px] font-semibold text-white/95 leading-tight">
            {t("travelSummary", { travel: travelMinutes, estimated: estimatedMinutes })}
          </span>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Navigation className="size-5 text-white stroke-[2.5]" />
        </div>
      </div>

      {/* 2. كارت رقم الدور بلون بيج دافئ وشارة "فاضلك واحد بس" */}
      <div className="flex flex-col items-center justify-center rounded-3xl border border-[#FDE68A]/70 bg-[#FEF9EE] p-6 sm:p-8 text-center shadow-xs">
        <span className="text-sm font-extrabold text-[#92400E]">
          {t("queueNumberLabel")}
        </span>

        {/* الرقم البني الضخم */}
        <span className="my-1 text-7xl sm:text-8xl font-black tracking-tight text-[#B45309] tabular-nums font-mono">
          {queueNumber}
        </span>

        {/* شارة بيضاوية بيضاء: فاضلك واحد بس */}
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#FDE68A] bg-white px-5 py-2 shadow-xs">
          <Users className="size-4 text-[#B45309]" />
          <span className="text-sm font-extrabold text-[#92400E]">
            {t("onlyAhead", { count: peopleAhead })}
          </span>
        </div>
      </div>

      {/* 3. شريط المراحل الثلاثي (Segmented Progress Bar) */}
      <div className="flex flex-col gap-2 px-1">
        <div className="grid grid-cols-3 gap-2">
          {/* المرحلة 1: دخلت الطابور (أخضر تيل) */}
          <div className="h-2 rounded-full bg-[#0F766E]" />
          {/* المرحلة 2: قرّب دورك (برتقالي نشط) */}
          <div className="h-2 rounded-full bg-[#EA580C] shadow-xs" />
          {/* المرحلة 3: دورك دلوقتي (رمادي غير نشط) */}
          <div className="h-2 rounded-full bg-[#E5E7EB]" />
        </div>

        <div className="grid grid-cols-3 text-center text-xs">
          <span className="font-semibold text-[#0F766E]">
            {t("stageJoined")}
          </span>
          <span className="font-black text-[#EA580C]">
            {t("stageApproaching")}
          </span>
          <span className="font-semibold text-muted-foreground/70">
            {t("stageYourTurn")}
          </span>
        </div>
      </div>

      {/* 4. كارت المسافة والوقت المتوقع (عمودين) */}
      <div className="grid grid-cols-2 divide-x divide-border rtl:divide-x-reverse rounded-2xl border border-border bg-card p-4 text-center shadow-xs">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-muted-foreground">
            {t("expectedTime")}
          </span>
          <span className="mt-1 text-2xl font-black text-foreground tabular-nums">
            {t("minutesShort", { count: estimatedMinutes })}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-muted-foreground">
            {t("distance")}
          </span>
          <span className="mt-1 text-2xl font-black text-foreground tabular-nums">
            {distanceText}
          </span>
        </div>
      </div>

      {/* 5. زرا الإجراءات: الاتجاهات والخروج */}
      <div className="flex flex-col gap-2.5 pt-1">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] text-sm sm:text-base font-extrabold text-white shadow-sm hover:bg-[#0B5A54] active:scale-98 transition-all cursor-pointer"
        >
          <Navigation className="size-4 stroke-[2.5]" />
          <span>{t("openDirections")}</span>
        </a>

        <button
          type="button"
          onClick={onLeaveQueue}
          className="flex h-12 w-full items-center justify-center rounded-xl border border-[#FECACA] bg-card text-sm font-extrabold text-[#EF4444] hover:bg-red-50 active:scale-98 transition-all cursor-pointer"
        >
          {t("leaveQueue")}
        </button>
      </div>
    </div>
  );
}

