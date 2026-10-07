// باك إند المصادقة الوهمي — منقول من Flutter (fake_auth_remote_data_source.dart) وبنفس قواعد السيرفر.
// بيرجّع أشكال Laravel الخام (snake_case) عشان auth.action و laravel-mappers يشتغلوا زي ما هما.
//   بريد karim.abdelrahman@gmail.com / كلمة السر barber2026
//   موبايل 01023456789 متسجّل · أي كود OTP = 1234 · 3 محاولات غلط = قفل 10 دقايق
import type { RawAuthSession, RawCustomer, RawOtpChallenge } from "@/lib/utils/auth/laravel-mappers";
import { MockHttpError, route, type MockRequest } from "./router.ts";

export const DEMO = { email: "karim.abdelrahman@gmail.com", password: "barber2026", phone: "01023456789", otp: "1234" };

const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_MS = 60_000;
const LOCK_MS = 10 * 60_000;

/** المفتاح = آخر 10 أرقام، عشان 010… و +2010… و 2010… يبقوا نفس الرقم */
const phoneKey = (phone: unknown) => String(phone ?? "").replace(/\D/g, "").slice(-10);
/** صيغة الـ API للموبايل: 01XXXXXXXXX (زي formatLocalEgyptianPhone في الويب) */
const local = (key: string) => `0${key}`;

function customer(id: string, firstName: string, lastName: string, phone: string, email: string | null, birthDate: string | null): RawCustomer {
  return {
    id,
    first_name: firstName,
    last_name: lastName,
    phone,
    phone_verified: true,
    email,
    email_verified: email !== null,
    pending_email: null,
    birth_date: birthDate,
    has_password: true,
    social_providers: [],
    location: null,
    onboarding: { complete: true, missing: [], skippable: [] },
  };
}

const accounts = new Map<string, { user: RawCustomer; password: string }>([
  [phoneKey(DEMO.phone), { user: customer("u-karim", "كريم", "عبد الرحمن", local(phoneKey(DEMO.phone)), DEMO.email, "1996-03-14"), password: DEMO.password }],
]);
const pendingRegistrations = new Map<string, Record<string, unknown>>();
const attemptsLeft = new Map<string, number>();
const lockedUntil = new Map<string, number>();
const resendAt = new Map<string, number>();
const sessions = new Map<string, string>(); // token → phone key
const resetTokens = new Map<string, string>(); // reset token → phone key

const t = (req: MockRequest, ar: string, en: string) => (req.locale === "en" ? en : ar);

function issue(key: string, purpose: RawOtpChallenge["purpose"]): RawOtpChallenge {
  const now = Date.now();
  resendAt.set(key, now + RESEND_COOLDOWN_MS);
  attemptsLeft.set(key, MAX_ATTEMPTS);
  return {
    phone: local(key),
    purpose,
    channel: "sms",
    code_length: CODE_LENGTH,
    expires_at: new Date(now + LOCK_MS).toISOString(),
    resend_available_at: new Date(now + RESEND_COOLDOWN_MS).toISOString(),
    attempts_left: MAX_ATTEMPTS,
  };
}

function session(key: string): RawAuthSession {
  const token = `fake.${key}.${Date.now()}`;
  sessions.set(token, key);
  return { access_token: token, token_type: "Bearer", expires_at: null, user: accounts.get(key)!.user };
}

/** الـ mock مالوش جلسات بعد إعادة التشغيل — أي توكن مش معروف بيتعامل كأنه الحساب التجريبي (زي Flutter) */
export function currentUserKey(req: MockRequest): string {
  if (!req.token) throw new MockHttpError(401, "auth.unauthenticated", t(req, "سجّل دخولك الأول.", "Please sign in first."));
  return sessions.get(req.token) ?? phoneKey(DEMO.phone);
}

/** نفس فحص الكود في otp/verify و password/verify: قفل بعد المحاولات، والكود الصح DEMO.otp */
function checkCode(req: MockRequest, key: string): void {
  const locked = lockedUntil.get(key) ?? 0;
  if (Date.now() < locked) {
    throw new MockHttpError(422, "auth.otp_locked", t(req, "حاولت كتير.", "Too many attempts."), {
      lockMinutes: Math.max(1, Math.ceil((locked - Date.now()) / 60_000)),
    });
  }
  if (req.body.code !== DEMO.otp) {
    const left = (attemptsLeft.get(key) ?? MAX_ATTEMPTS) - 1;
    if (left <= 0) {
      lockedUntil.set(key, Date.now() + LOCK_MS);
      attemptsLeft.delete(key);
      throw new MockHttpError(422, "auth.otp_locked", t(req, "حاولت كتير.", "Too many attempts."), { lockMinutes: LOCK_MS / 60_000 });
    }
    attemptsLeft.set(key, left);
    throw new MockHttpError(422, "auth.otp_invalid", t(req, "الكود مش مظبوط.", "That code isn't right."), { attemptsLeft: left });
  }
  attemptsLeft.delete(key);
}

