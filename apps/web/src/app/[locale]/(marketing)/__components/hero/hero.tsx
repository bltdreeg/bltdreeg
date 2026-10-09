// الهيرو: العنوان + شريط البحث + كارت التذكرة الحالية
import { Clock, Footprints, MapPin, Scissors, Check, Car } from "lucide-react";
import { useTranslations } from "next-intl";
import { GradientWaves } from "@/components/atoms/gradient-waves";
import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { PageContainer } from "@/components/atoms/page-container";
import { Pill } from "@/components/atoms/pill";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKINGS, ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

// اسم واحد لكل صورة — الحرف الواحد بيقعد جوه دايرة الـ26 صح
const PROOF_FACES = ["كريم", "أحمد", "محمود"];

const CURRENT_STEP = 1;

function SearchField({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-2.5", className)}>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-foreground">
        {icon}
        {value}
      </span>
    </div>
  );
}

function Hero({ cityName }: { cityName: string }) {
  const t = useTranslations("marketing.home.hero");

  const steps = [
    { key: "booked", label: t("steps.booked"), icon: Check },
    { key: "waiting", label: t("steps.waiting"), icon: Footprints },
    { key: "move", label: t("steps.move"), icon: Car },
    { key: "yourTurn", label: t("steps.yourTurn"), icon: Scissors },
  ];

  return (
    <section className="relative overflow-hidden border-b border-tint-border bg-tint">
      {/* موجات متدرجة بألوان النظام — ديكور بحت، ورا المحتوى */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        <GradientWaves
          horizonColor="#f0faf8"
          waveColor="#0b5a54"
          crestColor="#0f766e"
          speed={0.8}
          fogDepth={70}
          tilt={1.2}
          grain={false}
          mouseInteraction={false}
        />
      </div>

      <PageContainer className="relative z-10 flex flex-col items-start justify-between gap-8 py-8 md:flex-row md:items-center md:gap-14 md:py-13">
        {/* العمود النصي */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <h1 className="text-[25px] font-black leading-[1.35] text-balance md:text-[40px]">
            {t("headline")}{" "}
            <span className="text-primary-pressed">{t("headlineAccent")}</span>
          </h1>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center">
              {PROOF_FACES.map((name) => (
                <Avatar
                  key={name}
                  name={name}
                  size={26}
                  className="-ms-2 ring-2 ring-tint first:ms-0"
                />
              ))}
            </div>
            <p className="text-[13px] font-medium text-muted-foreground">
              {t.rich("proofCount", {
                bold: (chunks) => <span className="tabular font-bold text-foreground">{chunks}</span>,
              })}
            </p>
          </div>

          {/* شريط البحث: خدمة / منطقة / موعد */}
          <div className="flex w-full flex-col gap-2 rounded-[14px] border border-border bg-background p-2 md:flex-row md:items-center md:gap-0 md:p-1.5">
            <SearchField label={t("serviceLabel")} value={t("serviceValue")} />
            <span aria-hidden className="hidden h-8 w-px bg-border md:block" />
            <SearchField
              label={t("areaLabel")}
              value={t("areaValue")}
              icon={<MapPin aria-hidden className="size-3.5 shrink-0 text-primary" />}
            />
            <span aria-hidden className="hidden h-8 w-px bg-border md:block" />
            <SearchField
              label={t("timeLabel")}
              value={
                <>
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-success" />
                  {t("timeValue")}
                </>
              }
            />
            <Button
              size="lg"
              nativeButton={false}
              className="h-11 shrink-0 px-8 text-[14.5px] font-bold md:ms-2"
              render={<Link href={ROUTE_SEARCH} />}
            >
              {t("searchButton")}
            </Button>
          </div>
        </div>

        {/* كارت التذكرة الحالية */}
        <div className="flex w-full shrink-0 flex-col gap-4 rounded-[18px] border border-border bg-background p-5 shadow-sm md:w-[420px]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-bold">{t("ticketTitle")}</h2>
            <Pill tone="neutral" dot>
              {t("inQueueBadge")}
            </Pill>
          </div>

          <div className="flex flex-col items-center gap-1 py-1">
            <p className="text-[13px] font-medium text-muted-foreground">{t("yourNumber")}</p>
            <p className="tabular text-[56px] font-black leading-none text-primary">#4</p>
            <p className="flex items-center gap-1.5 text-[13.5px] font-semibold">
              <Clock aria-hidden className="size-4 text-muted-foreground" />
              {t("waitEstimate")}
            </p>
          </div>

          {/* خطوات الطابور */}
          <ol className="flex items-start">
            {steps.map((step, i) => {
              const done = i <= CURRENT_STEP;
              const Icon = step.icon;
              return (
                <li
                  key={step.key}
                  aria-current={i === CURRENT_STEP ? "step" : undefined}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                >
                  <div className="flex w-full items-center">
                    {/* نص الخط: شفاف عند الطرفين عشان الدواير تفضل في النص */}
                    <span
                      aria-hidden
                      className={cn(
                        "h-px flex-1",
                        i === 0 ? "bg-transparent" : done ? "bg-primary" : "bg-border",
                      )}
                    />
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "h-px flex-1",
                        i === steps.length - 1
                          ? "bg-transparent"
                          : i < CURRENT_STEP
                            ? "bg-primary"
                            : "bg-border",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "truncate text-[11px] font-semibold",
                      done ? "text-primary-pressed" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>

          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            className="h-11 w-full gap-2 text-[14px] font-bold"
            render={<Link href={ROUTE_BOOKINGS} />}
          >
            <MapPin aria-hidden className="size-4" />
            {t("trackOnMap")}
          </Button>

          <p className="text-center text-[12px] text-muted-foreground">
            {t.rich("nearbyInArea", {
              area: cityName,
              bold: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
            })}
          </p>
        </div>
      </PageContainer>
    </section>
  );
}

export { Hero };
