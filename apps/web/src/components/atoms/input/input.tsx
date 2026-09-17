// حقل إدخال: ارتفاع 48 ونصف قطر 12
import { cn } from "@/lib/utils/cn.utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-muted px-3.5 text-[15px] text-foreground transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-tint",
        "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
