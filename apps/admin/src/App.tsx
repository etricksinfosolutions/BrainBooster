import { useEffect, useState } from 'react'
import { api, type Activity } from './api'

export default function App() {
  const [tab, setTab] = useState<'review' | 'metrics'>('review')
  const [items, setItems] = useState<Activity[]>([])
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function refresh() {
    setLoading(true); setError(null)
    try {
      if (tab === 'review') setItems(await api.pendingActivities())
      else setMetrics(await api.metrics())
    } catch (e) {
      setError((e as Error).message + ' — is the server running on VITE_API_BASE?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [tab])

  async function act(id: string, kind: 'approve' | 'reject') {
    await api[kind](id)
    setItems((xs) => xs.filter((x) => x.id !== id))
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>🧠 BrainBooster Admin</h1>
      <nav style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('review')} disabled={tab === 'review'}>Content Review</button>
        <button onClick={() => setTab('metrics')} disabled={tab === 'metrics'}>Metrics</button>
        <button onClick={refresh}>Refresh</button>
      </nav>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {tab === 'review' && !loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th align="left">ID</th><th align="left">Topic</th><th align="left">Prompt</th><th /></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} style={{ borderTop: '1px solid #ddd' }}>
                <td>{a.id}</td><td>{a.topic}</td><td>{a.prompt}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button onClick={() => act(a.id, 'approve')}>✓ Approve</button>{' '}
                  <button onClick={() => act(a.id, 'reject')}>✗ Reject</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4}>No pending activities.</td></tr>}
          </tbody>
        </table>
      )}
      {tab === 'metrics' && !loading && (
        <ul>{Object.entries(metrics).map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}</ul>
      )}
    </div>
  )
}
