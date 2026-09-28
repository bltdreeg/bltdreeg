// أسئلة الصالونات + شريط الختام. <details> حقيقي: بيفتح من غير جافاسكريبت وبيشتغل بالكيبورد.

import { useTranslations } from "next-intl";
import { EXTERNAL_SALON_LOGIN, EXTERNAL_SALON_REGISTER } from "@/lib/data/constants/routes.constants";

const QUESTIONS = ["q1", "q2", "q3", "q4", "q5"] as const;

function PartnerFaq() {
  const t = useTranslations("marketing.partner.faq");
  const tCta = useTranslations("marketing.partner.cta");

  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-328 px-4 py-14 md:px-16 md:py-16">
        <div className="mx-auto max-w-220">
          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-[34px]">{t("title")}</h2>
          <p className="mt-2.5 text-[15px] leading-[1.8] text-muted-foreground md:text-base">{t("subtitle")}</p>

          <div className="mt-7 flex flex-col gap-2.5">
            {QUESTIONS.map((key, i) => (
              <details
                key={key}
                open={i === 0}
                className="group rounded-2xl border border-border bg-background px-5 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-extrabold text-foreground [&::-webkit-details-marker]:hidden">
                  {t(`${key}.q`)}
                  <svg
                    className="size-[17px] shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-3 text-[14.5px] leading-[1.85] text-muted-foreground">{t(`${key}.a`)}</p>
              </details>
            ))}
          </div>
        </div>

        {/* شريط الختام */}
        <div className="mt-12 flex flex-col gap-5 rounded-[20px] bg-primary px-6 py-7 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-xl font-black tracking-tight text-primary-foreground md:text-[26px]">
              {tCta("title")}
            </p>
            <p className="mt-1.5 text-[14.5px] leading-[1.7] font-semibold text-primary-foreground/85">
              {tCta("subtitle")}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href={EXTERNAL_SALON_REGISTER}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center justify-center rounded-xl bg-background px-7 text-base font-black text-primary transition-opacity hover:opacity-90"
            >
              {tCta("register")}
            </a>
            <a
              href={EXTERNAL_SALON_LOGIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 items-center justify-center rounded-xl border border-primary-foreground/45 px-6 text-base font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/15"
            >
              {tCta("login")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export { PartnerFaq };
