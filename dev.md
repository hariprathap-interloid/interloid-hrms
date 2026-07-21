# Developer Guide

Practical day-to-day instructions for working in this repo. For _why_ things are structured this way, see [learning.md](learning.md). For _why we picked_ a given tool/framework, see [decision.md](decision.md).

## Running the app

```
npm install          # first time only, or after pulling dependency changes
npm run dev           # start the dev server (http://localhost:5173)
```

Before running for the first time, copy the env template and fill in real values:

```
cp .env.example .env
```

Other scripts:

```
npm run build         # type-check + production build → dist/
npm run preview        # serve the production build locally, for a final sanity check
npm run lint           # run ESLint (npx eslint . is equivalent)
npm run analyze        # build + open an interactive bundle-size treemap
npm run test           # run the Jest test suite
npm run test:watch     # run Jest in watch mode
```

## Project structure — where does my code go?

```
src/
├── app/            # app-wide wiring: root component, router, providers
│   ├── layouts/    # shared page shells (header/sidebar wrappers)
│   └── pages/      # thin route-level pages, composed from features/
├── assets/         # images/icons/fonts you `import` into components
├── components/     # reusable UI primitives shared across features (e.g. shadcn/ui)
├── config/         # app-wide configuration/constants (paths.ts, env.ts)
├── features/       # business features, one folder per feature
├── hooks/          # shared React hooks used across features
├── lib/            # framework-agnostic utilities/helpers
├── services/       # API clients / external service integrations
├── skeletons/       # loading-state components (mirrors pages/ by name)
├── styles/         # global stylesheets
└── types/          # shared TypeScript types
```

## Structuring a feature folder

Each feature under `src/features/<name>/` starts **minimal** and grows only what it needs — don't scaffold empty subfolders upfront. Example, `src/features/auth/`:

```
features/auth/
└── components/     # feature-specific UI (login form, etc.) — created now
    api.ts           # add only once auth has real API calls
    hooks.ts          # add only once auth has real hooks
    types.ts          # add only once auth has real types
```

Rule: **start as flat files** (`api.ts`, `hooks.ts`, `types.ts`) directly inside the feature folder. Only promote a file to a folder (`api/` containing multiple files) once it genuinely outgrows a single file. `components/` is the one subfolder created upfront since almost every feature needs at least one component.

**Features must never import from another feature directly.** If two features need to share something (a formatting helper, a shared UI piece), that shared code belongs in `components/`, `hooks/`, or `lib/` — not cross-imported feature-to-feature. This keeps each feature deletable/replaceable in isolation without hunting down cross-feature breakage.

## When to modify a feature vs. add a new one

- **Modifying existing behavior on a page that already exists** → find its feature folder under `src/features/<name>/` and edit there. If the page itself just composes/renders the feature, you usually won't touch `src/app/pages/` at all.
- **Adding a brand-new business capability** (e.g. "leave requests"): create `src/features/leave-requests/`, build the feature there, then:
  1. Add a route-level page in `src/app/pages/leave-requests.tsx` that imports and renders the feature
  2. Add the URL to `src/config/paths.ts`
  3. Register the route in `src/app/router.tsx` (use the `lazy` field, matching the existing `home` route)
  4. If the page needs a loading skeleton, add one in `src/skeletons/leave-requests.tsx`, matching the real page's layout
- **Adding a small reusable UI piece used by multiple features** (a button variant, a modal) → `src/components/ui/` or `src/components/`, not inside a feature folder.
- **Adding logic reused by multiple features but not generic UI** (a formatting helper, a custom hook) → `src/lib/` or `src/hooks/`.

## Composing components

- Route-level pages in `app/pages/` should stay thin — import and render the real UI from `features/`, don't build business logic directly in a page file.
- Shared layouts (`app/layouts/main-layout.tsx`) wrap every page via React Router's nested routes (`<Outlet />`) — don't repeat header/sidebar JSX in every page.
- Prefer composing small components together over adding props/flags to one large component. If a component needs a loading state, give it a matching skeleton component rather than a generic spinner, so the layout doesn't shift once real content loads.
- Use the shadcn/ui CLI to add new base primitives rather than hand-rolling them: `npx shadcn add <component>`.

## Environment variables

