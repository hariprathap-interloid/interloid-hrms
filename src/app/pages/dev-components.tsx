import { ComponentGallery } from '@/features/dev-components/components/component-gallery'

export default function DevComponentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-display text-foreground">Components</h1>
        <p className="text-body text-muted-foreground">
          Stock shadcn primitives rendered with no custom classes, to confirm they inherit the
          Interloid Workforce tokens as-is.
        </p>
      </header>
      <ComponentGallery />
    </div>
  )
}
