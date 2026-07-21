# Onboarding — Start Here

Welcome! This is a plain-language walkthrough of the whole app, written for someone joining the project for the first time. It doesn't assume you already know where things are — it tells you.

If you want the short day-to-day reference instead, see [dev.md](dev.md). If you want to know _why_ something was built a certain way, see [learning.md](learning.md). This file is the "explain it to me like I just joined" version — it repeats some of what's in those files, on purpose, so you don't have to jump around on day one.

## What this app is

**Interloid** is an internal HR management system (HRMS). It's built with:

- **React 19** — the UI library
- **Vite** — the tool that runs the dev server and builds the app for production (fast, modern alternative to older tools like Create React App)
- **TypeScript** — JavaScript with types, catches bugs before you even run the code
- **Tailwind CSS v4** — utility classes for styling (`className="flex gap-2 p-4"` instead of writing separate CSS files)
- **shadcn/ui + Radix** — pre-built, accessible UI components (buttons, dropdowns, dialogs) that you copy into your own codebase and can freely edit
- **React Router v7** — handles page navigation (URLs like `/employees`, `/leave-requests`)

## Getting it running for the first time

```
npm install                 # installs everything listed in package.json
cp .env.example .env        # copy the env template, then fill in real values
npm run dev                  # starts the dev server
```

Open the URL it prints (usually `http://localhost:5173`).

**Node version matters here.** This project is pinned to Node `24.15.0` (see `.nvmrc`). If you use `nvm`, run `nvm use` in this folder before installing.

## The other commands you'll actually use

| Command                 | What it does                                                              |
| ----------------------- | ------------------------------------------------------------------------- |
| `npm run dev`           | Start the dev server (hot-reloads as you edit)                            |
| `npm run build`         | Type-check everything, then build for production into `dist/`             |
| `npm run lint`          | Check the whole codebase for lint issues                                  |
| `npm run test`          | Run all tests once                                                        |
| `npm run test:watch`    | Run tests, and re-run automatically as you edit                           |
| `npm run test:coverage` | Run tests and print how much of the code is covered                       |
| `npm run preview`       | Serve the production build locally, to sanity-check it                    |
| `npm run analyze`       | Build and open a visual map of what's taking up space in the final bundle |

Before you commit anything, the project expects `npx tsc -b && npx eslint .` to pass with no errors. (More on what happens automatically when you commit, further down.)

## Where things live (project structure)

```
src/
├── app/            # how the app is wired together — router, layouts, route pages
│   ├── layouts/    # shared page shells (e.g. header + sidebar wrapper)
│   └── pages/      # one file per URL — thin, just renders a feature
├── assets/         # images/icons/fonts you import into components
├── components/     # reusable UI building blocks used across the whole app
│   └── ui/         # shadcn/ui primitives (Button, Dialog, DropdownMenu, ...)
├── config/         # app-wide settings: env.ts, paths.ts
├── context/        # React context providers (e.g. theme-provider.tsx)
├── features/       # the actual business logic, one folder per feature
├── hooks/          # shared React hooks used across features
├── lib/            # plain helper functions, no React/framework dependency
├── services/       # talking to the backend API
├── skeletons/       # loading placeholders, one per page (mirrors app/pages/ by name)
├── styles/         # global CSS
└── types/          # shared TypeScript types
```

**The golden rule of this codebase: a "feature" never imports from another feature.** If two features both need something (a formatting helper, a shared button), that shared thing goes in `components/`, `hooks/`, or `lib/` — never feature-to-feature. This is what makes it safe to delete an entire feature folder without breaking something else you didn't expect.

**The `@/` shortcut.** Instead of writing `../../../components/ui/button`, you write `@/components/ui/button`. This works everywhere — app code, tests, everything. Always use it for anything outside your current folder.

## How a page actually gets built (the request-to-pixels path)