Whenever you add a new `VITE_*` variable, update all four of these together (see [README.md](README.md#environment-variables) for details):

1. `.env` — your local value
2. `.env.example` — placeholder value, committed
3. `src/config/env.ts` — add it to the Zod schema
4. `src/vite-env.d.ts` — add it to `ImportMetaEnv`

Import `env` from `@/config/env` in your code — never read `import.meta.env` directly elsewhere.

## Calling the backend API

Always go through `apiFetch` in [src/services/api-client.ts](src/services/api-client.ts) — never call the backend with a raw `fetch`/`axios` elsewhere.

```ts
import { apiFetch } from '@/services/api-client'

const response = await apiFetch('/employees')
```

**The only thing you configure is `VITE_API_URL` in `.env`.** Nothing in `vite.config.ts` or `api-client.ts` needs editing, no matter what the real backend's URL looks like — domain root, `/api`, `/api/v1`, anything.

```
VITE_API_URL=https://your-real-backend.com/whatever/path
```

How the zero-config part works:

- **Dev** (`npm run dev`): `apiFetch` actually calls a fixed internal path, `/__api/...`. `vite.config.ts` reads `VITE_API_URL` fresh every time the dev server starts, splits it into an origin (`https://your-real-backend.com`) and a path prefix (`/whatever/path`), and its `server.proxy` rewrites `/__api/employees` → `/whatever/path/employees` before forwarding to that origin. The browser only ever talks to `localhost:5173` (same-origin), so this avoids CORS entirely in dev — no backend CORS config needed just to develop locally.
- **Prod** (built with `npm run build`): `apiFetch` calls `VITE_API_URL` directly. `import.meta.env.DEV` is a Vite-provided flag (`true` in dev, `false` in a real build) that switches between the two — nobody sets it by hand. Since this is a genuine cross-origin request unless frontend and backend happen to share a domain, the backend needs CORS configured to allow the frontend's origin (`Access-Control-Allow-Credentials: true` too, if using cookies — `apiFetch` sends `credentials: 'include'` by default).

Nobody edits `vite.config.ts` per-project — the only input is `VITE_API_URL`, read fresh from `.env` every time `npm run dev` starts. Whatever value is in `.env`:

| `.env` value                   | `apiUrl.origin`         | `apiPath` | Result                                                        |
| ------------------------------ | ----------------------- | --------- | ------------------------------------------------------------- |
| `https://dummyjson.com`        | `https://dummyjson.com` | `""`      | `/__api/products` → `https://dummyjson.com/products`          |
| `http://localhost:3000/api/v1` | `http://localhost:3000` | `/api/v1` | `/__api/employees` → `http://localhost:3000/api/v1/employees` |
| `https://api.acme.com/v2`      | `https://api.acme.com`  | `/v2`     | `/__api/users` → `https://api.acme.com/v2/users`              |

Worked example — `VITE_API_URL=https://dummyjson.com` (no path at all) and `apiFetch('/products')`:

| Environment | Actual request                                                                                |
| ----------- | --------------------------------------------------------------------------------------------- |
| Dev         | `http://localhost:5173/__api/products` → proxy rewrites to → `https://dummyjson.com/products` |
| Prod        | `https://dummyjson.com/products` directly                                                     |

Change `VITE_API_URL` to `http://localhost:3000/api/v1` instead, and the same `apiFetch('/products')` call resolves to `http://localhost:3000/api/v1/products` in both dev (via the proxy) and prod (directly) — no code changes anywhere.

## Testing

Tests run on Jest and live in a top-level `test/` folder that mirrors `src/`'s structure — a test for `src/app/pages/home.tsx` goes to `test/app/pages/home.test.tsx`, a test for `src/features/auth/hooks.ts` goes to `test/features/auth/hooks.test.ts`, and so on.

```
npm run test           # run once
npm run test:watch     # re-run on file changes
npm run test:coverage  # run once + print a coverage table + write coverage/ (gitignored)
```

Writing a test:

- Import the file under test via the `@/` alias, not a relative path (`import HomePage from '@/app/pages/home'`) — `jest.config.cjs` maps `@/` to `src/` the same way Vite/TS do.
- Use `@testing-library/react`'s `render`/`screen` to render components and query the DOM; `@testing-library/jest-dom` matchers (`.toBeInTheDocument()`, `.toHaveTextContent()`, etc.) are available globally, no per-file import needed.
- `src/config/env.ts` (and anything that imports it) works in tests as-is — `.env` is loaded automatically before each test file runs, so `env.VITE_APP_NAME` etc. resolve to your real local values.
- Importing an asset (`import logo from '@/assets/logo.png'`) also works as-is in tests — it resolves to a harmless string stub instead of trying to parse the real binary file.

Relevant config files, all at the project root:

- `jest.config.cjs` — test environment (`jsdom`), the `@/` alias mapping, CSS/asset-import mocking, coverage settings, and where test files live (`test/**/*.test.[jt]s?(x)`)
- `babel.config.cjs` — Babel presets Jest uses to transpile TS/TSX (separate from `vite.config.ts`'s own Babel plugin, which only runs the React Compiler at build time)
- `jest.setup.cjs` — runs before every test file: loads `.env` into `process.env`, registers `@testing-library/jest-dom` matchers, and polyfills `crypto.randomUUID` (jsdom doesn't implement it, unlike real browsers/Node)
- `babel-plugin-transform-import-meta-env.cjs` — a small hand-written Babel plugin; see [learning.md](learning.md#why-jest-needs-a-hand-written-plugin-for-importmetaenv) for why it exists
- `test/__mocks__/fileMock.cjs` — the string stub every image/font import resolves to during tests

None of these files are auto-generated by `npm install` or any CLI — they're checked into the repo and only need editing if you change how tests run (e.g. adding a new path alias).

ESLint also recognizes Jest's globals (`describe`, `it`, `expect`, ...) specifically inside `test/**` — see the last block in `eslint.config.js`.

## What happens when you commit

A Husky pre-commit hook runs automatically on every `git commit`:

```
npx lint-staged
```

`lint-staged` (configured in `package.json`) only touches files you've actually staged:

- `*.{js,jsx,ts,tsx}` → runs `prettier --write` then `eslint`
- `*.{json,md,css}` → runs `prettier --write`

**What this means in practice:**

- Your staged files get auto-formatted before the commit completes — don't be surprised if `git diff` looks slightly different after committing than what you wrote.
- If ESLint finds an error it can't auto-fix, **the commit is blocked** until you fix it. Read the error, fix the code, `git add` again, and re-commit.
- This only checks staged files, not your whole codebase — running `npm run lint` manually checks everything.

## Continuous Integration (CI)

A GitHub Actions workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs automatically on every push and pull request targeting `main`. It runs the same pass gate you're expected to run locally — type-check, lint, test, build — on GitHub's servers, independent of anyone's machine:

1. `npx tsc -b` — type-check
2. `npx eslint .` — lint
3. `npm run test` — run the Jest suite
4. `npm run build` — production build

**Why this exists:** the pre-commit hook (above) only checks _staged files_ on _your_ machine, and only if you actually commit through Git (not, say, a GitHub web edit). CI is the backstop that catches everything else — a full-repo check that can't be skipped and blocks a PR from looking mergeable if it fails.

Before the build step, CI copies `.env.example` to `.env` — the app's env validation (`src/config/env.ts`) requires real values to even start, and CI has no access to your local `.env` (it's gitignored, on purpose — see [decision.md](decision.md)). The placeholder values in `.env.example` are enough to satisfy type-check/lint/test/build; CI isn't deploying anything, so it doesn't need real secrets.

**Nothing to configure** — no secrets, no external accounts. It runs the moment this file is pushed to GitHub.

## Docker

```
docker compose up --build   # build the image (reads .env automatically) + run it on :8080
docker compose down          # stop and remove the container
docker compose logs -f       # follow logs
```

**`VITE_API_URL` is injected at container _start_, not build time** — change it in `.env` and run `docker compose up` again; **no rebuild needed**. This is what lets one built image be deployed to dev/stage/prod with different backend URLs. Mechanics: `docker/generate-env-config.sh` runs automatically when the container starts (nginx's official image auto-runs every script in `/docker-entrypoint.d/`) and writes the real `VITE_API_URL` into `public/env-config.js`, which `index.html` loads before the app — see `src/config/env.ts` and [learning.md](learning.md) for the full reasoning.

**`VITE_APP_NAME` and `VITE_APP_DESCRIPTION` are still baked in at Docker _build_ time** — they're branding (the page `<title>`/meta description), not something that should differ per deployment, so changing them still requires `docker compose up --build`.

## Adding a new route — quick checklist

1. `src/features/<name>/` — build the actual feature
2. `src/config/paths.ts` — add the path + `getHref()`
3. `src/app/pages/<name>.tsx` — thin page composing the feature
4. `src/skeletons/<name>.tsx` — matching loading skeleton (optional, add when the page is non-trivial)
5. `src/app/router.tsx` — register the route using the `lazy` field + `HydrateFallback`
6. Run `npx tsc -b && npx eslint .` before committing
