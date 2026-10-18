"use client";

// مسار الحجز في الطابور الحي: الحلاق ← الوقت (دلوقتي أو ميعاد دخول) ← المراجعة.
// الاختيارات في الـ URL، والخدمات جاية من صفحة الصالون (?service=)
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Link, useRouter } from "@/i18n/navigation";
import { ROUTE_BOOK, ROUTE_BOOKING_DETAILS, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import { useBranch } from "@/lib/hooks/branches";
import { useBranchBarbers, useChairSlots, useCreateReservation } from "@/lib/hooks/reservations";
import {
  bookingStep,
  parseBookingSelection,
  toBookingQuery,
  type BookingSelection,
} from "@/lib/utils/reservations/booking-flow-params";
import { formatClock, slotDayLabel } from "@/lib/utils/reservations/slot-format";
import { BookingShell } from "../booking-shell";
import { BookingSummaryPanel } from "../booking-summary-panel";
import { StepBarber } from "../../__sections/step-barber";
import { StepReview } from "../../__sections/step-review";
import { StepWhen } from "../../__sections/step-when";

export function BookingFlow({ branchId }: { branchId: string }) {
  const t = useTranslations("app.bookFlow");
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const selection = parseBookingSelection(params);
  const step = bookingStep(selection);

  const branch = useBranch(branchId, null);
  const barbers = useBranchBarbers(branchId);
  const slots = useChairSlots(branchId, selection.chairId, selection.when === "slot");
  const create = useCreateReservation();

  const go = (next: BookingSelection) => {
    create.reset();
    const query = toBookingQuery(next);
    router.push(query ? `${ROUTE_BOOK(branchId)}?${query}` : ROUTE_BOOK(branchId), { scroll: false });
  };

  if (branch.isPending) {
    return <div role="status" className="min-h-[60vh]" aria-label={t("loading")} />;
  }

  if (branch.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-[15px] font-bold">{branch.error.status === 404 ? t("salonMissing") : t("loadError")}</p>
        <Link href={ROUTE_SALON(branchId)} className="font-bold text-primary underline">
          {t("backToSalon")}
        </Link>
      </div>
    );
  }

  const allServices = branch.data.serviceCategories.flatMap((category) => category.services);
  const services = allServices.filter((service) => selection.serviceIds.includes(service.id));

  // من غير خدمات صالحة مفيش حجز — نرجّعه لصفحة الصالون يختار
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-[15px] font-bold">{t("noServices")}</p>
        <Button nativeButton={false} render={<Link href={ROUTE_SALON(branchId)} />} className="h-11 rounded-xl px-6 font-bold">
          {t("chooseServices")}
        </Button>
      </div>
    );
  }

  const chair = barbers.data?.barbers.find((row) => row.chairId === selection.chairId) ?? null;
  const slot = slots.data?.find((row) => row.id === selection.slotId) ?? null;
  const dayText = (day: string) => {
    const label = slotDayLabel(day, locale);
    return label.kind === "date" ? label.label : t(`when.${label.kind}`);
  };
  const whenLabel =
    selection.when === "join_now"
      ? t("summary.now")
      : slot
        ? `${dayText(slot.day)} · ${formatClock(slot.time, locale)}`
        : undefined;

  const serviceSummary = t("summary.servicesCount", { count: services.length });
  const confirm = () => {
    if (!chair) return;
    create.mutate(
      selection.when === "slot"
        ? { type: "slot", slotId: selection.slotId ?? undefined, serviceIds: selection.serviceIds }
        : { type: "join_now", chairId: chair.chairId, serviceIds: selection.serviceIds },
      { onSuccess: (reservation) => router.replace(ROUTE_BOOKING_DETAILS(reservation.id)) },
    );
  };

  // الكرسي أو الميعاد اللي في الـ URL مبقاش متاح (اتملى/الحلاق مشي): نرجع خطوة
  const chairMissing = step !== "barber" && barbers.isSuccess && !chair;
  const slotMissing = step === "review" && selection.when === "slot" && slots.isSuccess && !slot;

  return (
    <BookingShell
      branchId={branchId}
      salonName={branch.data.salon.name}
      step={chairMissing ? "barber" : slotMissing ? "when" : step}
      serviceSummary={serviceSummary}
      barberSummary={chair?.barber.name}
      whenSummary={whenLabel}
      title={t(`titles.${chairMissing ? "barber" : slotMissing ? "when" : step}`)}
      subtitle={t(`subtitles.${chairMissing ? "barber" : slotMissing ? "when" : step}`)}
      panel={
        <BookingSummaryPanel
          branch={branch.data}
          services={services}
          barberName={chair?.barber.name}
          whenLabel={step === "review" ? whenLabel : undefined}
        />
      }
    >
      {(chairMissing || slotMissing) && (
        <p role="status" className="mb-4 rounded-xl bg-warning-bg/70 px-3.5 py-2.5 text-[13px] text-warning-fg">
          {chairMissing ? t("chairGone") : t("slotGone")}
        </p>
      )}

      {step === "barber" || chairMissing ? (
        <StepBarber
          barbers={barbers.data?.barbers}
          isLoading={barbers.isPending}
          selectedChairId={selection.chairId}
          onSelect={(chairId) => go({ ...selection, chairId, when: null, slotId: null })}
        />
      ) : !chair ? (
        <div role="status" className="min-h-40" />
      ) : step === "when" || slotMissing ? (
        <StepWhen
          branchId={branchId}
          barber={chair}
          onJoinNow={() => go({ ...selection, when: "join_now", slotId: null })}
          onPickSlot={(slotId) => go({ ...selection, when: "slot", slotId })}
        />
      ) : (
        <StepReview
          barber={chair}
          isSlot={selection.when === "slot"}
          whenLabel={whenLabel ?? ""}
          isPending={create.isPending}
          error={create.error}
          onConfirm={confirm}
          onChangeWhen={() => go({ ...selection, when: null, slotId: null })}
        />
      )}

      {step !== "barber" && !chairMissing && (
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 text-[13.5px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {t("back")}
        </button>
      )}
    </BookingShell>
  );
}
