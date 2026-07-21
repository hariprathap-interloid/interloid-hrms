import { render, screen } from '@testing-library/react'
import HomePage from '@/app/pages/home'

describe('HomePage', () => {
  it('renders the app name as a heading', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Interloid')
  })

  it('renders a welcome message that includes the app name', () => {
    render(<HomePage />)

    expect(screen.getByText('Welcome to Interloid HRMS.')).toBeInTheDocument()
  })
})
