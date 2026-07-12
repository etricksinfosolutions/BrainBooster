import { useEffect, useState } from 'react'
import { contentApi, fileToDataUri, type AssetItem } from '../auth/content'
import { ApiError } from '../auth/api'

/** Lists every emoji/image used by activities; upload or URL to override each. */
export function AssetsPanel() {
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setAssets((await contentApi.assets()).assets)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { void load() }, [])

  async function apply(key: string, imageUrl: string | null) {
    setBusy(key)
    setError(null)
    try {
      await contentApi.setAsset(key, imageUrl)
      await load()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setBusy(null)
    }
  }

  async function onFile(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB'); return }
    try {
      await apply(key, await fileToDataUri(file))
    } catch {
      setError('Could not read that file')
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>🖼️ Activity Assets</h2>
        <button className="btn" onClick={() => void load()} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      <p className="legend">Every emoji used across activities. Upload an image/GIF or paste a URL to replace it everywhere it's used.</p>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="asset-grid">
        {assets.map((a) => (
          <div key={a.key} className={`asset-card${a.overridden ? ' overridden' : ''}`}>
            <div className="asset-media">
              {a.imageUrl ? <img src={a.imageUrl} alt={`override for ${a.emoji}`} /> : <span className="asset-emoji">{a.emoji}</span>}
            </div>
            <div className="asset-meta">
              <span className="asset-emoji-sm">{a.emoji}</span>
              <span className="muted asset-used" title={a.usedBy.join(', ')}>{a.usedBy.length} activit{a.usedBy.length === 1 ? 'y' : 'ies'}</span>
            </div>
            <div className="asset-actions">
              <label className="btn asset-upload">
                {busy === a.key ? '…' : 'Upload'}
                <input type="file" accept="image/*,image/gif" hidden disabled={busy === a.key} onChange={(e) => onFile(a.key, e)} />
              </label>
              <button
                className="btn"
                disabled={busy === a.key}
                onClick={() => {
                  const url = window.prompt(`Image/GIF URL for ${a.emoji}`, a.imageUrl ?? '')
                  if (url !== null) void apply(a.key, url.trim() || null)
                }}
              >URL</button>
              {a.overridden && <button className="btn danger" disabled={busy === a.key} onClick={() => void apply(a.key, null)}>Reset</button>}
            </div>
          </div>
        ))}
        {assets.length === 0 && !loading && <p className="muted">No activity assets found.</p>}
      </div>
    </div>
  )
}
