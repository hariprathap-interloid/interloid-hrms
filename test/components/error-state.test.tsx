import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ErrorState } from '@/components/error-state'

function renderErrorState(ui: React.ReactElement) {
  // ErrorState renders a <Link>, which needs a router context.
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ErrorState', () => {
  it('renders the title and message', () => {
    renderErrorState(<ErrorState title="Boom" message="It broke" />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Boom')
    expect(screen.getByText('It broke')).toBeInTheDocument()
  })

  it('always shows a link back home', () => {
    renderErrorState(<ErrorState title="Boom" />)

    expect(screen.getByRole('link', { name: /go back home/i })).toHaveAttribute('href', '/')
  })

  it('hides the retry button when no onRetry is given', () => {
    renderErrorState(<ErrorState title="Boom" />)

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = jest.fn()
    renderErrorState(<ErrorState title="Boom" onRetry={onRetry} />)

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
