// خطوات التشغيل + المفاجأتين اللي بيتسببوا في أسوأ زيارة أولى: الدفع كاش وسياسة الـ٥ دقايق

import { useTranslations } from "next-intl";

function DownloadSteps() {
  const t = useTranslations("marketing.download.steps");
  const steps = ["one", "two", "three"] as const;

  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-328 px-4 py-14 md:px-16 md:py-16">
        <div className="max-w-160">
          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-[34px]">{t("title")}</h2>
          <p className="mt-2.5 text-[15px] leading-[1.8] text-muted-foreground md:text-base">{t("subtitle")}</p>
        </div>

        <ol className="mt-9 grid list-none gap-5 p-0 md:grid-cols-3">
          {steps.map((key, i) => (
            <li
              key={key}
              className="flex flex-col gap-3 rounded-[20px] border border-border bg-background p-7"
            >
              <span className="flex size-9.5 items-center justify-center rounded-[10px] bg-tint text-[17px] font-black text-primary">
                {i + 1}
              </span>
              <h3 className="text-[19px] font-black text-foreground">{t(`${key}.title`)}</h3>
              <p className="text-[14.5px] leading-[1.8] text-muted-foreground">{t(`${key}.body`)}</p>
            </li>
          ))}
        </ol>

        {/* الدفع كاش */}
        <div className="mt-6 flex items-center gap-3.5 rounded-2xl border border-tint-border bg-tint px-6 py-5">
          <span className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] border border-tint-border bg-background text-primary">
            <svg className="size-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
              <path d="M2.5 10h19" />
            </svg>
          </span>
          <div>
            <p className="text-[15px] font-black text-primary-pressed">{t("cash.title")}</p>
            <p className="mt-0.5 text-[13px] leading-[1.7] font-semibold text-primary-pressed">{t("cash.body")}</p>
          </div>
        </div>

        {/* سياسة الـ٥ دقايق */}
        <div className="mt-3.5 flex items-center gap-3.5 rounded-2xl border border-[#f5ddb4] bg-warning-bg px-6 py-5">
          <span className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] border border-[#f5ddb4] bg-background text-warning-fg">
            <svg className="size-[19px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3.5 21 19.5H3z" />
              <path d="M12 10v3.5M12 16.5h.01" />
            </svg>
          </span>
          <div>
            <p className="text-[15px] font-black text-warning-fg">{t("grace.title")}</p>
            <p className="mt-0.5 text-[13px] leading-[1.7] font-semibold text-warning-fg">{t("grace.body")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { DownloadSteps };
