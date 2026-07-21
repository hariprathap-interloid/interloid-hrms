import { useEffect, useState, type ReactNode } from 'react'
import { env } from '@/config/env'
import { ThemeProviderContext, type Theme } from '@/hooks/use-theme'
import { resolveTheme, THEMES } from '@/lib/theme'

const STORAGE_KEY = env.VITE_THEME_STORAGE_KEY
const AUTO_RECHECK_INTERVAL_MS = 60_000

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && THEMES.includes(stored as Theme) ? (stored as Theme) : defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyResolved = () => {
      root.classList.remove('light', 'dark')
      root.classList.add(resolveTheme(theme, media.matches))
    }

    applyResolved()

    if (theme === 'system') {
      media.addEventListener('change', applyResolved)
      return () => media.removeEventListener('change', applyResolved)
    }

    if (theme === 'auto') {
      const interval = setInterval(applyResolved, AUTO_RECHECK_INTERVAL_MS)
      return () => clearInterval(interval)
    }
  }, [theme])

  return (
    <ThemeProviderContext
      value={{
        theme,
        setTheme: (nextTheme: Theme) => {
          localStorage.setItem(STORAGE_KEY, nextTheme)
          setTheme(nextTheme)
        },
      }}
    >
      {children}
    </ThemeProviderContext>
  )
}
