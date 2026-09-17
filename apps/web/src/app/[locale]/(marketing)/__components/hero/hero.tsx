// الهيرو: العنوان + كارت البحث + إحصائيتين
import { Button } from "@/components/atoms/button";
import { Chip } from "@/components/atoms/chip";
import { Input } from "@/components/atoms/input";
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="tabular text-[21px] font-extrabold text-primary-pressed">{value}</span>
      <span className="text-[13.5px] font-medium">{label}</span>
    </div>
  );
}

function Hero({ areaName }: { areaName: string }) {
  return (
    <section className="border-b border-tint-border bg-tint">
      <div className="mx-auto flex w-full max-w-[1312px] flex-col items-start justify-between gap-8 px-4 py-8 md:flex-row md:gap-14 md:px-16 md:py-13">
        <div className="flex min-w-0 flex-1 flex-col gap-4 pt-1.5">
          <h1 className="text-[25px] font-black leading-[1.35] text-balance md:text-[40px]">
            احجز ميعادك في أقرب صالون حلاقة
            <br />
            <span className="text-primary-pressed">واعرف رقمك في الدور قبل ما تخرج من بيتك</span>
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Stat value="1,240" label="صالون في القاهرة والجيزة" />
            <span aria-hidden className="hidden h-[18px] w-px bg-[#C5DFDB] md:block" />
            <Stat value="7" label="دقايق متوسط الانتظار" />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 md:w-[560px]">
          <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-background p-4.5">
            <Input placeholder="ابحث باسم الصالون أو المنطقة" aria-label="ابحث باسم الصالون أو المنطقة" />
            <div className="flex items-center gap-2">
              <Chip variant="selected">النهارده</Chip>
              <Chip>بكرة</Chip>
              <Chip className="hidden sm:inline-flex">تاريخ تاني</Chip>
              <div className="flex-1" />
              <Button size="lg" className="h-10 px-6 text-[14.5px]" render={<Link href={ROUTE_SEARCH} />}>
                ابحث
              </Button>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed">
            أو اكتشف الصالونات القريبة منك في <span className="font-bold">{areaName}، القاهرة</span> ·{" "}
            <Link href={ROUTE_SEARCH} className="font-bold text-primary hover:text-primary-pressed">
              تغيير المنطقة
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export { Hero };
