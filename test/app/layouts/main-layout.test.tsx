import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '@/app/layouts/main-layout'
import { ThemeProvider } from '@/context/theme-provider'
import { env } from '@/config/env'

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        element: <MainLayout />,
        children: [{ index: true, element: <p>Home content</p> }],
      },
    ],
    { initialEntries: ['/'] },
  )

  return render(
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
}

describe('MainLayout', () => {
  it('shows the app name in the header', () => {
    renderLayout()

    expect(screen.getByText(env.VITE_APP_NAME)).toBeInTheDocument()
  })

  it('renders the current page through the Outlet', async () => {
    renderLayout()

    expect(await screen.findByText('Home content')).toBeInTheDocument()
  })

  it('renders the theme toggle', () => {
    renderLayout()

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })
})
