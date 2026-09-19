// صفحة 404 خاصة بصفحة الصالون
import { Link } from "@/i18n/navigation";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";

export default function SalonNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="text-[48px]" aria-hidden>
        ✂️
      </span>
      <h1 className="text-[22px] font-bold">الصالون ده مش موجود</h1>
      <p className="text-[14px] text-muted-foreground">
        ممكن الرابط يكون غلط أو الصالون اتشال
      </p>
      <Link
        href={ROUTE_HOME}
        className="mt-2 rounded-[9px] bg-primary px-6 py-3 text-[14px] font-bold text-primary-foreground hover:bg-primary-pressed"
      >
        ارجع للرئيسية
      </Link>
    </div>
  );
}
