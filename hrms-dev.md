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
- ✅ **Reconciled (2026-07-24).** The `--skeleton` token was stops 25/50/75 and its `iws-shimmer`
  keyframe was 200%/-200%; both were changed to the **design's** values (stops 25/37/63, keyframe
  `-320px → 320px` to match `background-size:640px`). Design is source of truth. The token now reads
  `var(--muted)/var(--border)` (one definition, adapts to dark). See "Data-view lifecycle" below.

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

---

## App Sidebar — composed against `components/Sidebar` (project `8f1502f5`)

The design source is a folder, not a single `.dc.html`: `Sidebar.jsx` (reference impl),
`Sidebar.d.ts` (props contract), `Sidebar.card.html` (visual card), `Sidebar.prompt.md` (usage).
Built on **shadcn's `sidebar` primitive** — collapse, mobile Sheet, and keyboard nav are the
primitive's job, not hand-rolled (per the task).

### Files (all new; nothing in `src/components/ui/` touched)

- `src/components/layout/app-sidebar.tsx` — `AppSidebar`, props mirror the design contract
  (`groups` / `activeKey` / `onNavigate` / `brand` / `footer`; role-filtering is the caller's job).
  Presentational only — feeds the primitive the design's structure and paints the treatment on top.
- `src/components/layout/app-shell.tsx` — `AppShell`: `SidebarProvider` (sets the design widths) +
  `AppSidebar` (with the app's real nav registry) + `SidebarInset` (a slim top header holding the
  `SidebarTrigger`, app name, and theme toggle). Active key derived from the route (longest-prefix).
- `src/app/layouts/main-layout.tsx` — rewired: the old bare header is replaced by `<AppShell>`
  wrapping the `Suspense`/`Outlet`. The sidebar is now the app shell for every route.

### Design treatment reproduced via composition (className only)

Brand: 60px bar, 30px gradient mark (`bg-linear-to-br from-primary to-accent`, white "I"), title
14/600 + muted 11px subtitle (subtitle + title drop in rail). Grouped nav with 10.5px uppercase
labels (auto-hidden in rail by the primitive). Items: 18px icons @ stroke 1.8, 13.5px/500 label,
r-9. **Active** = `sidebar-accent` tint + **primary** label + a 3px primary left rail bar. Count
**badge** = filled indigo pill (`bg-primary` / `primary-foreground`). Footer slot renders a
"Phase 1a · Live" status chip. Widths **248 / 68** via `--sidebar-width` / `--sidebar-width-icon`.

### What the design specifies that the primitive can't express as-is

Everything below was still achievable by composition, but the primitive's defaults actively
disagree — recorded so a later reader knows these are deliberate overrides, not drift.

1. **Active left rail bar** — the primitive's active state is only a bg tint + `sidebar-accent-fg`
   text; there is **no left indicator**. Added as a sibling `<span>` inside the menu item, _not_ a
   `::before` on the button: `SidebarMenuButton` carries `overflow-hidden`, which would clip the
   design's `left:-12px` bar. Consequence: the bar sits at the item's left edge (`left-0`), not the
   design's −12px gutter. Visually equivalent; exact offset differs by design.
2. **Active label colour** — primitive paints active text `sidebar-accent-foreground`; design wants
   `--primary`. Overridden with `data-active:text-primary`.
3. **Count badge** — the biggest disagreement. `SidebarMenuBadge` is a plain `sidebar-foreground`
   text label **and is hidden in icon/rail mode** (`group-data-[collapsible=icon]:hidden`). Design
   wants a filled indigo pill that **floats into the rail corner** when collapsed. Had to restyle it
   _and_ un-hide + reposition it for rail (`group-data-[collapsible=icon]:flex … top-1 right-2`).
4. **Rail centering** — the primitive's collapsed menu button is a fixed 32px (`size-8!`), content
   left-aligned, and relies on `overflow-hidden` to clip the label off the right edge. Design centers
   a full-width item. Forcing `w-full!`/`justify-center` re-revealed the truncated label ("D", "T."),
   so the label span also needs an explicit `group-data-[collapsible=icon]:hidden`. The primitive's
   collapsed sizing is `!important`, so the overrides must be `!important` too.
5. **Exact pixel metrics** — design is pixel-precise (13.5px text, 9px radius, 18px icon, 60px brand,
   30px mark, 19px badge); the primitive's defaults are token-rounded (14px, rounded-md, 16px, h-8).
   Matched the salient ones via arbitrary values. Item height lands at 36px (`h-9`) vs the design's
   ~38px — within a couple px, left as-is.
6. **Mobile transform — genuine gap.** The design says the mobile bottom-tab-bar is "owned by the
   app shell, not this component," and Sidebar renders tablet-up. The shadcn primitive instead
   auto-swaps to a **hamburger + slide-in Sheet** below `md`. So mobile currently gets the primitive's
   Sheet, **not** the design's bottom tab bar — that bar is unbuilt and needs a separate app-shell
   responsive branch. Flagged, out of scope for this pass.
7. **Nav semantics** — the design reference models items as `<button onClick>` + `onNavigate`. This
   build **upgrades to real anchors**: `SidebarMenuButton asChild` wrapping a react-router `<Link
to={href}>`, so items render as `<a href>` with middle-click / open-in-new-tab / right-click and
   proper a11y. `onNavigate` was dropped from `AppSidebar`'s props — hrefs on the items carry the
   destinations, and the `<Link>` navigates declaratively (no imperative `useNavigate` in the shell).

### `--sidebar-ring` — closed (AC-1 completion, 2026-07-24)

The primitive's sidebar controls use `focus-visible:ring-2 ring-sidebar-ring` — full token opacity,
**no `/50` dilution** (unlike the 8 core controls AC-1 fixed). So the entire weakness was the _token_:
`--sidebar-ring` was translucent (`rgba(79,70,229,.4)` light / `rgba(99,102,241,.5)` dark), landing
~1.9:1. Fix is **token-only** — no `ui/sidebar.tsx` edit, no offset needed: `--sidebar-ring` is now
opaque and theme-forked, matching `--ring` (`#4f46e5` light / `#6366f1` dark). Opaque indigo on the
sidebar surface clears WCAG 2.2 SC 1.4.11 (3:1) in both themes. Contrast checks: `#4f46e5` vs white
sidebar ≈ 7:1; `#6366f1` vs `#0e1626` dark sidebar ≈ 3.6:1, vs `#1b2536` sidebar-accent ≈ 3.1:1.

**Verified (2026-07-24, browser `/dev/components` + `/dev/tokens`):** labeled (248px) and icon rail
(68px), both light and dark. Brand mark, grouped labels, active tint + primary label + left rail bar,
indigo badge pill (floats to the corner in rail), and footer chip all render per the design card.
Collapse toggles via the header trigger; rail labels become hover tooltips; nav updates the active
item from the route. Not exercised: the `<md>` mobile Sheet (primitive default) and Cmd/Ctrl-B toggle.

---

## Data-view lifecycle + Skeletons — from `States & Components` (v4.16)

Built the five-state lifecycle ("every table & list cycles these") and the shimmer skeleton family
as reusable components in **`src/components/data-view/`** (barrel `index.ts`):

- **`state-message.tsx`** — `StateMessage` shell (52px tinted icon tile · copy slot = title +
  description + optional mono `code` · action slot) and three presets:
  - `EmptyState` — `muted` tile, primary CTA in the action slot, description capped 280px.
  - `ErrorState` — `destructive-subtle` tile + solid `destructive` glyph, always a mono `code`
    line, outline retry in the action slot.
  - `NoAccessState` — `warning-subtle` tile. **Has no `action` prop at all** — per the spec,
    permission failures _hide_ actions rather than disabling them, so the component structurally
    can't render one.
- **`skeleton.tsx`** — `Shimmer` base (uses the reconciled `--skeleton` gradient +
  `background-size:640px` + `iws-shimmer`) and the three design variants: `SkeletonRows`
  (avatar + 2 bars, optional trailing status pill), `SkeletonKpis` (label/value/sub in a tile),
  `SkeletonForm` (label + 38px field ×n + submit block). Placeholder lists key off a fixed
  `PLACEHOLDER_KEYS` array, not the map index (satisfies `react-x/no-array-index-key`).
- **`data-view.tsx`** — `DataView` (switches caller-provided `loading`/`empty`/`error`/`noAccess`
  slots vs. populated `children` off a `status` prop), `DataViewList` (the bordered r-12 frame
  shared by populated + loading), `DataViewRow` (avatar + name + mono code + trailing status;
  **not hover-interactive**, per spec), and `StatusPill` (subtle-tinted chip + solid dot).

All tints use the semantic `-subtle` / `-subtle-foreground` tokens (no raw colors). The stock
`ui/skeleton` (animate-pulse) was left untouched — the shimmer family is separate.

**Skeleton reconciliation (token, not just component):** the design's shimmer (stops **25/37/63**,
`background-size:640px`) disagreed with the `--skeleton` token (25/50/75) and its `iws-shimmer`
keyframe (`200%/-200%`). Per "page is source of truth," **the token was changed to match the page**:
`--skeleton` → `linear-gradient(90deg, var(--muted) 25%, var(--border) 37%, var(--muted) 63%)`
(one var-based definition, so the dark override was deleted — it adapts on its own), and the
keyframe → `-320px → 320px` (a 640px sweep). Nothing else consumed the old keyframe.

