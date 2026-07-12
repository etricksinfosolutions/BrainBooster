import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { authApi, ApiError } from '../auth/api'
import { UsernameField } from './UsernameField'
import { PasswordField } from './PasswordField'
import { CaptchaField } from './CaptchaField'
import { LoginButton } from './LoginButton'

interface FieldErrors {
  username?: string
  password?: string
  captcha?: string
}

/** Full login form: fields + CAPTCHA + validation + error handling. No alert(). */
export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaText, setCaptchaText] = useState('')
  const [captchaId, setCaptchaId] = useState<string | null>(null)
  const [captchaImage, setCaptchaImage] = useState<string | null>(null)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    setCaptchaText('')
    try {
      const c = await authApi.captcha()
      setCaptchaId(c.captchaId)
      setCaptchaImage(c.image)
    } catch {
      setFormError('Could not load the security check. Please retry.')
    } finally {
      setCaptchaLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCaptcha()
    usernameRef.current?.focus()
  }, [loadCaptcha])

  function validate(): boolean {
    const errs: FieldErrors = {}
    if (!username.trim()) errs.username = 'Username is required'
    if (!password) errs.password = 'Password is required'
    if (!captchaText.trim()) errs.captcha = 'Please solve the security check'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate() || !captchaId) return
    setSubmitting(true)
    try {
      await login({ username: username.trim(), password, captchaId, captchaText: captchaText.trim() })
      // On success the AuthProvider swaps this screen for the dashboard.
    } catch (err) {
      const e2 = err as ApiError
      // Every failed attempt invalidates the CAPTCHA — always fetch a fresh one.
      await loadCaptcha()
      if (e2.code === 'CAPTCHA_INVALID' || e2.code === 'CAPTCHA_EXPIRED') {
        setFieldErrors({ captcha: e2.message })
      } else if (e2.code === 'ACCOUNT_LOCKED') {
        const mins = e2.retryAfterMs ? Math.ceil(e2.retryAfterMs / 60000) : 15
        setFormError(`Account temporarily locked due to too many attempts. Try again in ~${mins} minute(s).`)
      } else if (e2.code === 'VALIDATION') {
        setFormError('Please check your input and try again.')
      } else {
        setFormError(e2.message || 'Login failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={onSubmit} noValidate aria-describedby={formError ? 'form-error' : undefined}>
      {formError && (
        <div className="form-error" id="form-error" role="alert">
          {formError}
        </div>
      )}
      <UsernameField ref={usernameRef} value={username} onChange={setUsername} error={fieldErrors.username} disabled={submitting} />
      <PasswordField value={password} onChange={setPassword} error={fieldErrors.password} disabled={submitting} />
      <CaptchaField
        image={captchaImage}
        loading={captchaLoading}
        value={captchaText}
        onChange={setCaptchaText}
        onRefresh={() => void loadCaptcha()}
        error={fieldErrors.captcha}
        disabled={submitting}
      />
      <LoginButton loading={submitting} disabled={captchaLoading} />
    </form>
  )
}
