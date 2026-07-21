# Learning Notes

A record of _why_ this project is structured the way it is — the reasoning behind decisions, not just what the decisions were. Read this when something looks unusual and you want to know if it was intentional.

## public/ vs src/assets/

Two different folders, two different ways of referencing files in code:

- **`public/`** — files copied as-is to the output root, untouched by Vite. Referenced by a plain string path (`<img src="/icons.svg" />`, `href="/favicon.svg"`). You cannot `import` a file from `public/` — Vite doesn't include it in the module graph at all.
- **`src/assets/`** — files imported like code (`import logo from '@/assets/logo.png'`). Vite processes these: content-hashes the filename for cache-busting, inlines small files as base64, tree-shakes anything unused.

**Rule of thumb:** if you `import` it, it goes in `assets/`. If you only ever reference it by a fixed URL string (favicon, `robots.txt`), it goes in `public/`. Default to `assets/` for anything used inside a component — it's safer and gets Vite's optimizations for free.

## Why folders start out empty (and what `.gitkeep` is for)

Git only tracks files, never directories — an empty folder is invisible to `git status` and never gets pushed. So placeholder folders (`assets`, `config`, `features`, `hooks`, `services`, `types`, `app/layouts`) each contain a `.gitkeep` — an empty file with no meaning to Git itself, used purely by convention to keep the folder visible in the repo until it has real content. **Delete the `.gitkeep` the moment a folder gets a real file** — it's dead weight after that.

## Why feature folders start flat, not with the full bulletproof-react subfolder set

A common React convention scaffolds every feature with `api/`, `components/`, `hooks/`, `stores/`, `types/`, `utils/` upfront. We deliberately didn't do that here — for the same reason we rejected the extra `HOMEROUTE` constant and rejected manual bundle chunking before measuring: **empty scaffolding is friction, not structure.** A feature that only needs one component and no API calls yet doesn't benefit from five empty folders someone has to remember to either fill in or clean up.

Instead, `src/features/auth/` (the first feature folder created) only has `components/` upfront — the one subfolder nearly every feature needs immediately. `api.ts`, `hooks.ts`, `types.ts` get added as flat files only once there's real content, and only get promoted to a folder (`api/` with multiple files) once a single file genuinely outgrows itself. This mirrors the same "start minimal, promote when it hurts" rule used for `app/pages/<name>.tsx` → `app/pages/<name>/index.tsx` once a page needs a co-located skeleton.

**Features never import from each other directly** — this is enforced by convention (not currently by lint), and matters because it keeps each feature deletable/replaceable without needing to trace cross-feature breakage. Anything two features need to share belongs in `components/`, `hooks/`, or `lib/` instead.

## Why `app/` exists, and what belongs in it

`src/app/` holds **app-wide wiring** — how the whole app boots and is assembled — not business logic and not reusable UI:

- `router.tsx` — the route tree
- `app.tsx` — root component, renders `RouterProvider`
- `layouts/` — shared page shells (e.g. `main-layout.tsx`)
- `pages/` — thin route-level pages, one per URL, each composing real logic from `features/`

Feature-specific logic → `features/<name>/`. Reusable UI primitives → `components/`. If it's about "how the app is wired together" rather than "one specific business feature," it belongs in `app/`.

## Why `pages/` and not `routes/`

Originally called `routes/`, renamed to `pages/` for clarity since `router.tsx` already exists in the same `app/` folder — having both "routes" and "router" as separate concepts read as confusing. Either name is valid; the point is picking one and being consistent (component/file names should match: a file in `pages/` exports a `*Page` component, e.g. `HomePage`).

## Why route paths live in `config/paths.ts`, not hardcoded strings

A `paths` object with `path` (the URL pattern used by the router) and `getHref()` (a function that builds a real URL, substituting dynamic segments) gives:

- One source of truth — rename a route once, everything using `paths.x.path` updates
- Type-safety and autocomplete instead of scattered magic strings
- A place to handle dynamic segments correctly (`/employees/:id` → `getHref(id)` builds the real link)

