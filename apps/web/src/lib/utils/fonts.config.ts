// خط Cairo عبر next/font/google بأوزان 400/600/700/800
import { Cairo } from "next/font/google";

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  // 900 لازم لشعار "بالتدريج" وعنوان الهيرو في التصميم
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});
