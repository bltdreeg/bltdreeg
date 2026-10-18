"use client";

// صفحة الصالون من /branches/{id} — الموقع اختياري (للمسافة بس)، والصفحة مبتستناهوش
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { useBranch } from "@/lib/hooks/branches";
import { useVisitorPosition } from "@/lib/hooks/geo";
import { SalonBooking } from "../salon-booking";
import { SalonGallery } from "../salon-gallery";
import { SalonNotFound } from "../salon-not-found";
import { SalonSkeleton } from "../salon-skeleton";

export function SalonView({ id }: { id: string }) {
  const t = useTranslations("marketing.salon");
  const { position } = useVisitorPosition();
  const branch = useBranch(id, position);

  if (branch.isPending) return <SalonSkeleton />;

  if (branch.isError) {
    if (branch.error.status === 404) return <SalonNotFound />;
    return (
      <div role="alert" className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-[15px] font-bold text-foreground">{t("loadError")}</p>
        <Button type="button" onClick={() => void branch.refetch()} className="h-10 rounded-xl px-6 font-bold">
          {t("retry")}
        </Button>
      </div>
    );
  }

  const data = branch.data;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1440px] mx-auto px-0 lg:px-12 py-0 lg:py-6">
        <SalonGallery photos={data.images} name={data.salon.name} salonId={data.id} />
        <SalonBooking branch={data} />
      </div>
    </div>
  );
}
