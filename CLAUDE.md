# Conventions

## Stack

Vite + React + TS, Tailwind v4 (CSS-first, no tailwind.config.js), shadcn/ui.

## Rules

- Installing NEW shadcn primitives is ALWAYS allowed: `npx shadcn add <component>` (if it prompts to
  overwrite an existing file like button.tsx, decline — keep ours). The rule below is only about
  EDITING primitives you already have, not adding new ones.
- NEVER hand-edit an existing file in src/components/ui/ except to ADD a cva variant. To restyle or
  extend a primitive, wrap it in an app-level component (e.g. src/components/…) instead.
- Never hardcode colors. Use semantic tokens: bg-primary, text-muted-foreground, border-border.
  Raw values like bg-[#1E2A38] are a bug.
- Feature components: src/features/<feature>/components/
- Shared app components (AppShell, Sidebar, TopBar): src/components/layout/
- Screens are thin. A page composes components; it does not contain layout primitives.
- No new dependencies without asking.
