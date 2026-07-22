/**
 * Catalog of every design token carried over from the Claude Design project
 * "Interloid Workforce design system". Drives the /dev/tokens gallery.
 *
 * `varName` is the raw custom property (read at runtime to show the resolved
 * value); `className` is the Tailwind utility the token is exposed through.
 */

export type ColorToken = {
  label: string
  varName: string
  className: string
  /** Utility for a legibility sample rendered on top of the swatch. */
  sampleClassName?: string
}

export type ColorGroup = {
  title: string
  tokens: ColorToken[]
}

export const colorGroups: ColorGroup[] = [
  {
    title: 'Surfaces & text',
    tokens: [
      {
        label: 'background',
        varName: '--background',
        className: 'bg-background',
        sampleClassName: 'text-foreground',
      },
      {
        label: 'foreground',
        varName: '--foreground',
        className: 'bg-foreground',
        sampleClassName: 'text-background',
      },
      {
        label: 'card',
        varName: '--card',
        className: 'bg-card',
        sampleClassName: 'text-card-foreground',
      },
      {
        label: 'card-foreground',
        varName: '--card-foreground',
        className: 'bg-card-foreground',
        sampleClassName: 'text-card',
      },
      {
        label: 'popover',
        varName: '--popover',
        className: 'bg-popover',
        sampleClassName: 'text-popover-foreground',
      },
      {
        label: 'popover-foreground',
        varName: '--popover-foreground',
        className: 'bg-popover-foreground',
        sampleClassName: 'text-popover',
      },
      {
        label: 'muted',
        varName: '--muted',
        className: 'bg-muted',
        sampleClassName: 'text-muted-foreground',
      },
      {
        label: 'muted-foreground',
        varName: '--muted-foreground',
        className: 'bg-muted-foreground',
        sampleClassName: 'text-muted',
      },
      {
        label: 'secondary',
        varName: '--secondary',
        className: 'bg-secondary',
        sampleClassName: 'text-secondary-foreground',
      },
      {
        label: 'secondary-foreground',
        varName: '--secondary-foreground',
        className: 'bg-secondary-foreground',
        sampleClassName: 'text-secondary',
      },
      { label: 'border', varName: '--border', className: 'bg-border' },
      { label: 'input', varName: '--input', className: 'bg-input' },
      { label: 'ring', varName: '--ring', className: 'bg-ring' },
    ],
  },
  {
    title: 'Brand',
    tokens: [
      {
        label: 'primary',
        varName: '--primary',
        className: 'bg-primary',
        sampleClassName: 'text-primary-foreground',
      },
      {
        label: 'primary-foreground',
        varName: '--primary-foreground',
        className: 'bg-primary-foreground',
        sampleClassName: 'text-primary',
      },
      {
        label: 'primary-bg',
        varName: '--primary-bg',
        className: 'bg-primary-bg',
        sampleClassName: 'text-primary',
      },
      {
        label: 'accent',
        varName: '--accent',
        className: 'bg-accent',
        sampleClassName: 'text-accent-foreground',
      },
      {
        label: 'accent-foreground',
        varName: '--accent-foreground',
        className: 'bg-accent-foreground',
        sampleClassName: 'text-accent',
      },
      {
        label: 'accent-bg',
        varName: '--accent-bg',
        className: 'bg-accent-bg',
        sampleClassName: 'text-accent',
      },
    ],
  },
  {
    title: 'Semantic — solid / on-solid / subtle / on-subtle',
    tokens: [
      {
        label: 'success',
        varName: '--success',
        className: 'bg-success',
        sampleClassName: 'text-success-foreground',
      },
      {
        label: 'success-foreground',
        varName: '--success-foreground',
        className: 'bg-success-foreground',
        sampleClassName: 'text-success',
      },
      {
        label: 'success-subtle',
        varName: '--success-subtle',
        className: 'bg-success-subtle',
        sampleClassName: 'text-success-subtle-foreground',
      },
      {
        label: 'success-subtle-foreground',
        varName: '--success-subtle-foreground',
        className: 'bg-success-subtle-foreground',
        sampleClassName: 'text-success-subtle',
      },
      {
        label: 'warning',
        varName: '--warning',
        className: 'bg-warning',
        sampleClassName: 'text-warning-foreground',
      },
      {
        label: 'warning-foreground',
        varName: '--warning-foreground',
        className: 'bg-warning-foreground',
        sampleClassName: 'text-warning',
      },
      {
        label: 'warning-subtle',
        varName: '--warning-subtle',
        className: 'bg-warning-subtle',
        sampleClassName: 'text-warning-subtle-foreground',
      },
      {
        label: 'warning-subtle-foreground',
        varName: '--warning-subtle-foreground',
        className: 'bg-warning-subtle-foreground',
        sampleClassName: 'text-warning-subtle',
      },
      {
        label: 'destructive',
        varName: '--destructive',
        className: 'bg-destructive',
        sampleClassName: 'text-destructive-foreground',
      },
      {
        label: 'destructive-foreground',
        varName: '--destructive-foreground',
        className: 'bg-destructive-foreground',
        sampleClassName: 'text-destructive',
      },
      {
        label: 'destructive-subtle',
        varName: '--destructive-subtle',
        className: 'bg-destructive-subtle',
        sampleClassName: 'text-destructive-subtle-foreground',
      },
      {
        label: 'destructive-subtle-foreground',
        varName: '--destructive-subtle-foreground',
        className: 'bg-destructive-subtle-foreground',
        sampleClassName: 'text-destructive-subtle',
      },
      {
        label: 'info',
        varName: '--info',
        className: 'bg-info',
        sampleClassName: 'text-info-foreground',
      },
      {
        label: 'info-foreground',
        varName: '--info-foreground',
        className: 'bg-info-foreground',
        sampleClassName: 'text-info',
      },
      {
        label: 'info-subtle',
        varName: '--info-subtle',
        className: 'bg-info-subtle',
        sampleClassName: 'text-info-subtle-foreground',
      },
      {
        label: 'info-subtle-foreground',
        varName: '--info-subtle-foreground',
        className: 'bg-info-subtle-foreground',
        sampleClassName: 'text-info-subtle',
      },
    ],
  },
  {
    title: 'Charts',
    tokens: [
      { label: 'chart-1', varName: '--chart-1', className: 'bg-chart-1' },
      { label: 'chart-2', varName: '--chart-2', className: 'bg-chart-2' },
      { label: 'chart-3', varName: '--chart-3', className: 'bg-chart-3' },
      { label: 'chart-4', varName: '--chart-4', className: 'bg-chart-4' },
      { label: 'chart-5', varName: '--chart-5', className: 'bg-chart-5' },
    ],
  },
  {
    title: 'Sidebar chrome',
    tokens: [
      {
        label: 'sidebar',
        varName: '--sidebar',
        className: 'bg-sidebar',
        sampleClassName: 'text-sidebar-foreground',
      },
      {
        label: 'sidebar-foreground',
        varName: '--sidebar-foreground',
        className: 'bg-sidebar-foreground',
        sampleClassName: 'text-sidebar',
      },
      {
        label: 'sidebar-primary',
        varName: '--sidebar-primary',
        className: 'bg-sidebar-primary',
        sampleClassName: 'text-sidebar-primary-foreground',
      },
      {
        label: 'sidebar-primary-foreground',
        varName: '--sidebar-primary-foreground',
        className: 'bg-sidebar-primary-foreground',
        sampleClassName: 'text-sidebar-primary',
      },
      {
        label: 'sidebar-accent',
        varName: '--sidebar-accent',
        className: 'bg-sidebar-accent',
        sampleClassName: 'text-sidebar-accent-foreground',
      },
      {
        label: 'sidebar-accent-foreground',
        varName: '--sidebar-accent-foreground',
        className: 'bg-sidebar-accent-foreground',
        sampleClassName: 'text-sidebar-accent',
      },
      { label: 'sidebar-border', varName: '--sidebar-border', className: 'bg-sidebar-border' },
      { label: 'sidebar-ring', varName: '--sidebar-ring', className: 'bg-sidebar-ring' },
    ],
  },
  {
    title: 'Glass',
    tokens: [
      { label: 'glass (--glass-bg)', varName: '--glass-bg', className: 'bg-glass' },
      {
        label: 'glass-border (--glass-border)',
        varName: '--glass-border',
        className: 'bg-glass-border',
      },
    ],
  },
]

