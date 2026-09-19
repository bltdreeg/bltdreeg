// شريط مسار التنقل لصفحات الحساب والبروفايل (حسابي > ...)
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageContainer } from "@/components/atoms/page-container";
import { ROUTE_ACCOUNT } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

export interface ProfileBreadcrumbItem {
  label: string;
  href?: string;
}

export interface ProfileBreadcrumbProps {
  items: ProfileBreadcrumbItem[];
  className?: string;
  extraContent?: React.ReactNode;
}

export function ProfileBreadcrumb({
  items,
  className,
  extraContent,
}: ProfileBreadcrumbProps) {
  return (
    <nav
      aria-label="مسار التنقل"
      className={cn("border-b border-border bg-card", className)}
    >
      <PageContainer className="flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-[13px]">
          <Link
            href={ROUTE_ACCOUNT}
            className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            حسابي
          </Link>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <ChevronLeft className="size-3.5 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-bold text-foreground">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {extraContent && (
          <div className="flex items-center">{extraContent}</div>
        )}
      </PageContainer>
    </nav>
  );
}
