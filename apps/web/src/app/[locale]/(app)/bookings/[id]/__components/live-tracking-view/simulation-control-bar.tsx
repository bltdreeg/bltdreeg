"use client";

// شريط تحكم المحاكاة المباشر (Simulation Control Bar) لتجربة تحديث الطابور Real-Time
import { useTranslations } from "next-intl";
import { Play, Pause, Sparkles, FastForward } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

export type LiveQueueSimStage =
  | "waiting"
  | "approaching"
  | "yourTurn"
  | "inService"
  | "completed";

interface SimulationControlBarProps {
  currentStage: LiveQueueSimStage;
  onSelectStage: (stage: LiveQueueSimStage) => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  secondsToNext: number;
}

export function SimulationControlBar({
  currentStage,
  onSelectStage,
  autoPlay,
  onToggleAutoPlay,
  secondsToNext,
}: SimulationControlBarProps) {
  const t = useTranslations("app.liveTracking.simulation");

  const stages: { key: LiveQueueSimStage; label: string }[] = [
    { key: "waiting", label: t("stageWaiting") },
    { key: "approaching", label: t("stageApproaching") },
    { key: "yourTurn", label: t("stageYourTurn") },
    { key: "inService", label: t("stageInService") },
    { key: "completed", label: t("stageCompleted") },
  ];

  return (
    <div className="w-full rounded-2xl border border-primary/25 bg-primary/5 p-3 sm:p-3.5 mb-6 shadow-xs font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-primary/15">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
            <Sparkles className="size-4" />
          </span>
          <div className="flex flex-col text-start">
            <span className="text-xs sm:text-sm font-black text-foreground">
              {t("title")}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {t("subtitle")}
            </span>
          </div>
        </div>

        {/* زر تشغيل / إيقاف التحديث التلقائي وعداد الثواني */}
        <div className="flex items-center gap-2">
          {autoPlay ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold tabular-nums">
              <span className="size-2 rounded-full bg-emerald-600 animate-ping" />
              <span>{t("nextInSeconds", { seconds: secondsToNext })}</span>
            </div>
          ) : (
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {t("paused")}
            </span>
          )}

          <button
            type="button"
            onClick={onToggleAutoPlay}
            className="flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-xs"
          >
            {autoPlay ? (
              <>
                <Pause className="size-3.5 text-amber-600" />
                <span>{t("pause")}</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 text-emerald-600" />
                <span>{t("play")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* أزرار التنقل الفوري بين الحالات */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-bold">
        {stages.map((st, idx) => {
          const isActive = currentStage === st.key;
          return (
            <button
              key={st.key}
              type="button"
              onClick={() => onSelectStage(st.key)}
              className={cn(
                "flex h-8.5 items-center justify-center gap-1 rounded-xl transition-all cursor-pointer px-2 text-center",
                isActive
                  ? "bg-[#0F766E] text-white shadow-xs font-black ring-2 ring-[#0F766E]/30"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              )}
            >
              <span className="text-[10.5px] opacity-75">{idx + 1}.</span>
              <span className="truncate">{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

