import { useAuth } from './auth/AuthContext'
import { LoginPage } from './components/LoginPage'
import { Dashboard } from './components/Dashboard'

/**
 * Route protection: while bootstrapping we render nothing (avoids a login flash);
 * anonymous users only ever see the login page; authenticated users see the
 * role-gated dashboard. There are no other reachable views, so direct access to
 * privileged UI is impossible without a valid session.
 */
export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="boot" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" /> Loading…
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginPage />
}
