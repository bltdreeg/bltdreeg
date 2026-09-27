// الأسئلة + الجديد في التطبيق. <details> حقيقي: بيفتح من غير جافاسكريبت وبيشتغل بالكيبورد.

import { useTranslations } from "next-intl";
import { StoreButton } from "../store-assets";

const QUESTIONS = ["q1", "q2", "q3", "q4", "q5"] as const;
const RELEASES = [
  { key: "v24", version: "2.4", current: true },
  { key: "v23", version: "2.3", current: false },
  { key: "v22", version: "2.2", current: false },
] as const;

function DownloadFaq() {
  const t = useTranslations("marketing.download.faq");
  const tRel = useTranslations("marketing.download.releases");
  const tCta = useTranslations("marketing.download.cta");
  const tRoot = useTranslations("marketing.download");

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-328 px-4 py-14 md:px-16 md:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-14">
          {/* الأسئلة */}
          <div className="flex-1">
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

          {/* الجديد في التطبيق */}
          <div className="lg:w-100 lg:shrink-0">
            <h2 className="text-xl font-black tracking-tight text-foreground md:text-[22px]">{tRel("title")}</h2>

            <div className="mt-5 flex flex-col gap-5 rounded-[20px] border border-border bg-muted p-6">
              {RELEASES.map(({ key, version, current }, i) => (
                <div key={key} className="flex flex-col gap-2">
                  {i > 0 && <span className="mb-3 h-px bg-border" />}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[15px] font-black ${current ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {version}
                    </span>
                    {current && (
                      <span className="inline-flex h-[21px] items-center rounded-md bg-primary px-2 text-[10.5px] font-extrabold text-primary-foreground">
                        {tRel("current")}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-muted-foreground">{tRel(`${key}.date`)}</span>
                  </div>
                  <ul className="m-0 list-disc ps-[18px] text-[13.5px] leading-[1.9] text-muted-foreground">
                    <li>{tRel(`${key}.a`)}</li>
                    <li>{tRel(`${key}.b`)}</li>
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-4 flex items-center gap-3 rounded-2xl border border-border px-4.5 py-4 text-[13px] leading-[1.7] font-semibold text-muted-foreground">
              <svg
                className="size-[18px] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 4v10" />
                <path d="m8 10.5 4 4 4-4" />
                <path d="M4.5 19h15" />
              </svg>
              {tRel("autoUpdate")}
            </p>
          </div>
        </div>

        {/* شريط الختام */}
        <div className="mt-12 flex flex-col gap-5 rounded-[20px] border border-tint-border bg-tint px-6 py-7 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-xl font-black tracking-tight text-foreground md:text-[21px]">{tCta("title")}</p>
            <p className="mt-1 text-[14.5px] font-semibold text-primary-pressed">{tCta("subtitle")}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <StoreButton store="ios" label="App Store" prefix={tRoot("downloadOn")} />
            <StoreButton store="android" label="Google Play" prefix={tRoot("downloadOn")} variant="secondary" />
          </div>
        </div>
      </div>
    </section>
  );
}

export { DownloadFaq };
