// حالة: مؤكد · مستني · تم · اتلغى — اللون بيظهر لما يكون له معنى بس
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn.utils";

const pillVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold",
  {
    variants: {
      tone: {
        neutral: "border border-tint-border bg-tint text-primary-pressed",
        success: "bg-success-bg text-success-strong",
        warning: "bg-warning-bg text-warning-fg",
        danger: "border border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const DOT: Record<NonNullable<VariantProps<typeof pillVariants>["tone"]>, string> = {
  neutral: "bg-primary",
  success: "bg-success-strong",
  warning: "bg-warning-fg",
  danger: "bg-destructive",
};

type PillProps = React.ComponentProps<"span"> &
  VariantProps<typeof pillVariants> & { dot?: boolean };

function Pill({ className, tone = "neutral", dot = false, children, ...props }: PillProps) {
  return (
    <span className={cn(pillVariants({ tone }), className)} {...props}>
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", DOT[tone ?? "neutral"])} />}
      {children}
    </span>
  );
}

export { Pill, pillVariants };
