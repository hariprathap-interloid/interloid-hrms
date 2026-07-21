import { useEffect, useState } from 'react'
import { useTheme } from '@/hooks/use-theme'

/**
 * Reads the computed value of a CSS custom property from :root, re-reading
 * whenever the theme changes so swatches show the value for the active theme.
 */
export function useResolvedVar(varName: string): string {
  const { theme } = useTheme()
  const [value, setValue] = useState('')

  useEffect(() => {
    // Read on the next frame so the theme class is applied first.
    const id = requestAnimationFrame(() => {
      const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName)
      setValue(resolved.trim())
    })
    return () => cancelAnimationFrame(id)
  }, [varName, theme])

  return value
}
