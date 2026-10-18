"use client";
// قسم المكان: العنوان والمنطقة + نسخ العنوان والاتجاهات والاتصال (مواعيد العمل لسه مالهاش API)
import { MapPin, Navigation, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BranchDetail } from "@/lib/types/branch";
import { branchDirectionsUrl } from "@/lib/utils/branches/branch-links";
import { CopyAddressButton } from "../salon-hours/copy-address-button";

export function SalonLocation({ branch }: { branch: BranchDetail }) {
  const t = useTranslations("marketing.salon.location");

  return (
    <section id="info" className="scroll-mt-28 px-4 sm:px-8 lg:rounded-[14px] lg:border lg:border-border lg:bg-background lg:p-6 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-base font-bold text-foreground">{t("title")}</h2>

      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-muted p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <MapPin className="size-3.5 text-primary" />
          <span>
            {branch.city.name}، {branch.governorate.name}
          </span>
        </div>
        {branch.address && (
          <p className="text-sm font-semibold text-foreground leading-relaxed">{branch.address}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          {branch.address && <CopyAddressButton address={branch.address} />}
          <a
            href={branchDirectionsUrl(branch)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[38px] items-center gap-1.5 rounded-[9px] border border-border bg-card px-4 text-[13px] font-bold text-foreground transition-colors hover:bg-muted"
          >
            <Navigation className="size-3.5 text-primary" />
            <span>{t("directions")}</span>
          </a>
          {branch.phone && (
            <a
              href={`tel:${branch.phone}`}
              className="inline-flex h-[38px] items-center gap-1.5 rounded-[9px] border border-border bg-card px-4 text-[13px] font-bold text-foreground transition-colors hover:bg-muted"
              dir="ltr"
            >
              <Phone className="size-3.5 text-primary" />
              <span className="tabular">{branch.phone}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
