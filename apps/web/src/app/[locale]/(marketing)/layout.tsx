// تخطيط صفحات التسويق: هيدر وفوتر وشريط تنقل سفلي للموبايل
import { BottomNav } from "@/components/molecules/bottom-nav";
import { Footer } from "@/components/molecules/footer";
import { Header } from "@/components/molecules/header";
import { OfflineBanner } from "@/components/molecules/offline-banner";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <OfflineBanner />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </div>
  );
}
