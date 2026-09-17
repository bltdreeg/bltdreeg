// صورة المستخدم مع الأحرف الأولى كبديل
import { cn } from "@/lib/utils/cn.utils";

/** أول حرف من أول كلمتين: "كريم مصطفى" → "ك م" */
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join(" ");
}

type AvatarProps = React.ComponentProps<"span"> & {
  name: string;
  size?: number;
};

function Avatar({ name, size = 38, className, ...props }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-tint-border bg-tint font-bold text-primary-pressed",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      {...props}
    >
      {initials(name)}
    </span>
  );
}

export { Avatar, initials };
