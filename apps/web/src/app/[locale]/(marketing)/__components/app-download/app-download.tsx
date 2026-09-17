// بالتدريج في جيبك — بانر تحميل التطبيق
const STORES = [
  { id: "ios", label: "App Store" },
  { id: "android", label: "Google Play" },
] as const;

function PhoneMock({ w, h, r }: { w: number; h: number; r: number }) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 border border-[#CFD4DA] bg-background p-2"
      style={{ width: w, height: h, borderRadius: r }}
    >
      <div className="flex-1 rounded-[16px] bg-[repeating-linear-gradient(135deg,#F7F8FA_0_9px,#EDEFF2_9px_18px)]" />
    </div>
  );
}

function AppDownload() {
  return (
    <section className="mt-10 border-y border-tint-border bg-tint md:mt-14">
      <div className="mx-auto flex w-full max-w-[1312px] flex-col items-center justify-between gap-8 px-4 py-11 md:flex-row md:gap-14 md:px-16">
        <div className="hidden shrink-0 items-end gap-4 md:flex">
          <PhoneMock w={214} h={300} r={26} />
          <PhoneMock w={150} h={230} r={22} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-3.5">
          <h2 className="text-[26px] font-black leading-tight md:text-[32px]">بالتدريج في جيبك</h2>
          <p className="max-w-[440px] text-[15px] leading-loose text-pretty">
            نزّل التطبيق وشوف رقمك في الدور وهو ماشي — هنبعتلك تنبيه لما يبقى فاضل واحد قبلك، وتنبيه
            تاني لو الصالون اتأخر.
          </p>
          <div className="mt-1 flex flex-wrap gap-2.5">
            {STORES.map((s) => (
              <span
                key={s.id}
                className="inline-flex h-12 items-center gap-2.5 rounded-[11px] bg-foreground px-4.5"
              >
                <span aria-hidden className="size-5 rounded-[5px] bg-background/20" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-background/70">نزّل من</span>
                  <span dir="ltr" className="text-sm font-bold text-background">
                    {s.label}
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { AppDownload };
