import { useLocation, useNavigate } from 'react-router-dom'
import { House, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="bg-background flex min-h-dvh items-center justify-center p-6">
      <div className="animate-in fade-in max-w-[420px] text-center duration-300">
        <div className="from-primary to-brand-accent bg-linear-to-br bg-clip-text font-mono text-[88px] leading-none font-semibold tracking-[-0.04em] text-transparent">
          404
        </div>
        <div className="text-foreground mt-[18px] text-[19px] font-semibold">
          We couldn&rsquo;t find that page
        </div>
        <div className="text-muted-foreground mt-2 text-[13.5px] leading-[1.6]">
          It may have been moved, or it doesn&rsquo;t exist for your role. Check the address, or
          head back to your dashboard.
        </div>

        <div className="bg-muted text-muted-foreground mt-4 inline-flex items-center gap-2 rounded-[9px] px-3 py-1.5 font-mono text-[12px]">
          <Unlink className="size-[13px]" />
          {location.pathname}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button
            className="h-11 gap-2 rounded-[11px] text-sm"
            onClick={() => void navigate(paths.dashboard.getHref())}
          >
            <House />
            Back to dashboard
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-[11px] text-sm font-medium"
            onClick={() => void navigate(-1)}
          >
            Go back
          </Button>
        </div>

        <div className="text-muted-foreground mt-[22px] text-[12px]">
          Think you should have access?{' '}
          <button type="button" className="text-primary hover:underline">
            Contact your HR Manager
          </button>
        </div>
      </div>
    </div>
  )
}
