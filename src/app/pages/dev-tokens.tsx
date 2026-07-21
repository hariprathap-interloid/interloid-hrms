import { TokenGallery } from '@/features/dev-tokens/components/token-gallery'

export default function DevTokensPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-display text-foreground">Design tokens</h1>
        <p className="text-body text-muted-foreground">
          Every token from the Interloid Workforce design system, resolved for the active theme.
        </p>
      </header>
      <TokenGallery />
    </div>
  )
}
