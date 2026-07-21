import { cn } from '@/lib/utils'

// Mirrors real usage: base classes plus a padding that depends on a runtime flag.
function paddedBox(isLarge: boolean) {
  return cn('rounded-md', isLarge && 'p-4')
}

describe('cn', () => {
  it('lets the last conflicting Tailwind class win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('drops falsy conditional classes', () => {
    expect(paddedBox(false)).toBe('rounded-md')
  })

  it('keeps truthy conditional classes', () => {
    expect(paddedBox(true)).toBe('rounded-md p-4')
  })
})
