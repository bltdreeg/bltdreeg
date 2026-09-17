// كارت: خط شعر 1px بدل الظل — الظل للهوفر والمودالات بس
import { cn } from "@/lib/utils/cn.utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("rounded-[14px] border border-border bg-card text-card-foreground", className)}
      {...props}
    />
  );
}

export { Card };