export const authRoutes = [
  route("GET", "/auth/options", () => ({ otp_channels: ["sms"], social_providers: ["google", "apple"], terms_version: "2026-09" })),

  route("POST", "/auth/login", (req) => {
    const email = typeof req.body.email === "string" ? req.body.email : null;
    const match = [...accounts.entries()].find(([key, a]) =>
      email ? a.user.email?.toLowerCase() === email.toLowerCase() : key === phoneKey(req.body.phone),
    );
    if (!match || match[1].password !== req.body.password) {
      throw new MockHttpError(422, "auth.invalid_credentials", t(req, "البيانات دي مش مظبوطة.", "These credentials don't match."));
    }
    return session(match[0]);
  }),

  route("POST", "/auth/otp", (req) => {
    const key = phoneKey(req.body.phone);
    if (!accounts.has(key)) {
      throw new MockHttpError(422, "auth.phone_not_registered", t(req, "الرقم ده مش متسجّل — اعمل حساب الأول.", "This number isn't registered yet."));
    }
    return issue(key, "login");
  }),

  route("POST", "/auth/register", (req) => {
    const key = phoneKey(req.body.phone);
    if (accounts.has(key)) {
      throw new MockHttpError(422, "auth.phone_taken", t(req, "الرقم ده عليه حساب بالفعل.", "This number already has an account."), {}, {
        phone: [t(req, "الرقم ده عليه حساب بالفعل.", "This number already has an account.")],
      });
    }
    pendingRegistrations.set(key, req.body);
    return issue(key, "register");
  }),

  route("POST", "/auth/otp/resend", (req) => {
    const key = phoneKey(req.body.phone);
    const at = resendAt.get(key) ?? 0;
    if (Date.now() < at) {
      throw new MockHttpError(429, "auth.otp_resend_too_soon", t(req, "استنى شوية قبل ما تطلب كود جديد.", "Wait a bit before asking for a new code."), {
        retryAfterSeconds: Math.ceil((at - Date.now()) / 1000),
      });
    }
    return issue(key, req.body.purpose as RawOtpChallenge["purpose"]);
  }),

  route("POST", "/auth/otp/verify", (req) => {
    const key = phoneKey(req.body.phone);
    checkCode(req, key);
    if (req.body.purpose === "register") {
      const r = pendingRegistrations.get(key);
      if (!r) throw new MockHttpError(422, "auth.otp_expired", t(req, "الكود انتهى، اطلب كود جديد.", "The code expired, request a new one."));
      pendingRegistrations.delete(key);
      const email = typeof r.email === "string" && r.email ? r.email : null;
      accounts.set(key, { user: customer(`u-${Date.now()}`, String(r.first_name), String(r.last_name), local(key), email, null), password: String(r.password) });
    }
    return session(key);
  }),

  // استعادة كلمة السر: forgot → كود → reset token → كلمة سر جديدة + جلسة (السيرفر بيقفل باقي الجلسات)
  route("POST", "/auth/password/forgot", (req) => {
    const email = typeof req.body.email === "string" ? req.body.email.toLowerCase() : null;
    const key = email ? [...accounts.entries()].find(([, a]) => a.user.email?.toLowerCase() === email)?.[0] : phoneKey(req.body.phone);
    if (!key || !accounts.has(key)) throw new MockHttpError(422, "auth.account_not_found", t(req, "مفيش حساب بالبيانات دي.", "No account matches these details."));
    return issue(key, "reset_password");
  }),

  route("POST", "/auth/password/verify", (req) => {
    const key = phoneKey(req.body.phone);
    checkCode(req, key);
    const token = `reset.${key}.${Date.now()}`;
    resetTokens.set(token, key);
    return { reset_token: token, expires_at: new Date(Date.now() + 10 * 60_000).toISOString() };
  }),

  route("POST", "/auth/password/reset", (req) => {
    const resetToken = String(req.body.reset_token);
    const key = resetTokens.get(resetToken);
    if (!key) throw new MockHttpError(422, "auth.reset_token_invalid", t(req, "الطلب انتهى، ابدأ من الأول.", "This request expired, start again."));
    resetTokens.delete(resetToken);
    accounts.get(key)!.password = String(req.body.password);
    for (const [token, k] of sessions) if (k === key) sessions.delete(token);
    return session(key);
  }),

  // ponytail: no native Google/Apple sign-in yet; the mock signs in the demo account so the flow can be demoed.
  route("POST", "/auth/social/:provider", () => session(phoneKey(DEMO.phone))),

  route("POST", "/auth/logout", (req) => {
    if (req.token) sessions.delete(req.token);
    return null;
  }),

  route("GET", "/me", (req) => accounts.get(currentUserKey(req))?.user ?? null),

  route("PUT", "/me", (req) => {
    const key = currentUserKey(req);
    const account = accounts.get(key)!;
    const b = req.body;
    account.user = {
      ...account.user,
      first_name: typeof b.first_name === "string" ? b.first_name : account.user.first_name,
      last_name: typeof b.last_name === "string" ? b.last_name : account.user.last_name,
      email: "email" in b ? ((b.email as string) || null) : account.user.email,
      birth_date: "birth_date" in b ? ((b.birth_date as string) || null) : account.user.birth_date,
    };
    return account.user;
  }),

  route("DELETE", "/me", (req) => {
    accounts.delete(currentUserKey(req));
    if (req.token) sessions.delete(req.token);
    return null;
  }),
];
