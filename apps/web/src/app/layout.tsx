import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/lib/contexts/providers";
import { APP_NAME } from "@/lib/data/constants/app.constants";
import { cairo } from "@/lib/utils/fonts.config";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "احجز ميعادك في أقرب صالون حلاقة واعرف رقمك في الدور قبل ما تتحرك",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
