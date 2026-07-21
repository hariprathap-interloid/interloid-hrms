import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { ThemeProvider } from '@/context/theme-provider'
import { useTheme } from '@/hooks/use-theme'
import { env } from '@/config/env'

const KEY = env.VITE_THEME_STORAGE_KEY

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
}

function autoWrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider defaultTheme="auto">{children}</ThemeProvider>
}

afterEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
})

describe('useTheme', () => {
  it('throws when used outside a ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useTheme())).toThrow(/within a ThemeProvider/)

    spy.mockRestore()
  })

  it('starts from the provider default', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
  })

  it('persists the chosen theme to localStorage and applies it to <html>', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => result.current.setTheme('dark'))

    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem(KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reads an existing theme from localStorage on mount', () => {
    localStorage.setItem(KEY, 'dark')

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
  })

  it('starts a recheck interval in auto mode and clears it on unmount', () => {
    jest.useFakeTimers()

    try {
      const { unmount } = renderHook(() => useTheme(), { wrapper: autoWrapper })

      // The auto-mode effect scheduled the periodic recheck.
      const timersWhileMounted = jest.getTimerCount()
      expect(timersWhileMounted).toBeGreaterThan(0)

      // Unmounting runs the cleanup, which clears that interval.
      unmount()
      expect(jest.getTimerCount()).toBeLessThan(timersWhileMounted)
    } finally {
      jest.useRealTimers()
    }
  })
})
