import type { Theme } from '@/hooks/use-theme'

export const THEMES: Theme[] = ['light', 'dark', 'system', 'auto']

const DAY_START_HOUR = 6
const DAY_END_HOUR = 18

export function resolveTheme(theme: Theme, prefersDark: boolean): 'light' | 'dark' {
  if (theme === 'system') return prefersDark ? 'dark' : 'light'

  if (theme === 'auto') {
    const hour = new Date().getHours()
    return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? 'light' : 'dark'
  }

  return theme
}
