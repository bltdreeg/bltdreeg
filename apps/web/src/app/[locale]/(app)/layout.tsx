// تخطيط التطبيق: هيدر وشريط تنقل سفلي للموبايل
import { BottomNav } from "@/components/molecules/bottom-nav";
import { Header } from "@/components/molecules/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </>
  );
}
