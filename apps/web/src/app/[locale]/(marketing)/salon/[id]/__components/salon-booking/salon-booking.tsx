'use client';
// منسّق صفحة الصالون: يمسك اختيار الخدمات، وزرار "احجز" بيفتح مسار الحجز بيها (?service=).
// العروض والتقييمات والمواعيد بترجع لما يبقى ليها API — مش بنعرض بيانات تجريبية مكانها
import { useState } from "react";
import { ROUTE_BOOK } from "@/lib/data/constants/routes.constants";
import type { BranchDetail } from "@/lib/types/branch";
import { toBookingQuery } from "@/lib/utils/reservations/booking-flow-params";
import { BookingSidebar } from "../booking-sidebar";
import { SalonBookingBar } from "../salon-booking-bar";
import { SalonInfoBlock } from "../salon-info-block";
import { SalonLocation } from "../salon-location";
import { SalonTabs } from "../salon-tabs";
import { ServiceCatalog } from "../service-catalog";

type SalonBookingProps = {
  branch: BranchDetail;
};

export function SalonBooking({ branch }: SalonBookingProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const services = branch.serviceCategories.flatMap((category) => category.services);
  const selected = services.filter((s) => selectedIds.includes(s.id));
  const bookHref =
    selected.length > 0
      ? `${ROUTE_BOOK(branch.id)}?${toBookingQuery({ serviceIds: selected.map((s) => s.id), chairId: null, when: null, slotId: null })}`
      : null;

  function toggleService(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <>
      <SalonInfoBlock branch={branch} />

      <SalonTabs />

      <div className="flex w-full flex-col items-stretch gap-6 lg:flex-row lg:items-start lg:mt-6 lg:pb-16">
        <aside className="hidden shrink-0 lg:sticky lg:top-27 lg:order-first lg:block lg:max-h-[calc(100vh-108px)] lg:w-95">
          <BookingSidebar
            bookHref={bookHref}
            selectedServices={selected}
            onRemoveService={(id) => setSelectedIds((prev) => prev.filter((x) => x !== id))}
          />
        </aside>

        <main className="flex w-full min-w-0 flex-1 flex-col gap-6 pb-6">
          <ServiceCatalog categories={branch.serviceCategories} selectedIds={selectedIds} onToggle={toggleService} />

          <SalonLocation branch={branch} />
        </main>
      </div>

      <SalonBookingBar bookHref={bookHref} selectedServices={selected} />
    </>
  );
}
