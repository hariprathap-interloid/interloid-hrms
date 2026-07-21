# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vite + React 19 + TypeScript starter template for an internal HRMS app ("Interloid"). Styling is Tailwind CSS v4 + shadcn/ui + Radix. Routing is React Router v7. The React Compiler is enabled (via a Babel preset in `vite.config.ts`), so manual `useMemo`/`useCallback` are usually unnecessary.

## Commands

```
npm run dev       # dev server on http://localhost:5173
npm run build     # tsc -b (type-check) then vite build → dist/
npm run lint      # eslint . — type-aware, so slow (runs the TS compiler on every file)
npm run preview   # serve the production build locally
npm run analyze   # build + open an interactive bundle-size treemap
```

Before committing, the pass gate is: `npx tsc -b && npx eslint .`. There is no test runner configured.

Node version is pinned to `24.15.0` (`.nvmrc`, `package.json engines`).

## Path alias

`@/` resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`). Always import via `@/...`, not relative paths across folders.

## Architecture

Feature-sliced. The three layers that matter:

- `src/app/` — wiring only. `router.tsx` (route table), `layouts/` (shared shells rendered via `<Outlet />`), and `pages/` (thin route components that just compose a feature — no business logic here).
- `src/features/<name>/` — one folder per business capability. This is where real logic lives. Start flat (`api.ts`, `hooks.ts`, `types.ts` as single files); promote a file to a folder only when it outgrows one file. `components/` is the one subfolder created upfront.
- Shared code — `src/components/` (reusable UI, incl. shadcn/ui in `components/ui/`), `src/hooks/`, `src/lib/` (framework-agnostic helpers), `src/services/` (API clients), `src/skeletons/` (loading states that mirror `pages/` by name).

**Hard rule: features must never import from another feature.** Shared code goes to `components/`/`hooks/`/`lib/` instead, so each feature stays deletable in isolation.

**Global rule (from user config): always build reusable components in `src/components/` — never define new components inline inside a page file.**

## Adding a route

1. Build the feature in `src/features/<name>/`.
2. Add the path + `getHref()` to `src/config/paths.ts`.
3. Add a thin page in `src/app/pages/<name>.tsx` that renders the feature.
4. (Optional) Add a matching skeleton in `src/skeletons/<name>.tsx`.
5. Register in `src/app/router.tsx` using the `lazy` field + `HydrateFallback` (copy the existing `home` route — routes are code-split via `lazy: () => import(...)`).

## Environment variables

Env is validated at startup with Zod in `src/config/env.ts` and thrown on early if invalid. Import `env` from `@/config/env` everywhere — never read `import.meta.env` directly. Only `VITE_`-prefixed vars reach the browser (treat as public).

When adding a var, update all four together: `.env`, `.env.example`, the Zod schema in `src/config/env.ts`, and `ImportMetaEnv` in `src/vite-env.d.ts`.

## Adding UI primitives

Use the shadcn CLI (`npx shadcn add <component>`) rather than hand-rolling base components. Config is in `components.json`.

## Commit behavior

Husky pre-commit runs `lint-staged` on staged files only: `.{js,jsx,ts,tsx}` get `prettier --write` then `eslint` (an unfixable lint error blocks the commit); `.{json,md,css}` get `prettier --write`. Expect staged files to be reformatted as part of committing.

## Docker

`docker compose up --build` builds (Node build stage → nginx serve stage, config in `nginx.conf`) and serves on `:8080`. **Env vars are baked in at build time, not container start** — changing `.env` requires a rebuild, not just a restart.

## Further reading

`dev.md` (day-to-day how-to), `learning.md` (why the structure is this way), `decision.md` (tool/framework choices and alternatives considered).
