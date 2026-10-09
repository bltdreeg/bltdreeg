import { MapPin, Scissors } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import type { NearbyBranch } from "@/lib/types/branch";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistance } from "@/lib/utils/format/price.utils";

type BranchCardProps = { branch: NearbyBranch; className?: string };

function BranchCard({ branch, className }: BranchCardProps) {
  const locale = useLocale();

  return (
    <article className={cn("flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-border bg-card", className)}>
      <div className="relative aspect-[4/3] bg-muted">
        {branch.coverImageUrl ? (
          // unoptimized: الصور من storage الـ Laravel ومش متعرّفة في remotePatterns
          <Image src={branch.coverImageUrl} alt={branch.name} fill unoptimized className="object-cover" />
        ) : (
          <Scissors aria-hidden className="absolute inset-0 m-auto size-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate text-[15px] font-bold">{branch.salon.name}</h3>
        <p className="truncate text-[13px] text-muted-foreground">{branch.name}</p>
        <p className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">
            {branch.city.name} · {formatDistance(branch.distanceKm, locale)}
          </span>
        </p>
      </div>
    </article>
  );
}

export { BranchCard };
