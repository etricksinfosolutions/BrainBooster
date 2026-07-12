// Content-config API client: level→activity, fun facts, activity assets.
// Same credentialed fetch + CSRF pattern as the other admin clients.

import { ApiError, readCsrfToken } from './api'

const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'
const PREFIX = '/api/admin/content'

async function request<T>(path: string, init: RequestInit = {}, withCsrf = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }
  if (withCsrf) {
    const csrf = readCsrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf
  }
  let res: Response
  try {
    res = await fetch(`${BASE}${PREFIX}${path}`, { ...init, headers, credentials: 'include' })
  } catch {
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, body.code || 'ERROR', body.error || `Request failed (${res.status})`)
  return body as T
}

export interface ActivityMeta { id: string; name: string; icon: string; mechanic: string; category: string }
export interface LevelMeta { id: number; tier: string; tierIndex: number }
export interface LevelConfig { levels: LevelMeta[]; activities: ActivityMeta[]; assignments: Record<string, string> }

export interface FunFact {
  id: string
  icon: string
  category: string
  title: string
  text: string
  imageUrl: string | null
  themes: string[]
  createdAt: string
  updatedAt: string
}
export interface FunFactInput {
  icon?: string
  category?: string
  title: string
  text: string
  imageUrl?: string | null
  themes?: string[]
}

export interface AssetItem {
  key: string
  emoji: string
  usedBy: string[]
  imageUrl: string | null
  overridden: boolean
  updatedAt: string | null
}

export const contentApi = {
  // Level → activity
  levels: () => request<LevelConfig>('/levels', { method: 'GET' }),
  setLevelActivity: (levelId: number, activityId: string | null) =>
    request<{ ok: boolean; assignments: Record<string, string> }>(`/levels/${levelId}`, {
      method: 'PUT',
      body: JSON.stringify({ activityId }),
    }, true),

  // Fun facts
  funFacts: () => request<{ facts: FunFact[] }>('/fun-facts', { method: 'GET' }),
  createFunFact: (input: FunFactInput) =>
    request<{ fact: FunFact }>('/fun-facts', { method: 'POST', body: JSON.stringify(input) }, true),
  updateFunFact: (id: string, patch: Partial<FunFactInput>) =>
    request<{ fact: FunFact }>(`/fun-facts/${id}`, { method: 'PUT', body: JSON.stringify(patch) }, true),
  deleteFunFact: (id: string) => request<{ ok: boolean }>(`/fun-facts/${id}`, { method: 'DELETE' }, true),

  // Assets
  assets: () => request<{ assets: AssetItem[] }>('/assets', { method: 'GET' }),
  setAsset: (key: string, imageUrl: string | null) =>
    request<{ ok: boolean }>(`/assets/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ imageUrl }),
    }, true),
}

/** Reads a File as a data: URI (for image/gif uploads). */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}
