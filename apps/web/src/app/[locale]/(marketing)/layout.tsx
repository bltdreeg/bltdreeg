// تخطيط صفحات التسويق: هيدر وفوتر وشريط تنقل سفلي للموبايل
import { BottomNav } from "@/components/molecules/bottom-nav";
import { Footer } from "@/components/molecules/footer";
import { Header } from "@/components/molecules/header";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
