import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

const Toaster = ({ ...props }: ToasterProps) => {
  // This project has its own theme system (see @/hooks/use-theme), not next-themes,
  // which the shadcn CLI assumes. Our provider adds a `light`/`dark` class to <html>,
  // and the CSS variables below follow that class — so we just hand Sonner a value it
  // understands. Our extra `auto` (time-based) mode maps to `system` here.
  const { theme } = useTheme()
  const sonnerTheme: ToasterProps['theme'] =
    theme === 'light' || theme === 'dark' ? theme : 'system'

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
