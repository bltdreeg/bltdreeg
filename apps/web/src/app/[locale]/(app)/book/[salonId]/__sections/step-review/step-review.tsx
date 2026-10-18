"use client";

// المراجعة والتأكيد: بنوضح الوعد الحقيقي — رقمك في الطابور دلوقتي، أو إنك هتدخل الطابور وقت الميعاد ورا اللي فيه
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKING_DETAILS } from "@/lib/data/constants/routes.constants";
import type { BranchBarber } from "@/lib/types/reservation";
import type { ApiError } from "@/lib/utils/api/api-error";
import { authErrorMessage } from "@/lib/utils/auth/auth-error-message";

type StepReviewProps = {
  barber: BranchBarber;
  isSlot: boolean;
  whenLabel: string;
  isPending: boolean;
  error: ApiError | null;
  onConfirm: () => void;
  onChangeWhen: () => void;
};

export function StepReview({ barber, isSlot, whenLabel, isPending, error, onConfirm, onChangeWhen }: StepReviewProps) {
  const t = useTranslations("app.bookFlow.review");
  const existingId = error?.code === "booking.already_in_queue" ? error.data.reservation_id : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-card p-5">
        <p className="text-[15px] font-bold text-foreground">
          {isSlot ? t("slotTitle", { when: whenLabel, barber: barber.barber.name }) : t("nowTitle", { barber: barber.barber.name })}
        </p>
        <p className="flex items-start gap-2 text-[13.5px] leading-relaxed text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          {isSlot
            ? t("slotExplainer")
            : barber.queue.peopleInQueue === 0
              ? t("nowEmpty")
              : t("nowQueue", { count: barber.queue.peopleInQueue, minutes: barber.queue.expectedWaitMinutes })}
        </p>
        <p className="text-[12.5px] text-muted-foreground">{t("cancelAnytime")}</p>
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive">
          <span>{authErrorMessage(error)}</span>
          {existingId !== undefined && (
            <Link href={ROUTE_BOOKING_DETAILS(String(existingId))} className="font-bold underline">
              {t("viewCurrent")}
            </Link>
          )}
          {(error.code === "booking.slot_full" || error.code === "booking.slot_unavailable" || error.code === "booking.branch_closed") && (
            <button type="button" onClick={onChangeWhen} className="self-start font-bold underline cursor-pointer">
              {t("pickAnother")}
            </button>
          )}
        </div>
      )}

      <Button type="button" onClick={onConfirm} disabled={isPending} className="h-12 rounded-xl text-[15px] font-extrabold">
        {isPending ? t("confirming") : isSlot ? t("confirmSlot") : t("confirmNow")}
      </Button>
    </div>
  );
}
