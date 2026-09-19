// حمّل الأبليكيشن — بانر تحميل التطبيق (التصميم الجديد بالموبايلين)

/* ————————— SVG Icons ————————— */

function AppleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.2 12.5c0-2.4 1.95-3.55 2.04-3.61-1.11-1.63-2.84-1.85-3.46-1.88-1.47-.15-2.87.86-3.62.86-.74 0-1.9-.84-3.12-.82-1.6.02-3.08.93-3.9 2.36-1.66 2.88-.42 7.15 1.2 9.49.79 1.14 1.74 2.43 2.98 2.38 1.2-.05 1.65-.77 3.1-.77 1.44 0 1.85.77 3.11.75 1.29-.02 2.1-1.16 2.89-2.31.91-1.33 1.29-2.61 1.31-2.68-.03-.01-2.51-.96-2.53-3.77zM14.1 5.4c.66-.8 1.1-1.9.98-3-.95.04-2.1.63-2.78 1.42-.61.7-1.14 1.83-1 2.9 1.06.08 2.14-.53 2.8-1.32z" />
    </svg>
  );
}

function GooglePlayIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3.6 2.4c-.2.2-.4.6-.4 1.1v17c0 .5.2.9.4 1.1l9.6-9.6L3.6 2.4zM16.8 9.3l-2.4 2.4 2.4 2.4 3-1.7c.9-.5.9-1.3 0-1.8l-3-1.3zM14.4 13.1l-9 9 10.2-5.9-1.2-3.1zm0-2.2l1.2-3.1L5.4 1.9l9 9z" />
    </svg>
  );
}

/* ————————— Sub-components ————————— */

