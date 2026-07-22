# HRMS — Development Notes

Working log of the design-system adoption for the Interloid Workforce HRMS frontend.
Source of truth for tokens is the Claude Design project **"Interloid Workforce design
system"** (`8f1502f5-7ea6-4398-93b2-7aff30096b51`).

Stack: Vite + React + TS, Tailwind v4 (CSS-first, no `tailwind.config.js`), shadcn/ui.

---

## Design tokens → `src/styles/index.css`

Every token from the design project's `tokens/` folder (`colors.css`, `effects.css`,
`typography.css`, `motion.css`, `fonts.css`) was mapped onto shadcn's CSS-variable layer.

- **Raw token values** (hex/rgba, exactly as authored) live on `:root` (light) and on
  `.dark, [data-theme="dark"]` (dark). Raw values belong here — this is the token layer,
  not component markup.
- **Tailwind utility exposure** via `@theme inline` (theme-varying values: colors, shadows,
  fonts) and `@theme` (static values: radius scale, type scale, easing).
- **Dark mode** matches both `.dark` (what the app's `ThemeProvider` toggles on `<html>`)
  and `[data-theme="dark"]` (the design source's convention). Variant:
  `@custom-variant dark (&:is(.dark *, [data-theme='dark'] *))`.

### Token groups mapped

| Group           | Exposed as                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces & text | `bg/text-background`, `-foreground`, `-card`, `-popover`, `-muted`, `-secondary`, `border`, `input`, `ring`                             |
| Brand           | `-primary` (+`-foreground`, `-bg`), `-accent` (+`-foreground`, `-bg`)                                                                   |
| Semantic        | `success` / `warning` / `destructive` / `info`, each: solid, `-foreground` (on-solid), `-subtle` (tint), `-subtle-foreground` (on-tint) |
| Charts          | `chart-1…5`                                                                                                                             |
| Sidebar         | full `sidebar-*` set                                                                                                                    |
| Elevation       | `shadow-sm` / `shadow` / `shadow-md` / `shadow-lg`                                                                                      |
| Glass           | `bg-glass`, `bg-glass-border`                                                                                                           |
| Radius          | `rounded-sm/md/lg/xl/2xl/3xl/4xl/full` (sm/md/lg = 6/10/14px from design; xl+ extrapolated)                                             |
| Type            | `text-display/h1/h2/h3/body/small/mono` (size + line-height + weight + tracking)                                                        |
| Fonts           | `font-sans` (Inter), `font-mono` (JetBrains Mono)                                                                                       |
| Motion          | `iws-*` keyframes + `--ease-standard`                                                                                                   |

### Deliberate adjustments (not 1:1 from source)

- **Semantic token naming** — the design's `-bg`/`-fg` were renamed to `-subtle` /
  `-subtle-foreground`, and an on-solid `-foreground` bridge was **added for all four**
  semantics (the design defines none). See the mismatch note below.
- **`--destructive-foreground`** — the design has no white-on-solid-destructive token;
  shadcn's Button expects one, so it's provided.
- **Root base = 16px**, `<body>` carries `text-body` (14px/1.5). The design's body size is a
  component-level token, not a global override.
- **`--space-1…12` deleted** — they map 1:1 onto Tailwind's default 4px scale
  (`p-1`=4px … `p-12`=48px at the 16px root). Nothing to wire up.
- **`--ease-standard`** = `cubic-bezier(0.22, 0.61, 0.36, 1)`. This matches the value the
  design-system page inlines everywhere (there is no named `--ease-standard` var in the
  source; the curve is used literally). Note: the confirmation `iws-dialog` uses a _different_
  curve, `cubic-bezier(.22, 1, .36, 1)`.

### Motion keyframes present

`iws-spin`, `iws-pop`, `iws-shake`, `iws-shimmer`, `iws-in`, `iws-pop-in` (from
`tokens/motion.css`), plus `iws-overlay`, `iws-sheet-r`, `iws-drawer-b` (pulled from the
design-system page). A `prefers-reduced-motion` guard collapses all animation/transition.

---

## Fonts

Both families are bundled via **Fontsource variable packages** (compiled into the build,
no CDN / Google Fonts request):

- **Inter** — `@fontsource-variable/inter`, imported in `src/styles/index.css` (line 4).
- **JetBrains Mono** — `@fontsource-variable/jetbrains-mono`, imported in
  `src/app/main.tsx`.

> Note: the two imports live in different files (Inter in the CSS, mono in `main.tsx`). Both
> bundle identically; if you want them co-located, say so and I'll align them.

---

## `/dev/tokens` route

A living token gallery, wired as a thin page composing feature components.

- Route: `paths.devTokens.path` (`/dev/tokens`), lazy-loaded in `src/app/router.tsx`.
- Page: `src/app/pages/dev-tokens.tsx` (composition only).
- Feature: `src/features/dev-tokens/`
  - `tokens.ts` — catalog of every token (colors, type, radius, shadow) + the unmapped list.
  - `hooks/use-resolved-var.ts` — reads the computed value of a CSS var, re-reading on
    theme change.
  - `components/` — `color-swatch`, `type-specimen`, `box-swatch`, `token-gallery`.
- Renders: every color token as a labeled swatch (with an on-swatch legibility sample +
  live resolved value), every `text-*` utility as sample text, every radius/shadow as a box,
  and a section flagging unmapped/partial tokens.

No files in `src/components/ui/` were modified.

---

## Open items / flags

- **On-solid semantic foregrounds diverge from the design** (reported, not fixed) — see
  below.
- **`--accent-fg`** (on-accent-subtle text: `#0369A1` light / `#7DD3FC` dark) exists in the
  States & Components page but **not** in `tokens/colors.css`, so there is no
  `accent-subtle-foreground` in the CSS layer. Text on `accent-bg` currently has no dedicated
  token.

### On-solid foreground mismatch (design vs. current)

The design never defines on-solid semantic foregrounds as tokens; where it puts text on a
solid semantic background it hardcodes **`color:#fff`** (primary & destructive solid buttons;
the confirmation dialog's dynamic-color confirm button). Current values:

| Token                      | Current (light)      | Design convention                 | Verdict                                                                                  |
| -------------------------- | -------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| `--success-foreground`     | `#0f172a` (dark ink) | `#fff`                            | **Mismatch** — chosen for contrast (white on `#10b981` ≈ 2.5:1)                          |
| `--warning-foreground`     | `#0f172a` (dark ink) | `#fff`                            | **Mismatch** — chosen for contrast (white on `#f59e0b` ≈ 2.1:1)                          |
| `--destructive-foreground` | `#fff`               | `#fff`                            | Match                                                                                    |
| `--info-foreground`        | `#fff`               | `#fff`                            | Match                                                                                    |
| all four (dark theme)      | `#0b1120` (dark ink) | `#fff` (page doesn't theme-adapt) | **Mismatch** — dark ink is legible on the light dark-theme solids; literal `#fff` is not |

The design's `#fff`-on-solid is only ever exercised on primary/destructive; success/warning
are used solely as subtle badges or accent dots, so their on-solid contrast was never a
concern in the source. Awaiting your call on whether to match the design literally or keep
the contrast-driven values.