export type TypeToken = {
  /** Tailwind utility, e.g. text-h1. */
  className: string
  /** Backing theme var, e.g. --text-h1. */
  varName: string
  mono?: boolean
}

export const typeTokens: TypeToken[] = [
  { className: 'text-display', varName: '--text-display' },
  { className: 'text-h1', varName: '--text-h1' },
  { className: 'text-h2', varName: '--text-h2' },
  { className: 'text-h3', varName: '--text-h3' },
  { className: 'text-body', varName: '--text-body' },
  { className: 'text-small', varName: '--text-small' },
  { className: 'text-mono', varName: '--text-mono', mono: true },
]

export type BoxToken = {
  label: string
  varName: string
  className: string
}

export const radiusTokens: BoxToken[] = [
  { label: 'rounded-sm', varName: '--radius-sm', className: 'rounded-sm' },
  { label: 'rounded-md', varName: '--radius-md', className: 'rounded-md' },
  { label: 'rounded-lg', varName: '--radius-lg', className: 'rounded-lg' },
  { label: 'rounded-xl', varName: '--radius-xl', className: 'rounded-xl' },
  { label: 'rounded-2xl', varName: '--radius-2xl', className: 'rounded-2xl' },
  { label: 'rounded-full', varName: '--radius-full', className: 'rounded-full' },
]

export const shadowTokens: BoxToken[] = [
  { label: 'shadow-sm', varName: '--shadow-sm', className: 'shadow-sm' },
  { label: 'shadow', varName: '--shadow', className: 'shadow' },
  { label: 'shadow-md', varName: '--shadow-md', className: 'shadow-md' },
  { label: 'shadow-lg', varName: '--shadow-lg', className: 'shadow-lg' },
]

/**
 * Design-project tokens that have NO clean Tailwind utility mapping in
 * src/styles/index.css. Surfaced in the gallery so the gap is visible.
 */
export type UnmappedToken = {
  token: string
  reason: string
  /** Optional gradient/background to preview via var(). */
  previewVar?: string
}

export const unmappedTokens: UnmappedToken[] = [
  {
    token: '--skeleton',
    reason:
      'Gradient, not a color — kept as a raw var. No bg-skeleton utility; use via var(--skeleton).',
    previewVar: '--skeleton',
  },
  {
    token: '--mesh',
    reason: 'Radial-gradient wash — kept as a raw var. No utility; apply via var(--mesh).',
    previewVar: '--mesh',
  },
  {
    token: '--space-1 … --space-12',
    reason:
      "Resolved: these map 1:1 onto Tailwind's default 4px scale (p-1=4px … p-12=48px at the 16px root), so the raw vars were deleted rather than mapped.",
  },
  {
    token: '--accent-fg (on-accent-subtle text)',
    reason:
      'Present in the States & Components page (#0369A1 light / #7DD3FC dark) but absent from tokens/colors.css. No accent-subtle-foreground token exists in the CSS layer — text on accent-bg has no dedicated color.',
  },
]
