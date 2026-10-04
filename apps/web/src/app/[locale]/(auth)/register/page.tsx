// إنشاء حساب — مطابق لتصميم FRAME 13B و FRAME 13D
import { METADATA_REGISTER } from "@/lib/data/constants/metadata.constants";
import { CALLBACK_PARAM } from "@/lib/data/constants/app.constants";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";
import { Link } from "@/i18n/navigation";
import { AuthBrandPanel } from "../__components/auth-brand-panel";
import { RegisterForm } from "./__components/register-form";

export const metadata = METADATA_REGISTER;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const callbackUrl = (await searchParams)[CALLBACK_PARAM];

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
      <AuthBrandPanel mode="register" />

      {/* مساحة النموذج في المنتصف */}
      <div className="flex w-full lg:w-1/2 flex-1 items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
        <RegisterForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
