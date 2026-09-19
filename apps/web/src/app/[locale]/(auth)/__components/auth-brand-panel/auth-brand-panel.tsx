"use client";

// اللوحة التعريفية الجانبية لصفحات المصادقة — مطابقة لـ FRAME 13A, 13B, 13C في web app design.html
import { Link } from "@/i18n/navigation";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";

export type AuthBrandMode = "login" | "register" | "otp" | "forgot-password";

interface AuthBrandPanelProps {
  mode: AuthBrandMode;
  className?: string;
}

export function AuthBrandPanel({ mode, className = "" }: AuthBrandPanelProps) {
  return (
    <aside
      className={`relative hidden lg:flex flex-col justify-between border-e border-[#CFE6E3] bg-[#F0FAF8] p-10 lg:p-12 xl:p-16 text-[#0E0F11] w-full lg:w-1/2 shrink-0 ${className}`}
    >
      <div className="mx-auto flex h-full w-full max-w-[520px] flex-col justify-between">
        {/* 1. شعار التطبيق */}
        <Link
          href={ROUTE_HOME}
          className="text-[22px] font-black leading-none text-[#0B5A54] hover:opacity-90 transition-opacity"
        >
          بالتدريج
        </Link>

      {/* 2. المحتوى السياقي حسب الشاشة */}
      <div className="my-auto flex flex-col gap-7 py-8">
        {mode === "login" && (
          <>
            <h2 className="max-w-[460px] text-3xl xl:text-[40px] font-black leading-[1.3] text-[#0E0F11] text-balance">
              ميعاد ورقم في الدور — مع بعض في نفس التذكرة.
            </h2>

            {/* مجسم التذكرة المصغّر — مطابق لـ FRAME 13A */}
            <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#CFE6E3] bg-white shadow-sm">
              <div className="h-1 w-full bg-[#0F766E]" />
              <div className="flex flex-col gap-1 p-5 pb-0">
                <div className="text-base font-bold text-[#0E0F11]">بربر لاونج المعادي</div>
                <div className="text-[12.5px] text-[#6B7280]">
                  قص شعر + تحديد دقن · مع كريم مصطفى
                </div>
              </div>

              {/* خط التثقيب مع النوتشات الجانبية */}
              <div className="relative my-4">
                <div className="border-t border-dashed border-[#D9DDE2]" />
                <div className="absolute -top-2 -right-2.5 size-4 rounded-full border border-[#CFE6E3] bg-[#F0FAF8]" />
                <div className="absolute -top-2 -left-2.5 size-4 rounded-full border border-[#CFE6E3] bg-[#F0FAF8]" />
              </div>

              <div className="flex items-stretch px-5 pb-5">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-[11.5px] font-semibold text-[#6B7280]">ميعادك</span>
                  <span className="text-[32px] font-extrabold leading-none tabular-nums text-[#0E0F11]">
                    6:30 م
                  </span>
                </div>
                <div className="my-1 w-px bg-[repeating-linear-gradient(#D9DDE2_0_5px,transparent_5px_10px)]" />
                <div className="flex flex-1 flex-col gap-1 pr-4">
                  <span className="text-[11.5px] font-semibold text-[#6B7280]">رقمك في الدور</span>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-14 items-center justify-center rounded-xl border-2 border-[#0F766E] bg-[#F0FAF8]">
                      <span className="text-[32px] font-extrabold leading-none tabular-nums text-[#0B5A54]">
                        3
                      </span>
                    </div>
                    <span className="text-[12.5px] leading-[1.5] text-[#6B7280]">
                      قدامك 2
                      <br />
                      في الدور
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === "register" && (
          <>
            <h2 className="max-w-[440px] text-3xl xl:text-[36px] font-black leading-[1.35] text-[#0E0F11] text-balance">
              حساب واحد، وبعد كده الحجز بيبقى في لمستين.
            </h2>

            {/* خطوات القيمة الثلاث — مطابقة لـ FRAME 13B */}
            <div className="flex flex-col gap-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex size-[26px] shrink-0 items-center justify-center rounded-lg border border-[#CFE6E3] bg-white text-xs font-extrabold text-[#0B5A54]">
                  1
                </div>
                <span className="text-sm font-medium leading-[1.7] text-[#0E0F11]">
                  اعرف رقمك في الدور وقت ما تحجز، مش لما توصل.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-[26px] shrink-0 items-center justify-center rounded-lg border border-[#CFE6E3] bg-white text-xs font-extrabold text-[#0B5A54]">
                  2
                </div>
                <span className="text-sm font-medium leading-[1.7] text-[#0E0F11]">
                  تنبيه على واتساب لما يفضل قدامك اتنين.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-[26px] shrink-0 items-center justify-center rounded-lg border border-[#CFE6E3] bg-white text-xs font-extrabold text-[#0B5A54]">
                  3
                </div>
                <span className="text-sm font-medium leading-[1.7] text-[#0E0F11]">
                  نفس الحجز تاني بضغطة من حجوزاتك السابقة.
                </span>
              </div>
            </div>
          </>
        )}

        {mode === "otp" && (
          <>
            <h2 className="max-w-[380px] text-3xl xl:text-[32px] font-black leading-[1.4] text-[#0E0F11] text-balance">
              الرقم ده هو اللي هنبعتلك عليه تنبيهات الدور.
            </h2>
            <p className="max-w-[380px] text-[13.5px] leading-[1.8] text-[#0B5A54]">
              التأكيد بيضمن إنك تستلم تنبيهات دورك في وقتها بدون أي تأخير، وتقدر تغيره لاحقاً من
              الإعدادات.
            </p>
          </>
        )}

        {mode === "forgot-password" && (
          <>
            <h2 className="max-w-[380px] text-3xl xl:text-[34px] font-black leading-[1.35] text-[#0E0F11] text-balance">
              هنساعدك ترجع لحسابك في ثواني.
            </h2>
            <p className="max-w-[380px] text-[13.5px] leading-[1.8] text-[#0B5A54]">
              اكتب رقم موبايلك أو إيميلك المسجل وهنبعتلك كود تأكيد عشان تعيّن كلمة سر جديدة.
            </p>
          </>
        )}
      </div>

      {/* 3. ملاحظة الطمأنينة بالأسفل */}
      <div className="text-[13px] leading-[1.8] text-[#0B5A54]">
        {mode === "login" &&
          "سجّل دخول عشان تحجز، وتتابع دورك يوم الميعاد، وتلاقي صالوناتك المفضلة في مكان واحد."}
        {mode === "register" &&
          "مفيش دفع أونلاين ولا بيانات بنكية — الحساب للحجز والتنبيهات بس."}
        {mode === "otp" &&
          "لو الرقم غلط، ارجع وغيّره قبل ما تكمّل — التنبيهات مش هتوصلك على رقم تاني."}
        {mode === "forgot-password" &&
          "بياناتك وحجوزاتك السابقة كلها محفوظة بأمان ومش هتتأثر بتغيير كلمة السر."}
      </div>
      </div>
    </aside>
  );
}

