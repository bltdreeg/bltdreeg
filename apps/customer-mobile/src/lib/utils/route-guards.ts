// المسارات اللي محتاجة تسجيل دخول — نفس AppRoutes.protectedRoutes في Flutter. الضيف بيتحوّل لـ /login?from=<المسار> ويرجع بعد الدخول.
const LOGIN_REQUIRED = [
  /^\/salon\/[^/]+\/book(\/|$)/,
  /^\/booking\/[^/]+\/(confirmed|rate)(\/|$)/,
  /^\/queue\/[^/]+$/,
  /^\/account\/(profile|favorites|notification-settings)$/,
];

export function requiresLogin(pathname: string): boolean {
  return LOGIN_REQUIRED.some((r) => r.test(pathname));
}

/** "from" لازم يبقى مسار داخلي — مش URL خارجي ولا //host */
export function safeReturnPath(from: unknown): string | null {
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : null;
}
