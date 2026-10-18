import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_ACCOUNT_PROFILE } from "@/lib/data/constants/routes.constants";
import type { Customer } from "@/lib/types/auth";
import { formatLocalEgyptianPhone } from "@/lib/utils/auth-validation.utils";
import { customerFullName, customerInitials } from "@/lib/utils/user/customer-display";

type AccountHeaderProps = {
  user: Customer;
};

export function AccountHeader({ user }: AccountHeaderProps) {
  const t = useTranslations("app.account.header");
  const name = customerFullName(user) || t("noName");
  const initials = customerInitials(user);
  const contact = user.phone ? formatLocalEgyptianPhone(user.phone) : user.email;

  return (
    <section
      aria-label={t("ariaLabel")}
      className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs sm:flex-row sm:items-center sm:gap-5.5"
    >
      {/* الصورة / الرمز الأولي */}
      <div
        className="flex size-[82px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-tint-border bg-tint"
        aria-hidden
      >
        <span className="text-[26px] font-extrabold text-primary-pressed">
          {initials}
        </span>
      </div>

      {/* اسم المستخدم ووسيلة التواصل */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 className="truncate text-[22px] font-extrabold leading-tight text-foreground md:text-2xl">
          {name}
        </h2>
        {contact && (
          <p dir="ltr" className="tabular truncate text-start text-sm text-muted-foreground">
            {contact}
          </p>
        )}
      </div>

      {/* زر التعديل */}
      <Link
        href={ROUTE_ACCOUNT_PROFILE}
        className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-bold text-foreground transition-colors hover:bg-muted sm:w-auto"
      >
        {t("edit")}
      </Link>
    </section>
  );
}
