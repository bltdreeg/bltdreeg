// مسار الحجز — الخطوات كلها في صفحة واحدة والحالة في الـ URL (BookingFlow)
import { Suspense } from "react";
import { METADATA_BOOK } from "@/lib/data/constants/metadata.constants";
import { BookingFlow } from "./__components/booking-flow";

export const metadata = METADATA_BOOK;

export default async function BookPage({ params }: { params: Promise<{ salonId: string }> }) {
  const { salonId } = await params;

  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <BookingFlow branchId={salonId} />
    </Suspense>
  );
}
