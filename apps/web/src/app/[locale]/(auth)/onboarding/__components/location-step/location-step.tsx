"use client";

// خطوة تأكيد الموقع: قائمتين (محافظة ← مدينة) متعبّيين مبدئياً (GPS أو IP) — العميل بيأكّد أو يغيّر بس، والسيرفر بيحدد المنطقة من المدينة
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LocateFixed } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCities, useGovernorates } from "@/lib/hooks/geo";
import { useConfirmLocation, useLocationPrefill } from "@/lib/hooks/user";
import type { Customer } from "@/lib/types/auth";
import type { GeoDivision } from "@/lib/types/geo";
import { toConfirmPayload } from "@/lib/utils/location/location-choice";
import {
  locationStepSchema,
  type LocationStepValues,
} from "./location-step.schema";

interface LocationStepProps {
  onDone: (user: Customer) => void;
}

export function LocationStep({ onDone }: LocationStepProps) {
  const t = useTranslations("auth.onboarding.location");
  const prefill = useLocationPrefill();
  const confirm = useConfirmLocation();
  const [retriedGps, setRetriedGps] = useState(false);
  const prefilled = prefill.data?.location;
  // القيم المبدئية من GPS/IP؛ keepDirtyValues بيحافظ على اللي العميل غيّره لو الموقع اتحدّث بعد كده
  const { control, handleSubmit, setValue, watch } =
    useForm<LocationStepValues>({
      resolver: zodResolver(locationStepSchema),
      values: {
        governorateId: prefilled?.governorate.id ?? "",
        cityId: prefilled?.city.id ?? "",
      },
      resetOptions: { keepDirtyValues: true },
    });
  const governorateId = watch("governorateId");
  const cityId = watch("cityId");

  // المحافظات بتتحمّل أول ما العميل يفتح القائمة؛ لحد وقتها بنعرض محافظة التعبئة المبدئية بس
  const [governoratesRequested, setGovernoratesRequested] = useState(false);
  const governorates = useGovernorates(governoratesRequested);
  // المدن بنفس الفكرة: بتتحمّل لما العميل يفتح القائمة أو يغيّر المحافظة (لازم يختار مدينة جديدة)
  const [citiesRequested, setCitiesRequested] = useState(false);
  const cities = useCities(governorateId || null, citiesRequested);
  const prefilledCity =
    prefilled && governorateId === prefilled.governorate.id
      ? [prefilled.city]
      : undefined;

  const source = prefilled?.source;
  const canSubmit = !!(cityId && prefilled) && !confirm.isPending;

  function onValid() {
    if (!cityId || !prefilled) return;
    confirm.mutate(toConfirmPayload(cityId, prefilled), { onSuccess: onDone });
  }

  // الفورم مبيظهرش غير لما الموقع يتحدد، عشان مفيش قوائم فاضية بتتغير تحت إيد العميل
  if (prefill.isPending) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 p-10 text-sm text-[#6B7280]"
      >
        <Loader2 className="size-7 animate-spin text-[#0F766E]" aria-hidden />
        {t("loading")}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className="mx-auto flex w-full max-w-[420px] flex-col gap-5 p-6"
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-extrabold leading-tight text-[#0E0F11]">
          {t("title")}
        </h1>
        <p className="text-sm leading-relaxed text-[#6B7280]">
          {t("subtitle")}
        </p>
      </div>

      {prefill.data?.gps === "denied" && (
        <p className="text-[13px] text-[#8A5A00]">{t("denied")}</p>
      )}
      {(prefill.data?.gps === "unavailable" ||
        prefill.data?.gps === "outside") && (
        <p className="text-[13px] text-[#8A5A00]">{t("unavailable")}</p>
      )}
      {(source === "ip" || source === "default") && (
        <p className="text-[13px] text-[#8A5A00]">{t("approximate")}</p>
      )}
      {prefill.data?.gps !== "granted" && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            // بنطلب الإذن تاني؛ المتصفحات اللي بتحفظ الرفض هتفضل مقفولة وده بنوضّحه تحت
            onClick={() => {
              setRetriedGps(true);
              void prefill.refetch();
            }}
            disabled={prefill.isFetching}
            className="flex h-11 items-center justify-center gap-2 rounded-[11px] border border-[#0F766E] text-sm font-bold text-[#0F766E] transition-colors hover:bg-[#0F766E]/5 disabled:opacity-50 cursor-pointer"
          >
            {prefill.isFetching ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LocateFixed className="size-4" aria-hidden />
            )}
            {prefill.isFetching ? t("loading") : t("retryGps")}
          </button>
          {retriedGps &&
            !prefill.isFetching &&
            prefill.data?.gps === "denied" && (
              <p className="text-[13px] text-[#8A5A00]">{t("deniedHelp")}</p>
            )}
        </div>
      )}

      <Controller
        control={control}
        name="governorateId"
        render={({ field }) => (
          <GeoSelect
            label={t("governorate")}
            placeholder={t("choose")}
            value={field.value}
            options={
              governorates.data ??
              (prefilled ? [prefilled.governorate] : undefined)
            }
            onOpen={() => setGovernoratesRequested(true)}
            onChange={(id) => {
              field.onChange(id);
              setCitiesRequested(true);
              setValue("cityId", "", { shouldDirty: true });
            }}
          />
        )}
      />
      <Controller
        control={control}
        name="cityId"
        render={({ field }) => (
          <GeoSelect
            label={t("city")}
            placeholder={t("choose")}
            value={field.value}
            options={cities.data ?? prefilledCity}
            onOpen={() => setCitiesRequested(true)}
            onChange={field.onChange}
          />
        )}
      />

      {confirm.isError && (
        <p role="alert" className="text-[13px] text-red-600">
          {t("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="h-12 rounded-[11px] bg-[#0F766E] text-sm font-bold text-white transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {t("continue")}
      </button>
    </form>
  );
}

interface GeoSelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: Pick<GeoDivision, "id" | "name">[] | undefined;
  onChange: (id: string) => void;
  onOpen?: () => void;
}

function GeoSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  onOpen,
}: GeoSelectProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold text-[#0E0F11]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={!options}
        onFocus={onOpen}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-[11px] border border-[#E5E7EB] bg-white px-3 text-sm text-[#0E0F11] disabled:opacity-50"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
