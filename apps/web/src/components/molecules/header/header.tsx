// الهيدر: شريطين — شريط البراند تيل، وشريط البحث أبيض sticky
import { Avatar } from "@/components/atoms/avatar";
import { Input } from "@/components/atoms/input";
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/lib/data/constants/app.constants";
import { ROUTE_BOOKINGS, ROUTE_HOME, ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

type HeaderProps = {
  areaName?: string;
  userName?: string;
  /** شريط البحث بيتخفي في مسار الحجز */
  showSearchRow?: boolean;
};

function Header({ areaName = "المعادي", userName, showSearchRow = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40">
      {/* الشريط العلوي */}
      <div className="bg-primary">
        <div className="mx-auto flex h-[46px] w-full max-w-[1312px] items-center justify-between gap-4 px-4 md:px-16">
          <div className="flex min-w-0 items-center gap-3 md:gap-5.5">
            <Link
              href={ROUTE_HOME}
              className="shrink-0 text-[19px] font-black tracking-tight text-primary-foreground"
            >
              {APP_NAME}
            </Link>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-foreground/15 px-2.5 py-1.5 transition-colors hover:bg-primary-foreground/25"
            >
              <span aria-hidden className="size-1.5 rounded-full bg-primary-foreground" />
              <span className="text-[13px] font-bold text-primary-foreground">{areaName}</span>
              <span
                aria-hidden
                className="mb-0.5 size-[7px] -rotate-45 border-b-[1.5px] border-s-[1.5px] border-primary-foreground"
              />
              <span className="sr-only">تغيير المنطقة</span>
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3 md:gap-4.5">
            <Link
              href={ROUTE_BOOKINGS}
              className="hidden text-[13px] font-semibold text-primary-foreground/90 hover:text-primary-foreground sm:block"
            >
              حجوزاتي
            </Link>
            {userName ? (
              <span className="flex items-center gap-2">
                <Avatar name={userName} size={26} className="border-0 bg-primary-foreground/20 text-primary-foreground" />
                <span className="hidden text-[13px] font-semibold text-primary-foreground sm:block">
                  {userName.split(" ")[0]}
                </span>
              </span>
            ) : (
              <Link
                href={ROUTE_SEARCH}
                className="text-[13px] font-semibold text-primary-foreground/90 hover:text-primary-foreground"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* الشريط التاني */}
      {showSearchRow && (
        <div className={cn("border-b border-border bg-background")}>
          <div className="mx-auto flex h-[66px] w-full max-w-[1312px] items-center gap-5 px-4 md:px-16">
            <Input
              placeholder="ابحث باسم الصالون أو المنطقة"
              aria-label="ابحث باسم الصالون أو المنطقة"
              className="h-11 max-w-[480px] text-sm"
            />
          </div>
        </div>
      )}
    </header>
  );
}

export { Header };
