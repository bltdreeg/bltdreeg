// قراءة وكتابة كوكيز المتصفح — دوال نقية عشان تتختبر من غير DOM

export interface CookieOptions {
  /** بالثواني؛ من غيرها بتبقى session cookie وبتتمسح لما المتصفح يتقفل */
  maxAge?: number;
  secure?: boolean;
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Lax"];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function expireCookie(name: string): string {
  return `${name}=; Path=/; SameSite=Lax; Max-Age=0`;
}

export function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
