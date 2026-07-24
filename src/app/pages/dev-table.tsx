import { DataTableGallery } from '@/features/dev-components/components/data-table-gallery'

export default function DevTablePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-display text-foreground">Data table</h1>
        <p className="text-body text-muted-foreground">
          The workforce data grid — shadcn Table + TanStack, with sorting, pagination, opt-in
          interactive rows, and the loading / empty / error / no-access states rendered through the
          DataView lifecycle.
        </p>
      </header>
      <DataTableGallery />
    </div>
  )
}
