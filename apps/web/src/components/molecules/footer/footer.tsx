// الفوتر: خلفية غامقة، 4 أعمدة روابط
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/lib/data/constants/app.constants";
import {
  ROUTE_BOOKINGS,
  ROUTE_HOME,
  ROUTE_SEARCH,
} from "@/lib/data/constants/routes.constants";

const COLUMNS = [
  {
    title: `عن ${APP_NAME}`,
    links: [
      { label: "مين إحنا", href: ROUTE_HOME },
      { label: "إزاي بيشتغل", href: ROUTE_HOME },
      { label: "وظايف", href: ROUTE_HOME },
    ],
  },
  {
    title: "تواصل معانا",
    links: [
      { label: "مساعدة", href: ROUTE_HOME },
      { label: "شكوى على حجز", href: ROUTE_BOOKINGS },
      { label: "واتساب الدعم", href: ROUTE_HOME },
    ],
  },
  {
    title: "الشروط والخصوصية",
    links: [
      { label: "شروط الاستخدام", href: ROUTE_HOME },
      { label: "سياسة الخصوصية", href: ROUTE_HOME },
      { label: "سياسة الإلغاء", href: ROUTE_HOME },
    ],
  },
  {
    title: "للصالونات",
    links: [
      { label: "ضيف صالونك", href: ROUTE_HOME },
      { label: "الأسعار", href: ROUTE_SEARCH },
      { label: "تسجيل دخول الصالون", href: ROUTE_HOME },
    ],
  },
] as const;

function Footer() {
  return (
    <footer className="mt-auto bg-foreground">
      <div className="mx-auto w-full max-w-[1312px] px-4 pb-7 pt-11 md:px-16">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:gap-14">
          <div className="flex w-full shrink-0 flex-col gap-3.5 md:w-[300px]">
            <span className="text-[21px] font-black text-background">{APP_NAME}</span>
            <p className="text-[13.5px] leading-[1.8] text-disabled-fg">
              احجز ميعادك في أقرب صالون، واعرف رقمك في الدور من قبل ما تخرج من البيت.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:flex md:gap-18">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="text-[13px] font-bold text-background">{col.title}</span>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="text-[13px] text-disabled-fg transition-colors hover:text-background"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between gap-5 border-t border-background/10 pt-5">
          <span className="tabular text-[12.5px] text-muted-foreground">
            {APP_NAME} © {new Date().getFullYear()}
          </span>
          <span className="text-[12.5px] text-muted-foreground">القاهرة، مصر</span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