We deliberately **rejected** wrapping each path in an extra standalone constant (e.g. `const HOMEROUTE = '/'`) on top of the `paths` object — the object key (`paths.home`) is already the semantic name; a second constant is a second source of truth for the same value, which is the exact class of bug this pattern exists to prevent.

## Why environment variables are validated with Zod, not just typed

`src/vite-env.d.ts` gives **compile-time** types for `import.meta.env` (autocomplete, catches typos while coding) — but it doesn't check that a required variable actually exists in the real `.env` file at runtime. `src/config/env.ts` (`schema.parse(import.meta.env)`) closes that gap: if a required var is missing or malformed, the app throws a clear error immediately at startup instead of failing later, deep in some component, with a confusing `undefined`.

Both are needed — they check different things, at different times. Everywhere else in the app, import `env` from `@/config/env` instead of touching `import.meta.env` directly, so there's exactly one place reading raw env vars.

**Checklist for adding any new env var** — update all four together: `.env`, `.env.example`, `config/env.ts` schema, `vite-env.d.ts` interface.

Only variables prefixed `VITE_` are exposed to the browser — treat all of them as public. Never put real secrets in them.

## Why route-level pages are lazy-loaded via React Router's `lazy` field, not `React.lazy()`

Using `React.lazy()` directly inside `router.tsx` (assigning it to a local `const HomePage = lazy(...)`) broke ESLint's `react-refresh/only-export-components` rule — a file mixing a locally-defined component with a non-component export (`router`) confuses Fast Refresh boundaries. Switching to React Router's own `lazy: () => import('./pages/home').then(...)` route field avoids this (no local component variable needed) and is the more idiomatic approach for a data router — it also lazy-loads any loader/action defined in that module, not just the component.

## `HydrateFallback` vs `<Suspense fallback>` — these solve different moments, not the same thing

- **`<Suspense fallback>`** (wrapping `<Outlet />` in `main-layout.tsx`) — fires every time its children suspend: on first load _and_ on every later navigation to a not-yet-loaded lazy route.
- **`HydrateFallback`** (set per-route in `router.tsx`) — fires only once, during the very first page load, before anything has rendered yet. Required when a route has a `lazy`/`loader` field, otherwise React Router logs "No `HydrateFallback` element provided..." because it has nothing to show during that initial fetch.

Both are needed together for a route using `lazy`.

## Why `<main>` matters (and not just `<div>`)

