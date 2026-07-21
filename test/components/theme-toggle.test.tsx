import { render, screen } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ThemeProvider } from '@/context/theme-provider'

describe('ThemeToggle', () => {
  it('renders the toggle trigger', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })
})
