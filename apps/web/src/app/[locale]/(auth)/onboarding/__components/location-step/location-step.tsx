"use client";

// خطوة تأكيد الموقع: ٣ قوائم متسلسلة متعبّية مبدئياً (GPS أو IP) — العميل بيأكّد أو يغيّر بس
import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { useAreas, useCities, useGovernorates } from "@/lib/hooks/geo";
import { useConfirmLocation, useLocationPrefill } from "@/lib/hooks/user";
import type { Customer } from "@/lib/types/auth";
import type { GeoDivision } from "@/lib/types/geo";
import { toConfirmPayload } from "@/lib/utils/location/location-choice";

interface LocationStepProps {
  onDone: (user: Customer) => void;
}

export function LocationStep({ onDone }: LocationStepProps) {
  const t = useTranslations("auth.onboarding.location");
  const prefill = useLocationPrefill();
  const confirm = useConfirmLocation();
  // undefined = العميل لسه ماختارش (نستخدم التعبئة المبدئية)، null = مسح الاختيار بتغيير القائمة الأعلى
  const [choice, setChoice] = useState<{ governorateId?: string | null; cityId?: string | null; areaId?: string | null }>({});

  const prefilled = prefill.data?.location;
  const governorateId = choice.governorateId !== undefined ? choice.governorateId : (prefilled?.governorate.id ?? null);
  const cityId = choice.cityId !== undefined ? choice.cityId : (prefilled?.city.id ?? null);
  const governorates = useGovernorates();
  const cities = useCities(governorateId);
  const areas = useAreas(cityId);

  // مدن "خارج الزمام" فيها منطقة واحدة بس، فمفيش داعي نسأل
  const onlyArea = areas.data?.length === 1 ? areas.data[0].id : null;
  const areaId = choice.areaId !== undefined ? (choice.areaId ?? onlyArea) : (prefilled?.area.id ?? null);

  const source = prefill.data?.location.source;
  const canSubmit = !!(governorateId && cityId && areaId && prefill.data) && !confirm.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!areaId || !prefill.data) return;
    confirm.mutate(toConfirmPayload(areaId, prefill.data.location), { onSuccess: onDone });
  }

  if (prefill.isPending) {
    return <p className="p-6 text-center text-sm text-[#6B7280]">{t("loading")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[420px] flex-col gap-5 p-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-extrabold leading-tight text-[#0E0F11]">{t("title")}</h1>
        <p className="text-sm leading-relaxed text-[#6B7280]">{t("subtitle")}</p>
      </div>

      {prefill.data?.gps === "denied" && <p className="text-[13px] text-[#8A5A00]">{t("denied")}</p>}
      {(source === "ip" || source === "default") && <p className="text-[13px] text-[#8A5A00]">{t("approximate")}</p>}

      <GeoSelect
        label={t("governorate")}
        placeholder={t("choose")}
        value={governorateId}
        options={governorates.data}
        onChange={(id) => setChoice({ governorateId: id, cityId: null, areaId: null })}
      />
      <GeoSelect
        label={t("city")}
        placeholder={t("choose")}
        value={cityId}
        options={cities.data}
        onChange={(id) => setChoice({ governorateId, cityId: id, areaId: null })}
      />
      <GeoSelect label={t("area")} placeholder={t("choose")} value={areaId} options={areas.data}
        onChange={(id) => setChoice({ governorateId, cityId, areaId: id })}
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
  value: string | null;
  options: GeoDivision[] | undefined;
  onChange: (id: string) => void;
}

function GeoSelect({ label, placeholder, value, options, onChange }: GeoSelectProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-bold text-[#0E0F11]">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        disabled={!options}
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
