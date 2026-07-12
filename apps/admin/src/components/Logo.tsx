/** Inline brand logo (self-contained SVG — no external asset dependency). */
export function Logo() {
  return (
    <div className="brand-logo" aria-hidden="true">
      <svg width="56" height="56" viewBox="0 0 56 56" role="img" aria-label="BrainBooster">
        <defs>
          <linearGradient id="bb-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7a5cc8" />
            <stop offset="1" stopColor="#5ba8ff" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="52" height="52" rx="14" fill="url(#bb-grad)" />
        <text x="28" y="38" textAnchor="middle" fontSize="28" role="presentation">
          🧠
        </text>
      </svg>
    </div>
  )
}
