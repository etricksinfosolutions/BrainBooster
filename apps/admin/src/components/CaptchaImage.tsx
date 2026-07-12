interface Props {
  src: string | null
  loading: boolean
}

/** Renders the server-generated CAPTCHA SVG (a data URI). Never computes the answer. */
export function CaptchaImage({ src, loading }: Props) {
  return (
    <div className="captcha-image" aria-live="polite">
      {loading || !src ? (
        <span className="captcha-skeleton" aria-label="Loading CAPTCHA">
          …
        </span>
      ) : (
        <img src={src} alt="CAPTCHA challenge — type the characters you see" draggable={false} />
      )}
    </div>
  )
}