**Demo/verify:** wired `/dev/states` (route + `paths.devStates` + thin page +
`features/dev-components/components/data-view-gallery.tsx`) and added a **States** item to the
sidebar's Design System group. **Verified (2026-07-24, browser, both themes):** all five states via
the segmented switcher — populated rows (avatars, mono codes, success pills), framed loading shimmer
(rows + pill placeholder), empty (muted tile + primary CTA), error (destructive tile + `503 ·
service_unavailable` + outline retry), no-access (warning tile, **no button**) — plus the three
standalone skeletons, shimmer animating in light and dark.

---

## DataTable — the workforce data grid (design `components/DataTable`)

**New dependency:** `@tanstack/react-table` (^8.21.3) — explicitly authorized for this build.

**Screen split (confirmed from the design, so the two never overlap):**

- **DataTable** — the grid for **every screen that lists records**: Employees, Attendance, Leave &
  Permissions, Unified Approvals (+ the Data Table showcase). The prompt is explicit: _"One API
  covers all of them; do not fork a bespoke table per screen."_ Owns headers, sorting, pagination,
  (selection/bulk + row actions in the full design), and the responsive transform.
- **DataViewList / DataViewRow** (built earlier) — the lightweight avatar+name+code+status list for
  **compact embedded contexts** (dashboard "recent" widgets, in-card mini-lists, side panels). No
  header, no pagination, not a grid.

