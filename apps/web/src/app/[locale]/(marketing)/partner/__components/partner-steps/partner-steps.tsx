// من التسجيل لأول حجز — ٣ خطوات. التالتة بلون التينت عشان تبان إنها النتيجة.

import { useTranslations } from "next-intl";

const STEPS = ["one", "two", "three"] as const;

function PartnerSteps() {
  const t = useTranslations("marketing.partner.steps");

  return (
    <section id="how" className="scroll-mt-20 border-y border-border bg-muted">
      <div className="mx-auto max-w-328 px-4 py-14 md:px-16 md:py-16">
        <h2 className="text-2xl font-black tracking-tight text-foreground md:text-[34px]">{t("title")}</h2>
        <p className="mt-2.5 text-[15px] leading-[1.8] text-muted-foreground md:text-base">{t("subtitle")}</p>

        <div className="mt-8 grid gap-5 md:mt-9 md:grid-cols-3">
          {STEPS.map((key, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div
                key={key}
                className={`rounded-2xl border p-6 md:p-6.5 ${
                  isLast ? "border-tint-border bg-tint" : "border-border bg-background"
                }`}
              >
                <span className="tabular flex size-9.5 items-center justify-center rounded-xl bg-primary text-[17px] font-black text-primary-foreground">
                  {i + 1}
                </span>
                <h3
                  className={`mt-4 text-lg font-extrabold md:text-[19px] ${
                    isLast ? "text-primary-pressed" : "text-foreground"
                  }`}
                >
                  {t(`${key}.title`)}
                </h3>
                <p
                  className={`mt-2 text-[14.5px] leading-[1.75] ${
                    isLast ? "text-primary-pressed" : "text-muted-foreground"
                  }`}
                >
                  {t(`${key}.body`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { PartnerSteps };