/** الهاتف الأمامي — الشاشة الرئيسية (متابعة الدور) */
function PhoneFront() {
  return (
    <div
      className="absolute z-2"
      style={{
        left: 24,
        top: 10,
        width: 246,
        height: 494,
        borderRadius: 48,
        background: "linear-gradient(160deg, #3A454E 0%, #151A1E 45%, #242D34 100%)",
        padding: 8,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.18) inset",
      }}
    >
      {/* أزرار الجوانب */}
      <div className="absolute rounded-l-sm" style={{ left: -3, top: 95, width: 3, height: 24, background: "#475569", borderRadius: "2px 0 0 2px" }} />
      <div className="absolute rounded-l-sm" style={{ left: -3, top: 130, width: 3, height: 38, background: "#475569", borderRadius: "2px 0 0 2px" }} />
      <div className="absolute rounded-l-sm" style={{ left: -3, top: 178, width: 3, height: 38, background: "#475569", borderRadius: "2px 0 0 2px" }} />
      <div className="absolute rounded-r-sm" style={{ right: -3, top: 120, width: 3, height: 48, background: "#475569", borderRadius: "0 2px 2px 0" }} />

      {/* الشاشة الداخلية */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{
          borderRadius: 41,
          background: "#0F766E",
          border: "3px solid #0B1115",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
        }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute top-2 left-1/2 z-20 flex -translate-x-1/2 items-center justify-between"
          style={{
            width: 72,
            height: 18,
            background: "#000",
            borderRadius: 20,
            padding: "0 8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
        >
          <div className="rounded-full" style={{ width: 7, height: 7, background: "#102A24", border: "1px solid #1E463C" }} />
          <div className="rounded-full" style={{ width: 4, height: 4, background: "#059669", boxShadow: "0 0 4px #10B981" }} />
        </div>

        {/* محتوى الشاشة */}
        <div
          className="flex flex-1 flex-col font-[Cairo]"
          dir="rtl"
          style={{
            background: "linear-gradient(175deg, #0F766E 0%, #0B5A54 100%)",
            color: "#fff",
            padding: "32px 14px 16px",
          }}
        >
          {/* Status bar */}
          <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-bold" style={{ direction: "ltr" }}>
            <span className="text-[11.5px] font-extrabold tracking-wide">9:41</span>
            <div className="flex items-center gap-[5px] text-[10px]">
              <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="8" width="2.8" height="4" rx="0.8" /><rect x="4.2" y="5.5" width="2.8" height="6.5" rx="0.8" /><rect x="8.4" y="3" width="2.8" height="9" rx="0.8" /><rect x="12.6" y="0" width="2.8" height="12" rx="0.8" /></svg>
              <svg width="11" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.28 19.64 10.59 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" /></svg>
              <div className="flex items-center" style={{ width: 17, height: 9, border: "1.5px solid currentColor", borderRadius: 3, padding: 1 }}>
                <div style={{ width: "80%", height: "100%", background: "currentColor", borderRadius: 1 }} />
              </div>
            </div>
          </div>

          {/* Header bar */}
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: "rgba(255,255,255,0.16)", backdropFilter: "blur(4px)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </div>
            <span className="text-[13.5px] font-extrabold" style={{ letterSpacing: "-0.2px" }}>متابعة الدور</span>
            <div className="flex items-center gap-1" style={{ background: "rgba(52,211,153,0.22)", border: "1px solid rgba(52,211,153,0.45)", borderRadius: 999, padding: "2px 7px" }}>
              <span className="rounded-full" style={{ width: 6, height: 6, background: "#34D399", boxShadow: "0 0 6px #34D399" }} />
              <span className="text-[9.5px] font-extrabold" style={{ color: "#A7F3D0" }}>لايف</span>
            </div>
          </div>

          {/* بطاقة رقم الدور */}
          <div className="mb-2 rounded-[18px] bg-white px-3 py-3 text-center" style={{ color: "#0E0F11", boxShadow: "0 10px 24px rgba(0,0,0,0.16)" }}>
            <div className="mb-px text-[11px] font-bold" style={{ color: "#6B7280" }}>رقم دورك الآن</div>
            <div className="mb-1 font-[Cairo] text-[46px] leading-none font-black" style={{ color: "#0F766E" }}>٤</div>

            <div className="mb-2.5 inline-flex items-center gap-[5px] rounded-full px-[11px] py-[3px] text-[11px] font-extrabold" style={{ background: "#E6F0EF", color: "#0F766E" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              <span>قدامك ٢ أنفار</span>
            </div>

            {/* خطوات التقدم */}
            <div className="flex items-center justify-between" style={{ borderTop: "1px solid #F3F4F6", paddingTop: 4 }}>
              <div className="flex flex-1 flex-col items-center gap-[2px]">
                <div className="flex items-center justify-center rounded-full text-[9px] font-black text-white" style={{ width: 16, height: 16, background: "#0F766E" }}>✓</div>
                <span className="text-[9px] font-extrabold" style={{ color: "#0F766E" }}>بالطابور</span>
              </div>
              <div className="flex-1" style={{ height: 2, background: "#0F766E", margin: "0 -2px 14px" }} />
              <div className="flex flex-1 flex-col items-center gap-[2px]">
                <div className="flex items-center justify-center rounded-full" style={{ width: 16, height: 16, background: "#10B981", border: "2px solid #D1FAE5" }}>
                  <span className="rounded-full bg-white" style={{ width: 5, height: 5 }} />
                </div>
                <span className="text-[9px] font-extrabold" style={{ color: "#047857" }}>قربت</span>
              </div>
              <div className="flex-1" style={{ height: 2, background: "#E5E7EB", margin: "0 -2px 14px" }} />
              <div className="flex flex-1 flex-col items-center gap-[2px]">
                <div className="rounded-full" style={{ width: 16, height: 16, background: "#F3F4F6", border: "1.5px solid #D1D5DB" }} />
                <span className="text-[9px] font-semibold" style={{ color: "#9CA3AF" }}>حان دورك</span>
              </div>
            </div>
          </div>

          {/* بطاقة المحل */}
          <div className="mb-2 flex items-center justify-between rounded-[14px] px-[11px] py-2" style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.24)" }}>
            <div className="text-right">
              <div className="text-[11.5px] font-extrabold text-white">صالون الكابتن حسام</div>
              <div className="mt-px text-[9.5px] font-semibold" style={{ color: "rgba(255,255,255,0.82)" }}>فرع المعادي — شارع النصر</div>
            </div>
            <div className="rounded-lg px-2 py-[3px] text-center" style={{ background: "rgba(255,255,255,0.22)" }}>
              <span className="block text-[11px] font-black leading-tight text-white">~ ٢٠ د</span>
              <span className="block text-[8.5px] opacity-90">متبقي</span>
            </div>
          </div>

          {/* زر الإجراء */}
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none font-[inherit] text-[12.5px] font-extrabold"
            style={{ background: "#34D399", color: "#064E3B", height: 38, boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
            <span>أنا وصلت المحل</span>
          </button>

          {/* Home indicator */}
          <div className="mx-auto mt-2" style={{ width: 80, height: 3.5, background: "rgba(255,255,255,0.6)", borderRadius: 3 }} />
        </div>

        {/* انعكاس زجاجي */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.04) 38%, transparent 58%)", borderRadius: 38 }} />
      </div>
    </div>
  );
}

/** الهاتف الخلفي — شاشة "حان وقت حضورك" (مايل) */
function PhoneBack() {
  return (
    <div
      className="absolute z-1"
      style={{
        right: 28,
        top: 32,
        width: 228,
        height: 460,
        borderRadius: 44,
        background: "linear-gradient(145deg, #2C343B, #151A1E)",
        padding: 7,
        boxShadow: "none",
        transform: "perspective(1000px) rotateY(-14deg) rotateZ(6deg) scale(0.92)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{ borderRadius: 38, background: "#0B1319", border: "2.5px solid #1E293B" }}
      >
        <div
          className="flex flex-1 flex-col items-center justify-between font-[Cairo]"
          dir="rtl"
          style={{
            background: "linear-gradient(180deg, #0d3b38 0%, #082826 100%)",
            padding: "24px 18px 28px",
            textAlign: "center",
          }}
        >
          {/* مؤشر السماعة */}
          <div className="mx-auto mb-3" style={{ width: 44, height: 4, background: "#1e2a30", borderRadius: 3 }} />

          {/* إشعار علوي */}
          <div className="w-full rounded-xl px-3 py-2 text-center" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <span className="block text-[11px] font-extrabold" style={{ color: "#34D399" }}>🔔 حان وقت حضورك!</span>
            <span className="block text-[10px] font-semibold" style={{ color: "#E2E8F0" }}>متبقي ٥ دقائق للدخول</span>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="my-auto flex flex-col items-center gap-2">
            <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "rgba(52,211,153,0.15)", border: "2px solid #34D399", boxShadow: "0 0 24px rgba(52,211,153,0.3)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div className="text-[21px] font-black leading-tight text-white">دورك حان الآن!</div>
            <div className="text-[11px] font-semibold leading-snug" style={{ color: "#A7F3D0" }}>تفضل بالدخول، الكابتن حسام في انتظارك</div>
          </div>

          {/* زر إجراء */}
          <div
            className="flex w-full items-center justify-center gap-1.5 rounded-[14px] text-[12.5px] font-extrabold text-white"
            style={{
              background: "linear-gradient(135deg, #2DD4BF, #0F766E)",
              padding: "11px 14px",
              boxShadow: "0 6px 18px rgba(15,118,110,0.35)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
            <span>أنا وصلت الصالون</span>
          </div>
        </div>

        {/* انعكاس زجاجي */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 42%, transparent 70%)" }} />
      </div>
    </div>
  );
}

const QR_PATH =
  "M0,0h1v1h-1zM1,0h1v1h-1zM2,0h1v1h-1zM3,0h1v1h-1zM4,0h1v1h-1zM5,0h1v1h-1zM6,0h1v1h-1zM12,0h1v1h-1zM13,0h1v1h-1zM15,0h1v1h-1zM16,0h1v1h-1zM18,0h1v1h-1zM19,0h1v1h-1zM20,0h1v1h-1zM21,0h1v1h-1zM22,0h1v1h-1zM23,0h1v1h-1zM24,0h1v1h-1zM0,1h1v1h-1zM6,1h1v1h-1zM8,1h1v1h-1zM10,1h1v1h-1zM12,1h1v1h-1zM16,1h1v1h-1zM18,1h1v1h-1zM24,1h1v1h-1zM0,2h1v1h-1zM2,2h1v1h-1zM3,2h1v1h-1zM4,2h1v1h-1zM6,2h1v1h-1zM8,2h1v1h-1zM9,2h1v1h-1zM11,2h1v1h-1zM16,2h1v1h-1zM18,2h1v1h-1zM20,2h1v1h-1zM21,2h1v1h-1zM22,2h1v1h-1zM24,2h1v1h-1zM0,3h1v1h-1zM2,3h1v1h-1zM3,3h1v1h-1zM4,3h1v1h-1zM6,3h1v1h-1zM10,3h1v1h-1zM11,3h1v1h-1zM12,3h1v1h-1zM13,3h1v1h-1zM16,3h1v1h-1zM18,3h1v1h-1zM20,3h1v1h-1zM21,3h1v1h-1zM22,3h1v1h-1zM24,3h1v1h-1zM0,4h1v1h-1zM2,4h1v1h-1zM3,4h1v1h-1zM4,4h1v1h-1zM6,4h1v1h-1zM10,4h1v1h-1zM11,4h1v1h-1zM12,4h1v1h-1zM15,4h1v1h-1zM16,4h1v1h-1zM18,4h1v1h-1zM20,4h1v1h-1zM21,4h1v1h-1zM22,4h1v1h-1zM24,4h1v1h-1zM0,5h1v1h-1zM6,5h1v1h-1zM8,5h1v1h-1zM9,5h1v1h-1zM11,5h1v1h-1zM12,5h1v1h-1zM13,5h1v1h-1zM14,5h1v1h-1zM18,5h1v1h-1zM24,5h1v1h-1zM0,6h1v1h-1zM1,6h1v1h-1zM2,6h1v1h-1zM3,6h1v1h-1zM4,6h1v1h-1zM5,6h1v1h-1zM6,6h1v1h-1zM8,6h1v1h-1zM10,6h1v1h-1zM12,6h1v1h-1zM14,6h1v1h-1zM16,6h1v1h-1zM18,6h1v1h-1zM19,6h1v1h-1zM20,6h1v1h-1zM21,6h1v1h-1zM22,6h1v1h-1zM23,6h1v1h-1zM24,6h1v1h-1zM8,7h1v1h-1zM9,7h1v1h-1zM10,7h1v1h-1zM11,7h1v1h-1zM12,7h1v1h-1zM14,7h1v1h-1zM2,8h1v1h-1zM5,8h1v1h-1zM6,8h1v1h-1zM7,8h1v1h-1zM8,8h1v1h-1zM11,8h1v1h-1zM13,8h1v1h-1zM14,8h1v1h-1zM15,8h1v1h-1zM16,8h1v1h-1zM17,8h1v1h-1zM18,8h1v1h-1zM20,8h1v1h-1zM21,8h1v1h-1zM23,8h1v1h-1zM24,8h1v1h-1zM0,9h1v1h-1zM4,9h1v1h-1zM7,9h1v1h-1zM8,9h1v1h-1zM15,9h1v1h-1zM16,9h1v1h-1zM17,9h1v1h-1zM18,9h1v1h-1zM19,9h1v1h-1zM21,9h1v1h-1zM23,9h1v1h-1zM2,10h1v1h-1zM3,10h1v1h-1zM5,10h1v1h-1zM6,10h1v1h-1zM7,10h1v1h-1zM8,10h1v1h-1zM11,10h1v1h-1zM12,10h1v1h-1zM16,10h1v1h-1zM18,10h1v1h-1zM19,10h1v1h-1zM23,10h1v1h-1zM0,11h1v1h-1zM1,11h1v1h-1zM2,11h1v1h-1zM4,11h1v1h-1zM7,11h1v1h-1zM8,11h1v1h-1zM9,11h1v1h-1zM12,11h1v1h-1zM14,11h1v1h-1zM18,11h1v1h-1zM19,11h1v1h-1zM20,11h1v1h-1zM23,11h1v1h-1zM0,12h1v1h-1zM1,12h1v1h-1zM2,12h1v1h-1zM3,12h1v1h-1zM5,12h1v1h-1zM6,12h1v1h-1zM10,12h1v1h-1zM11,12h1v1h-1zM14,12h1v1h-1zM16,12h1v1h-1zM18,12h1v1h-1zM19,12h1v1h-1zM20,12h1v1h-1zM21,12h1v1h-1zM22,12h1v1h-1zM2,13h1v1h-1zM3,13h1v1h-1zM5,13h1v1h-1zM7,13h1v1h-1zM10,13h1v1h-1zM11,13h1v1h-1zM12,13h1v1h-1zM13,13h1v1h-1zM17,13h1v1h-1zM18,13h1v1h-1zM20,13h1v1h-1zM24,13h1v1h-1zM2,14h1v1h-1zM4,14h1v1h-1zM6,14h1v1h-1zM8,14h1v1h-1zM9,14h1v1h-1zM10,14h1v1h-1zM11,14h1v1h-1zM12,14h1v1h-1zM13,14h1v1h-1zM15,14h1v1h-1zM16,14h1v1h-1zM17,14h1v1h-1zM18,14h1v1h-1zM20,14h1v1h-1zM21,14h1v1h-1zM0,15h1v1h-1zM1,15h1v1h-1zM2,15h1v1h-1zM3,15h1v1h-1zM4,15h1v1h-1zM5,15h1v1h-1zM10,15h1v1h-1zM12,15h1v1h-1zM14,15h1v1h-1zM15,15h1v1h-1zM16,15h1v1h-1zM18,15h1v1h-1zM19,15h1v1h-1zM20,15h1v1h-1zM21,15h1v1h-1zM22,15h1v1h-1zM0,16h1v1h-1zM3,16h1v1h-1zM5,16h1v1h-1zM6,16h1v1h-1zM7,16h1v1h-1zM11,16h1v1h-1zM16,16h1v1h-1zM17,16h1v1h-1zM18,16h1v1h-1zM19,16h1v1h-1zM20,16h1v1h-1zM22,16h1v1h-1zM23,16h1v1h-1zM8,17h1v1h-1zM10,17h1v1h-1zM13,17h1v1h-1zM15,17h1v1h-1zM16,17h1v1h-1zM20,17h1v1h-1zM22,17h1v1h-1zM23,17h1v1h-1zM0,18h1v1h-1zM1,18h1v1h-1zM2,18h1v1h-1zM3,18h1v1h-1zM4,18h1v1h-1zM5,18h1v1h-1zM6,18h1v1h-1zM9,18h1v1h-1zM11,18h1v1h-1zM13,18h1v1h-1zM14,18h1v1h-1zM15,18h1v1h-1zM16,18h1v1h-1zM18,18h1v1h-1zM20,18h1v1h-1zM23,18h1v1h-1zM0,19h1v1h-1zM6,19h1v1h-1zM8,19h1v1h-1zM9,19h1v1h-1zM10,19h1v1h-1zM11,19h1v1h-1zM14,19h1v1h-1zM15,19h1v1h-1zM16,19h1v1h-1zM20,19h1v1h-1zM22,19h1v1h-1zM23,19h1v1h-1zM0,20h1v1h-1zM2,20h1v1h-1zM3,20h1v1h-1zM4,20h1v1h-1zM6,20h1v1h-1zM8,20h1v1h-1zM13,20h1v1h-1zM14,20h1v1h-1zM15,20h1v1h-1zM16,20h1v1h-1zM17,20h1v1h-1zM18,20h1v1h-1zM19,20h1v1h-1zM20,20h1v1h-1zM23,20h1v1h-1zM0,21h1v1h-1zM2,21h1v1h-1zM3,21h1v1h-1zM4,21h1v1h-1zM6,21h1v1h-1zM10,21h1v1h-1zM14,21h1v1h-1zM15,21h1v1h-1zM16,21h1v1h-1zM18,21h1v1h-1zM19,21h1v1h-1zM21,21h1v1h-1zM22,21h1v1h-1zM0,22h1v1h-1zM2,22h1v1h-1zM3,22h1v1h-1zM4,22h1v1h-1zM6,22h1v1h-1zM11,22h1v1h-1zM13,22h1v1h-1zM19,22h1v1h-1zM20,22h1v1h-1zM22,22h1v1h-1zM24,22h1v1h-1zM0,23h1v1h-1zM6,23h1v1h-1zM8,23h1v1h-1zM9,23h1v1h-1zM10,23h1v1h-1zM11,23h1v1h-1zM12,23h1v1h-1zM13,23h1v1h-1zM14,23h1v1h-1zM15,23h1v1h-1zM18,23h1v1h-1zM19,23h1v1h-1zM22,23h1v1h-1zM0,24h1v1h-1zM1,24h1v1h-1zM2,24h1v1h-1zM3,24h1v1h-1zM4,24h1v1h-1zM5,24h1v1h-1zM6,24h1v1h-1zM8,24h1v1h-1zM11,24h1v1h-1zM12,24h1v1h-1zM14,24h1v1h-1zM16,24h1v1h-1zM17,24h1v1h-1zM18,24h1v1h-1zM19,24h1v1h-1zM22,24h1v1h-1zM23,24h1v1h-1z";

/** مصفوفة QR Code واقعية */
function QrMatrix() {
  return (
    <div
      className="qrcode flex shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      aria-label="QR Code للتحميل السريع"
      style={{
        width: 68,
        height: 68,
        border: "1px solid #E5E7EB",
      }}
    >
      <svg
        viewBox="0 0 25 25"
        className="h-full w-full"
        style={{ shapeRendering: "crispEdges" }}
      >
        <path d={QR_PATH} fill="#111827" />
      </svg>
    </div>
  );
}

/* ————————— Main Component ————————— */

function AppDownload() {
  return (
    <section className="mt-10 bg-white md:mt-14">
      <div
        className="relative mx-auto grid max-w-[1312px] items-center gap-10 overflow-hidden px-4 py-[50px] max-md:grid-cols-1 max-md:gap-9 max-md:py-10 md:grid-cols-[1.05fr_1fr] md:px-16"
      >


        {/* ————— العمود الأيسر: الهاتفين ————— */}
        <div
          className="relative flex items-center justify-center overflow-hidden max-md:order-2 max-md:min-h-[440px]"
          aria-label="شاشات تطبيق بالتدريج للموبايل"
          style={{ minHeight: 520, direction: "ltr", perspective: 1200 }}
        >
          <div className="relative h-[510px] w-[420px] max-w-full shrink-0 origin-center scale-[0.68] xs:scale-[0.8] sm:scale-95 md:scale-[0.88] lg:scale-100 transition-transform">
            <PhoneBack />
            <PhoneFront />
          </div>
        </div>

        {/* ————— العمود الأيمن: النص + QR + أزرار المتاجر ————— */}
        <div className="flex flex-col gap-[18px] text-right max-md:order-1 max-md:items-center max-md:text-center">
          {/* شارة التوفر */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-tint px-[14px] py-1.5 text-[13px] font-bold text-primary">
            <div className="flex items-center gap-1">
              <GooglePlayIcon className="h-3.5 w-3.5 fill-current" />
              <AppleIcon className="h-3.5 w-3.5 fill-current" />
            </div>
            <span>متوفّر الآن لجميع الأجهزة</span>
          </div>

          {/* العنوان الرئيسي */}
          <h2 className="text-[38px] font-black leading-[1.25] tracking-tight text-foreground max-md:text-[30px]">
            حمّل تطبيق<br />
            <span className="inline-block text-primary">بالتدريج</span> الآن
          </h2>

          {/* الوصف */}
          <p className="max-w-[440px] text-[15.5px] leading-[1.75] text-muted-foreground max-md:max-w-full">
            استنّى دورك وأنت في مكانك. ادخل الطابور من موبايلك، وشوف فاضلك كام واحد والوقت المتوقع لحظة بلحظة، وهنبعتلك إشعار لما يقرب دورك.
          </p>

          {/* QR + أزرار المتاجر */}
          <div className="mt-2.5 flex flex-wrap items-center gap-5 border-t border-border pt-4 max-md:flex-col max-md:items-center">
            {/* بطاقة QR */}
            <div className="flex h-full min-h-[98px] items-center gap-3.5 rounded-2xl border border-border bg-muted px-4 py-2.5">
              <QrMatrix />
              <div className="flex flex-col text-right">
                <span className="text-[13px] font-extrabold text-foreground">امسح الكود للتحميل</span>
                <span className="mt-0.5 text-[11.5px] font-semibold text-muted-foreground">متاح لنظام iOS و Android</span>
              </div>
            </div>

            {/* أزرار المتاجر */}
            <div className="flex flex-col gap-2.5 sm:flex-row max-md:w-full max-md:justify-center">
              {/* Google Play */}
              <a
                href="#"
                className="inline-flex min-w-[150px] items-center justify-center gap-2.5 rounded-xl bg-foreground px-[18px] py-2 text-white no-underline transition-all hover:-translate-y-px hover:bg-[#262B30]"
                style={{ boxShadow: "0 3px 10px rgba(0,0,0,0.09)", direction: "ltr" }}
              >
                <GooglePlayIcon className="h-[22px] w-[22px] shrink-0 fill-white" />
                <div className="flex flex-col leading-[1.15]" style={{ direction: "ltr", textAlign: "left" }}>
                  <span className="text-[9.5px] font-medium uppercase tracking-wide opacity-80">GET IT ON</span>
                  <span className="text-[14px] font-extrabold" style={{ letterSpacing: "-0.2px" }}>Google Play</span>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#"
                className="inline-flex min-w-[150px] items-center justify-center gap-2.5 rounded-xl bg-foreground px-[18px] py-2 text-white no-underline transition-all hover:-translate-y-px hover:bg-[#262B30]"
                style={{ boxShadow: "0 3px 10px rgba(0,0,0,0.09)", direction: "ltr" }}
              >
                <AppleIcon className="h-[22px] w-[22px] shrink-0 fill-white" />
                <div className="flex flex-col leading-[1.15]" style={{ direction: "ltr", textAlign: "left" }}>
                  <span className="text-[9.5px] font-medium uppercase tracking-wide opacity-80">Download on the</span>
                  <span className="text-[14px] font-extrabold" style={{ letterSpacing: "-0.2px" }}>App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { AppDownload };
