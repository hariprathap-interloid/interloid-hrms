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

---

## State & component spec — from `States & Components.dc.html`

Source: project `8f1502f5` (the single source of truth), page `States & Components.dc.html`
(v4.16). Captured as reference only — **no components built or modified yet.**

**Important framing:** this page is organized by **view / container state**, not by control.
It specifies the data-view lifecycle (populated · loading · empty · error · no-access) and the
overlay/feedback components exhaustively, but it defines **per-element interaction states
(hover / focus / active / disabled) only incidentally** — see the "Undefined states" flags
below.

### A. Data-view lifecycle — "every table & list cycles these five"

| State         | Container                                                          | Icon tile (52px, r-15)                      | Copy                                                                                     | Action                                              |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Populated** | bordered r-12 list; rows = avatar + name + mono code + status pill | —                                           | per-row; status pill `bg-success-subtle` / `text-success-subtle-fg` + dot                | none (rows are **not** hover-interactive)           |
| **Loading**   | same list frame, shimmer skeleton rows                             | —                                           | —                                                                                        | —                                                   |
| **Empty**     | centered, 44px pad                                                 | `muted` bg / `muted-fg` icon                | title 15/600 "No employees yet" + muted desc (≤280px)                                    | **primary** CTA "Add employee" (+ icon)             |
| **Error**     | centered, 44px pad                                                 | `destructive-subtle` / `destructive`        | title "Couldn't load employees" + muted desc + **mono code** `503 · service_unavailable` | **outline** "Retry" (card bg, border, refresh icon) |
| **No access** | centered, 44px pad                                                 | `warning-subtle` / `warning-subtle-fg` lock | title "You don't have access" + muted desc (≤300px)                                      | **none** — actions are hidden, not disabled         |

Notes: `perm`/no-access deliberately shows **no button** (permission failures hide actions
rather than disabling them). Error state always surfaces a **mono status code**; empty never
does. A forbidden URL resolves to the **404** full-page fallback, not 403 (403 chip only
appears in the inline no-permission panel).

### B. Skeleton / loading treatment

- **Shimmer:** `linear-gradient(90deg, var(--muted) 25%, var(--border) 37%, var(--muted) 63%)`,
  `background-size:640px 100%`, `animation: iws-shimmer 1.3s infinite linear`.
- Variants shown: **table rows** (avatar + 2 bars 42%/24%), **KPI cards** (label 56% / value
  44% / sub 70%), **form** (label bar + 38px field, ×3, + 40×130 submit placeholder).
- ⚠ This gradient (stops 25/37/63, 640px) differs from the `--skeleton` token in `index.css`
  (stops 25/50/75) and from that token's `iws-shimmer` keyframe (200%/-200% vs 320px offsets).
  Reconcile when building the Skeleton component — pick one.

### C. Overlay & feedback components

| Component               | Trigger / behavior                                               | Scrim                             | Panel                                                             | Motion                                     |
| ----------------------- | ---------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| **Confirm AlertDialog** | opens per action; **Esc closes**                                 | `rgba(2,6,23,.5)` + blur 3, z-80  | 430px, card, r-15, shadow-lg; icon tile tinted per action         | `iws-dialog .2s cubic-bezier(.22,1,.36,1)` |
| **Toaster (Sonner)**    | bottom-right, stacked, **auto-dismiss 4200ms**, click-to-dismiss | — (glass toasts)                  | 340px, glass + blur 14, **border-left 3px accent**, shadow-md     | `iws-in .25s ease`                         |
| **Command palette**     | **⌘K / Ctrl+K** toggles, Esc closes, input autofocus             | `rgba(2,6,23,.45)` + blur 3, z-85 | 520px, glass + blur 16, r-14, shadow-lg; groups Screens/Employees | `iws-dialog .18s ease`                     |
| **Session timeout**     | 120s countdown warning; progress bar                             | `rgba(2,6,23,.55)` + blur 3, z-88 | 410px, card, r-15, shadow-lg; mono clock                          | `iws-dialog .2s cubic-bezier(.22,1,.36,1)` |

