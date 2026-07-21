import { render } from '@testing-library/react'
import HomeLoadingSkeleton from '@/skeletons/home'
import MainLayoutSkeleton from '@/skeletons/main-layout'

describe('skeletons', () => {
  it('renders the home skeleton', () => {
    const { container } = render(<HomeLoadingSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the main-layout skeleton (exercises crypto.randomUUID keys)', () => {
    const { container } = render(<MainLayoutSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
