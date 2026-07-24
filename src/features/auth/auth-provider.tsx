import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue, type AuthState, type AuthUser } from './use-auth'

/* Stubbed client-side auth — session state in sessionStorage so it survives a
   refresh. No backend: signIn/expire just flip state, and the route guard
   (ProtectedLayout) redirects based on `status`. */

const STORAGE_KEY = 'iws.auth'
const DEMO_USER: AuthUser = { name: 'Priya Nair', email: 'priya.nair@interloid.io' }

function readStored(): AuthState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AuthState
  } catch {
    // ignore malformed/unavailable storage
  }
  return { status: 'unauthenticated', user: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(readStored)

  const persist = useCallback((next: AuthState) => {
    setState(next)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore unavailable storage
    }
  }, [])

  const signIn = useCallback(
    (user: AuthUser = DEMO_USER) => persist({ status: 'authenticated', user }),
    [persist],
  )
  const signOut = useCallback(() => persist({ status: 'unauthenticated', user: null }), [persist])
  const expire = useCallback(
    () => persist({ status: 'expired', user: readStored().user ?? DEMO_USER }),
    [persist],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signOut, expire }),
    [state, signIn, signOut, expire],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
