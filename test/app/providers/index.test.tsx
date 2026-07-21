import { render, screen } from '@testing-library/react'
import { AppProviders } from '@/app/providers'

describe('AppProviders', () => {
  it('renders its children', () => {
    render(
      <AppProviders>
        <p>wrapped child</p>
      </AppProviders>,
    )

    expect(screen.getByText('wrapped child')).toBeInTheDocument()
  })
})