Browser accessibility tools flag "Document does not have a main landmark" when structural regions use generic `<div>`s instead of semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`). Screen reader users rely on these to jump directly to a page's primary content instead of tabbing through every wrapper. `MainLayout`'s content region is wrapped in `<main>` for exactly this reason — add `<header>`/`<nav>` similarly once those components exist.

## Why `manualChunks` was added, and why it's a function, not an object

`vite-bundle-visualizer`/`npm run analyze` was set up early, and manual chunk splitting was initially skipped — the bundle was ~107 KB gzipped at the time, genuinely too small to justify guessing at a split before a real problem existed. It stopped being small: by the time `sonner`, `tooltip`, and other shadcn/Radix pieces were added, the single JS chunk crossed Vite's 500 KB (pre-gzip) warning threshold. At that size, splitting stops being premature optimization — a one-line app change was forcing every visitor to re-download all of React/Radix/etc. too, since everything shared one content hash.

`vite.config.ts`'s `build.rollupOptions.output.manualChunks` groups `react`/`react-dom`/`react-router-dom` into `react-vendor` and the Radix/shadcn-adjacent packages into `ui-vendor`, leaving genuinely app-specific code (plus smaller deps like `zod`/`sonner`) in the main chunk. Each group gets its own content hash, so deploying an app-only change no longer invalidates the vendor chunks' browser cache.

**Why it's written as a function** (`manualChunks(id) { ... }`) instead of Rollup's more common object shorthand (`manualChunks: { 'react-vendor': ['react', ...] }`): this project runs on Vite 8's Rolldown bundler, and Rolldown's TypeScript types for `manualChunks` only accept the function form — the object shorthand fails to type-check. This is the same "compatible subset of Rollup's API, not the full surface" caveat noted in `decision.md`'s Vite entry.

## `robots.txt` — currently allows crawling

`public/robots.txt` is set to `Allow: /`. If this ever needs to go back to blocking search engines (the more typical default for an internal, non-public tool like an HRMS), switch it to `Disallow: /` — see [README.md](README.md#robotstxt) for the exact syntax.

## Why `VITE_API_URL` is injected at Docker container _start_, not baked at build time

Vite normally bakes `VITE_*` env vars into the JS bundle at **build time** — a well-known SPA limitation, since the browser only ever runs the already-built JS, it can't re-read a `.env` file. The direct consequence: one built image is locked to whatever values it was built with, so promoting the exact same artifact from staging to production (with a different backend URL) means rebuilding the image just to change one string — defeating the point of "build once, deploy everywhere" that Docker images are supposed to give you.

**The fix used here** is the standard SPA runtime-config pattern: instead of `VITE_API_URL` living only inside the bundled JS, `index.html` loads a tiny `<script src="/env-config.js">` _before_ the app bundle, which sets `window.__ENV__ = { VITE_API_URL: '...' }`. `src/config/env.ts` prefers that runtime value over the build-time `import.meta.env.VITE_API_URL` if it's present (see the `runtimeApiUrl` merge in `env.ts`). In Docker, `docker/generate-env-config.sh` — an executable script nginx's official image automatically runs from `/docker-entrypoint.d/` right before starting nginx — overwrites the committed placeholder `public/env-config.js` with the container's real, current `VITE_API_URL`. Change `.env` and run `docker compose up` again (no `--build`), and the running container picks up the new backend URL immediately.

**Why only `VITE_API_URL` and not every `VITE_*` var:** it's the one value that genuinely differs per deployment (dev/stage/prod backend). `VITE_APP_NAME`/`VITE_APP_DESCRIPTION` are branding baked directly into `index.html`'s `<title>`/meta tags via Vite's own `%VAR%` HTML replacement at build time — true runtime injection for those would mean an extra `document.title = ...` script for near-zero real-world benefit (an app's name isn't expected to change between environments), so they were deliberately left build-time-only. `VITE_THEME_STORAGE_KEY` is just a `localStorage` key name — never expected to vary by deployment either.

**A known limitation of this approach, accepted deliberately:** `docker/generate-env-config.sh` builds `env-config.js` with a shell heredoc, wrapping the value in double quotes without JSON-escaping it. A `VITE_API_URL` containing a literal `"` character would break the generated JavaScript. URLs practically never contain unescaped double quotes, so this was judged an acceptable simplification for a starter template rather than reaching for a JSON-aware templating tool.

## Why `apiFetch` proxies through a fixed `/__api` marker in dev, not a plain `/api` prefix

The common Vite tutorial pattern is `proxy: { '/api': { target: '...' } }` — the frontend calls `/api/...`, and it forwards straight through, unchanged, to the backend. That works when you control both sides and deliberately make the frontend's path and the backend's real route match.

