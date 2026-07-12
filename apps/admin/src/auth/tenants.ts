// Tenant management API client. Reuses the same credentialed fetch + CSRF
// approach as the auth client. The plaintext clientSecret is only present on
// create / rotate responses.

import { ApiError, readCsrfToken } from './api'

const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:4000'
const PREFIX = '/api/admin/tenants'

export type TenantStatus = 'created' | 'pending' | 'active' | 'suspended' | 'deleted'

export interface Tenant {
  id: string
  name: string
  clientId: string
  clientSecret?: string // present only right after create / rotate
  sessionTimeMinutes: number
  status: TenantStatus
  scope: string[]
  createdAt: string
  updatedAt: string
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
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server.')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, body.code || 'ERROR', body.error || `Request failed (${res.status})`)
  }
  return body as T
}

export interface CreateTenantInput {
  name: string
  sessionTimeMinutes: number
  scope: string[]
  status?: TenantStatus
}

export const tenantsApi = {
  list: () => request<{ tenants: Tenant[] }>('', { method: 'GET' }),
  create: (input: CreateTenantInput) =>
    request<{ tenant: Tenant }>('', { method: 'POST', body: JSON.stringify(input) }, true),
  update: (id: string, patch: Partial<CreateTenantInput>) =>
    request<{ tenant: Tenant }>(`/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }, true),
  setStatus: (id: string, status: TenantStatus) =>
    request<{ tenant: Tenant }>(`/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, true),
  rotateSecret: (id: string) =>
    request<{ tenant: Tenant }>(`/${id}/rotate-secret`, { method: 'POST' }, true),
  remove: (id: string) => request<{ tenant: Tenant }>(`/${id}`, { method: 'DELETE' }, true),
}