1. `src/app/router.tsx` — defines which URL maps to which page component. Routes are lazy-loaded (the code for a page only downloads when you visit that page).
2. `src/app/pages/<name>.tsx` — a thin wrapper. It shouldn't contain real logic — it just renders the feature.
3. `src/features/<name>/` — where the actual logic, API calls, and feature-specific components live.
4. `src/app/layouts/main-layout.tsx` — wraps every page (header, sidebar, etc. go here, once).
5. `src/skeletons/<name>.tsx` — what shows up while a page's code is still loading (so the screen doesn't just go blank).

**Adding a brand-new page**, step by step:

1. Build the feature in `src/features/<name>/`
2. Add the URL to `src/config/paths.ts`
3. Add a thin page in `src/app/pages/<name>.tsx`
4. Add a matching skeleton in `src/skeletons/<name>.tsx` (optional but nice)
5. Register the route in `src/app/router.tsx`

## Every file explained (quick reference)

Below is a one-line "what is this and why does it exist" for each important file, grouped by job. It's a lookup table, not a deep read.

> **Want the full explanation of any of these?** [codebase-tour.md](codebase-tour.md) covers every file in depth — _the problem it solves → the fix → a concrete example → what you can change → do's and don'ts_. Use this table to find the file; use that doc to understand it.

**The boot sequence** (these run in order, every load):

| File                          | What it does                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `index.html`                  | The single HTML page. Its `<div id="root">` is where React injects everything.      |
| `src/app/main.tsx`            | Entry point — mounts `<App />` into `#root` and imports global CSS once.            |
| `src/app/app.tsx`             | Top of the component tree — wraps `AppProviders` around the router.                 |
| `src/app/providers/index.tsx` | Where all "wrap the whole app" providers stack (theme, error boundary, later auth). |

**Routing & pages:**

| File                              | What it does                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `src/app/router.tsx`              | The "URL → which page" map. Pages are lazy-loaded (downloaded on first visit).    |
| `src/config/paths.ts`             | The one source of truth for every URL. Never hardcode a URL elsewhere.            |
| `src/app/layouts/main-layout.tsx` | The frame around every page (header + content). Put shared header/nav here, once. |
| `src/app/pages/home.tsx`          | An example page — kept thin; real pages just render a feature.                    |
| `src/app/pages/not-found.tsx`     | The 404 page (for any unmatched URL).                                             |
| `src/app/pages/error.tsx`         | Shown when a route throws (e.g. a page fails to load).                            |

**Error handling:**

| File                                   | What it does                                          |
| -------------------------------------- | ----------------------------------------------------- |
| `src/app/providers/error-fallback.tsx` | The screen shown when a component crashes at runtime. |
| `src/components/error-state.tsx`       | The reusable error UI all three error screens share.  |