This is a template, so that assumption doesn't hold: the real `VITE_API_URL` might be a domain root (`https://dummyjson.com`, no path at all), `/api`, or `/api/v1` — unknown until someone fills in `.env`. Proxying on a literal `/api` prefix breaks the moment the real backend doesn't happen to use that exact prefix (as `dummyjson.com` doesn't) — requests silently go nowhere, or worse, get misinterpreted (see the `//products` → `ERR_NAME_NOT_RESOLVED` bug this replaced, caused by concatenating an empty proxy path with a leading-slash request path).

The fix: `apiFetch` always calls a fixed, made-up marker (`/__api/...`) that has no relationship to the real backend's path shape. `vite.config.ts` parses `VITE_API_URL` into an origin and a path prefix at dev-server startup, and rewrites `/__api/<x>` → `<real path prefix>/<x>` before forwarding. This decouples "what path does the frontend call" from "what path does the backend actually use" — the mapping is computed from `VITE_API_URL`, not hardcoded, so it's correct for any backend shape without editing `vite.config.ts` per project. See [dev.md](dev.md#calling-the-backend-api) for the worked examples.

## Why Jest needs a hand-written plugin for `import.meta.env`

Jest runs tests in Node via Babel/CommonJS, not through Vite — so it has no native understanding of `import.meta.env`, the Vite-specific syntax `src/config/env.ts` uses to read environment variables at import time. Without a fix, simply importing any component that (transitively) imports `env` crashes every test.

The fix is `babel-plugin-transform-import-meta-env.cjs`, a small custom Babel plugin that rewrites `import.meta` → `process` at transpile time, so `import.meta.env.VITE_APP_NAME` becomes `process.env.VITE_APP_NAME`. `jest.setup.cjs` then loads `.env` into `process.env` via `dotenv` (already present as a transitive dependency of Vite, so no new package needed) before each test file runs, so the rewritten reads resolve to real values — same source of truth as `npm run dev`.

We rejected mocking `@/config/env` in every test instead: that would work per-test but means every future component test needs its own env mock, and silently diverges from the real values the app actually runs with. Fixing it once, at the Jest-config level, means any component using `env` "just works" in tests with no per-test setup.

## Why `jest.setup.cjs` polyfills `crypto.randomUUID`

`src/skeletons/main-layout.tsx` calls `crypto.randomUUID()` to generate stable React `key`s for its placeholder lists (see the array-index-key discussion below/in git history). This works fine in real browsers and in Node directly — but Jest's `jsdom` test environment ships an incomplete `Crypto` implementation that only has `getRandomValues`, not `randomUUID`. Any test that renders a component using `crypto.randomUUID()` would crash with `crypto.randomUUID is not a function` without the polyfill in `jest.setup.cjs`, which fills in Node's real implementation when jsdom's is missing it. This was found by actually rendering the skeleton in a test, not by reading the jsdom changelog — a reminder to smoke-test any component that touches a Web API before assuming Jest supports it.

## Why asset imports (images/fonts) need a Jest mock

Vite understands `import logo from '@/assets/logo.png'` natively — it's part of its module graph. Jest is not Vite; when it hits that same import, it tries to load the binary file as a JS module and crashes. `jest.config.cjs`'s `moduleNameMapper` redirects any `.png/.jpg/.svg/.woff2/...` import to `test/__mocks__/fileMock.cjs`, which just exports a harmless string — tests don't care what the actual image looks like, only that the import doesn't blow up the module graph.

## Why test files live in `test/`, mirroring `src/`, instead of colocated

The more common React convention colocates a test next to the file it covers (`home.tsx` + `home.test.tsx` in the same folder), which also fits this repo's feature-sliced, deletable-by-folder architecture better in the abstract. This project deliberately uses a separate top-level `test/` folder instead, mirroring `src/`'s structure 1:1 (`src/app/pages/home.tsx` → `test/app/pages/home.test.tsx`) — a direct choice, not a default. If you're wiring up tests for a new file, mirror its `src/` path under `test/` rather than colocating.

## Why `vite.config.ts` uses `vite-plugin-compression2`, not `vite-plugin-compression`

The build emits pre-compressed `.gz` **and** `.br` siblings for every eligible asset (see `dist/assets/*.js.gz` / `*.js.br` after `npm run build`) — brotli compresses noticeably smaller than gzip for the same content, and hosts like Vercel/Netlify/CloudFront serve `.br` automatically with zero extra config.

This originally used `vite-plugin-compression` (unmaintained, last real release years old) with **two separate plugin instances** — one per algorithm — which is the obvious way to configure it and is exactly what the package's own README shows. It silently produced **zero `.br` files**, with no error, while still logging "compressed file successfully." The cause: that package keeps its file-dedup cache (`mtimeCache`) at **module scope**, not per-plugin-instance scope. Both `compression({algorithm:'gzip'})` and `compression({algorithm:'brotliCompress'})` import the same module, so they share one cache. The gzip instance's `closeBundle` hook runs first, stamps every file's path into the shared cache with `Date.now()`, and the brotli instance's `closeBundle` then sees each file's real (older) mtime as "already compressed" and skips it — every time, for every file, silently.

The fix was switching to `vite-plugin-compression2` (an actively maintained fork), which takes `algorithms: ['gzip', 'brotliCompress']` as an array in **one** plugin call instead of one instance per algorithm — sidestepping the shared-cache class of bug entirely by design, not just avoiding this one instance of it. **If `vite.config.ts` is ever refactored to call `compression()` more than once, verify the second call's output actually appears in `dist/` — a compression plugin silently doing nothing is easy to miss** since the build succeeds and logs look like success.

## Why the dead legacy CSS tokens in `styles/index.css` weren't just clutter — they were silently breaking the font

`styles/index.css` originally carried a second, unrelated set of design tokens (`--text`, `--bg`, `--code-bg`, `--accent-bg`, `--accent-border`, `--social-bg`, `--shadow`, `--sans`, `--heading`, `--mono`) alongside the real shadcn/Tailwind theme tokens (`--background`, `--foreground`, `--font-sans` in `@theme inline`, etc.) — leftovers from an unrelated template this project started from. None of them were referenced by `@theme inline` or any component (confirmed by grepping the whole `src/` tree), so on the surface this looked like ordinary dead code.

It wasn't just dead — it was **actively wrong**. The `:root` block set `font: 18px/145% var(--sans); color: var(--text); background: var(--bg);` directly, as **unlayered** CSS (a plain `:root { ... }` rule, not inside any `@layer`). Tailwind v4's `@import 'tailwindcss'` implicitly creates `@layer theme, base, components, utilities;`, and `@layer base { html { @apply font-sans; ... } }` is where the _real_ font (`--font-sans: 'Inter Variable'`) was supposed to apply to `<html>`. Per the CSS Cascade Layers spec, **unlayered declarations always beat layered ones**, regardless of selector specificity or source order — so the dead `var(--sans)` (`system-ui, 'Segoe UI', Roboto, sans-serif`) was silently winning over the real Inter Variable font-family on every page load. Confirmed by inspecting the built CSS before/after: `html{...font-family:Inter Variable,sans-serif}` only appears uncontested after removing the competing `:root` declaration.

The fix kept the tokens that are genuinely real and used (`--border`, `--accent` — both feed `@theme inline`), kept the real global rendering settings unrelated to the dead palette (`font-size`/`line-height`/`letter-spacing`/`color-scheme`/font-smoothing), and removed everything else. **Lesson for this codebase: when custom CSS lives outside Tailwind's `@layer` system, it silently wins over every themed utility class targeting the same element — if a Tailwind utility "isn't working," check for unlayered CSS on the same selector before assuming the utility itself is broken.**

## Why nginx has security headers but no Content-Security-Policy

`nginx.conf` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` unconditionally — they're safe defaults for any app, cost nothing, and don't depend on what the app actually does. A `Content-Security-Policy` was deliberately **not** added: a correct CSP needs to list every real origin the app talks to (script/style/connect sources), and this template's backend origin (`VITE_API_URL`) is only known at deploy time — it can even differ per container thanks to the runtime env injection above. Hardcoding a CSP here risks silently breaking `apiFetch` calls in some deployment with a `connect-src` violation that's invisible until someone opens devtools. Add a CSP once a project using this template has fixed, known origins.

## Why nginx, and why two Dockerfile stages

After `vite build`, the app is just static files (HTML/JS/CSS) — no Node.js process needs to keep running. nginx is a small, fast, purpose-built static file server. The `Dockerfile` uses two `FROM` stages: stage 1 (`node:24-alpine`) only exists to run `npm ci && npm run build`; stage 2 (`nginx:alpine`) starts completely fresh and copies over _only_ the built `dist/` output, discarding the entire Node toolchain. This keeps the final shipped image small.

`nginx.conf` overrides nginx's default config with one line that matters: `try_files $uri $uri/ /index.html;` — without it, visiting or refreshing any client-side route (e.g. `/employees`) would 404, since nginx has no idea React Router exists and would look for a literal file at that path.