- **Confirm button tone** = `destructive` for cancel/delete, `warning-fg` for lock (matches
  the trigger's severity).
- **Toast kinds:** success `✓`/success · error `✕`/destructive · info `↗`/info · warning
  `!`/warning — accent drives both the left border and the icon-circle tint.
- **Session color switch:** clock/bar go `destructive` at **≤30s left**, else `warning-fg`.

### D. Interaction states actually defined (sparse)

| Element                                  | Hover                           | Focus | Active | Disabled / busy                                                                                     |
| ---------------------------------------- | ------------------------------- | ----- | ------ | --------------------------------------------------------------------------------------------------- |
| Confirm primary button                   | —                               | —     | —      | **busy:** `disabled`, `cursor:wait`, spinner + "Working…" (850ms); **dismissal blocked while busy** |
| Dialog **Cancel** / session **Sign out** | `background: var(--muted)`      | —     | —      | —                                                                                                   |
| Command-palette **list item**            | `background: var(--primary-bg)` | —     | —      | —                                                                                                   |
| Top-bar search button (hidden variant)   | `border-color: var(--ring)`     | —     | —      | —                                                                                                   |
| Segmented **state tabs**                 | — (only active vs inactive)     | —     | —      | active = `card` bg + `primary` text; inactive = transparent + `muted-fg`                            |

### E. Undefined states — FLAGS (page does not specify; decide at build time)

1. **Focus / focus-visible — undefined everywhere.** No element shows a keyboard-focus ring.
   `--ring` exists and is used as a _hover_ border on one button, but there is **no focus
   treatment** on any button, input, row, or tab. (The repo's stock shadcn primitives supply
   `focus-visible:ring-*` — the design page itself is silent, so shadcn's defaults are unverified
   against design intent.)
2. **Active / pressed — undefined** for every element (no press-down, no `translate-y`).
3. **Generic disabled — undefined.** Only the confirm button's _busy_ state exists. No standard
   disabled visual (opacity, `not-allowed` cursor) for ordinary buttons, inputs, checkboxes.
4. **Hover — only 4 elements specified** (table D). Primary buttons, Retry, theme toggle,
   toasts, status pills, and data rows have **no hover** defined.
5. **Form-field states — undefined.** The only real text input (command-palette search) is
   borderless with no focus/hover/error/disabled style. **No input validation / error state,
   no field focus ring** appears anywhere on this page. (The form "skeleton" is placeholders
   only.)
6. **Checkbox / Switch / Select / Radio interaction states — not on this page** (they live in
   `components/*` and other pages; extract separately before building those).
7. **Button loading — only exercised inside the confirm dialog.** No general "button spinner"
   pattern is shown for non-dialog primary/outline buttons.
8. **Toast hover-to-pause / manual close button — undefined** (only whole-toast click-dismiss
   - 4.2s auto-dismiss).

Next: reconcile items 1–5 against the stock shadcn primitives (which already ship focus/active/
disabled) before we touch the component layer — flagged, not yet actioned.

---

## Accessibility completions

Behaviours the design source (`8f1502f5`) leaves **undefined** that we complete to meet WCAG.
These are **not design deviations** — the design is silent, and we fill the gap to a standard.
Recorded so a future reader doesn't mistake them for drift from the source.

### AC-1 · Focus-visible ring (keyboard focus indicator)

- **Design status:** undefined everywhere (see State spec §E.1). shadcn ships a ring reading
  `--ring`; we adopt and complete it.
- **Target:** WCAG 2.2 SC 1.4.11 (non-text contrast) — focus indicator ≥ **3:1** vs every
  adjacent surface, in both themes.

**Contrast measured (relative luminance, ring composited over surface):**

| Stage                                                             | Light vs `--background` | Light vs `--card` | Dark vs `--background` | Dark vs `--card` |
| ----------------------------------------------------------------- | ----------------------- | ----------------- | ---------------------- | ---------------- |
| **Before** — translucent `--ring` × `ring-ring/50` (eff. .20/.25) | 1.35 ✗                  | 1.36 ✗            | 1.32 ✗                 | 1.33 ✗           |
| Intermediate — opaque `--ring` but still `/50`                    | ~2.30 ✗                 | ~2.15 ✗           | ~1.93 ✗                | ~1.90 ✗          |
| **After** — opaque `--ring` + full `ring-ring` + `ring-offset-2`  | **5.87 ✓**              | **6.29 ✓**        | **4.22 ✓**             | **3.97 ✓**       |

The intermediate row is the proof that a **token-only fix is insufficient**: `ring-ring/50`
halves whatever the token is, so even an opaque brand ring lands ~1.9–2.3:1. Both dilutions had
to go.

**The fix (three coordinated parts — none alone suffices):**

1. **Token** (`src/styles/index.css`): `--ring` → dedicated **opaque, theme-forked** primary
   — `#4f46e5` (light) / `#6366f1` (dark). The prior translucent rgba moved to **`--ring-subtle`**
   (+ `--color-ring-subtle` in `@theme inline`) for future hover-border use, so nothing overloads
   the focus token. See [[design-source-of-truth]] — values still trace to `8f1502f5`; only the
   opacity/role is our completion.
2. **Components** (8 files in `src/components/ui/`): focus ring goes to full opacity + offset —
   `focus-visible:ring-ring/50` → `focus-visible:ring-ring focus-visible:ring-offset-2
focus-visible:ring-offset-background`. Files: `button`, `badge`, `checkbox`, `input`, `select`,
   `switch`, `textarea`, `tabs`. (This is a base-class edit, outside CLAUDE.md's "add a cva
   variant" carve-out — approved explicitly as an a11y completion, not a design change.)
3. **Global fallback** (`index.css` `@layer base`): `* { outline-ring/50 }` → `outline-ring`, so
   non-shadcn focusable elements (plain `<a>`, custom `tabIndex` divs) inherit a compliant native
   focus outline at the same opaque colour.

**Why there is no single-source fix:** the operative indicator is inlined per-component (8×
`ring-ring/50`) — there is **no shared focus class** to change once. `--ring` is the single source
for the ring's **colour only**; the `/50` **opacity** is duplicated per component and is the
dominant cause of the failure. A colour-token-only fix would require pushing `--ring` to extremes
that only _barely_ clear 3:1 while abandoning the brand — `#1E1B4B` (near-black) light,
`#A5B4FC` (pale) dark — so the per-component edit is necessary, not cosmetic.

**Still open — `sidebar.tsx`:** its 5 focus rings read a **separate** token (`--sidebar-ring`,
still `rgba(…,.4/.5)`) via `focus-visible:ring-2`, so they retain the same ~1.9:1 weakness. Out of
scope for this pass (not approved); fold in by giving `--sidebar-ring` the same opaque treatment
when the sidebar is built.

**Verified (2026-07-22, browser tab-through of `/dev/components`, both themes):** all 9 shadcn
controls (5 buttons, card action, input, checkbox, select) show a visible indigo ring + offset
gap; both non-shadcn focusables (plain `<a>`, custom `tabIndex` div) show the global-fallback
outline. Nothing weak in either theme. Note: reading the ring via `getComputedStyle` on a
CDP/automation-driven focus is unreliable (`:focus-visible` drops during eval, reporting a zero
box-shadow) — the rendered pixels are the source of truth, not the computed style.
