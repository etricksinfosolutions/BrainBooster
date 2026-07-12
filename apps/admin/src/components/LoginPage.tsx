import { LoginForm } from './LoginForm'
import { Logo } from './Logo'

/** Centered, responsive login card with the company logo. */
export function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <header className="login-header">
          <Logo />
          <h1 id="login-title">BrainBooster Admin</h1>
          <p className="login-subtitle">Sign in to the operator console</p>
        </header>
        <LoginForm />
        <footer className="login-footer">
          <span>Authorized personnel only. Activity is audited.</span>
        </footer>
      </section>
    </main>
  )
}
