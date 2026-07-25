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

## shadcn semantic collisions

A few token **names** carry a different meaning in shadcn's primitives than in the design
source. Where both meanings are the same concept, one name is fine. Where they are **two
different concepts that happen to share a name**, keeping them on one variable makes shadcn's
components paint with the design's colour (or vice-versa). These entries disambiguate such a
name into two — this is **not** a break from the 1:1 token mapping; it is recognising that the
name mapped two unrelated roles at once.

### `accent` — resolved (2026-07-25)

Two unrelated concepts shared the `--accent` name:

- **shadcn's `--accent`** = the **hover / active tint for menu surfaces**. `DropdownMenuItem`,
  `SelectItem`, `CommandItem`, and sub-triggers all paint `focus:bg-accent
focus:text-accent-foreground` (+ `data-open:bg-accent`). shadcn intends a **neutral tint**
  (≈ `--muted`).
- **the design's `accent`** (`tokens/colors.css`) = the **secondary brand colour** (sky,
  `#0ea5e9` / `#38bdf8`) — used for brand gradients (mark tiles, 404) and the toast accent
  border/icon tint. A saturated brand hue, not a menu tint.

While both lived on `--accent`, every menu-hover row rendered a **bright sky fill with white
text** instead of a subtle neutral — visibly wrong on the theme-toggle menu, the user menu, the
row ⋯ menu, and the select dropdown, in both themes. (`command.tsx` had a local workaround —
`data-[selected=true]:bg-muted` instead of `bg-accent` — which papered over the palette only.)

**Disambiguation:**

- `--accent` / `--accent-foreground` → kept as **shadcn intends**: the neutral menu-hover tint,
  matching `--muted` (`#eef1f6` / `#0f172a` light, `#1b2536` / `#e6eaf2` dark). Lives in the
  **Surfaces & text** group now (it is a neutral UI surface, not brand).
- the design's brand colour → moved to **`--brand-accent`** / `--brand-accent-foreground` /
  `--brand-accent-bg` (values unchanged; sits in the **Brand** group). Utilities: `bg-brand-accent`,
  `text-brand-accent`, `to-brand-accent`, etc. The six brand-gradient consumers were repointed
  `to-accent` → `to-brand-accent` (`app-sidebar`, `top-bar`, `auth-shell`, `account-setup-panel`,
  `session-expired-card`, `not-found`).
- `command.tsx` reverted to stock `data-[selected=true]:bg-accent
data-[selected=true]:text-accent-foreground` — the workaround is no longer needed now that
  `--accent` is the correct neutral tint.

`--sidebar-accent` was **not** part of this — it is a separate token, already the neutral rail
tint (`#eef1f6` / `#1b2536`), and shadcn's sidebar hover reads it correctly.

### Swept for the same collision — `muted`, `secondary`, `ring` all clean (2026-07-25)

Checked whether the other names shadcn overloads carry a second, conflicting design concept.
None do — each is a **single concept** shared by both, so no split is warranted:

- **`--muted`** — shadcn uses `bg-muted` / `text-muted-foreground` for subtle neutral surfaces
  (table footer/row-hover, drawer handle, progress track, avatar, skeleton, tab-list, filter
  chips, info strips) and secondary text. The design's `--muted` is the same neutral surface
  (`#eef1f6` / `#1b2536`). Same concept — no collision.
- **`--secondary`** — consumed only by the Button `secondary` and Badge `secondary` variants:
  shadcn's low-emphasis **neutral filled** surface. The design value is that same neutral
  (`#eef1f6`, incidentally equal to `--muted`, as in shadcn stock). No design usage assigns
  `secondary` a brand meaning. No collision.
- **`--ring`** — the focus / emphasis outline colour (primary indigo). The design uses it both
  as the focus ring and as a hover-border, but those are one concept (an emphasis outline). Its
  only prior overload — the _translucent_ variant — was already forked to **`--ring-subtle`**
  during the AC-1 focus-ring work. No naming collision remains.

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

**Still deferred:** the **mobile table→stacked-card** transform (below 640px the table just scrolls
horizontally). One tolerated lint warning — TanStack's `useReactTable` trips
`react-hooks/incompatible-library` (React Compiler skips memoizing it; TanStack manages its own) —
suppressed with an explained inline disable.

**Demo/verify:** wired `/dev/table` (route + `paths.devTable` + thin page +
`features/dev-components/components/data-table-gallery.tsx`) and added a **Data table** sidebar item.
**Verified (2026-07-24, browser):** populated grid (sortable headers, PersonCell avatars, mono IDs,
tone-correct status chips, right-aligned dates, `14 rows` / `Page 1 of 3` pagination); header-click
re-sort; interactive opt-in (toggle → row click fires navigation + hover); and loading (`SkeletonRows`)
/ empty (custom `EmptyState` + Clear-filters) / no-access (`NoAccessState`, no button) all routing
through DataView. Error uses the identical DataView path.

### DataTable API completion + FilterBar + PageHeader (2026-07-24)

Rounded out the DataTable to the full design contract and built the two toolbar/title companions.

- **Controlled / server-side pagination + sorting** — passing `page` switches to manual mode:
  `manualPagination` + `manualSorting`, `pageCount` from `total`, and `page`/`onPageChange` +
  `sort`/`onSortChange` drive the footer and headers. **Client-side stays the default when `page` is
  omitted** (internal TanStack sorted + paginated row models). Both branches share one render.
- **Row selection + bulk-action bar** — `selectable` (+ `selectedKeys`/`onSelectionChange`/
  `bulkActions`), backed by TanStack `rowSelection` bridged to the design's string-key array API. A
  leading shadcn `Checkbox` column (header = select-all with indeterminate), selected rows tint
  `bg-primary-bg`, and a bar above the table: "N selected" · bulk buttons · Clear.
