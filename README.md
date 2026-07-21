# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Documentation

- [onboarding.md](onboarding.md) — **start here if you're new.** A plain-language walkthrough of the whole app: setup, project structure, theming, testing, environment variables, and day-to-day tips, in one place.
- [codebase-tour.md](codebase-tour.md) — the deep dive: every important file explained with _the problem it solves → the fix → a concrete example → when you'd touch it_. Read after onboarding when you want to truly understand the app.
- [dev.md](dev.md) — day-to-day developer guide: running the app, project structure, adding a feature/route, what happens on commit, CI, Docker usage
- [learning.md](learning.md) — the reasoning behind non-obvious decisions in this codebase (why things are structured the way they are)
- [decision.md](decision.md) — why this project uses the tools/frameworks it does, and what alternatives were considered

## Project Structure

```
src/
├── app/            # app-wide wiring: root component, router, providers
│   ├── layouts/    # shared page shells (e.g. main layout with header/sidebar)
│   └── pages/      # thin route-level pages, one per URL, composed from features/
├── assets/         # images/icons/fonts imported into components (import x from '@/assets/...')
├── components/     # reusable UI primitives shared across features
├── config/         # app-wide configuration/constants
├── features/       # business features, one folder per feature (e.g. auth/, employees/)
├── hooks/          # shared React hooks used across features
├── lib/            # framework-agnostic utilities/helpers
├── services/       # API clients / external service integrations
├── skeletons/       # loading-state components, mirroring pages/ by name
├── styles/         # global stylesheets
└── types/          # shared TypeScript types
```

See [dev.md](dev.md#structuring-a-feature-folder) for how to structure the contents of an individual feature folder.

### Why some folders look empty

Some of the folders above start out empty on purpose — placeholders for where that kind of code should go as the app grows. Currently only `assets/` and `types/` still are; `config/`, `hooks/`, `services/`, and `app/layouts/` already have real files (`api-client.ts` in `services/`, see [dev.md](dev.md#calling-the-backend-api), for example).

Git does not track empty directories — it only tracks files, so a folder with nothing in it is invisible to `git status` and never gets pushed. To keep these placeholder folders visible in the repo before they have real content, each one contains a `.gitkeep` file — an empty file with no special meaning to Git itself, used purely by convention to keep the folder tracked.

**Once you add a real file to one of these folders, delete its `.gitkeep`** — it's no longer needed once the folder isn't empty.

## Environment Variables

Environment variables are validated at runtime with [Zod](https://zod.dev) in [src/config/env.ts](src/config/env.ts), and typed at compile time in [src/vite-env.d.ts](src/vite-env.d.ts). If a required variable is missing or invalid, the app throws a clear error immediately at startup instead of failing later with a confusing `undefined`.

Only variables prefixed with `VITE_` are exposed to the browser — treat them as public and never put real secrets (passwords, private keys) in them.

`.env` is gitignored (never commit it); `.env.example` is committed and lists every variable with a placeholder value, so anyone cloning the repo knows what to set.

Everywhere else in the app, import `env` from `@/config/env` instead of reading `import.meta.env` directly, so there's a single validated source of truth.

**When adding a new environment variable, update all four of these together:**

1. `.env` — your local value
2. `.env.example` — a placeholder value, committed
3. `src/config/env.ts` — add it to the Zod `schema`
4. `src/vite-env.d.ts` — add it to the `ImportMetaEnv` interface

## robots.txt

[public/robots.txt](public/robots.txt) tells search engine crawlers which pages they may or may not index. It currently allows crawling (`Allow: /`).

If this is ever an internal-only tool that shouldn't be indexed, switch it to block crawlers instead:

```
User-agent: *
Disallow: /
```

## Docker

```
docker compose up --build   # build the image (reads .env automatically) and run it on http://localhost:8080
docker compose down          # stop and remove the container
docker compose logs -f       # follow logs
```

The [Dockerfile](Dockerfile) is a two-stage build: a Node stage builds the static production files, then an nginx stage (configured via [nginx.conf](nginx.conf)) serves them, including the fallback needed for client-side routing (`try_files ... /index.html`).

`VITE_API_URL` is injected when the **container starts**, not baked at build time — [docker-compose.yml](docker-compose.yml) passes the runtime value via `environment:`, and [docker/generate-env-config.sh](docker/generate-env-config.sh) writes it into `public/env-config.js` on every container start. Changing `.env` and running `docker compose up` again (no `--build`) is enough. `VITE_APP_NAME`/`VITE_APP_DESCRIPTION` are still baked in at **build time** (they're branding, not per-deployment config) — see [dev.md](dev.md#docker) and [learning.md](learning.md) for the full mechanics and reasoning.

## Linting

To check the project for lint issues, run:

```
npx eslint .
```

(equivalent to `npm run lint`, defined in `package.json`)

## Testing

This project uses Jest + React Testing Library. Tests live in a top-level `test/` folder that mirrors `src/`'s structure (e.g. a test for `src/app/pages/home.tsx` lives at `test/app/pages/home.test.tsx`).

```
npm run test           # run the test suite once
npm run test:watch     # re-run on file changes
npm run test:coverage  # run once + print a coverage report
```

See [dev.md](dev.md#testing) for how to write a test, and [learning.md](learning.md#why-jest-needs-a-hand-written-plugin-for-importmetaenv) for why the setup needs a custom Babel plugin and a mirrored `test/` folder instead of colocated tests.

## Bundle Analysis

To visualize what's taking up space in the production bundle, run:

```
npm run analyze
```

This builds the app and opens an interactive treemap of every package/module included in the final bundle. Useful for deciding whether something like manual chunk splitting is actually worth doing — check this before optimizing, not instead of it.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## ESLint Configuration

[eslint.config.js](eslint.config.js) uses type-aware linting (`tseslint.configs.recommendedTypeChecked`) plus React-specific rules (`eslint-plugin-react-x`, `eslint-plugin-react-dom`) on top of the base recommended rules — since type-aware checks use the real TypeScript compiler (not just syntax parsing), they catch things plain linting can't, like floating/unhandled promises and unsafe `any` usage. This is why `npx eslint .` is noticeably slower than a typical ESLint run — it's type-checking every file, not just parsing it.
