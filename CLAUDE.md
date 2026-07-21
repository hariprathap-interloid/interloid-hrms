# Conventions

## Stack

Vite + React + TS, Tailwind v4 (CSS-first, no tailwind.config.js), shadcn/ui.

## Rules

- NEVER edit files in src/components/ui/ except to ADD a cva variant.
- Never hardcode colors. Use semantic tokens: bg-primary, text-muted-foreground, border-border.
  Raw values like bg-[#1E2A38] are a bug.
- Feature components: src/features/<feature>/components/
- Shared app components (AppShell, Sidebar, TopBar): src/components/layout/
- Screens are thin. A page composes components; it does not contain layout primitives.
- No new dependencies without asking.
