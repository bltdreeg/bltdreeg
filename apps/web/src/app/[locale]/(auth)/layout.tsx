// تخطيط صفحات الدخول والمصادقة
import { Footer } from "@/components/molecules/footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0E0F11]">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
