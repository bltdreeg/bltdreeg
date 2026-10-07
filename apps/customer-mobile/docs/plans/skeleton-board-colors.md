# Skeleton colors = design board

## Context

The mobile board (`mobile.html`) draws no skeletons. The design-system board (`web.html` §03 SKELETONS) does, and the
web app follows it: a `#F1F3F5` base (image blocks, secondary lines) and a darker `#EDEFF2` for the title and price lines.
The board has no animation. Flutter (and RN after batch 8) used `surf` `#F7F8FA` boxes with an `#EDEFF2` sweep, which is
paler than the board and has no darker lines. Decision (2026-10-07): use the board colors and keep Flutter's 1300 ms sweep.
The sweep band becomes `#E5E7EB` so it still shows over the darker fills.

## Tasks

- [x] 1. `styles/tokens.ts`: replace `surfSheen` with `skeleton` `#F1F3F5`, `skeletonStrong` `#EDEFF2`, `skeletonSheen` `#E5E7EB`.
- [x] 2. `atoms/skeleton`: base fill `skeleton`; `strong` prop → `skeletonStrong`; sweep fades from the box fill to `skeletonSheen` and back; sweep band = full screen width (Flutter gradient spans the whole rect).
- [x] 3. `strong` on title/price lines: `SalonRowSkeleton` (name, wait chip), Home (greeting, rail card name), salon (name), booking step (heading), account (name), dev gallery.
- [x] 4. Docs: GAPS.md loading-skeletons row, flutter-reuse.md motion row.
- [x] 5. Checks: `npx tsc --noEmit`, `npx expo lint`.

## Files

`src/styles/tokens.ts`, `src/components/atoms/skeleton/skeleton.tsx`, `src/screens/home/__sections/home-skeleton.tsx`,
`src/screens/salon/__sections/salon-skeleton.tsx`, `src/components/organs/booking-step/booking-step.tsx`,
`src/screens/account/account.screen.tsx`, `src/screens/design-system/__sections/components-gallery.tsx`, `GAPS.md`,
`docs/flutter-reuse.md`.

## Verification

tsc + lint green. On the device: Home cold start, Search, Favorites show the `#F1F3F5` boxes with darker title lines and
a visible sweep.

## Review summary

- `surfSheen` had one user (the skeleton); removed. `batch-8-flutter-gaps.md` still names it — left as history.
- The sweep gradient ends on the box's own fill, so a `strong` box keeps its color at the band's edges.
- Gallery hero (196) and booking-slot field (42) stay base color: image/field blocks are `#F1F3F5` in the board.
- Checks: `tsc` ✅ · lint 0 errors (8 baseline warnings). Not device-checked yet.
- Device feedback: the salon skeleton covered ~70 % of the screen on a grey (navigator default `#F2F2F2`) background.
  Fixed: white `flex: 1` root. Filling the screen with rows (here, then on every page) was tried and reverted at the
  user's request: layouts follow Flutter exactly and only the colors come from the board.
- Layout pass vs Flutter: Home (top 12, 8 · 18 · 14 · 26 · 24, second rail card takes the rest like `Expanded`), salon
  (top 20, 10 · 16 · 24 · 12), Search (top 16) fixed. Favorites (3 rows) and the slot grid (9 × 42, 3 across, gap 8)
  already matched. Gallery, account and booking-step skeletons have no Flutter equivalent — unchanged.
