interface Props {
  loading: boolean
  disabled?: boolean
}

/** Submit button with an inline loading state (disabled while submitting). */
export function LoginButton({ loading, disabled }: Props) {
  return (
    <button type="submit" className="login-button" disabled={loading || disabled} aria-busy={loading}>
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" /> Signing in…
        </>
      ) : (
        'Sign in'
      )}
    </button>
  )
}
