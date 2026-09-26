"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { PasswordCriteria } from "@/lib/utils/auth-validation.utils";

interface PasswordRequirementsProps {
  criteria: PasswordCriteria;
  touched: boolean;
}

export function PasswordRequirements({ criteria, touched }: PasswordRequirementsProps) {
  const t = useTranslations("auth.register.passwordRequirements");
  const items = [
    {
      met: criteria.min8,
      label:
        touched && !criteria.min8 && criteria.remainingLength > 0
          ? t("min8Remaining", { count: criteria.remainingLength })
          : t("min8"),
    },
    {
      met: criteria.hasNumber,
      label: t("hasNumber"),
    },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-[11px] border border-[#E5E7EB] bg-[#F7F8FA] p-3.5">
      {items.map((item, idx) => {
        const isError = touched && !item.met;
        const isSuccess = item.met;

        return (
          <div key={idx} className="flex items-center gap-2.5">
            {isSuccess ? (
              <div className="flex size-[17px] shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
                <Check className="size-2.5 stroke-[3]" />
              </div>
            ) : isError ? (
              <div className="flex size-[17px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#EF4444] text-[#EF4444]">
                <span className="text-[10px] font-extrabold leading-none">!</span>
              </div>
            ) : (
              <div className="size-[17px] shrink-0 rounded-full border-[1.5px] border-[#CFD4DA]" />
            )}

            <span
              className={`text-[12.5px] font-medium leading-none transition-colors ${
                isSuccess
                  ? "text-[#15803D]"
                  : isError
                    ? "text-[#B91C1C]"
                    : "text-[#6B7280]"
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
