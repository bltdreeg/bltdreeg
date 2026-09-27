# 03 · Support classes: phone, onboarding status, password rule

**Depends on:** 02 · **Spec:** §3 (Support), §7, §7.4

## Steps
- [ ] `PhoneNumber` value object: accept `01XXXXXXXXX`, `+201…`, `201…`, `00201…`; allow only Egyptian
      mobile prefixes (010/011/012/015); store E.164, output local 11 digits. Add a validation rule.
      Rejecting non-Egyptian numbers is also the main defence against SMS-pumping fraud.
- [ ] `OnboardingStatus`: `complete`, `missing` (phone, name, terms), `skippable` (location, birth_date).
- [ ] Password rule object: min 8, letters + numbers.

## Done when
- [ ] Unit tests: every input format, invalid prefixes, each onboarding combination.
