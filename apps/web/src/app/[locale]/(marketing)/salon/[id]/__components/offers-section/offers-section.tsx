"use client";
// قسم العروض الشغّالة — فريم ٢٢
import { Gift } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { SalonOffer } from "@/lib/types/offer";
import { OfferKind } from "@/lib/types/offer";
import {
  daysUntil,
  offerBundleSaving,
  offerExpiresIn,
  offerLoyaltyProgress,
} from "@/lib/utils/format/offer-labels.utils";

type OffersSectionProps = {
  offers: SalonOffer[];
};

export function OffersSection({ offers }: OffersSectionProps) {
  const t = useTranslations("marketing.salon.offers");
  const locale = useLocale();

  if (offers.length === 0) return null;

  return (
    <section id="offers" className="scroll-mt-28 px-4 sm:px-8 lg:rounded-[14px] lg:border lg:border-border lg:bg-background lg:p-6 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-lg font-bold text-foreground">{t("title")}</h2>

      <div className="flex flex-col gap-2.5">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} locale={locale} />
        ))}
      </div>
    </section>
  );
}

function OfferCard({ offer, locale }: { offer: SalonOffer; locale: string }) {
  const { highlighted } = offer;

  return (
    <div
      className={
        highlighted
          ? "flex gap-3 rounded-[14px] border-[1.5px] border-dashed border-primary bg-accent p-3.5"
          : "flex gap-3 rounded-[14px] border border-border p-3.5"
      }
    >
      <Gift
        className={`size-5 shrink-0 ${highlighted ? "text-primary-pressed" : "text-muted-foreground"}`}
      />
      <div className="flex-1">
        <div className={`text-[14.5px] font-extrabold ${highlighted ? "text-primary-pressed" : "text-foreground"}`}>
          {offer.title}
        </div>

        {offer.kind === OfferKind.DISCOUNT && offer.description && (
          <div className={`mt-[3px] text-[12.5px] font-semibold ${highlighted ? "text-primary-pressed" : "text-muted-foreground"}`}>
            {offer.description}
          </div>
        )}

        {offer.kind === OfferKind.BUNDLE && offer.originalPrice != null && offer.price != null && (
          <div className="mt-[3px] text-[12.5px] font-semibold text-muted-foreground">
            {offerBundleSaving(offer.originalPrice, offer.price, locale)}
          </div>
        )}

        {offer.kind === OfferKind.LOYALTY && offer.visitsDone != null && offer.visitsTarget != null && (
          <>
            <div className="mt-[3px] text-[12.5px] font-semibold text-muted-foreground">
              {offerLoyaltyProgress(offer.visitsDone, offer.visitsTarget, locale)}
            </div>
            <div className="mt-2.5 flex gap-1.5">
              {Array.from({ length: offer.visitsTarget }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-[3px] ${i < offer.visitsDone! ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
          </>
        )}

        {offer.expiresAt && (
          <div className={`mt-1.5 text-xs ${highlighted ? "text-primary-pressed" : "text-muted-foreground"}`}>
            {offerExpiresIn(daysUntil(offer.expiresAt), locale)}
          </div>
        )}
      </div>
    </div>
  );
}
