# 15 · Web auth pages

**Depends on:** 09, 14 · **Spec:** §11 (Pages)

Pages live in `src/app/[locale]/(auth)/`. All copy in ar + en; check RTL.

## Steps
- [ ] **Login:** identifier + password + "remember me"; "log in with a code" → phone + channel picker →
      verify-otp; Google button (Google Identity Services) in `social-auth-buttons` → `socialLogin`
      action; Apple button only when `getAuthOptions` lists it.
- [ ] **Register:** first/last name, phone, optional email, password (existing `password-requirements`),
      terms checkbox, WhatsApp/SMS picker from `getAuthOptions` → verify-otp.
- [ ] **Verify OTP:** driven by the challenge (code length, countdown from `resend_available_at`,
      attempts left, resend with channel switch). Map every spec §9 code to a message.
- [ ] **Forgot password:** identifier → code → new `reset-password` page (password + confirm).
- [ ] On success: invalidate `['user']`, then go to `/onboarding?callbackUrl=…` if onboarding is
      incomplete, else `callbackUrl`.

## Done when
- [ ] Each page works against the local API in both languages, including error states (locked,
      resend too soon, send limit).
