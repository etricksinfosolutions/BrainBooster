import { useState } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  error?: string
  disabled?: boolean
}

/** Password input with an accessible show/hide toggle. */
export function PasswordField({ value, onChange, error, disabled }: Props) {
  const [show, setShow] = useState(false)
  return (
    <div className="field">
      <label htmlFor="password">Password</label>
      <div className="password-wrap">
        <input
          id="password"
          name="password"
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          value={value}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'password-error' : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="reveal"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          aria-pressed={show}
          aria-label={show ? 'Hide password' : 'Show password'}
          title={show ? 'Hide password' : 'Show password'}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {error && (
        <p className="field-error" id="password-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
