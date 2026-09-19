// كود التأكيد — مطابق لتصميم FRAME 13C
import { METADATA_VERIFY_OTP } from "@/lib/data/constants/metadata.constants";
import { CALLBACK_PARAM } from "@/lib/data/constants/app.constants";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";
import { Link } from "@/i18n/navigation";
import { AuthBrandPanel } from "../__components/auth-brand-panel";
import { OtpForm } from "./__components/otp-form";

export const metadata = METADATA_VERIFY_OTP;

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const phone = query.phone || "1023456789";
  const callbackUrl = query[CALLBACK_PARAM];

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-white text-[#0E0F11]">
      {/* هيدر الموبايل */}
      <div className="flex items-center justify-between border-b border-[#CFE6E3] bg-[#F0FAF8] px-6 py-4 lg:hidden">
        <Link
          href={ROUTE_HOME}
          className="text-xl font-black leading-none text-[#0B5A54]"
        >
          بالتدريج
        </Link>
        <span className="text-xs font-bold text-[#0B5A54]">
          ميعادك ورقمك في الدور
        </span>
      </div>

      {/* اللوحة التعريفية الجانبية (شاشات الكمبيوتر) */}
      <AuthBrandPanel mode="otp" />

      {/* مساحة النموذج في المنتصف */}
      <div className="flex w-full lg:w-1/2 flex-1 items-center justify-center p-4 sm:p-10 lg:p-12 xl:p-16">
        <OtpForm phone={phone} callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
