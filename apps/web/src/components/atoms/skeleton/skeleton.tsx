// هيكل تحميل
import { cn } from "@/lib/utils/cn.utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };
