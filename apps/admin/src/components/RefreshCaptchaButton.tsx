interface Props {
  onClick: () => void
  disabled?: boolean
}

/** Requests a brand-new CAPTCHA challenge. */
export function RefreshCaptchaButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      className="captcha-refresh"
      onClick={onClick}
      disabled={disabled}
      aria-label="Get a new CAPTCHA"
      title="Refresh CAPTCHA"
    >
      ↻
    </button>
  )
}
