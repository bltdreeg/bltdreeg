# 17 · End-to-end check, docs, follow-ups

**Depends on:** 01–16 (13 optional) · **Spec:** §12, §13, §14

## Manual checklist (local Docker stack)
- [ ] Register (SMS via `log` provider) → onboarding → booking redirect.
- [ ] OTP login; five wrong codes → locked; requesting a new code while locked is refused.
- [ ] Google login → incomplete account → onboarding phone step, including a merge into an existing phone.
- [ ] Forgot + reset (phone and email); other sessions logged out.
- [ ] Logout; delete account; same phone registers again.
- [ ] Revoke a token in the DB → web lands on login cleanly.
- [ ] Admin: disable SMS → it disappears from auth options; deliveries table shows sends; disabling a
      customer logs them out.

## Docs
- [ ] `plan/customer-app.md` CA-A1: web done, mobile follow-up. Update the table in `../README.md`.
- [ ] Update the auth spec with the "Changes vs spec" list in `../README.md`.

## Follow-ups (not in this plan)
- Mobile wiring: `BACKEND=real`; send `accepted_terms` at register; `channel` + `/auth/options`;
  social buttons; onboarding; forgot password; nullable `phone`/names in `UserModel`; add
  `reset_password`/`verify_phone`/`verify_email` to its `OtpPurpose` enum (parsed with `byName`);
  parse the `code` envelope into `RuleFailure`; token swap after a merge.
- Real WhatsApp/SMS vendor drivers; Apple keys; device list UI; named areas; push token registration.
