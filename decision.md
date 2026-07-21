# Decision Log

Why this project uses the tools/frameworks it does, and what the alternatives were. Some of these were already in place when this project started (marked "pre-existing"); others were chosen deliberately during setup (marked "chosen").

## Vite (pre-existing)

**Alternatives considered:** Create React App (deprecated, no longer maintained), Webpack-based custom setup, Next.js.

**Why Vite:** near-instant dev server startup and hot module reload (uses native ES modules in dev, doesn't bundle everything upfront like Webpack/CRA). Since this is a client-only SPA (no need for server-side rendering or file-based routing), a full framework like Next.js would add complexity (server runtime, different routing model) this project doesn't need. This project is additionally on **Vite 8**, which defaults to **Rolldown** (a Rust-based bundler) instead of classic Rollup — faster builds. `manualChunks` was later added once the bundle actually warranted it, written as a function since Rolldown's types don't accept Rollup's object shorthand (see [learning.md](learning.md)).

## React 19 + React Compiler (pre-existing)

**Why React:** the team's existing familiarity and the ecosystem size (component libraries, routing, tooling) outweigh alternatives (Vue, Svelte) for a business app like an HRMS where velocity and hiring pool matter more than marginal performance differences.

**Why the React Compiler is enabled:** automatically memoizes components/values that would otherwise need manual `useMemo`/`useCallback`/`React.memo`, reducing a common class of manual-optimization bugs and boilerplate. Trade-off acknowledged in the README: it impacts dev/build performance somewhat — acceptable for the correctness/ergonomics benefit at this project's current size.

## TypeScript (pre-existing)

**Why:** an HRMS app handles structured, sensitive data (employee records, leave balances, payroll-adjacent info) — compile-time type safety catches a meaningful class of bugs (wrong field names, null/undefined handling, mismatched API shapes) before they reach production. `strict: true` plus `noUncheckedIndexedAccess` are enabled in `tsconfig.app.json` for the stricter end of type safety.

## Tailwind CSS + shadcn/ui + Radix (pre-existing)

**Alternatives considered:** CSS Modules, styled-components, a full component library (MUI, Ant Design).

**Why this combination:** Tailwind avoids hand-writing/maintaining separate CSS files per component and keeps styling co-located with markup. shadcn/ui isn't a traditional npm dependency — it's a CLI (`npx shadcn add <component>`) that copies component source directly into `src/components/ui/`, built on Radix UI's accessible, unstyled primitives. This means components are **fully owned and editable** in the codebase rather than living as an opaque `node_modules` dependency — important for an internal app likely to need custom behavior/branding over time, without fighting a library's API surface.

## React Router (chosen)

**Alternatives considered:** TanStack Router, `vite-plugin-pages`, plain manual state-based routing.

**Why React Router:** it's the most established routing library for React, with the largest ecosystem and hiring-familiarity. The newer "data router" API (`createBrowserRouter`) supports nested layouts, per-route lazy-loading (`lazy` field), loaders/actions, and `HydrateFallback` — everything this project needed without extra packages.

**Why not TanStack Router:** its fully type-safe, file-based routing is genuinely excellent and arguably the more "modern" choice for a pure Vite app — but it introduces a new mental model (folder structure _is_ the route tree) and was judged unnecessary complexity for this app's current size. Documented as the natural upgrade path if the app grows large enough that manual route registration in `router.tsx` becomes unwieldy, or if route-level type safety becomes a priority.

**Why not `vite-plugin-pages`:** less actively maintained than TanStack Router, and doesn't offer a meaningfully simpler experience than manually maintaining `router.tsx` at this project's size.

## Path constants module (`config/paths.ts`) over hardcoded strings or env vars (chosen)

Considered and rejected: storing route paths as environment variables. Env vars exist for values that differ between deployment environments (API URLs, secrets) — a route path like `/employees` is identical in every environment, so it's not configuration, it's part of the app's fixed structure. A typed constants object gives the same "single source of truth" benefit with compile-time safety, which env vars cannot provide (Vite stringifies all env values, losing type information). See [learning.md](learning.md) for the full reasoning, including why we also rejected adding a _second_ redundant constant per path (e.g. `HOMEROUTE`) on top of the `paths` object.

## Zod for environment variable validation (chosen)

**Alternatives considered:** no validation (raw `import.meta.env` access), a hand-written validation function (zero dependencies), `envalid`, `valibot`, `@t3-oss/env-core`.

**Why Zod:** validates env vars at runtime (fails loudly at startup if a required variable is missing/malformed) rather than failing silently later with a confusing `undefined`. Chosen over a zero-dependency hand-written function because Zod is very likely to be reused elsewhere in an HRMS app anyway — form validation, API response validation — making the dependency cost worth it. Chosen over `envalid`/`valibot`/`@t3-oss/env-core` because those are narrower/less standard for a project that will likely need general-purpose schema validation beyond just env vars.

## Jest for testing (chosen)

**Alternatives considered:** Vitest, no test runner at all.

**Why Jest:** requested directly for this project. It's the most widely known React test runner, with the largest ecosystem and the biggest hiring-familiarity pool — a safe default for an internal app.

**Why not Vitest (the honest trade-off):** Vitest is arguably the more natural fit for a Vite project — it reuses Vite's own config and transform pipeline, so it understands `@/` aliases and `import.meta.env` out of the box with almost no setup. Choosing Jest instead meant adding a small amount of glue that Vitest would have given for free: a separate Babel config, a tiny hand-written plugin to translate `import.meta.env` for Jest, and manual mocks for CSS/asset imports (see [dev.md](dev.md#testing) and [codebase-tour.md](codebase-tour.md#14-the-testing-setup--file-by-file)). That glue is written once and stable, so the trade was judged acceptable. **If test config maintenance ever becomes a burden, migrating to Vitest is the documented upgrade path.**

## `vite-bundle-visualizer` over `rollup-plugin-visualizer` (chosen)

**Why:** `rollup-plugin-visualizer` hooks into Rollup's plugin API specifically. Since this project runs on Vite 8's Rolldown-based bundler (which implements only a compatible _subset_ of Rollup's plugin API), compatibility wasn't guaranteed. `vite-bundle-visualizer` is Vite-native and doesn't assume Rollup internals, making it the safer choice for this specific setup.

## Docker + nginx for deployment (chosen)

**Alternatives considered:** serving the built app with a Node.js static-file server (e.g. `serve`, or a minimal Express server) inside the container; deploying without Docker at all (static hosting platforms like Vercel/Netlify/Cloudflare Pages, which don't need a container).

**Why Docker:** packages the app with everything needed to run it identically across machines/environments — removes "works on my machine" drift, and gives a portable artifact deployable to any Docker-compatible host (a VPS, ECS, Cloud Run, etc.) rather than being tied to one specific static-hosting provider.

**Why nginx over a Node-based static server inside the container:** after `vite build`, the app is pure static files — no JavaScript runtime is needed to serve them. nginx is purpose-built for this, is extremely lightweight (`nginx:alpine` is roughly 40 MB vs. carrying a full Node runtime + `node_modules` for no reason), and is the industry-standard choice for this exact job. The `Dockerfile` uses a two-stage build specifically so the Node.js build toolchain (needed only to _produce_ the static files) is discarded entirely from the final shipped image.

**Why a custom `nginx.conf` was required:** nginx's default config doesn't know this is a single-page app using client-side routing — without `try_files $uri $uri/ /index.html;`, visiting or refreshing any route other than `/` would 404, since nginx would look for a literal file at that path instead of letting React Router handle it.

**Why Docker Compose on top of a plain `Dockerfile`:** avoids retyping long `docker build --build-arg ...` commands by hand every time — Compose reads `.env` automatically and reuses those values, matching the same file the app already uses for local development.

## Not yet decided / open

- **Auth strategy** — not yet designed (session-based vs. token-based, which provider/library) — will need its own decision entry once addressed.
- **Data-fetching library** — a base `fetch` wrapper exists (`services/api-client.ts`), but whether to add a data-fetching/caching layer on top (TanStack Query) vs. staying with plain `apiFetch` is not yet decided; will depend on the backend API's shape once known.
- **Container registry / hosting platform** for actual deployment — not yet chosen.
