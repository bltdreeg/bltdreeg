// شريحة: عادية، مختارة، معطّلة — ارتفاع 36 ونصف قطر 9
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn.utils";

const chipVariants = cva(
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[9px] px-[15px] text-[13px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: "border border-border bg-background font-semibold text-foreground hover:bg-muted",
        selected: "bg-primary font-bold text-primary-foreground hover:bg-primary-pressed",
        // النسخة المحدّدة الخفيفة — بتستخدم للمواعيد المتاحة
        tint: "border border-primary bg-tint font-bold text-primary-pressed",
        disabled: "bg-disabled-bg font-semibold text-disabled-fg",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type ChipProps = React.ComponentProps<"button"> & VariantProps<typeof chipVariants>;

function Chip({ className, variant, disabled, ...props }: ChipProps) {
  return (
    <button
      type="button"
      data-slot="chip"
      disabled={disabled}
      className={cn(chipVariants({ variant: disabled ? "disabled" : variant }), className)}
      {...props}
    />
  );
}

export { Chip, chipVariants };
