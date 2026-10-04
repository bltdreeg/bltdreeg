// "تصفح كزائر" — تفضيل متذكر في كوكي، مش صلاحية دخول (proxy.ts بيتجاهله عمداً)
import { GUEST_COOKIE } from "@/lib/data/constants/app.constants";
import { serializeCookie } from "./cookie";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function enterGuestMode(): void {
  document.cookie = serializeCookie(GUEST_COOKIE, "1", {
    maxAge: ONE_YEAR_SECONDS,
    secure: window.location.protocol === "https:",
  });
}
