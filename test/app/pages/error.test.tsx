import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import ErrorPage from '@/app/pages/error'

// ErrorPage reads the error via useRouteError, so it must be tested as a real
// route's errorElement. We trigger the error with a render-time throw rather
// than a loader — a loader would require the Fetch `Request` global, which
// jsdom doesn't provide.
function ThrowOnRender({ error }: { error: Error }): never {
  throw error
}

function renderWithThrow(thrown: Error) {
  const router = createMemoryRouter(
    [{ path: '/', element: <ThrowOnRender error={thrown} />, errorElement: <ErrorPage /> }],
    { initialEntries: ['/'] },
  )

  return render(<RouterProvider router={router} />)
}

describe('ErrorPage', () => {
  it('shows a generic message when a non-response error is thrown', async () => {
    // React logs the caught render error; silence it to keep test output clean.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    renderWithThrow(new Error('boom'))

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()

    spy.mockRestore()
  })
})
