// Admin auth API client. Talks to the server's /api/admin/auth endpoints using
// HTTP-only session cookies (credentials: 'include') plus a CSRF token echoed
// in the X-CSRF-Token header for mutating requests. Never stores the session
// token in JS (it is HttpOnly) — only the readable CSRF token is handled here.

import type { AdminProfile } from './permissions'

const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'
const PREFIX = '/api/admin/auth'

export class ApiError extends Error {
  status: number
  code: string
  retryAfterMs?: number
  constructor(status: number, code: string, message: string, retryAfterMs?: number) {
    super(message)
    this.status = status
    this.code = code
    this.retryAfterMs = retryAfterMs
  }
}

/** Read the (non-HttpOnly) CSRF token the server set at login. */
export function readCsrfToken(): string {
  const m = document.cookie.match(/(?:^|;\s*)bb_admin_csrf=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : ''
}

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
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server. Is it running?')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.code || 'ERROR',
      body.error || `Request failed (${res.status})`,
      body.retryAfterMs,
    )
  }
  return body as T
}

export interface CaptchaChallenge {
  captchaId: string
  image: string
  expiresInMs: number
}

export interface AuditEntry {
  id: string
  timestamp: string
  event: string
  username?: string
  role?: string
  ip?: string
  userAgent?: string
  reason?: string
}

export const authApi = {
  captcha: () => request<CaptchaChallenge>('/captcha', { method: 'POST' }),

  login: (input: { username: string; password: string; captchaId: string; captchaText: string }) =>
    request<{ user: AdminProfile; csrfToken: string }>('/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  me: () => request<{ user: AdminProfile }>('/me', { method: 'GET' }),

  refresh: () => request<{ user: AdminProfile }>('/refresh', { method: 'POST' }, true),

  logout: () => request<{ ok: boolean }>('/logout', { method: 'POST' }, true),

  auditLogs: (limit = 100) =>
    request<{ entries: AuditEntry[] }>(`/audit-logs?limit=${limit}`, { method: 'GET' }),
}
