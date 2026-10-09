# 16 · Web onboarding, route protection, account page

**Depends on:** 10, 11 (merge), 15 · **Spec:** §11 (Onboarding, Account, `proxy.ts`)

## Steps
- [ ] Route group `src/app/[locale]/(onboarding)/onboarding`; show only the missing steps:
  1. [ ] Phone + verify. On a merge the action stores the new token from the response.
  2. [ ] Name + terms.
  3. [ ] Location: render `<LocationStep>` from `plan/geo-location` task 09 (already built at `/onboarding`). It is required: dropdowns pre-filled from GPS or the IP, confirmed by the customer. No map.
  4. [ ] Birth date. Skippable.
  - [ ] After the last step: clear the onboarding cookie, go to `callbackUrl`.
- [ ] `src/proxy.ts` (extend the existing `isProtectedPath` check):
  - [ ] Protected paths without session → login with `callbackUrl` (exists today).
  - [ ] Protected paths with the onboarding cookie → `/onboarding?callbackUrl=…`.
  - [ ] `/onboarding` without session → login; with session but no onboarding cookie → `callbackUrl` or home.
  - [ ] Auth pages with a session → home. Public browsing stays open.
  - [ ] Session cookie refresh from task 14.
- [ ] Account → profile: add/change email with a code dialog; set password (social-only) or change it.

## Done when
- [ ] Guest → book → login/register → onboarding → back on the booking page, signed in.
