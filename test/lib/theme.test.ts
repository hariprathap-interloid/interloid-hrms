import { resolveTheme, THEMES } from '@/lib/theme'

describe('resolveTheme', () => {
  it('returns the mode directly for light and dark', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows the OS preference in system mode', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  describe('auto mode (time based)', () => {
    afterEach(() => {
      jest.useRealTimers()
    })

    it('is light during the day (10:00)', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01T10:00:00'))
      expect(resolveTheme('auto', false)).toBe('light')
    })

    it('is dark at night (22:00)', () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01T22:00:00'))
      expect(resolveTheme('auto', false)).toBe('dark')
    })
  })
})

describe('THEMES', () => {
  it('lists every supported mode', () => {
    expect(THEMES).toEqual(['light', 'dark', 'system', 'auto'])
  })
})
