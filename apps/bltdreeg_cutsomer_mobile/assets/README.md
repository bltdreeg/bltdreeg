# Assets

All artwork was extracted from the design board (`html_designs/all.html`), then redrawn or cleaned. Reference assets only via `AppAssets` (generated), never by path.

```bash
dart run tool/generate_app_assets.dart   # after adding/renaming/removing an SVG
```

## Conventions

- **Icons** (`icons/`): 24×24 viewBox, `stroke-width` 1.75, round caps/joins, black stroke. Tinted at runtime by `AppIcon`. `*_bold` variants (2.15) are the selected bottom-nav state. `google.svg` is the only multicolor icon.
- **Illustrations** (`illustrations/`): palette colors only, **no `<text>`**. Numbers and captions are overlaid in Flutter (`IllustrationCanvas` + `IllustrationLabel`) so they localize and always use Western digits. A test enforces this.
- **Layered illustrations** (`illustrations/<name>/`): each layer shares the parent's viewBox so the layers stack exactly and can be animated independently.
- **Photos**: none are bundled. `AppNetworkImage` renders the board's placeholder (surface + muted icon) for `null` URLs, and shimmer → fade-in → placeholder-on-error for real URLs.

## Fix log (vs. the board)

### Missing icons (referenced by `<use>` but never defined, so blank on the board)
`message`, `camera`, `share`, `heart_filled`, `play`, `navigation`, `phone`, `gift`, `chair`, `trash` were drawn from scratch. Added for app needs: `star_filled`, `plus`, `lock`, `sun` / `sunset` / `moon` (slot times of day), `check_bold`, and the bold nav variants.

### Icons fixed
| Icon | Problem | Fix |
|---|---|---|
| `settings` (i-gear) | Sun-ray burst, not a gear | Real 8-tooth gear with hub |
| `wifi_off` | Arcs not concentric, asymmetric stroke paths | Concentric arcs (r 4.2/8.4/12.6) around one center, filled dot, clean slash |
| `eye_off` | Fragmented, misaligned eye segments | Redrawn as a continuous eye with a slash |
| `home` | Walls started below the roof line (gap / misjoin) | Walls meet the roof pitch; rounded base; centered door |
| `store` (i-shop) | Walls overlapped the awning scallops | Body starts under the scallops |
| `scissors` | Blades started at arbitrary points inside the handle rings | Blades start exactly on the ring edge, aimed at the tips |
| `star` | Irregular hand-typed points | Mathematically regular 5-point star |
| `heart` | Lopsided lobes | Symmetric heart |
| `repeat`, `logout` | Arrowheads touching the viewBox edge / sharp door corners | Inset from the edges, rounded corners |
| `calendar` | Single stray dash | Balanced date lines |
| `google` | Rendered monochrome grey | Official 4-color mark |
| `chair` (new) | First draft read as a desk lamp | Side-profile barber chair |

### Illustrations fixed
| Illustration | Problem | Fix |
|---|---|---|
| `no_internet` (frame 18) | Three "wifi" arcs had different centers (y 134 / 130 / 126) so they didn't nest | Concentric arcs centered on the dot |
| `onboarding_choose_barber` (03) | Chair legs floated (never reached the base); headrest fill covered the back's stroke; baked-in `٨٥ ج.م` / `٢٥ دقيقة` text | Single column + base plate + armrests; headrest posts; text removed and overlaid in Flutter; split into animatable layers |
| `onboarding_live_queue` (02) | Baked-in Arabic-Indic `٤`, `فاضلك ٢ أنفار`, `~ ٢٠ دقيقة`; dashed clock built from an `a20 20 0 1 1 0 .1` arc hack; stray bracket | Text removed (overlay labels); real dashed `<circle>`; home roof over the "at home" person clarifies the message |
| `onboarding_find_salons` (01) | Center shop had no door; shops floated with no ground; left door off-center | Ground line, centered doors, closed awnings, status dots over each shop |
| `search_no_results` (15) | Roof (x 66–106) off-center relative to walls (70–106) | Roof widened to 66–110 so the shop is symmetric |
| `notifications_empty` (33) | Bell stem floated 6px above the bell | Stem attached to the bell top |
| `favorites_empty` (35) | "Heart" was actually a map-pin/teardrop shape; storefront read as a box | Real heart badge; storefront with scalloped awning |
| `rating_sent` (41) | Check mark off-center on the star | Star recomputed and check re-centered |
| `empty_bookings` (11), `queue_joined` (26), `your_turn` (29) | Minor: peg length, check alignment, scissor blade starts | Tidied; geometry preserved |
