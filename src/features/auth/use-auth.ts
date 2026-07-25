import { createContext, use } from 'react'
import type { DemoUser } from './demo-users'

/** The signed-in user is a resolved persona (see demo-users → resolveUser). */
export type AuthUser = DemoUser

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'expired'

export interface AuthState {
  status: AuthStatus
  user: AuthUser | null
}

export interface AuthContextValue extends AuthState {
  /** Simulated sign-in — defaults to a demo user. */
  signIn: (user?: AuthUser) => void
  signOut: () => void
  /** Simulate an 8h-idle session expiry — keeps the user for the re-auth screen. */
  expire: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = use(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