Both share the **DataView lifecycle** — so DataTable **renders its non-populated states through
those components rather than reimplementing them** (the design's own `DataTable.jsx` has a bespoke
`StatePanel`/`SkelRow`; we deliberately do not copy that).

**Files — `src/components/data-table/`:**

- **`data-table.tsx`** — `DataTable<TData>`: shadcn `Table` markup + TanStack (`getSortedRowModel`
  - `getPaginationRowModel`). Header cells are sortable buttons (chevron via `getIsSorted`); rows
    honor a `density` (compact/default/spacious → 42/54/64px); the card is `rounded-lg` (=14px token)
  - `shadow-sm`. Column layout hints (`align`/`width`/`minWidth`/class overrides) ride on TanStack's
    `ColumnMeta` via module augmentation. When `status !== "populated"` it renders `<DataView>` with
    `SkeletonRows` (loading) / `EmptyState` / `ErrorState` / `NoAccessState` (sensible defaults,
    overridable per-instance). `no-access` is the design's "forbidden" guard.
- **`cells.tsx`** — `PersonCell` (avatar + name + sub), `MonoText`, `TableBadge` (the table's
  rounded-rect **r7 chip**, 6 tones on `-subtle` tokens — distinct from data-view's full-pill
  `StatusPill`; the design uses different badge shapes per context).
- **`utils.ts`** — `avatarColor` / `initialsOf` (split out of `cells.tsx` so that file only exports
  components, satisfying `react-refresh/only-export-components`).

**Interactive rows — opt-in, non-interactive default (per spec):** rows are static by default
(overriding shadcn `TableRow`'s baked-in `hover:bg-muted/50` with `hover:bg-transparent`, honoring
"rows are not hover-interactive"). Passing **`onRowClick`** opts into the interactive variant:
`cursor-pointer` + hover tint + `role="button"` + `tabIndex=0` + Enter/Space → navigate. (A whole-row
`<a>` is invalid HTML, so navigation is JS-driven, not an anchor — cells can render `<Link>` if real
anchor semantics are needed on a column.)

**Not built this pass (design has them; deferred, flagged):** row **selection + bulk-action bar**,
per-row **⋯ actions**, **server-side/controlled pagination** (`total`/`page`/`onPageChange` — current
build is client-side via TanStack), and the **mobile table→stacked-card** transform (below 640px the
table currently just scrolls horizontally). The lint shows one tolerated warning — TanStack's
`useReactTable` trips `react-hooks/incompatible-library` (React Compiler skips memoizing it; TanStack
manages its own) — suppressed with an explained inline disable.

**Demo/verify:** wired `/dev/table` (route + `paths.devTable` + thin page +
`features/dev-components/components/data-table-gallery.tsx`) and added a **Data table** sidebar item.
**Verified (2026-07-24, browser, dark):** populated grid (sortable headers, PersonCell avatars, mono
IDs, tone-correct status chips, right-aligned dates, `14 rows` / `Page 1 of 3` pagination); header-
click re-sort (Department asc); interactive opt-in (toggle → row click fires navigation + hover);
and loading (`SkeletonRows`) / empty (custom `EmptyState` + Clear-filters) / no-access
(`NoAccessState`, no button) all routing through DataView. Error uses the identical DataView path.
