# Batch 12: review leftovers

## Context

After batches 10 and 11, the user asked for a review of all the work done and a check of `docs/build-roadmap.md` for forgotten tasks, then a plan for whatever was found ("after finish review all works … check build-roadmap … start plan for it and work with it", 2026-10-07).

What the review found:
- **Every plan's tasks are ticked.** No ⏸ step was skipped.
- **Step 0's leftovers are closed:** batch 2 evidence; onboarding at 320 and iPad landscape (done in the batch 11 matrix).
- **Still waiting on the user:** the decisions in GAPS §2b/§2c/#11, `eas init` plus the iOS build, and a logo of at least 1024 px.
- **The copy audit (roadmap Step 1.9) only ever ran for batch 2,** and only checked top-level keys. Run recursively over all 550 `mobile.*` strings against the board and Flutter's ARB:
  - 410 strings appear verbatim on the board;
  - 129 come from the board or Flutter;
  - **11 come from neither** (copy drift, see task 1).
- **Frame 33** (notifications, empty) was never checked on the device, because the mock always has six notifications.
- **Skeleton RTL bug (found in review):** RTL swaps the sheen's `left: 0` to the right, so the sweep started mid-box. Already fixed: the skeleton box is `direction: "ltr"`.
- **`build-roadmap.md` "Where we are" and HANDOFF stop at batch 7.**
- **Deferred by the user**, not forgotten: the auth batch (D3 forgot password, #7 complete-profile, D5/D6 OTP), English (38), iOS, the icon.

## Tasks

- [x] **1. Copy drift → Flutter wording** (board first, else Flutter ARB, never invented):
  - `a11y.showPassword` / `hidePassword`: "اظهر كلمة السر" / "اخفي كلمة السر" (`a11yShowPassword` / `a11yHidePassword`);
  - `comingSoon.title`: "الشاشة دي لسه بتتبني" (`comingSoonTitle`). Flutter has no body, so the invented message goes;
  - `auth.network`: "مفيش اتصال بالنت." (`errorNetwork`); `auth.generic`: "حصلت مشكلة. جرّب تاني بعد شوية." (Flutter's generic);
  - register password: Flutter shows the failing rule, "كلمة السر لازم تكون 8 حروف على الأقل" or "كلمة السر لازم يكون فيها رقم واحد على الأقل", instead of the invented combined message;
  - `notifications.unread`: "غير مقروء" (`a11yUnread`);
  - kept, with a GAPS row:
    - `offline.bar` is the fallback when there's no update time; the board and Flutter always have a time;
    - `notifications.loadFailed` covers an error state Flutter doesn't have, and follows its pattern "معرفناش نجيب …";
    - `salon.bundleSaving` is board text split by `<s>`, so it isn't drift.
- [x] **2. Audit tool.** `scripts/emulator/copy_audit.py` walks nested keys and accepts Flutter ARB text, so the next batch can run it as Step 1.9 says.
- [x] **3. Frame 33 on the device.** Empty the notifications seed only for the check (like the batch 8 latency trick), screenshot at 393 and 320, then restore it.
- [x] **4. Skeleton RTL fix: device check** (code fixed in review).
- [x] **5. Docs.**
  - `build-roadmap.md`: "Where we are" plus the handoff line for batches 8, 10, 11 and 12.
  - HANDOFF §3–§5.
  - GAPS rows for task 1.
- [x] **6. Checks:** tsc, lint, tests; review summary.

## Review summary

**Files:** `ar.json` (`a11y.show/hidePassword`, `comingSoon.title` (−`message`), `auth.network`, `auth.generic`, `auth.passwordShort`/`passwordDigit` (−`passwordInvalid`), `notifications.unread`), `components/organs/coming-soon/coming-soon.tsx`, `screens/register/register.screen.tsx`, `components/atoms/skeleton/skeleton.tsx` (`direction: "ltr"`), `scripts/emulator/copy_audit.py` (recursive + Flutter ARB), `GAPS.md`, `docs/build-roadmap.md`, `docs/HANDOFF.md`.

**Found and fixed:** 8 of the 11 strings that were neither board nor Flutter text now use Flutter's wording (1 was a false positive, 2 are kept); the register password error shows the one rule that fails (Flutter) instead of an invented combined sentence. The skeleton sheen started mid-box in RTL (`left` swapped to the right) → box is LTR, the band now enters from the left like Flutter. Docs stopped at batch 7 → roadmap, HANDOFF updated.

**Checks:** `tsc` ✅ · lint 0 errors (8 baseline warnings) · tests 86/86 · copy audit: board 412 · board + Flutter 136 · neither 2 (both kept on purpose, GAPS rows). Emulator-5554: frame 33 empty notifications at 393 and 320 (mock emptied for the check, restored); skeleton sweep enters from the left in RTL (latency raised for the check, restored to 300–700 ms).

**Left open (waiting on the user):** decisions GAPS §2b B1–B8, §2c D1–D8, §2 #11; `eas init` + iOS build; a ≥1024 logo; the auth batch (D3, #7, D5, D6) and English (38) when they choose.
