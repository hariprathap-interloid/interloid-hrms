# Codebase Tour — Every Part Explained in Depth

This is the deep-dive companion to [onboarding.md](onboarding.md). Onboarding gives you the quick map; **this file explains the _why_ behind every important piece of the app**, each in the same simple format:

- **What it is** — the plain description
- **The problem** — what would go wrong without it
- **The fix** — how this file/pattern solves it
- **A concrete example** — real code showing it in action
- **What you can do here** — the changes this file is _meant_ to accept
- **What you'd update, and how** — the correct way/order to make those changes
- **Do & Don't** — quick guardrails so you don't break something

Read it top-to-bottom once and the whole app will click. Come back to any single section later as a reference.

---

## 1. `index.html` — the one page everything lives in

**What it is.** A single, almost-empty HTML file at the project root. The only line that matters is `<div id="root"></div>`.

**The problem.** A browser can only load HTML. But we write the app in React (JavaScript), not HTML. Something has to be the "landing pad" the browser opens first.

**The fix.** `index.html` is that landing pad. It's basically empty — that `#root` div is a blank canvas. React fills it in with the entire app once its JavaScript loads. This is what "single-page app" means: there is only ever _this one_ HTML file; every "page" you navigate to is React swapping content inside that div, not the browser loading a new file.

**A concrete example.** When you visit `/employees`, the browser does **not** fetch an `employees.html`. It loads `index.html` once, React boots, sees the URL is `/employees`, and renders the employees page into `#root`. Refreshing `/employees` still loads `index.html` first (this is why the nginx and dev-server configs redirect every URL back to it).

**What you can do here.** Change the page `<title>`, add a favicon or a `<meta>` tag (description, theme-color), or add a `<link>`/`<script>` that must exist before React starts.

**What you'd update, and how.** Edit the tags inside `<head>` directly. Leave `<div id="root"></div>` and the `<script type="module" src="/src/app/main.tsx">` line exactly as they are — they're the wiring that boots the app.

**Do & Don't.**

- ✅ Do put document-level metadata (title, favicon, meta tags) here.
- ❌ Don't add app UI or content here — that belongs in React components.
- ❌ Don't rename or remove the `#root` div or the module script — the app won't start without them.

---

## 2. `src/app/main.tsx` — the ignition switch

**What it is.** The true starting point of your code. It's the first `.tsx` file that runs.

**The problem.** React needs to be _told_ two things: "here's the empty div to fill" and "here's the component to put in it." That connection has to happen exactly once, somewhere.

**The fix.** `main.tsx` grabs the `#root` div and calls `createRoot(...).render(<App />)`. It also imports the global stylesheet here (`import '@/styles/index.css'`) — once, at the top — so styles are available everywhere without every file re-importing them.

