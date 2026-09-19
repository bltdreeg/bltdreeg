'use client';
// منسّق صفحة الصالون: يمسك اختيار الخدمات بس، وباقي الحجز (المعاد والحلاق) بيحصل في مسار الحجز
import { useState } from "react";
import type { SalonDetails } from "@/lib/types/salon";
import type { Service } from "@/lib/types/service/service.interface";
import type { Barber } from "@/lib/types/barber/barber.interface";
import type { Review } from "@/lib/types/review";
import type { SalonOffer } from "@/lib/types/offer";
import { SalonInfoBlock } from "../salon-info-block";
import { SalonTabs } from "../salon-tabs";
import { SalonBookingBar } from "../salon-booking-bar";
import { ServiceCatalog } from "../service-catalog";
import { BarberList } from "../barber-list";
import { OffersSection } from "../offers-section";
import { BookingSidebar } from "../booking-sidebar";
import { ReviewSection } from "../review-section";
import { SalonHours } from "../salon-hours";

type SalonBookingProps = {
  salon: SalonDetails;
  services: Service[];
  barbers: Barber[];
  offers: SalonOffer[];
  reviews: Review[];
};

export function SalonBooking({ salon, services, barbers, offers, reviews }: SalonBookingProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = services.filter((s) => selectedIds.includes(s.id));
  const barbersOnShiftCount = barbers.filter((b) => b.queue !== null).length;

  function toggleService(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <>
      <SalonInfoBlock salon={salon} barbersOnShiftCount={barbersOnShiftCount} />

      <SalonTabs />

      <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:mt-6 lg:pb-16">
        <aside className="hidden shrink-0 lg:sticky lg:top-27 lg:order-first lg:block lg:max-h-[calc(100vh-108px)] lg:w-95">
          <BookingSidebar
            salonId={salon.id}
            selectedServices={selected}
            onRemoveService={(id) =>
              setSelectedIds((prev) => prev.filter((x) => x !== id))
            }
          />
        </aside>

        <main className="flex w-full min-w-0 flex-1 flex-col gap-6">
          <ServiceCatalog
            services={services}
            selectedIds={selectedIds}
            onToggle={toggleService}
          />

          <BarberList barbers={barbers} />

          <OffersSection offers={offers} />

          <ReviewSection salon={salon} reviews={reviews} />

          <SalonHours salon={salon} />
        </main>
      </div>

      <SalonBookingBar salonId={salon.id} selectedServices={selected} />
    </>
  );
}
