import { forwardRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  error?: string
  disabled?: boolean
}

/** Accessible username input with inline validation messaging. */
export const UsernameField = forwardRef<HTMLInputElement, Props>(function UsernameField(
  { value, onChange, error, disabled },
  ref,
) {
  return (
    <div className="field">
      <label htmlFor="username">Username</label>
      <input
        id="username"
        ref={ref}
        name="username"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'username-error' : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="field-error" id="username-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
