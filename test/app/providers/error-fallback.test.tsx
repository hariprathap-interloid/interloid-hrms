import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppErrorFallback } from '@/app/providers/error-fallback'

describe('AppErrorFallback', () => {
  it('shows the error message and resets on retry', () => {
    const reset = jest.fn()

    render(
      <MemoryRouter>
        <AppErrorFallback error={new Error('kaboom')} resetErrorBoundary={reset} />
      </MemoryRouter>,
    )

    expect(screen.getByText('kaboom')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(reset).toHaveBeenCalledTimes(1)
  })
})