**Theming** (light / dark / system / auto — see the [Theming](#theming-light--dark--system--auto) section below):

| File                              | What it does                                                            |
| --------------------------------- | ----------------------------------------------------------------------- |
| `src/hooks/use-theme.ts`          | Defines the `Theme` type + the `useTheme()` hook components call.       |
| `src/context/theme-provider.tsx`  | Remembers the choice (`localStorage`) and applies it to `<html>`.       |
| `src/lib/theme.ts`                | Pure logic: "given a mode + OS preference, what color?" (easy to test). |
| `src/components/theme-toggle.tsx` | The dropdown button users click to switch themes.                       |

**Backend, config & shared helpers:**

| File                         | What it does                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `src/services/api-client.ts` | `apiFetch` — the only function that talks to the backend.                     |
| `src/config/env.ts`          | Reads + validates env variables at startup. Import `env` from here.           |
| `src/vite-env.d.ts`          | The TypeScript types for your env variables (autocomplete + typo-catching).   |
| `src/lib/utils.ts`           | `cn()` — merges Tailwind class names safely. Used in almost every component.  |
| `src/components/ui/`         | shadcn/ui primitives (button, dropdown, skeleton) — copied in, yours to edit. |
| `src/skeletons/`             | Gray "loading placeholder" shapes, one per page, to avoid layout jump.        |
| `src/styles/index.css`       | The global stylesheet (Tailwind, theme, font, color variables).               |

**Empty-on-purpose folders:** `src/assets/`, `src/types/`, and `src/features/` currently hold only a `.gitkeep` (a placeholder that keeps an otherwise-empty folder visible to Git). Delete the `.gitkeep` the moment you add a real file. `src/features/` is where all business logic will go — one folder per feature, and **features never import from each other**.

## Environment variables (the `.env` file)

- `.env` — your actual local values. **Never commit this file** (it's gitignored).
- `.env.example` — the template, committed to git, with placeholder values so anyone cloning the repo knows what variables exist.
- Only variables starting with `VITE_` are visible to the browser — treat every one of them as public. Never put real secrets in them.
- **Never read `import.meta.env` directly in your code.** Always `import { env } from '@/config/env'` instead. Why: `env.ts` validates every variable with [Zod](https://zod.dev) at startup — if something's missing or wrong, the app fails immediately with a clear error, instead of silently breaking somewhere deep in a component later.

**Adding a new environment variable?** You must update all four of these together, or things will break in confusing ways:

1. `.env` — your real value
2. `.env.example` — placeholder value
3. `src/config/env.ts` — add it to the Zod schema
4. `src/vite-env.d.ts` — add it to the `ImportMetaEnv` interface

## Talking to the backend

Never call `fetch` or `axios` directly. Always go through `apiFetch` in `src/services/api-client.ts`:

```ts
import { apiFetch } from '@/services/api-client'

const response = await apiFetch('/employees')
```

The only thing you ever need to configure is `VITE_API_URL` in `.env` — it can be a domain root, `/api`, `/api/v1`, anything. `apiFetch` and Vite's dev proxy handle the rest automatically (avoids CORS headaches in local development). See [dev.md](dev.md#calling-the-backend-api) if you want the full mechanics.

## Theming (light / dark / system / auto)

The app supports four theme modes, managed by `src/context/theme-provider.tsx`:

| Mode     | What it does                                                             |
| -------- | ------------------------------------------------------------------------ |
| `light`  | Always light                                                             |
| `dark`   | Always dark                                                              |
| `system` | Follows your OS's light/dark setting, and updates live if you change it  |
| `auto`   | Time-based — light from 6am–6pm, dark otherwise (see `src/lib/theme.ts`) |

- The chosen mode is saved to `localStorage` (key configurable via `VITE_THEME_STORAGE_KEY` in `.env`), so it persists across visits.
- `useTheme()` (in `src/hooks/use-theme.ts`) is how any component reads or changes the current theme — it must be used inside a `<ThemeProvider>` (already wired up near the app root), or it throws on purpose, to catch the mistake early.
- `src/components/theme-toggle.tsx` is the actual dropdown UI users click to switch themes — a good example to copy if you're building another settings-style control.
- Behind the scenes: it adds a `light` or `dark` class to the `<html>` element; Tailwind's dark-mode styles key off that class.

## Testing

Tests are written with **Jest** + **React Testing Library**, and live in a **separate `test/` folder** at the project root — not next to the source files. The structure mirrors `src/` exactly:

```
src/app/pages/home.tsx        →  test/app/pages/home.test.tsx
src/features/auth/hooks.ts    →  test/features/auth/hooks.test.ts
```

### Running tests

```
npm run test           # run once
npm run test:watch     # re-run automatically as you edit
npm run test:coverage  # run once and show how much of the code is tested
```

### Writing a test — the pattern to copy

```tsx
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/pages/home'

describe('HomePage', () => {
  it('renders the app name as a heading', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Interloid')
  })
})
```

- `render(...)` mounts the component in a simulated browser (jsdom).
- `screen.getBy...` finds elements the way a real user would (by visible text, by role like "button" or "heading" — not by CSS class).
- `expect(...).toBeInTheDocument()`, `.toHaveTextContent()`, etc. come from `@testing-library/jest-dom` and are available in every test file automatically — no import needed.
- Always import the thing you're testing via the `@/` alias (`@/app/pages/home`), never a relative path.

### The config files that make testing work (and what each one is for)

None of these are auto-generated — they're checked into the repo, written by hand, and you only touch them if you're changing _how_ tests run (not for every new test file):

| File                                         | What it's for                                                                                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `jest.config.cjs`                            | Main Jest settings — where test files live, the `@/` alias, mocking CSS/image imports, coverage settings                                  |
| `babel.config.cjs`                           | Tells Jest how to convert TypeScript/JSX into plain JavaScript it can run                                                                 |
| `jest.setup.cjs`                             | Runs before every single test file — loads `.env`, registers extra matchers, patches a couple of things jsdom doesn't support (see below) |
| `babel-plugin-transform-import-meta-env.cjs` | A small custom fix so `env.ts`'s Vite-style `import.meta.env` syntax works under Jest (Jest doesn't understand it natively)               |
| `test/__mocks__/fileMock.cjs`                | Stand-in for any image/font import during a test, since Jest can't parse binary files                                                     |

### The `test/__mocks__/` folder — quick version

In short: Jest can't read binary files (images, fonts). So when tested code does `import logo from '@/assets/logo.png'`, a rule in `jest.config.cjs` swaps that import for a harmless one-line string stub (`test/__mocks__/fileMock.cjs`) instead of trying to parse the real file — which keeps tests from crashing on asset imports. The `__mocks__` name is a Jest convention for "where mocks live."

> **Want the full story?** The complete explanation — why it happens, the exact config rule, a before/after example, what you can safely change, and the do's and don'ts — is in [codebase-tour.md](codebase-tour.md#14d-test__mocks__filemockcjs--the-imagefont-stand-in). That file explains _every_ part of the app in this same depth.

### Things that trip people up (read this before you debug for an hour)

- **jsdom isn't a real browser.** It simulates one, but it's missing some Web APIs. For example, `crypto.randomUUID()` doesn't exist in jsdom by default — `jest.setup.cjs` patches it in. If you use a browser API and a test mysteriously says "is not a function," this is probably why — add a polyfill to `jest.setup.cjs`, don't work around it in your component.
- **`npm run test --watch` doesn't do what you think.** That syntax gets swallowed by npm itself, not passed to Jest (you'll see an "Unknown cli config" warning). Use `npm run test:watch` instead, or `npm run test -- --watch` (note the `--`).
- **You'll see a random one-line "tip" printed above your test output**, like `◇ injected env (4) from .env // tip: ...`. That's just the `dotenv` package's own built-in self-promotion — harmless, not something we added, not a sign anything's broken.
- **Tests aren't part of the pre-commit hook.** Committing only runs `prettier` + `eslint` on your staged files (see below) — it does _not_ run the test suite. Get in the habit of running `npm run test` yourself before pushing.

## What happens automatically when you commit

A Git hook (via Husky) runs on every `git commit`:

- Any staged `.js/.jsx/.ts/.tsx` file gets auto-formatted with Prettier, then linted with ESLint. **If ESLint finds an error it can't fix automatically, the commit is blocked** — fix it, `git add` again, and re-commit.
- Any staged `.json/.md/.css` file just gets Prettier-formatted.

Don't be surprised if `git diff` looks slightly different right after committing — that's the auto-formatting.

## Adding a new UI component

Don't hand-write basic components like buttons or dialogs from scratch. Use the shadcn CLI:

```
npx shadcn add <component>
```

This copies the component's actual source code into `src/components/ui/` — it's yours to edit afterward, not a black-box dependency.

## Docker

```
docker compose up --build   # builds and runs the app on http://localhost:8080
docker compose down          # stops it
```

**Important gotcha:** environment variables are baked into the app at _build_ time, not read when the container starts. If you change `.env`, you must re-run `docker compose up --build` — just restarting the container won't pick up the new values.

## Where to go next

- Stuck on _how_ to do something day-to-day? → [dev.md](dev.md)
- Curious _why_ something is built the way it is? → [learning.md](learning.md)
- Wondering why a specific tool/library was chosen over an alternative? → [decision.md](decision.md)
- General project overview and quick reference? → [README.md](README.md)
