import type { Metadata } from "next";
import "@/styles/globals.css";
import { APP_NAME } from "@/lib/data/constants/app.constants";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "احجز ميعادك في أقرب صالون حلاقة واعرف رقمك في الدور قبل ما تتحرك",
};

// html/body انتقلوا لـ [locale]/layout.tsx عشان lang/dir يتحددوا حسب اللغة
export default function RootLayout({ children }: LayoutProps<"/">) {
  return children;
}
