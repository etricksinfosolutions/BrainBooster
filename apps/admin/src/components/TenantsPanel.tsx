import { useEffect, useState, type FormEvent } from 'react'
import { tenantsApi, type Tenant, type TenantStatus } from '../auth/tenants'
import { ApiError } from '../auth/api'

const STATUSES: TenantStatus[] = ['created', 'pending', 'active', 'suspended', 'deleted']
const SELECTABLE: TenantStatus[] = ['created', 'pending', 'active', 'suspended']

/** SUPER_ADMIN tenant management: list, create, status, rotate secret, delete. */
export function TenantsPanel() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create form.
  const [name, setName] = useState('')
  const [sessionTime, setSessionTime] = useState('60')
  const [scope, setScope] = useState('')
  const [status, setStatus] = useState<TenantStatus>('active')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Show-once secret reveal after create/rotate.
  const [reveal, setReveal] = useState<{ name: string; clientId: string; clientSecret: string } | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setTenants((await tenantsApi.list()).tenants)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const minutes = Number(sessionTime)
    if (!name.trim()) return setFormError('Name is required')
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440)
      return setFormError('Session time must be 1–1440 minutes')
    const scopeArr = scope
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    setCreating(true)
    try {
      const { tenant } = await tenantsApi.create({ name: name.trim(), sessionTimeMinutes: minutes, scope: scopeArr, status })
      setReveal({ name: tenant.name, clientId: tenant.clientId, clientSecret: tenant.clientSecret || '' })
      setName('')
      setScope('')
      setSessionTime('60')
      setStatus('active')
      await load()
    } catch (e2) {
      setFormError((e2 as ApiError).message)
    } finally {
      setCreating(false)
    }
  }

  async function changeStatus(t: Tenant, next: TenantStatus) {
    try {
      await tenantsApi.setStatus(t.id, next)
      await load()
    } catch (e) {
      setError((e as ApiError).message)
    }
  }

  async function rotate(t: Tenant) {
    try {
      const { tenant } = await tenantsApi.rotateSecret(t.id)
      setReveal({ name: tenant.name, clientId: tenant.clientId, clientSecret: tenant.clientSecret || '' })
      await load()
    } catch (e) {
      setError((e as ApiError).message)
    }
  }

  async function remove(t: Tenant) {
    if (!window.confirm(`Delete tenant "${t.name}"? This soft-deletes it (audited).`)) return
    try {
      await tenantsApi.remove(t.id)
      await load()
    } catch (e) {
      setError((e as ApiError).message)
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>🏢 Tenants</h2>
        <button className="btn" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {reveal && (
        <div className="secret-reveal" role="alert">
          <strong>Client secret for “{reveal.name}”.</strong> Copy it now — it is shown only once.
          <div className="secret-row">
            <code className="mono">Client ID:</code> <code className="mono">{reveal.clientId}</code>
          </div>
          <div className="secret-row">
            <code className="mono">Secret:</code> <code className="mono secret-value">{reveal.clientSecret}</code>
            <button className="btn" onClick={() => void navigator.clipboard?.writeText(reveal.clientSecret)}>Copy</button>
            <button className="btn" onClick={() => setReveal(null)}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Create */}
      <form className="tenant-create" onSubmit={onCreate}>
        <div className="tenant-create-grid">
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme School" disabled={creating} />
          </label>
          <label className="field">
            <span>Session time (min)</span>
            <input type="number" min={1} max={1440} value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} disabled={creating} />
          </label>
          <label className="field">
            <span>Scope (comma-separated)</span>
            <input value={scope} onChange={(e) => setScope(e.target.value)} placeholder="games, content, analytics" disabled={creating} />
          </label>
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as TenantStatus)} disabled={creating}>
              {SELECTABLE.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <button className="login-button tenant-add" type="submit" disabled={creating}>
            {creating ? 'Creating…' : '+ Add tenant'}
          </button>
        </div>
        {formError && <p className="field-error" role="alert">{formError}</p>}
      </form>

      {error && <p className="field-error" role="alert">{error}</p>}

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Client ID</th><th>Status</th><th>Session</th><th>Scope</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className={t.status === 'deleted' ? 'row-deleted' : undefined}>
                <td>{t.name}</td>
                <td className="mono">{t.clientId}</td>
                <td><span className={`status-badge s-${t.status}`}>{t.status}</span></td>
                <td className="mono">{t.sessionTimeMinutes}m</td>
                <td>{t.scope.length ? t.scope.join(', ') : '—'}</td>
                <td className="mono">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>
                  {t.status !== 'deleted' ? (
                    <div className="row-actions">
                      <select
                        aria-label={`Status for ${t.name}`}
                        value={t.status}
                        onChange={(e) => void changeStatus(t, e.target.value as TenantStatus)}
                      >
                        {SELECTABLE.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="btn" onClick={() => void rotate(t)} title="Rotate client secret">↻ Secret</button>
                      <button className="btn danger" onClick={() => void remove(t)}>Delete</button>
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {tenants.length === 0 && !loading && (
              <tr><td colSpan={7} className="muted">No tenants yet. Create one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="legend">Statuses: {STATUSES.join(' · ')}. Secrets are stored hashed and shown once on create/rotate.</p>
    </div>
  )
}
