// Shared, dependency-free time formatter for activity timers.
// Rule: show hours only when present, minutes only when present, else seconds.
//   3725 → "1:02:05"   ·   127 → "2:07"   ·   42 → "42s"
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const p = (n: number): string => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${p(m)}:${p(sec)}`   // h:mm:ss
  if (m > 0) return `${m}:${p(sec)}`           // m:ss
  return `${sec}s`                             // just seconds
}
