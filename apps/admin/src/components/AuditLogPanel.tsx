import { useEffect, useState } from 'react'
import { authApi, ApiError, type AuditEntry } from '../auth/api'

/** Live audit feed — only reachable by roles with the AUDIT_LOGS permission. */
export function AuditLogPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { entries: rows } = await authApi.auditLogs(200)
      setEntries(rows)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>🧾 Audit Logs</h2>
        <button className="btn" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      {!error && (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>User</th>
                <th>Role</th>
                <th>IP</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className={`evt-${e.event.toLowerCase()}`}>
                  <td className="mono">{new Date(e.timestamp).toLocaleString()}</td>
                  <td>{e.event}</td>
                  <td>{e.username || '—'}</td>
                  <td>{e.role || '—'}</td>
                  <td className="mono">{e.ip || '—'}</td>
                  <td>{e.reason || '—'}</td>
                </tr>
              ))}
              {entries.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="muted">No audit entries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