- **Per-row ⋯ actions** — `rowActions?: (row) => ReactNode` returns DropdownMenu items; DataTable
  renders the trailing ⋯ trigger + shadcn `DropdownMenu`. (This is the shadcn-integrated take on the
  design's `(row)=>void` "you own the surface" contract — noted as a deliberate ergonomic choice.)
- **`permitActions`** (default true) gates selection + bulk + row-actions for role-limited views —
  data stays visible, affordances the role lacks are stripped.
- **`toolbar` slot** — right-aligned in the title row; when `title` is omitted it left-aligns as a
  full strip (how FilterBar sits). Non-interactive row default is unchanged.

**FilterBar** — `src/components/data-table/filter-bar.tsx` (exported from the barrel). Faceted strip
for the toolbar slot: label + facet dropdowns (single/multi, shadcn `Popover` + option list w/ check)

- auto-derived removable chips (`--primary-bg` tint) + Clear all. Chips derive from `values` unless
  overridden. **PageHeader** — `src/components/layout/page-header.tsx`. Screen title block: optional
  breadcrumb + icon tile, title + status badges (6-tone, `-subtle` tokens) + description,
  primary/secondary actions (shadcn Button), and an in-page tab row (underline + count pills).

**Verified (2026-07-24, browser):** the `/dev/table` gallery now renders a full workforce screen —
PageHeader (title, "14 total" badge that tracks the filtered count, Export/Add actions, tabs) above a
DataTable whose toolbar is a FilterBar. Confirmed: Department facet → "Department: Design" chip →
filters to 3 rows with `total` flowing to the badge + footer; select-all → bulk bar ("3 selected" ·
Export · Clear) with rows tinted; row ⋯ → View / Edit / Delete menu; controlled pagination `Page 1 of
3`. (Note: CDP screenshots intermittently time out while a Radix Popover/DropdownMenu opens — a
capture-timing quirk, no console errors; a short wait + retry recovers.)

---

## Login screen (design: `Login.dc.html`)

Standalone auth screen — two panes: a marketing **showcase** and the **auth column** with a
three-step flow (SSO → email → 6-digit MFA → done). Composed from existing `@/components/ui`
primitives; no `ui/` file rewritten (one cva variant added, below).

**Files — `src/features/auth/components/`:**

- **`login-panel.tsx`** — the auth column + full step machine (ported from the design's DCLogic):
  Microsoft SSO (simulated 1.5s → MFA), an expandable email/password form with inline validation
  (Input + Label), the MFA step (OtpInput + verify + error/attempts + 3-strike lockout countdown +
  resend cooldown), and the success step that redirects to `paths.home`. All buttons are shadcn
  `Button`; spinners are `Loader2 + animate-spin`; the error alert reuses the `iws-shake` keyframe.
- **`otp-input.tsx`** — 6-box numeric code, composed from shadcn `Input` (auto-advance,
  backspace-to-prev, arrow nav, paste-to-fill). Error rides `aria-invalid` + a `destructive-subtle`
  tint.
- **`login-showcase.tsx`** — the fixed brand panel (hidden below `lg`): brand lockup, headline, three
  proof rows (lucide icons), and a live "trust card" (`animate-ping` dot + avatar stack).
- **Page** `src/app/pages/login.tsx` + **route** `paths.login` (`/login`), wired as a **top-level
  route OUTSIDE `MainLayout`** so the auth screen has no sidebar/top bar. Verified: `/login` shows no
  shell; the post-login redirect to `/` shows the full AppShell.

**The one `ui/` change — Button `sso` cva variant.** The Microsoft sign-in button is a **fixed white
surface with dark ink in BOTH themes** (Microsoft's sign-in-button brand spec — the colourful logo
must sit on white). No semantic token expresses a theme-invariant brand white, so per the task's
"add a cva variant and tell me why" I added `sso: 'border-border bg-white text-neutral-800 shadow-sm
hover:brightness-[0.98]'`. This is the sanctioned carve-out (add a variant, don't rewrite base
classes).

**Token added — `--login-hero`.** The showcase gradient (`linear-gradient(150deg,#312E81,#4338CA,
#0EA5E9)`) is a fixed brand-illustration surface (same both themes). Rather than hardcode raw hex in
markup (CLAUDE.md forbids), the gradient lives in the token layer (`index.css`), and the panel's
on-surface content uses `white`/`white-opacity` utilities. Minor deviation: the trust-card avatars
use `chart-1/2/3` tokens instead of the design's indigo/sky/violet hexes (violet has no token).

**Assets needed: none.** The design uses no photography, illustration, or logo files — it's pure CSS
gradient + inline SVG. The Microsoft mark is inlined as SVG (standard 4-square brand glyph); the
Interloid brand is a gradient tile with the "I" glyph (no logo file). Nothing to provide.

**⚠ UI-only — not real auth.** Every step is a client-side stub with simulated timers (SSO, email
submit, and MFA all advance on `setTimeout`; the demo MFA code is `123456` with a 3-strike lockout).
**No credentials are sent anywhere.** Wiring to real Microsoft Entra ID / a backend (and gating the
app routes behind auth) is the obvious next step. The marketing stats (231/248, 93.1%, avatars) are
demo content from the design.

**Verified (2026-07-24, browser, dark):** showcase (brand, headline, 3 proofs, ping trust card) +
auth column (white MS button with logo, email expand w/ disabled-until-valid submit, footer);
SSO → MFA (masked email, OTP boxes, resend countdown, mono demo hint); typed `123456` → verify →
redirect to `/` landing on the dashboard **with** the app shell (login correctly rendered without it).

---

## Auth boundary + remaining auth screens (2026-07-24)

Added a **stubbed client-side auth boundary** and the five remaining auth/error screens. No backend —
sessions are simulated and persisted to `sessionStorage`.

**Boundary:**

- `src/features/auth/use-auth.ts` — `AuthContext` + `useAuth` (hook only, no component, mirrors the
  repo's `use-theme.ts`/`theme-provider.tsx` split so fast-refresh stays happy).
- `src/features/auth/auth-provider.tsx` — `AuthProvider`: `status` (`authenticated` |
  `unauthenticated` | `expired`) + `user`, with `signIn` / `signOut` / `expire`. Backed by
  `sessionStorage` (survives refresh). Wired into `AppProviders`.
- `src/app/layouts/protected-layout.tsx` — the route guard: `expired` → `<Navigate>` to
  `/session-expired`, anything non-authenticated → `/login`, else renders `<MainLayout>`.
- **Router restructured**: public auth routes (login / account-setup / forgot-password /
  reset-password / session-expired) sit **outside** the guard; the app routes nest under
  `ProtectedLayout` with `ServerErrorPage` as `errorElement`; a full-page 404 catch-all.
- **Login** now calls `signIn()` on MFA success; the **AppShell** gained an account menu
  (avatar → "Simulate session expiry" / "Sign out") so the guard's `expired`/`unauthenticated`
  redirects are reachable in-app — **Session Expired is reached via the guard, not just by URL.**

**Screens** (all reuse shared chrome in `features/auth/components/auth-shell.tsx` —
`AuthTwoPane` / `AuthCentered` / `AuthShowcase` / `ShowcaseTrust` / `AuthBrandMark`; Login refactored
onto them):

- **Forgot Password** (`/forgot-password`) — two-pane; email → "check your inbox" with resend timer.
- **Reset Password** (`/reset-password`) — two-pane; strength meter + 4-rule checklist + confirm +
  show/hide eye → done; `?expired=1` shows the expired-link variant. Password helpers live in
  `password-utils.ts` (+ `password-fields.tsx` components), shared with Account Setup.
- **Account Setup** (`/account-setup`) — centered glass card; invited-user chip + create/confirm +
  terms → activated.
- **Session Expired** (`/session-expired`) — centered glass card; re-auth with the persisted user
  (`expired` variant, the guard target) → `signIn` → back to the app; `?variant=locked` shows the
  lockout countdown.
- **Not Found** (`*`) — full-page, no shell; gradient 404 + the actual bad path + back/dashboard.
- **Server Error** (route `errorElement`) — full-page; retry demo (1st fails, 2nd recovers) + Ref +
  copy.

**Reused primitives only** — Input / Button / Label / Checkbox / DropdownMenu / ThemeToggle. No new
`ui/` change beyond the `sso` Button variant added for Login (Microsoft brand white). Password fields
use `h-11 border-[1.5px]` + `aria-invalid:bg-destructive-subtle` (composition; Input already ships the
`aria-invalid` border/ring). One shared token added earlier (`--login-hero`) covers the showcase.

**⚠ Still UI-only — no real auth.** Every step is simulated (`setTimeout`); the MFA demo code is
`123456`, Session-Expired/Account-Setup accept any password ≥ the rule threshold, and no credentials
leave the browser. The guard reads only the stubbed `sessionStorage` session. Invite details
(Diya Sharma / ITL-0187) and the reset account email are hardcoded demo data — a real flow reads them
from the invite/reset token.

**Verified (2026-07-24, browser, dark):** `/` (unauthenticated) → redirect to `/login`; SSO → MFA
`123456` → dashboard; account menu → **Simulate session expiry → `/session-expired`** (guard) with the
persisted user; re-auth → back to `/`; Forgot / Reset / Account-Setup render; a bad URL → the full-page
404 (no shell) showing the path. Server Error is wired as the `errorElement` (not live-triggered).

---

## TopBar + Command palette + error-page trigger (2026-07-24)

**New dependency:** `cmdk` (^1.1.1) — for shadcn's `command` primitive (explicitly requested).

- **`src/components/ui/command.tsx`** — the shadcn command primitive (new `ui/` file, not a variant
  edit; authorized). One adaptation: selected/hover uses `bg-muted`, because this repo's `--accent`
  is the sky brand color, not shadcn's default subtle accent.
- **`src/components/layout/top-bar.tsx`** — `TopBar` (design `components/TopBar`): glass chrome,
  sidebar toggle + page title/crumb, a ⌘K search box (icon button < md), notifications bell with a
  count, and the user button. The **ad-hoc AccountMenu was folded into the user dropdown**
  (Simulate session expiry / Sign out). Theme toggle kept in the bar (the design omits it, but the
  app needs it somewhere — flagged).
- **`src/components/layout/command-palette.tsx`** — the ⌘K quick switcher via shadcn `CommandDialog`,
  fed Screens (nav) + Employees; selection navigates. (shadcn's dialog portals to `document.body`
  rather than the app-shell frame the design mentions — a benign difference.)
- **`app-shell.tsx`** — placeholder header replaced by `<TopBar>`; title/crumb derived from the active
  nav item; a global ⌘K/Ctrl-K listener toggles the palette; `<CommandPalette>` mounted.
- **`/dev/throw`** (`pages/dev-throw.tsx`, protected route) throws on render so the protected group's
  `errorElement` (`ServerErrorPage`) can be **verified live**.
- **`flow.md`** (repo root) — documents the (stubbed) authentication flow end to end, with a mermaid
  state diagram.

**Verified (2026-07-24, browser):** TopBar renders (title "Data table / Design System", ⌘K box, bell
badge 3, "Priya Nair / HR Manager"); ⌘K opens the palette → typing "token" filters → Enter navigates
to `/dev/tokens` and the title updates; `/dev/throw` → the live full-page ServerErrorPage.

---

## Home + Company Dashboard + routing restructure (2026-07-25)

Built the two dashboard-family screens from `8f1502f5`, grounded in the design's own `CLAUDE.md`
file manifest (which classifies every `.dc.html`). The manifest was decisive: `Home.dc.html` is a
**public marketing landing at `/`** (outside the shell), and `Company Dashboard.dc.html` is the
**authenticated landing at `/dashboard`, roles: ALL** — the post-login screen every role sees.
`HR Command Center` (`/command-center`, HR+Admin only) is separate ops, **not** the default landing.

### Routing restructure — design-faithful split

Our app previously guarded `/` as the landing. Now:

- **`/` → public marketing Home** (moved outside `ProtectedLayout`, like Login). An authenticated
  visitor is bounced to `/dashboard` from inside `pages/home.tsx` (`useAuth` → `<Navigate>`).
- **`/dashboard` → Company Dashboard** (guarded; the post-login target). Added `paths.dashboard`.
- **`paths.home` consumers repointed** (grep-driven inventory, shown before rewiring): 6 → `/dashboard`
  (`app-shell` nav, `command-palette`, `login-panel` post-login, `session-expired-card` re-auth,
  `not-found` + `server-error` "Back to dashboard"). **`error-state.tsx` is auth-conditional** — the
  top-level error escape (used by `error-fallback` + route `error.tsx`, both inside `AuthProvider`)
  reads `useAuth`: authenticated → `/dashboard` ("Back to dashboard"), otherwise → `/` ("Go back home")
  for the pre-auth case. So an authed user hitting an error returns to their app, not the splash.

### Shared chart layer — `src/components/charts/` (new dep: `recharts` ^3.8, via `npx shadcn add chart`)

Charts recur across the design (Company Dashboard, HR Command Center, Attendance — Team Overview has
none), so these are a **shared pattern**, not dashboard-local. `shadcn add chart` added `ui/chart.tsx`
(new primitive, not an edit — authorized). Four wrappers, all bound to the app's `--chart-1..5` scale:

- `AreaTrend` — Recharts `AreaChart` + gradient fill. Uses a **numeric data-relative Y domain**
  (`[min-pad, max+pad]`) so small trends (e.g. headcount 1180→1248) read as a curve, not a flat line
  pinned to 0. (Recharts v3's function-form `domain` renders empty — use numeric.)
- `CategoryBarChart` — `BarChart` with per-bar `<Cell fill>` so the design's highlight bars survive
  (Design=amber `--chart-4`, Sales=rose `--chart-5` against indigo `--chart-1`).
- `DonutChart` — `PieChart` ring + centred `<Label>` total + swatch legend.
- `Sparkline` — deliberately **inline SVG, not Recharts** (a dashboard renders 6+; one polyline each
  is far cheaper than mounting a chart per KPI). Matches the design's `viewBox 0 0 100 30`.

**Token note:** the `.dc.html` prototypes coloured charts from screen-local hexes (`--green #12A150`,
`--amber #E08600`); the design **system** readme says charts use `--chart-1..5`, and our repo defines
them — so the wrappers bind to the token scale (indigo/sky/green/amber/rose). chart-1/2/5 are exact
matches; green/amber differ by a few % (screen-local vs token). Both themes fork automatically.

### Company Dashboard — `src/features/dashboard/` (HR/Admin branch complete; role seam in place)

Role-aware by design. `useDashboardRole()` (currently defaults to `'hr'` — subscribes to `useAuth`,
map `user.role` when the session carries one) → `getDashboardData(role)`: **HR/Admin fully populated;
Employee/Lead return `null`** → screen shows a "coming soon" note. Real branching structure, one branch
complete — Employee/Lead are a **data fill-in from the design's isEmp/isLead branches, not a refactor**.

- `data.ts` — role-keyed content (hero, 6 KPIs, area/bar/donut, approvals, activity).
- `components/kpi-card.tsx` — metric tile: icon + label, value, trailing `Sparkline`, semantic delta
  chip + sub. `<button>` when `onClick` given, else static.
- `components/ai-insight-card.tsx` — the "AI insight" banner + recommendation chips.
- `dashboard-screen.tsx` — composition: `PageHeader` (greeting + date + status badges) · AI insight ·
  KPI row (`SkeletonKpis` loading) · `AreaTrend`+`CategoryBarChart` / `DonutChart` · **Pending
  approvals** via `DataViewList` (approve/reject; `SkeletonRows` loading, `EmptyState` empty) · **Recent
  activity** via `DataViewList`. A simulated 600ms fetch exercises the skeletons on mount.
- **Dropped the design's embedded People `DataTable`** (per instruction: "not DataTable" — that grid
  lives on Employees/`/dev/table`). Heatmap (HR Command Center) deferred — Recharts has no first-class
  heatmap; it'll be a CSS grid later.
- `SkeletonKpis` gained an optional `className` (non-breaking; default 2-col) so the loading grid
  matches the populated 6-up layout.

### Marketing Home — `src/features/marketing/marketing-home.tsx`

Faithful to `Home.dc.html`: own glass chrome (not AppShell) — brand nav + `ThemeToggle`, `--mesh` hero
with a `from-primary to-brand-accent` gradient headline, an approvals-queue glimpse card, 4 module
cards, 4 role rows, footer. Public route; links into `/login`. Uses `bg-glass`/`border-glass-border`
and the brand-accent gradient (post-collision token). **Assets needed: none** — inline Lucide SVG,
gradient brand tile, `--mesh` token; `recharts` is the only new dep (authorized).

**Verified (2026-07-25, browser, light + dark):** `/` unauthenticated → marketing landing (no shell,
mesh + gradient headline, glimpse card, modules); `/dashboard` unauthenticated → guard redirects to
`/login`; seeded session → `/dashboard` renders the full HR dashboard (PageHeader + badges, AI insight,
6 KPIs with sparklines, rising headcount area trend, dept bar chart with amber/rose highlights, 87.8%
attendance donut + legend, pending-approvals list with approve/reject, recent-activity grid; sidebar
"Dashboard" active); authenticated `/` → redirects to `/dashboard`. Both themes clean; `tsc -b` +
`eslint` pass.

---

## HR Command Center + role seam promotion (2026-07-25)

Built `HR Command Center.dc.html` → `/command-center` — org-wide ops for **HR/Admin only**. Reuses the
shared `components/charts` layer; the heatmap is the one deliberately-non-Recharts chart.

### Role seam — promoted to shared, route-gated

- **`src/features/auth/use-role.ts`** — `AppRole` (`employee|lead|hr|admin`) + `useRole()` (subscribes to
  auth; defaults to `hr` until the session carries a role) + `hasRole()`. The dashboard's local
  `useDashboardRole` now **delegates** to it (admin → hr branch), so there's one role source.
- **`src/features/auth/role-gate.tsx`** — `<RoleGate allow={[…]} fallback={…}>`. `fallback` is a prop
  (not an import) to keep the auth feature decoupled from the page layer.
- **`pages/command-center.tsx`** gates with `allow={['hr','admin']}` and `fallback={<NotFoundPage/>}` —
  a forbidden URL resolves to the full-page 404 (States spec: not an inline 403). Denied branch is dead
  today (role always `hr`) but the seam is real. Nav item added to the sidebar + command palette
  (nav role-filtering is a later enhancement; the route is the gate).

### Reused the charts layer (no new wrappers)

- **`Sparkline`** ×8 — 4 hero KPI tiles (white stroke on the gradient) + 4 bento tiles (green/rose per delta).
- **`AreaTrend`** — "Attendance rate" (Jan–Jul).
- **`CategoryBarChart`** — "Leave taken by type". ⚠ The design rendered this as **horizontal progress
  meters**; per "reuse the wrappers, don't create new ones" it's the shared **vertical** bar chart
  (Annual/Sick/Casual/Unpaid = chart-1/2/3/4). Say the word to add a horizontal `orientation` variant if
  the meter look matters.

### Punctuality heatmap — the one non-Recharts chart (deferred earlier)

`features/hr-command-center/components/punctuality-heatmap.tsx` — a **CSS grid** (6 dept × 10 day cells),
not Recharts (which has no first-class heatmap). Intensity is **`color-mix(in srgb, var(--chart-3) N%,
transparent)`** — green for healthy on-time %, `--chart-4` (amber) for low — so no raw colours and **no
new token**. Cell rate/heat logic mirrors the design's `heat()` (deterministic `sin` wobble, no random).

### PageHeader / DataViewList / SkeletonKpis

- **PageHeader** — greeting title + date/role description + **Export/Ask-AI actions** (the design put the
  actions in the gradient hero; moved them to PageHeader so the header component earns its place and the
  hero stays a clean KPI spotlight).
- The signature **gradient hero** is a bespoke banner (fixed brand gradient — **reused `--login-hero`**
  rather than adding a `--command-hero`; on-gradient content uses white utilities, per the login-showcase
  precedent). Not a PageHeader.
- **DataViewList** frames "Needs your attention" (approve/retry/investigate rows, `SkeletonRows` loading,
  a success "all caught up" empty state via `StateMessage` — items resolve out of the list optimistically)
  and the "What changed today" timeline.
- **SkeletonKpis** — the bento row's loading state (simulated 600ms fetch).
- **Violet has no token** — the design's violet AI accents map to `--primary` (indigo); the Interloid-AI
  card border is `from-primary to-brand-accent`. Flagged, not a new token.

**Dev gotcha:** brand-new Tailwind classes (`grid-cols-10`, `lg:grid-cols-[1.4fr_1fr]`) weren't generated
by the running dev server's incremental scan — the heatmap collapsed to one column until a **dev-server
restart** forced a full regen. Valid classes; a production build scans fresh, so no code change needed.

**Verified (2026-07-25, browser, light + dark):** `/command-center` renders for HR — PageHeader
(greeting + Export/Ask-AI), gradient hero (93.1% live pill + 4 KPI tiles w/ white sparklines), attention
lane (4 items, AI badges, approve/retry), Interloid-AI card (insights + leave-at-risk + ask input), bento
row (4 KPIs), attendance-rate area trend + leave-by-type bars (shared wrappers), 6×10 punctuality heatmap
(green + amber low-cells, distinct cells + legend), "what changed today" timeline; sidebar "Command
center" active. `tsc -b` + `eslint` pass. **Assets needed: none** (inline Lucide SVG, `--login-hero`
gradient, `color-mix` heat cells; no new deps).

---

## Demo credentials + persona seam (2026-07-25)

Static demo accounts, resolved **through the real login flow** (email → shared password → MFA),
each mapping to a distinct persona so role-gated screens (via `role`) and personal-data screens (via
`leaveBalance` / `team` / `attendance`) render correctly per role. Still 100% stub — no backend.
(`lead@` was added later so the Employees view-only `permitActions` path is testable inside its allowed
roles — see the Employees section.)

| Email                    | Persona       | Role       | Title       |
| ------------------------ | ------------- | ---------- | ----------- |
| `admin@interloid.com`    | Devi Krishnan | `admin`    | Super Admin |
| `hr@interloid.com`       | Priya Nair    | `hr`       | HR Manager  |
| `lead@interloid.com`     | Rohan Gupta   | `lead`     | Team Lead   |
| `employee@interloid.com` | Arjun Rao     | `employee` | Analyst     |

**Shared demo password: `interloid`** · MFA code: `123456` (both shown on the login screen's "Demo
accounts" hint). These are stub demo values, intentionally visible.

### The seam — `src/features/auth/demo-users.ts`

- `resolveUser(email): DemoUser | null` — **the single email→persona lookup the real API replaces.**
  Swap its body for the login response / `GET /me` mapping and nothing else changes: the login flow,
  the auth provider, the role seam, and every screen already read the returned `DemoUser`.
- `DemoUser` carries `id · name · email · role · title · department` + the fields screens read:
  `leaveBalance {annual,sick,casual}`, `team {name,size}`, `attendance {checkedInAt,monthPct,status}`.
- `DEMO_PASSWORD`, `DEFAULT_DEMO_USER` (SSO / fallback = the HR persona), `DEMO_ACCOUNTS` (login hint).
- `AppRole` now lives here (re-exported from `use-role.ts` for existing imports).

### Wiring (one place each)

- **`use-auth.ts`** — `AuthUser = DemoUser` (the persisted session user is a persona).
- **`use-role.ts`** — `useRole()` now returns `user?.role ?? 'hr'` (was hard-coded `'hr'`). This is what
  makes `RoleGate` real: an **employee is denied `/command-center` (→ 404)**; hr/admin are allowed.
- **`login-panel.tsx`** — the email step calls `resolveUser(email)` and checks `DEMO_PASSWORD`; on
  mismatch it shows an inline "credentials don't match a demo account" error, else stores the resolved
  persona and advances to MFA, which signs in with it. **SSO** signs in as `DEFAULT_DEMO_USER`. Added the
  "Demo accounts" hint block. The `resolveUser + password` check is the exact block a real API call replaces.
- **`auth-provider.tsx`** / **`session-expired-card.tsx`** — default/fallback user is `DEFAULT_DEMO_USER`
  (persona), not a bare `{name,email}`.
- **Identity now reflects the persona:** TopBar role reads `user.title` (was hard-coded "HR Manager");
  the dashboard + command-center greetings read the persona's first name (admin → "Devi", hr → "Priya").

**Verified (2026-07-25, browser — full login flow per role):** employee@ → Arjun Rao/Analyst → dashboard
employee branch + `/command-center` returns 404 (gated); hr@ → Priya Nair/HR Manager → command center
accessible, greeting "Good morning, Priya"; admin@ → Devi Krishnan/Super Admin → command center
accessible, greeting "Good morning, Devi". `tsc -b` + `eslint` pass. No new deps, no assets.

> Note: the dashboard's **employee** branch is still the "coming soon" stub (audit-flagged) — the persona
> now carries the leave/team/attendance data those screens will read once built; this task added the
> credentials + seam, not the personal screens.

---

## Employees screen `/employees` + server-side pagination + nav role-filtering (2026-07-25)

Promoted the `/dev/table` demo into the real Employees route under the shell (design: Employees.dc.html),
composing the **built** `PageHeader` + `FilterBar` + `DataTable` + cells (`PersonCell`/`MonoText`/
`TableBadge`). No `ui/` changes. **Assets: none** (inline Lucide icons; no new deps).

### Server-side / controlled pagination — the seam

- **`features/employees/data.ts`** — a 48-row directory + **`fetchEmployees(query)`**, the one place a
  real `GET /employees?q&filter[…]&sort&page&per_page` plugs in. Same shape in/out (`{page, pageSize,
sort, filters, q}` → `{rows, total}`); swap the body for a fetch and the screen is unchanged.
- **`features/employees/employees-screen.tsx`** drives the DataTable's controlled path (`page`/`total`/
  `pageSize`/`onPageChange` + `sort`/`onSortChange`) — the **first real exercise of that path under the
  shell**. Every page/sort/filter/search change re-queries the seam behind a ~300 ms latency: loading is
  **derived** from a `queryKey` (stale ⇒ `status:'loading'`), and the only `setState` is in the async
  callback, so there's no `set-state-in-effect` cascade. The `useEffect` cleanup cancels superseded
  requests (and debounces typing). Toolbar = a search `Input` + `FilterBar` (Department/Type facets);
  PageHeader tabs (All/Active/On leave/Probation) drive the status filter; the "N total" badge tracks
  the filtered count.

### Role-driven affordances (`permitActions`) + nav role visibility

- **`permitActions = role === 'hr' || role === 'admin'`.** HR/Admin get selection + bulk bar
  (Export/Deactivate) + per-row ⋯ (View/Edit/Deactivate) + the "Add employee" primary action. Other
  roles get a **read-only roster** — DataTable strips checkboxes/bulk/⋯ while keeping the data (the
  design's "data stays visible, affordances the role lacks are stripped").
- **Nav role visibility (completes the filtering deferred in the command-center pass):** `NavItem` gained
  an optional `roles?: AppRole[]`; `AppShell` filters `NAV_GROUPS` by `useRole()` before handing them to
  the sidebar (which already expects pre-filtered groups). Employees → `['hr','admin','lead']`; Command
  center → `['hr','admin']`; the rest are unrestricted. So an **employee sees neither** Employees nor
  Command center in nav (only Dashboard + dev).
- **Strict design scope:** the page is wrapped in `RoleGate allow={['hr','admin','lead']}` (fallback =
  full-page 404), matching the manifest (HR/Admin manage; Team Leads view read-only). A plain **employee
  typing `/employees` hits the 404**, not the roster. The view-only `permitActions` path is exercised by
  the **`lead@interloid.com` Team Lead persona** (Rohan Gupta, added for this) — the test stays _inside_
  the allowed roles rather than widening the route to reach it.

**Verified (2026-07-25, browser):** as HR — 48 total, Page 1→2 slices a different page server-side
(loading between), "Page 1 of 6"; search "aarav" → "3 total"/3 rows; select-all → "8 selected" bulk bar
(Export/Deactivate/Clear) + 8 row ⋯; sidebar shows Employees + Command center. As **Team Lead**
(lead@) — roster **read-only** (0 checkboxes, 0 ⋯, no Add employee), Employees in nav, Command center
hidden. As **employee** — `/employees` → **full-page 404** (roster denied). `tsc -b` + `eslint` pass.

---

## ESS cluster — My Profile / My Attendance / My Leave / Notifications (2026-07-25)

Four employee-self-service screens (design: `My Profile` / `My Attendance` / `My Leave` /
`Notifications.dc.html`), **all roles**, in a new **"My workspace"** sidebar group (unrestricted) +
command-palette entries + routes (`/me/profile`, `/me/attendance`, `/me/leave`, `/notifications`).
Each reads the current persona (resolveUser via `useAuth`) for what it carries and uses **flagged demo
data** for the rest. No `ui/` changes. **Assets: none** (inline Lucide icons; no new deps).

- **My Profile** (`features/my-profile`) — `PageHeader` as the identity header (avatar-initials icon +
  name + `id`/status badges + `title · department` description + Personal/Contact/Documents tabs), a
  dept/manager meta strip, per-tab field cards, a "Bank — Coming later" dashed card, and a Documents
  `DataViewList`. Edit → toast (the design's per-field HR-approval workflow is stubbed).
- **My Attendance** (`features/my-attendance`) — `PageHeader` (+ persona `checkedInAt` in the subtitle),
  4 stat cards (`SkeletonKpis` loading), and a daily-log `DataViewList` (per-day status pill, LATE badge,
  punch in/out, worked-hours bar). Calendar-grid view + day-detail drawer + regularisation form deferred.
- **My Leave** (`features/my-leave`) — `PageHeader`, 3 balance **`DonutChart`** rings (`SkeletonKpis`
  loading) whose "N left" centre is the persona's `leaveBalance.{annual,sick,casual}`, a request form
  (Select/date/Switch/Textarea + live duration + client validation), and a history `DataViewList` with
  status chips + Cancel. Cancel is a direct action + toast (no `ui/alert-dialog` primitive → the design's
  confirm dialog is simplified).
- **Notifications** (`features/notifications`) — `PageHeader` (unread count + "Mark all read") + filter
  tabs + a grouped (Today/Yesterday/Earlier) `DataViewList` of kind-colored rows with unread dots.
  **Role-aware:** plain employees don't see the Approvals tab or any `approval` items (uses persona role).

### ⚠ Data the persona does NOT carry (flagged, using demo data)

The persona (`name, email, id, title, department, leaveBalance{annual,sick,casual}, team{name,size},
attendance{checkedInAt,monthPct,status}`) covers only a thin slice. Every ESS screen needs backend data
it lacks — demo stand-ins are used and marked in each feature's `data.ts`:

- **My Profile** — DOB, gender, marital status, blood group, nationality, all contact fields, manager,
  employment type, join date, documents list, and the **pending-change approval ledger**. (Persona has
  only name/email/id/title/department.)
- **My Attendance** — the **day-by-day ledger**: per-day status, punch logs, worked minutes, late marks,
  shift window, regularisation state. (Persona has one snapshot: `checkedInAt`/`status`; `monthPct` isn't
  even used by the screen.)
- **My Leave** — the balance **ledger** (opening/accrued/used — derived here from the single `available`
  number) and the **request history** entirely. (Persona gives only one available number per type.)
- **Notifications** — the **entire feed**, unread counts, read state. The design's own CLAUDE.md notes the
  API spec defines **no notifications endpoint/schema** at all. Only `role` (persona) is real, for filtering.
- `team` (persona) is **unused** by all four screens.

Each `data.ts` has a `fetch`-shaped or exported demo dataset that a real endpoint replaces
(`GET /me`+`/documents`, `/attendance/days`+`/punch_logs`, `/leave/balances/{id}/ledger`+`/leave/requests`,
`GET /notifications`).

**Verified (2026-07-25, browser):** My Leave rings show the HR persona's **12 / 8 / 5 left** + form +
history; My Attendance subtitle "checked in today at **09:15**" (persona) + stat cards (12/2/1/1) + daily
log with statuses/LATE/times/worked-bars; My Profile header (PN · Priya Nair · ITL-0042 · Active · HR
Manager · People Ops) + tabs + fields; Notifications grouped list with unread dots — and as **employee**
the Approvals tab + approval items are hidden while leave/system remain, with the "My workspace" group
visible to all roles. `tsc -b` + `eslint` pass.

---

## Confirm dialog — the standard destructive-action confirm (2026-07-25)

Added shadcn's `alert-dialog` primitive (`npx shadcn add alert-dialog` — declined its offer to overwrite
`button.tsx`, keeping our `sso` variant) and built a **reusable Confirm dialog** on top, to the States &
Components spec ("Confirm AlertDialog"). Replaces the ad-hoc "Cancel → toast" from the ESS pass and is now
the standard for destructive actions.

- **`components/confirm/use-confirm.ts`** — `ConfirmContext` + `useConfirm()` + `ConfirmOptions` type.
- **`components/confirm/confirm-provider.tsx`** — `ConfirmProvider` renders ONE dialog and exposes an
  imperative `confirm({ title, description, confirmLabel, cancelLabel, tone, icon, onConfirm })`. Wired
  once into `AppProviders` (inside TooltipProvider). Any call site triggers it in one line, incl. from a
  row ⋯ menu item or a bulk button.
- **Spec build:** 430px card panel (`max-w-[430px]` — had to override the primitive's higher-specificity
  `data-[size=default]:sm:max-w-sm` with the same variant stack for tailwind-merge to drop it), r-15,
  shadow-lg; per-severity tinted icon tile (`destructive` = destructive-subtle, `warning` =
  warning-subtle); destructive/warning confirm button. **Busy state:** while `onConfirm` runs, the confirm
  button shows a spinner + "Working…" (disabled, `aria-busy`, `cursor-wait`) and **Esc/dismiss is blocked**
  (the `onOpenChange` guard). Closes when `onConfirm` resolves. Stub call sites `await` ~700ms to exercise
  the busy state; real latency drives it naturally.
- **Rejection handling (real APIs fail):** `runConfirm` wraps `onConfirm` in try/**catch**/finally. On a
  thrown/rejected action the `finally` clears busy (never stuck on "Working…"), the dialog **stays open**
  (no `setOpen(false)` in the catch) so Esc/Cancel re-enable, and the error **surfaces inline** — a
  destructive `iws-shake` panel showing the `Error.message` (or a generic fallback). The confirm button
  reverts to its label so the user can retry. Error clears on reopen / dismiss. Without this the promise
  would become an unhandled rejection and never reach the user.

**Wired at:** My Leave **Cancel** ("Cancel this leave? … N days return to your balance" · Keep it / Cancel
leave) and Employees **Deactivate** (row ⋯ + bulk — "Deactivate {name/N}?"). Both run their action inside
`onConfirm`.

**CLAUDE.md clarified:** installing NEW shadcn primitives via `npx shadcn add` is always allowed (decline
any overwrite of an existing file); the `ui/` rule is only about **hand-editing existing** primitives
(except adding a cva variant) — restyle/extend by wrapping in an app-level component instead.

**Verified (2026-07-25, browser):** My Leave Cancel → dialog (title/desc/Keep-it/Cancel-leave, `maxWidth`
computed 430px, r-15) → confirm shows **"Working…" (disabled, aria-busy)** → row flips to **Cancelled** +
toast → dialog closes, page stays interactive (re-opens fine). Employees row ⋯ → Deactivate → "Deactivate
Aarav Nair? / They lose access immediately…" with the same busy flow. `tsc -b` + `eslint` pass.
(Note: in the CDP automation browser the dialog renders at `scale(0.95)` — the Radix enter `zoom-in-95`
doesn't settle there; `max-width` is correctly 430px. Same benign artifact on all the app's Radix dialogs.)

**Reject path verified (2026-07-25):** temporarily made My Leave's Cancel `onConfirm` throw
(`409 already processed`) → mid-action showed **"Working…" (disabled)**; after the throw the dialog stayed
open, busy **cleared** ("Cancel leave" restored), **both buttons re-enabled**, and the error surfaced
inline ("Cancellation rejected — request already processed (409)."). "Keep it" then dismissed cleanly.
Reverted the throw; success path intact.

---

## Company Dashboard — Employee branch filled; role seam complete (2026-07-25)

The dashboard's Employee/Lead landing was a "coming soon" stub (the role seam existed but only HR/Admin
was populated). Now **both branches are real** — no role sees a placeholder at `/dashboard`.

- **`features/dashboard/employee-dashboard.tsx`** — `EmployeeDashboard`, a persona-driven personal
  summary reusing the HR branch's building blocks (**PageHeader** greeting + status badges, **KpiCard**
  row, **DonutChart** rings, **DataViewList**). Sections: 4 KPI cards (Leave balance / Attendance / Present
  days / Pending — each **deep-links** into the matching ESS screen via `KpiCard.onClick`), a **Leave
  balance** card (3 `DonutChart` rings) → My Leave, an **Attendance snapshot** (month % + present/late/
  absent + checked-in) → My Attendance, and **Recent notifications** (`DataViewList`, approvals filtered
  out for `employee`) → Notifications. Every card header carries a "view" link into the ESS screen.
- **`features/dashboard/employee-data.ts`** — `buildEmployeeKpis(user)`: reads the persona
  (`leaveBalance`/`attendance`) and the **same demo sources the ESS screens use** (`buildBalances`,
  `getMonth`/`summarize`, `DEMO_HISTORY`), so the dashboard and My Leave / My Attendance agree.
- **`dashboard-screen.tsx`** routes `employee`/`lead` → `EmployeeDashboard`, `hr`/`admin` →
  `DashboardContent` (org). `getDashboardData` now runs only for `hr`; its Employee/Lead null arms are a
  defensive fallback (documented in `data.ts`). Lead uses the personal view for now — a dedicated
  team-focused Lead variant (design's isLead) is still a future fill-in.

**Verified (2026-07-25, browser, all roles):** employee@ → "Good morning, Arjun", rings **8/6/4.5**
(persona), Attendance 96%, Present 12/Late 2/Absent 1, checked-in 09:28, notifications with **approvals
hidden**; Leave-balance KPI click → `/me/leave`. lead@ → personal dashboard, rings **10/7/5** (persona).
hr@ → still the **org** dashboard (Headcount, charts, approvals) — not the personal one. No "coming soon"
for any role. `tsc -b` + `eslint` pass.
