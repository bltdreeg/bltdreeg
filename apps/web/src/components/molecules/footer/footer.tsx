// الفوتر: خلفية غامقة، 4 أعمدة روابط
import { PageContainer } from "@/components/atoms/page-container";
import { Link } from "@/i18n/navigation";
import { APP_NAME } from "@/lib/data/constants/app.constants";
import {
  EXTERNAL_SALON_LOGIN,
  EXTERNAL_SALON_REGISTER,
  ROUTE_BOOKINGS,
  ROUTE_HOME,
  ROUTE_PRIVACY,
  ROUTE_REFUND_POLICY,
  ROUTE_SEARCH,
  ROUTE_TERMS,
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
      { label: "شروط الاستخدام", href: ROUTE_TERMS },
      { label: "سياسة الخصوصية", href: ROUTE_PRIVACY },
      { label: "سياسة الإلغاء", href: ROUTE_REFUND_POLICY },
    ],
  },
  {
    title: "للصالونات",
    links: [
      { label: "ضيف صالونك", href: EXTERNAL_SALON_REGISTER },
      { label: "الأسعار", href: ROUTE_SEARCH },
      { label: "تسجيل دخول الصالون", href: EXTERNAL_SALON_LOGIN },
    ],
  },
] as const;

function Footer() {
  return (
    <footer className="mt-auto bg-foreground">
      <PageContainer className="pb-24 pt-11 md:pb-7">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:gap-14">
          <div className="flex w-full shrink-0 flex-col gap-3.5 lg:w-[300px]">
            <span className="text-[21px] font-black text-background">{APP_NAME}</span>
            <p className="text-[13.5px] leading-[1.8] text-disabled-fg">
              احجز ميعادك في أقرب صالون، واعرف رقمك في الدور من قبل ما تخرج من البيت.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:flex lg:gap-12 xl:gap-18">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="text-[13px] font-bold text-background">{col.title}</span>
                {col.links.map((l) =>
                  l.href.startsWith("http") ? (
                    <a
                      key={l.label}
                      href={l.href}
                      className="text-[13px] text-disabled-fg transition-colors hover:text-background"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="text-[13px] text-disabled-fg transition-colors hover:text-background"
                    >
                      {l.label}
                    </Link>
                  ),
                )}
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
      </PageContainer>
    </footer>
  );
}

export { Footer };
