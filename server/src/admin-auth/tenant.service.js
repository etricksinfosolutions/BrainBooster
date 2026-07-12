/**
 * TenantService — business logic for tenant lifecycle management.
 *
 * A tenant is an OAuth-style client: { name, clientId, clientSecret,
 * sessionTime, status, scope }. The client secret is generated server-side,
 * returned in PLAINTEXT exactly once (at creation or rotation), and stored only
 * as a bcrypt hash (via the shared PasswordHasher) — the same never-store-secrets
 * posture as admin passwords.
 *
 * Depends only on a TenantProvider + PasswordHasher + AuditService, so the store
 * is swappable without changing this class.
 */

const crypto = require('crypto')
const { AUDIT_EVENTS } = require('./audit.service')

/** Allowed tenant lifecycle states. */
const TENANT_STATUSES = Object.freeze(['created', 'pending', 'active', 'suspended', 'deleted'])

/** Tenant-specific audit events (added to the shared audit vocabulary). */
const TENANT_EVENTS = Object.freeze({
  CREATED: 'TENANT_CREATED',
  UPDATED: 'TENANT_UPDATED',
  STATUS_CHANGED: 'TENANT_STATUS_CHANGED',
  SECRET_ROTATED: 'TENANT_SECRET_ROTATED',
  DELETED: 'TENANT_DELETED',
})

class TenantService {
  /**
   * @param {{ tenantProvider: import('./tenant.provider').InMemoryTenantProvider,
   *           passwordHasher: import('./password.hasher').PasswordHasher,
   *           auditService: import('./audit.service').AuditService,
   *           now?: () => number }} deps
   */
  constructor(deps) {
    this.tenants = deps.tenantProvider
    this.hasher = deps.passwordHasher
    this.audit = deps.auditService
    this._now = deps.now || Date.now
  }

  _iso() {
    return new Date(this._now()).toISOString()
  }

  _genClientId() {
    return `tnt_${crypto.randomBytes(12).toString('hex')}`
  }

  _genClientSecret() {
    return `sk_${crypto.randomBytes(24).toString('hex')}`
  }

  /** Public shape — NEVER includes the secret hash. */
  toPublic(tenant, opts = {}) {
    if (!tenant) return null
    const out = {
      id: tenant.id,
      name: tenant.name,
      clientId: tenant.clientId,
      sessionTimeMinutes: tenant.sessionTimeMinutes,
      status: tenant.status,
      scope: [...tenant.scope],
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
    // The plaintext secret is surfaced only immediately after create/rotate.
    if (opts.clientSecret) out.clientSecret = opts.clientSecret
    return out
  }

  /**
   * @param {{ name: string, sessionTimeMinutes: number, scope?: string[], status?: string }} input
   * @param {{ actor?: object, ip?: string, userAgent?: string }} ctx
   * @returns {Promise<{ tenant: object }>} public tenant incl. one-time clientSecret
   */
  async create(input, ctx = {}) {
    const status = input.status && TENANT_STATUSES.includes(input.status) ? input.status : 'created'
    const clientSecret = this._genClientSecret()
    const now = this._iso()
    const record = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      clientId: this._genClientId(),
      clientSecretHash: await this.hasher.hash(clientSecret),
      sessionTimeMinutes: input.sessionTimeMinutes,
      status,
      scope: Array.isArray(input.scope) ? input.scope : [],
      createdAt: now,
      updatedAt: now,
    }
    await this.tenants.create(record)
    this._audit(TENANT_EVENTS.CREATED, record, ctx, `status:${status}`)
    return { tenant: this.toPublic(record, { clientSecret }) }
  }

  async list() {
    const rows = await this.tenants.list()
    return rows.map((t) => this.toPublic(t))
  }

  async get(id) {
    return this.toPublic(await this.tenants.findById(id))
  }

  /**
   * Update mutable fields (name, sessionTime, scope). Status changes go through
   * setStatus so they get their own audit event.
   */
  async update(id, patch, ctx = {}) {
    const existing = await this.tenants.findById(id)
    if (!existing || existing.status === 'deleted') return null
    const next = await this.tenants.update(id, {
      name: patch.name !== undefined ? patch.name.trim() : existing.name,
      sessionTimeMinutes:
        patch.sessionTimeMinutes !== undefined ? patch.sessionTimeMinutes : existing.sessionTimeMinutes,
      scope: patch.scope !== undefined ? patch.scope : existing.scope,
      updatedAt: this._iso(),
    })
    this._audit(TENANT_EVENTS.UPDATED, next, ctx)
    return this.toPublic(next)
  }

  /** @param {string} newStatus one of TENANT_STATUSES (not 'deleted' — use remove) */
  async setStatus(id, newStatus, ctx = {}) {
    if (!TENANT_STATUSES.includes(newStatus)) return { error: 'invalid_status' }
    const existing = await this.tenants.findById(id)
    if (!existing || existing.status === 'deleted') return null
    const next = await this.tenants.update(id, { status: newStatus, updatedAt: this._iso() })
    this._audit(TENANT_EVENTS.STATUS_CHANGED, next, ctx, `from:${existing.status}->${newStatus}`)
    return this.toPublic(next)
  }

  /** Rotate the client secret. Returns the new plaintext ONCE. */
  async rotateSecret(id, ctx = {}) {
    const existing = await this.tenants.findById(id)
    if (!existing || existing.status === 'deleted') return null
    const clientSecret = this._genClientSecret()
    const next = await this.tenants.update(id, {
      clientSecretHash: await this.hasher.hash(clientSecret),
      updatedAt: this._iso(),
    })
    this._audit(TENANT_EVENTS.SECRET_ROTATED, next, ctx)
    return this.toPublic(next, { clientSecret })
  }

  /** Soft delete — flips status to 'deleted' (audit trail preserved). */
  async remove(id, ctx = {}) {
    const existing = await this.tenants.findById(id)
    if (!existing || existing.status === 'deleted') return null
    const next = await this.tenants.update(id, { status: 'deleted', updatedAt: this._iso() })
    this._audit(TENANT_EVENTS.DELETED, next, ctx)
    return this.toPublic(next)
  }

  /** Verify a tenant's client credentials (for future machine-to-machine auth). */
  async verifyCredentials(clientId, clientSecret) {
    const tenant = await this.tenants.findByClientId(clientId)
    if (!tenant || tenant.status !== 'active') return false
    return this.hasher.verify(clientSecret, tenant.clientSecretHash)
  }

  _audit(event, tenant, ctx, detail) {
    this.audit.log({
      event,
      username: ctx.actor && ctx.actor.username,
      role: ctx.actor && ctx.actor.role,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      detail: `tenant:${tenant.name}(${tenant.clientId})${detail ? ' ' + detail : ''}`,
    })
  }
}

module.exports = { TenantService, TENANT_STATUSES, TENANT_EVENTS }
