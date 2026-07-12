// Auth state provider. Bootstraps the session from the HTTP-only cookie via
// /me on mount, exposes login/logout, and drives an inactivity auto-logout that
// mirrors the server's idle timeout so the UI reacts before the API rejects.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { authApi, ApiError } from './api'
import type { AdminProfile, Permission } from './permissions'

interface AuthState {
  user: AdminProfile | null
  loading: boolean
  login: (input: { username: string; password: string; captchaId: string; captchaText: string }) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (p: Permission) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

// Client-side inactivity window (ms). Kept below the server's 30-minute idle cap
// so the UI logs out cleanly rather than hitting a 401 mid-action.
const INACTIVITY_MS = 25 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const timer = useRef<number | undefined>(undefined)

  const clearInactivity = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const doLogout = useCallback(async () => {
    clearInactivity()
    try {
      await authApi.logout()
    } catch {
      /* even if the call fails, drop local state */
    }
    setUser(null)
  }, [clearInactivity])

  const armInactivity = useCallback(() => {
    clearInactivity()
    timer.current = window.setTimeout(() => { void doLogout() }, INACTIVITY_MS)
  }, [clearInactivity, doLogout])

  // Bootstrap from cookie.
  useEffect(() => {
    let alive = true
    authApi
      .me()
      .then((r) => { if (alive) { setUser(r.user); armInactivity() } })
      .catch(() => { if (alive) setUser(null) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [armInactivity])

  // Reset the inactivity timer on real user activity while authenticated.
  useEffect(() => {
    if (!user) return
    const onActivity = () => armInactivity()
    const events = ['mousedown', 'keydown', 'touchstart', 'visibilitychange']
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    return () => events.forEach((e) => window.removeEventListener(e, onActivity))
  }, [user, armInactivity])

  const login = useCallback(
    async (input: { username: string; password: string; captchaId: string; captchaText: string }) => {
      const { user: profile } = await authApi.login(input)
      setUser(profile)
      armInactivity()
    },
    [armInactivity],
  )

  const hasPermission = useCallback(
    (p: Permission) => Boolean(user && user.permissions.includes(p)),
    [user],
  )

  return (
    <AuthContext.Provider value={{ user, loading, login, logout: doLogout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

export { ApiError }