**A concrete example.**

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`<StrictMode>` is a development-only helper — it deliberately runs some logic twice to surface sloppy code (like effects that don't clean up after themselves). It disappears in the production build.

**What you can do here.** Import another global stylesheet, or (rarely) swap what gets rendered at the very root.

**What you'd update, and how.** If you must add a top-level wrapper, prefer adding it inside `AppProviders` instead of here — keep `main.tsx` as just "mount `<App />` into `#root`."

**Do & Don't.**

- ✅ Do keep this file tiny and boring — that's a feature, not a gap.
- ❌ Don't add providers, routing, or business logic here — those live in `app.tsx` / `AppProviders`.
- ❌ Don't remove `<StrictMode>` to "fix" double-running effects; that double-run is exposing a real bug to fix in your code.

---

## 3. `src/app/app.tsx` + `src/app/providers/index.tsx` — the wrapping layers

**What it is.** `app.tsx` is the top of your component tree. `AppProviders` (in `providers/index.tsx`) is where all the "wrap the entire app" tools get stacked.

**The problem.** Some things need to be available to _every_ component, no matter how deep: the current theme, a crash-catcher, later maybe the logged-in user or a data-fetching client. If each feature set these up itself, you'd have five copies and no single source of truth.

**The fix.** Stack them once, at the very top, so everything below inherits them. `app.tsx` stays tiny — it just assembles `AppProviders` around the `RouterProvider`. `AppProviders` is the actual stack.

**A concrete example.**

```tsx
// providers/index.tsx
<ThemeProvider defaultTheme="system">
  <ErrorBoundary FallbackComponent={AppErrorFallback}>{children}</ErrorBoundary>
</ThemeProvider>
```

Because `ThemeProvider` wraps everything, _any_ component can call `useTheme()`. Because `ErrorBoundary` wraps everything, if _any_ component throws, the user sees a friendly error screen instead of a blank white page.

**What you can do here.** Add any app-wide provider: authentication, a data-fetching client (e.g. React Query), a toast/notification system, feature flags.

**What you'd update, and how.** Add the new provider in `providers/index.tsx`, wrapping `{children}`. **Order matters** — outer providers can't use inner ones. Example: if your auth logic needs the query client, put `<QueryClientProvider>` _outside_ `<AuthProvider>`. Keep `app.tsx` itself untouched; it just renders `<AppProviders>` around the router.

**Do & Don't.**

- ✅ Do add every "the whole app needs this" provider here, in one place.
- ✅ Do think about nesting order (a provider can only use the ones wrapping it).
- ❌ Don't scatter the same provider inside individual features — you'll get multiple conflicting copies.
- ❌ Don't put feature-specific context here; that belongs inside the feature.

---

## 4. `src/app/router.tsx` — the URL-to-page map

**What it is.** The table that says "this URL shows this component."

**The problem.** A single-page app has many "pages" but one HTML file. Something must decide, based on the current URL, which component to render. And if we bundled _all_ pages' code into one giant download, the first load would be slow.

**The fix.** React Router matches the URL to a route. Each route is **lazy-loaded** — its code is only downloaded the moment someone visits it (`lazy: () => import('./pages/home')`). Small first load, pages stream in on demand.

**A concrete example.**

```tsx
{
  path: paths.home.path,                                  // '/'
  lazy: () => import('./pages/home').then((m) => ({ Component: m.default })),
  HydrateFallback: HomeLoadingSkeleton,                   // shown while that code downloads
},
{ path: '*', Component: NotFoundPage },                   // any unmatched URL → 404
```

The `*` route is the catch-all: type any URL that doesn't exist and you land on the 404 page. `errorElement` (set higher up) catches routes that throw and shows the error page.

**What you can do here.** Register new pages, nest routes under a shared layout, add per-route error screens, and set the loading skeleton each route shows.

**What you'd update, and how.** Copy the existing `home` route as your template: set `path` to `paths.<name>.path`, point `lazy` at `./pages/<name>`, and give it a `HydrateFallback` skeleton. Add it to the `children` array of the layout it belongs under. Keep the `{ path: '*' }` catch-all **last**.

**Do & Don't.**

- ✅ Do use the `lazy` field (copy the `home` route) so each page is code-split.
- ✅ Do reference URLs via `paths.<name>.path`, never a hardcoded string.
- ❌ Don't `import` a page component directly at the top of this file — that defeats lazy-loading and makes the first download bigger.
- ❌ Don't put a route after the `*` catch-all; nothing after it will ever match.

---

## 5. `src/config/paths.ts` — the single source of truth for URLs

**What it is.** One object holding every URL in the app, plus a `getHref()` builder for each.

**The problem.** If you scatter the raw string `'/employees'` across 20 files and later rename the route to `/team`, you have to hunt down all 20 — and you _will_ miss one, creating a dead link. Magic strings rot.

**The fix.** Define each URL once, here. Everyone else refers to `paths.home.path` (for the router) or `paths.home.getHref()` (to build a link). Rename it once and everything updates.

**A concrete example.**

```tsx
// config/paths.ts
export const paths = {
  home: { path: '/', getHref: () => '/' },
} as const

// anywhere you need a link:
<Link to={paths.home.getHref()}>Go home</Link>
```

`getHref()` is a function (not just a string) because real apps have dynamic URLs. For an employee route you'd write `getHref: (id) => '/employees/' + id`, so `getHref(42)` builds `/employees/42`. Doing it here keeps the "how a link is built" logic in one place.

**What you can do here.** Add a new URL entry, change an existing URL, or add dynamic-segment support (`:id`) with a matching `getHref(id)`.

**What you'd update, and how.** Add a new key to the `paths` object with two fields: `path` (the router pattern, e.g. `'/employees/:id'`) and `getHref` (builds the real link). For static pages `getHref` just returns the same string; for dynamic ones it takes an argument. Then use `paths.<name>.path` in the router and `paths.<name>.getHref(...)` in your `<Link>`s.

**Do & Don't.**

- ✅ Do keep this as the _only_ place URL strings are written.
- ✅ Do keep `path` and `getHref` in sync (if `path` has `:id`, `getHref` should take an `id`).
- ❌ Don't hardcode URL strings anywhere else — always reference `paths`.
- ❌ Don't add a second constant elsewhere for the same URL; this object _is_ the source of truth.

---

## 6. `src/config/env.ts` + `src/vite-env.d.ts` — the two-part env safety net

**What it is.** Two files that together make environment variables both _type-safe_ and _validated_. `env.ts` checks values at runtime; `vite-env.d.ts` describes their types for the editor.

**The problem.** Env variables come from a `.env` file that isn't checked by the compiler. If `VITE_API_URL` is missing or a typo, nothing complains — until deep inside some component you get a confusing `undefined`, hours later, far from the real cause. Also, `import.meta.env.VITE_API_URL` gives you no autocomplete and no protection against typos in the _name_.

**The fix — two different checks at two different times:**

- **`vite-env.d.ts`** (compile-time) — declares the _shape_: `VITE_API_URL` is a `string`, etc. This gives you autocomplete and catches misspelled variable names _while you type_.
- **`env.ts`** (runtime) — actually validates the real values at startup using Zod, and **crashes immediately with a clear message** if something's missing or malformed. Better a loud failure on boot than a silent `undefined` later.

**A concrete example.**

```ts
// env.ts
const schema = z.object({
  VITE_API_URL: z.url(), // must be a valid URL or the app won't start
  VITE_APP_NAME: z.string().default('Interloid'),
})
export const env = schema.parse(import.meta.env) // throws here if invalid
```

Everywhere else you write `import { env } from '@/config/env'` and use `env.VITE_APP_NAME` — never `import.meta.env` directly. That keeps exactly one place reading raw env vars.

**What you can do here.** Add a new environment variable, mark one required vs. optional, give it a default, or add validation rules (must be a URL, a number, one of a set of values).

**What you'd update, and how — the four-files rule.** A new variable must be added to **all four** of these together, or it breaks confusingly:

1. `.env` — your real local value
2. `.env.example` — a placeholder value (committed, so others know it exists)
3. `src/config/env.ts` — add it to the Zod `schema` (this is where you set required/optional/default/validation)
4. `src/vite-env.d.ts` — add it to the `ImportMetaEnv` interface (the TypeScript type)

**Do & Don't.**

- ✅ Do prefix every browser variable with `VITE_` — only those reach the frontend.
- ✅ Do use Zod rules (`z.url()`, `z.string().min(1)`, defaults) so bad config fails loudly at startup.
- ❌ Don't read `import.meta.env` anywhere in the app — always `import { env } from '@/config/env'`.
- ❌ Don't put secrets (passwords, private keys) in `VITE_` vars — they're shipped to the browser and are public.

---

## 7. `src/services/api-client.ts` — the one door to the backend

**What it is.** A single function, `apiFetch`, that every network request goes through.

**The problem.** If each feature calls `fetch` directly, then credentials, auth headers, base URLs, and error handling get copy-pasted everywhere and drift out of sync. Worse: the API's real address differs between local dev and production, and talking to it directly in dev triggers CORS errors.

**The fix.** Funnel _all_ requests through `apiFetch`. It handles the dev-vs-prod URL difference and sends cookies automatically. Change how the app talks to the backend once, here, and every request benefits.

**A concrete example.**

```ts
import { apiFetch } from '@/services/api-client'
const res = await apiFetch('/employees') // that's it
```

Under the hood: in **dev** it calls a fake local path `/__api/employees` that Vite's proxy quietly forwards to the real backend (no CORS pain); in **production** it calls the real `VITE_API_URL` directly. Your calling code is identical in both — you never think about it.

**What you can do here.** Add behavior that should apply to _every_ request: an auth token header, a default `Content-Type`, global retry/timeout logic, or centralized error handling (e.g. auto-logout on a 401).

**What you'd update, and how.** Edit the `apiFetch` function so the new behavior applies to all calls. For example, to attach a token, read it and add it to the `headers` before the `fetch`. Don't change the dev/prod base-URL logic unless you truly understand it — the backend _address_ is configured via `VITE_API_URL` in `.env`, not here.

**Do & Don't.**

- ✅ Do route every backend call through `apiFetch`.
- ✅ Do add cross-cutting request logic here so it's applied consistently.
- ❌ Don't call `fetch` or `axios` directly in features — you'll lose credentials, the dev proxy, and shared error handling.
- ❌ Don't hardcode the backend URL here; it comes from `VITE_API_URL`.

---

## 8. The theme system — four files, one job each

**What it is.** Light / dark / system / auto theming, deliberately split across four small files so each has a single responsibility.

**The problem.** Theming touches many concerns at once: remembering the user's choice, reacting to the OS changing, computing "what color right now," and the button to switch. Cram all that into one file and it becomes a tangled mess that's impossible to test.

**The fix — separation by responsibility:**

| File                          | Its one job                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `hooks/use-theme.ts`          | Defines the `Theme` type + the `useTheme()` hook other components call                                 |
| `context/theme-provider.tsx`  | Remembers the choice (`localStorage`), applies it (adds `light`/`dark` to `<html>`), reacts to changes |
| `lib/theme.ts`                | Pure logic: "given a mode + OS preference, what actual color?" No React — easy to test                 |
| `components/theme-toggle.tsx` | The dropdown button the user clicks                                                                    |

**A concrete example.** The `auto` mode rule ("light during the day, dark at night") is a plain function in `lib/theme.ts`:

```ts
if (theme === 'auto') {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'light' : 'dark'
}
```

Because it's a pure function with no React, you can test it with `resolveTheme('auto', false)` and check the result directly — no rendering needed. Meanwhile a component just does `const { theme, setTheme } = useTheme()` and never worries about any of this.

**What you can do here.** Read or change the current theme from any component (`useTheme()`), add a brand-new theme mode, or change the `auto` mode's day/night hours.

**What you'd update, and how.** To _use_ theming, just call `useTheme()` — nothing to edit. To _add a mode_, touch three files in this order: (1) add it to the `Theme` type in `hooks/use-theme.ts`, (2) add its resolving logic in `lib/theme.ts`, (3) add it to the options list in `components/theme-toggle.tsx`. To tweak `auto` hours, edit only the constants in `lib/theme.ts`.

**Do & Don't.**

- ✅ Do use `useTheme()` inside components — always.
- ✅ Do keep pure logic (the "what color now?" decision) in `lib/theme.ts` so it stays testable.
- ❌ Don't read/write the theme `localStorage` key directly — go through the provider.
- ❌ Don't call `useTheme()` outside a `<ThemeProvider>`; it throws on purpose to catch the mistake.

---

## 9. Error handling — `ErrorBoundary`, `error-fallback`, `error.tsx`, `error-state`

**What it is.** A safety net so a single broken component (or failed page) never shows the user a blank white screen.

**The problem.** In React, one component throwing an error during render will, by default, unmount the _entire_ app — the user just sees a white page with no explanation. Separately, navigating to a bad URL or a page that fails to load needs its own friendly screen.

**The fix — catch errors at the top, show one shared UI:**

- `ErrorBoundary` (in `AppProviders`) catches any component that _crashes at runtime_ and renders `AppErrorFallback` instead of dying.
- `error.tsx` (the router's `errorElement`) catches _route/loading_ errors.
- `not-found.tsx` catches _unknown URLs_.
- All three render the **same** `components/error-state.tsx` — one reusable UI with a title, message, and "Try again" / "Go home" buttons.

**A concrete example.** A 404, a route crash, and a component throwing look consistent because each just configures the shared component:

```tsx
<ErrorState title="404 - Page Not Found" message="The page you're looking for doesn't exist." />
```

That's the "build reusable components, never repeat UI" rule paying off — fix the error look once, all three improve.

**What you can do here.** Restyle the shared error screen, change the error messages, add an extra action button (e.g. "Report issue"), or customize what the crash-fallback shows.

**What you'd update, and how.** To change how _all_ error screens look, edit `components/error-state.tsx` once — every error surface updates. To change wording for a specific case, edit the props passed in `not-found.tsx`, `error.tsx`, or `error-fallback.tsx`. The `ErrorBoundary` wiring in `AppProviders` rarely needs changes.

**Do & Don't.**

- ✅ Do reuse `ErrorState` for any new full-screen error, rather than building a new one.
- ✅ Do keep error messages user-friendly (don't leak stack traces to end users).
- ❌ Don't build a separate error UI per page — funnel them through the shared component.
- ❌ Don't remove the top-level `ErrorBoundary`; without it, one crash blanks the whole app.

---

## 10. `src/lib/utils.ts` — the tiny `cn()` helper you'll use constantly

**What it is.** A one-function file that merges Tailwind class names intelligently.

**The problem.** In Tailwind you build `className` strings by combining pieces, often conditionally. Two issues arise: (1) you get messy empty strings from `false` conditions, and (2) **conflicting** classes. If you write `class="p-2 p-4"`, which padding wins? With plain strings, it's whichever CSS was defined last — unpredictable.

**The fix.** `cn()` combines `clsx` (handles conditionals cleanly) with `tailwind-merge` (resolves conflicts so the _last_ conflicting class wins, predictably).

**A concrete example.**

```tsx
cn('rounded-md p-2', isLarge && 'p-4')
// isLarge true  → 'rounded-md p-4'  (p-4 correctly overrides p-2)
// isLarge false → 'rounded-md p-2'  (no leftover empty string)
```

Without `cn`, `'rounded-md p-2 ' + (isLarge ? 'p-4' : '')` could leave both paddings fighting, or a trailing space. You'll see `cn(...)` in nearly every UI component — that's why.

**What you can do here.** Use `cn()` anywhere you build a `className` with conditions or want a component's incoming `className` prop to safely override defaults.

**What you'd update, and how.** You almost never edit `utils.ts` itself. Instead, _use_ `cn()` in your components: put the base classes first, then conditional or prop classes after (later classes win conflicts). If you add other tiny framework-agnostic helpers later, this `lib/` folder is where they go.

**Do & Don't.**

- ✅ Do wrap any dynamic `className` in `cn(...)`.
- ✅ Do put a component's own `className` prop _last_ in `cn()` so callers can override.
- ❌ Don't build class strings with `+` or template literals — you'll hit conflict and empty-string bugs.
- ❌ Don't add React-specific code to `lib/`; it's for pure, framework-free helpers only.

---

## 11. `src/skeletons/` — the gray "loading" placeholders

**What it is.** For each page, a matching component of gray pulsing shapes shown while the real content loads.

**The problem.** Lazy-loaded pages take a moment to download. During that gap, if you show nothing, the screen is blank and feels broken. If you show a generic spinner, then when content arrives the layout suddenly "jumps" as elements push into place — jarring.

**The fix.** Show a skeleton _shaped like the real page_. The user perceives instant structure, and because the skeleton occupies the same space as the real content, there's no layout jump when it swaps in.

**A concrete example.**

```tsx
// skeletons/home.tsx — mirrors the real home page's heading + subtext
<Skeleton className="h-8 w-40" /> // where the title will be
<Skeleton className="h-4 w-64" /> // where the subtitle will be
```

Skeletons are wired in two spots: `HydrateFallback` in the router (first-ever load) and `<Suspense fallback>` in the layout (later navigations).

**What you can do here.** Add a loading placeholder for a new page, or refine an existing one so it more closely matches its real page's shape.

**What you'd update, and how.** Create `skeletons/<name>.tsx` named to match the page, build it from the `Skeleton` primitive (`@/components/ui/skeleton`) roughly mirroring the real layout's boxes, then reference it as the route's `HydrateFallback` in `router.tsx`.

**Do & Don't.**

- ✅ Do make the skeleton's overall shape/size match the real content, to avoid layout jump.
- ✅ Do name it after the page it mirrors, so the pairing is obvious.
- ❌ Don't put real data-fetching or logic in a skeleton — it's dumb placeholder UI only.
- ❌ Don't reach for a generic spinner when a shaped skeleton keeps the layout stable.

---

## 12. `src/components/ui/` — the shadcn primitives

**What it is.** Base UI building blocks (`button.tsx`, `dropdown-menu.tsx`, `skeleton.tsx`) generated by the shadcn CLI.

**The problem.** Hand-writing accessible buttons, dropdowns, and dialogs is genuinely hard (keyboard nav, focus traps, ARIA roles) and easy to get subtly wrong. But pulling them from a locked npm package means you can't tweak them when design needs something custom.

**The fix.** shadcn's model: the CLI **copies the component's real source into your repo**. You get correct, accessible defaults _and_ full ownership to edit them.

**A concrete example.**

```
npx shadcn add dialog
```

...drops a `dialog.tsx` into `src/components/ui/` that you can open and modify like any other file. (There's an ESLint exception for this folder because these files legitimately co-export helper variants, which a rule would otherwise flag.)

**What you can do here.** Add new primitives via the CLI, and lightly customize existing ones (colors, default sizes, variants) since the source is yours.

**What you'd update, and how.** To add a primitive, run `npx shadcn add <component>` — don't hand-write it. To customize, edit the generated file directly. To build something _app-specific_ (an `EmployeeCard`, a `PageHeader`), create it in `src/components/` one level up, composing these `ui/` primitives — don't bloat the primitives with app logic.

**Do & Don't.**

- ✅ Do use the shadcn CLI for base primitives (accessibility is already handled correctly).
- ✅ Do build reusable app components in `src/components/`, never inline inside a page.
- ❌ Don't hand-roll buttons/dialogs/menus from scratch — you'll get accessibility subtly wrong.
- ❌ Don't put business logic inside `ui/` primitives; keep them generic and reusable.

---

## 13. Empty folders & `.gitkeep`

**What it is.** Some folders (`assets/`, `types/`, `features/auth/components/`) currently contain only a `.gitkeep` file.

**The problem.** Git tracks _files_, not folders. A truly empty folder is invisible to Git — it won't be committed or show up for teammates. But we want these folders to _exist_ as signposts for where certain code should go.

**The fix.** Drop an empty `.gitkeep` file inside. It has no meaning to Git itself — it's just a convention: "keep this folder alive until it has real content."

**A concrete example.** `src/assets/.gitkeep` exists so the `assets/` folder shows up in the repo, signaling "put imported images/fonts here." The moment you add a real file:

```
src/assets/logo.png   ← add this
src/assets/.gitkeep   ← now delete this, it's dead weight
```

**What you can do here.** Add real files to a placeholder folder, or create a new placeholder folder yourself for structure you're about to fill.

**What you'd update, and how.** When you add the first real file to a `.gitkeep`'d folder, delete that folder's `.gitkeep` in the same commit. If you're scaffolding a brand-new empty folder you want committed now, add an empty `.gitkeep` inside it.

**Do & Don't.**

- ✅ Do delete a `.gitkeep` the moment its folder has real content.
- ❌ Don't put any content inside a `.gitkeep` — it's meant to be empty and meaningless.
- ❌ Don't rely on committing an empty folder without a `.gitkeep`; Git will silently drop it.

---

## 14. The testing setup — file by file

The full testing walkthrough (how to write and run tests) is in [onboarding.md](onboarding.md#testing). Here's the _why_ behind each config file, in the same format.

### 14a. `babel.config.cjs` — teaching Jest to read your code

**What it is.** Tells Jest how to convert TypeScript + JSX into plain JavaScript.

**The problem.** Your tests and components are written in TypeScript/JSX. Jest runs on Node, which only understands plain JavaScript — it can't read `.tsx` directly.

**The fix.** Babel (via these presets) transpiles TS/JSX down to JS that Jest can run. This is _separate_ from the app's own build, which uses Vite's Babel plugin for the React Compiler — the test config is intentionally its own thing.

**What you can do here.** Add a Babel preset/plugin that _tests_ need (not the app), e.g. support for a new syntax.

**What you'd update, and how.** Add to the `presets` or `plugins` arrays. Remember this file affects tests only — the app build is configured in `vite.config.ts`, so don't assume a change here changes production.

**Do & Don't.**

- ✅ Do keep this focused on making test files runnable.
- ❌ Don't try to add the React Compiler or app-build concerns here — that's Vite's job.
- ❌ Don't rename it away from `.cjs`; the project is ESM (`"type": "module"`), so Babel's config loader needs the `.cjs` extension.

### 14b. `babel-plugin-transform-import-meta-env.cjs` — the `import.meta.env` fix

**What it is.** A small hand-written Babel plugin, ~10 lines.

**The problem.** `src/config/env.ts` reads `import.meta.env` — a syntax _Vite_ invented. Jest/Node have never heard of `import.meta.env`, so any test importing `env.ts` (or anything that imports it) crashes.

**The fix.** The plugin rewrites `import.meta` → `process` during transpile, turning `import.meta.env.VITE_APP_NAME` into `process.env.VITE_APP_NAME`. Then `jest.setup.cjs` loads `.env` into `process.env` so the values actually exist.

**A concrete example.** Source `import.meta.env.VITE_APP_NAME` becomes `process.env.VITE_APP_NAME` in the test run — same value, syntax Node understands.

**What you can do here.** Essentially nothing routine — it's a stable, done piece of plumbing.

**What you'd update, and how.** Only if you started using other `import.meta` features Jest can't handle would you extend this plugin. For normal work, leave it alone.

**Do & Don't.**

- ✅ Do trust it to just work in the background.
- ❌ Don't delete it thinking it's unused — remove it and every test that touches `env.ts` breaks.
- ❌ Don't try to make it change app behavior; it only runs during tests.

### 14c. `jest.setup.cjs` — the "before every test" prep

**What it is.** A script that runs once before each test file.

**The problem.** Every test needs the same groundwork: env values loaded, nicer assertions available, and a couple of browser APIs that the fake test-browser (jsdom) is missing.

**The fix.** It does three things: loads `.env` (via `dotenv`), registers `@testing-library/jest-dom` matchers (`.toBeInTheDocument()` etc.), and polyfills `crypto.randomUUID` (jsdom lacks it — see below).

**A concrete example.** Because of this file, every test file can write `expect(el).toBeInTheDocument()` without importing anything, and any component calling `crypto.randomUUID()` renders without crashing.

**What you can do here.** Add anything that must run once before every test: a missing browser-API polyfill, a global mock (e.g. `window.matchMedia`), or extra matcher libraries.

**What you'd update, and how.** Add your line to `jest.setup.cjs`. It's already registered in `jest.config.cjs` under `setupFilesAfterEnv`, so you only edit the setup file, not the wiring. Put polyfills near the existing `crypto.randomUUID` block.

**Do & Don't.**

- ✅ Do fix "missing browser API" problems here, once, for all tests.
- ✅ Do keep global mocks here rather than repeating them in every test file.
- ❌ Don't work around a missing jsdom API by changing your component — polyfill it here instead.
- ❌ Don't put test-specific logic here; this is shared setup for _every_ test.

### 14d. `test/__mocks__/fileMock.cjs` — the image/font stand-in

**What it is.** A one-line file that stands in for any image or font a component imports, during tests only.

**The problem.** When the real app runs, **Vite** handles your code. Vite is smart about non-code files — if you write `import logo from '@/assets/logo.png'`, Vite knows "that's an image, turn it into a URL." But **tests don't run through Vite — they run through Jest**, and Jest only understands JavaScript. When Jest sees that same `import ... .png` line, it tries to read the PNG file _as if it were JavaScript source code_, chokes on the binary bytes, and the whole test crashes — before your actual test logic even runs.

**The fix.** Tell Jest: "any time you see an image or font import, don't read the real file — just pretend it returned this simple string." That string lives in `test/__mocks__/fileMock.cjs`, which is one line:

```js
module.exports = 'test-file-stub'
```

And this rule in `jest.config.cjs` wires it up:

```js
moduleNameMapper: {
  '\\.(png|jpe?g|gif|svg|webp|avif|woff2?|ttf|eot)$': '<rootDir>/test/__mocks__/fileMock.cjs',
}
```

Read it as: "if an import path _ends in_ `.png`, `.jpg`, `.svg`, `.woff2`, etc., swap it for `fileMock.cjs`." (The name `__mocks__`, with double underscores, is a Jest convention for "where mocks live." CSS imports are handled the same way via a ready-made package, `identity-obj-proxy`, in the same block.)

**A concrete example — before/after.** Testing a header:

```tsx
// src/components/app-header.tsx
import logo from '@/assets/logo.png'
export function AppHeader() {
  return <img src={logo} alt="Interloid" />
}
```

- **Without the mock:** Jest reads `logo.png`, sees raw binary, throws `SyntaxError: Invalid or unexpected token`, and the test dies immediately.
- **With the mock:** `logo` simply becomes `'test-file-stub'`, so it renders `<img src="test-file-stub" alt="Interloid" />`. Your test can now check `alt="Interloid"` — the thing you actually care about. The test never needed the real image; it only needed the import to _not crash_.

**What you can do here.** Support a new _kind_ of asset in tests (e.g. `.mp4`), or change what the stub value is.

**What you'd update, and how.** To support a new asset type, add its extension to the regex in `jest.config.cjs`'s `moduleNameMapper` — **not** to `fileMock.cjs`, which basically never changes. The stub string itself is fine as-is.

**Do & Don't.**

- ✅ Do add new binary extensions to the `jest.config.cjs` rule when the app imports a new asset type in tested code.
- ❌ Don't put real logic in `fileMock.cjs`; it's meant to be a dumb, harmless stub.
- ❌ Don't test the _actual pixels_ of an image this way — the mock deliberately throws the real file away.

### 14e. jsdom's missing `crypto.randomUUID`

**What it is.** A one-line polyfill in `jest.setup.cjs`.

**The problem.** Real browsers and Node have `crypto.randomUUID()`. Jest's fake browser (jsdom) ships an incomplete `crypto` that's missing it. `src/skeletons/main-layout.tsx` uses `crypto.randomUUID()` for React keys, so testing anything that renders it throws `crypto.randomUUID is not a function`.

**The fix.** In setup, if `randomUUID` is missing, borrow Node's real implementation.

**A concrete example.** This was found the honest way — by actually rendering the skeleton in a throwaway test and watching it crash, _not_ by reading docs. Lesson: if a test dies with "X is not a function" on a browser API, jsdom probably just doesn't implement it — polyfill it in `jest.setup.cjs`.

**What you can do here.** Add more polyfills for browser APIs jsdom is missing (this `crypto.randomUUID` one is just the first).

**What you'd update, and how.** Add another guarded polyfill block in `jest.setup.cjs`, following the same pattern: check whether the API exists, and if not, fill it in (from Node, or a simple mock). Guarding with an `if` keeps it safe if a future jsdom version adds the API natively.

**Do & Don't.**

- ✅ Do guard each polyfill with an existence check so it's future-proof.
- ✅ Do read the error message literally — "X is not a function" usually means "jsdom lacks X."
- ❌ Don't change your component to avoid a browser API just because a _test_ environment lacks it.
- ❌ Don't assume jsdom equals a real browser — it's a partial simulation.

---

## Where to go next

- Quick day-one overview → [onboarding.md](onboarding.md)
- Day-to-day how-to → [dev.md](dev.md)
- The reasoning behind structural decisions → [learning.md](learning.md)
- Why these specific tools/libraries were chosen → [decision.md](decision.md)
