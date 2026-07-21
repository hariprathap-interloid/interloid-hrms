import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from '@/app/pages/not-found'

describe('NotFoundPage', () => {
  it('shows the 404 message', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404 - Page Not Found')
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument()
  })
})
