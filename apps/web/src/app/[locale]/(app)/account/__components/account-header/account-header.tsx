import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import type { User } from "@/lib/types/user/user.interface";

type AccountHeaderProps = {
  user: User;
  favoriteCount?: number;
  onEdit?: () => void;
};

export function AccountHeader({ user, favoriteCount, onEdit }: AccountHeaderProps) {
  const t = useTranslations("app.account.header");
  const completedCuts = user.completedBookingsCount ?? 12;
  const favCount = favoriteCount ?? user.favoriteShopIds?.length ?? 4;

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
          ك م
        </span>
      </div>

      {/* اسم المستخدم والموبايل */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 className="text-[22px] font-extrabold leading-tight text-foreground md:text-2xl">
          {user.name}
        </h2>
        <p className="tabular text-sm text-muted-foreground">
          {user.phone ? "01xxxxxxxxx" : "01xxxxxxxxx"} · {t("joinedDate", { date: user.joinedDate ?? "يونيو 2025" })}
        </p>
      </div>

      {/* الإحصائيات: حلاقة خلصتها وصالونات مفضلة */}
      <div className="flex shrink-0 items-center divide-x divide-x-reverse divide-border self-stretch sm:self-auto">
        <div className="flex flex-1 flex-col items-center gap-1.5 px-5 sm:flex-none sm:px-6.5">
          <span className="tabular text-[26px] font-extrabold text-foreground md:text-[28px]">
            {completedCuts}
          </span>
          <span className="whitespace-nowrap text-[12.5px] text-muted-foreground">
            {t("completedCuts")}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1.5 px-5 sm:flex-none sm:px-6.5">
          <span className="tabular text-[26px] font-extrabold text-foreground md:text-[28px]">
            {favCount}
          </span>
          <span className="whitespace-nowrap text-[12.5px] text-muted-foreground">
            {t("favoriteSalons")}
          </span>
        </div>
      </div>

      {/* زر التعديل */}
      <Button
        type="button"
        variant="outline"
        onClick={onEdit}
        className="h-11 w-full shrink-0 rounded-xl px-5 text-sm font-bold text-foreground hover:bg-muted sm:w-auto"
      >
        {t("edit")}
      </Button>
    </section>
  );
}

