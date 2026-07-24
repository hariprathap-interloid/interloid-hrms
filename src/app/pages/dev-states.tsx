import { DataViewGallery } from '@/features/dev-components/components/data-view-gallery'

export default function DevStatesPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-display text-foreground">Data-view states</h1>
        <p className="text-body text-muted-foreground">
          The populated · loading · empty · error · no-access lifecycle and the shimmer skeleton
          variants, composed against the States &amp; Components spec.
        </p>
      </header>
      <DataViewGallery />
    </div>
  )
}
