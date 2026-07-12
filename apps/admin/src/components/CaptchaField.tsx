import { CaptchaImage } from './CaptchaImage'
import { RefreshCaptchaButton } from './RefreshCaptchaButton'

interface Props {
  image: string | null
  loading: boolean
  value: string
  onChange: (v: string) => void
  onRefresh: () => void
  error?: string
  disabled?: boolean
}

/** CAPTCHA challenge image + refresh + the user's answer input. */
export function CaptchaField({ image, loading, value, onChange, onRefresh, error, disabled }: Props) {
  return (
    <div className="field">
      <label htmlFor="captcha">Security check</label>
      <div className="captcha-row">
        <CaptchaImage src={image} loading={loading} />
        <RefreshCaptchaButton onClick={onRefresh} disabled={disabled || loading} />
      </div>
      <input
        id="captcha"
        name="captcha"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="Type the characters above"
        value={value}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'captcha-error' : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="field-error" id="captcha-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
