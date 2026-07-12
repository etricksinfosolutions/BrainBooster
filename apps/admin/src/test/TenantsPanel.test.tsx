import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TenantsPanel } from '../components/TenantsPanel'
import { tenantsApi } from '../auth/tenants'

vi.mock('../auth/tenants', async () => {
  const actual = await vi.importActual<typeof import('../auth/tenants')>('../auth/tenants')
  return { ...actual, tenantsApi: { list: vi.fn(), create: vi.fn(), setStatus: vi.fn(), rotateSecret: vi.fn(), remove: vi.fn() } }
})

const api = tenantsApi as unknown as Record<string, ReturnType<typeof vi.fn>>

const sample = {
  id: 't1', name: 'Acme School', clientId: 'tnt_abc', sessionTimeMinutes: 60,
  status: 'active' as const, scope: ['games'], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
}

describe('TenantsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.list.mockResolvedValue({ tenants: [sample] })
  })

  it('lists tenants without exposing a secret', async () => {
    render(<TenantsPanel />)
    const row = (await screen.findByText('Acme School')).closest('tr') as HTMLElement
    expect(within(row).getByText('tnt_abc')).toBeInTheDocument()
    // Status is shown as a badge (not just a <select> option).
    expect(row.querySelector('.status-badge.s-active')).not.toBeNull()
    expect(screen.queryByText(/^sk_/)).not.toBeInTheDocument()
  })

  it('creates a tenant and reveals the one-time secret', async () => {
    const user = userEvent.setup()
    api.create.mockResolvedValue({
      tenant: { ...sample, id: 't2', name: 'North Academy', clientId: 'tnt_new', clientSecret: 'sk_secret123' },
    })
    render(<TenantsPanel />)
    await screen.findByText('Acme School')

    await user.type(screen.getByPlaceholderText('Acme School'), 'North Academy')
    await user.type(screen.getByPlaceholderText(/games, content/i), 'games, analytics')
    await user.click(screen.getByRole('button', { name: /add tenant/i }))

    await waitFor(() =>
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'North Academy', sessionTimeMinutes: 60, scope: ['games', 'analytics'] }),
      ),
    )
    const reveal = await screen.findByRole('alert')
    expect(within(reveal).getByText('sk_secret123')).toBeInTheDocument()
  })
})
