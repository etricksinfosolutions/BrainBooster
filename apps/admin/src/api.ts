// Thin client for the BrainBooster server admin API. Base URL is configurable so
// the portal can point at local, staging, or prod without a rebuild.
const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('bb_admin_token') || ''
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export interface Activity { id: string; topic: string; prompt: string; status?: string }

export const api = {
  health: () => req<{ status: string }>('/api/health'),
  pendingActivities: () => req<Activity[]>('/api/admin/activities?status=pending'),
  approve: (id: string) => req<{ ok: boolean }>(`/api/admin/activities/${id}/approve`, { method: 'POST' }),
  reject: (id: string) => req<{ ok: boolean }>(`/api/admin/activities/${id}/reject`, { method: 'POST' }),
  metrics: () => req<Record<string, number>>('/api/admin/metrics'),
}
