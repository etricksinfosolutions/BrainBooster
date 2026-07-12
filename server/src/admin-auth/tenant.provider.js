/**
 * TenantProvider abstraction — the tenant store the TenantService talks to.
 *
 * Mirrors the UserProvider pattern: the service depends only on this interface,
 * so the in-memory store here can be replaced by Postgres/Mongo later without
 * touching TenantService. A stored tenant keeps only the secret HASH — the
 * plaintext client secret is shown once at creation/rotation and never persisted.
 *
 * Interface:
 *   create(record)        -> Promise<Tenant>
 *   list()                -> Promise<Tenant[]>
 *   findById(id)          -> Promise<Tenant | null>
 *   findByClientId(cid)   -> Promise<Tenant | null>
 *   update(id, patch)     -> Promise<Tenant | null>
 */

/**
 * @typedef {Object} Tenant
 * @property {string} id
 * @property {string} name
 * @property {string} clientId
 * @property {string} clientSecretHash   bcrypt hash — never the plaintext
 * @property {number} sessionTimeMinutes
 * @property {string} status             one of TENANT_STATUSES
 * @property {string[]} scope
 * @property {string} createdAt          ISO-8601
 * @property {string} updatedAt          ISO-8601
 */

class InMemoryTenantProvider {
  constructor() {
    this.name = 'memory'
    /** @type {Map<string, Tenant>} */
    this._byId = new Map()
    /** @type {Map<string, string>} */
    this._clientIdIndex = new Map()
  }

  /** @param {Tenant} record */
  async create(record) {
    this._byId.set(record.id, record)
    this._clientIdIndex.set(record.clientId, record.id)
    return record
  }

  async list() {
    return [...this._byId.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }

  async findById(id) {
    return this._byId.get(id) || null
  }

  async findByClientId(clientId) {
    const id = this._clientIdIndex.get(clientId)
    return id ? this._byId.get(id) || null : null
  }

  /** @param {string} id @param {Partial<Tenant>} patch */
  async update(id, patch) {
    const existing = this._byId.get(id)
    if (!existing) return null
    const next = { ...existing, ...patch }
    this._byId.set(id, next)
    return next
  }

  size() {
    return this._byId.size
  }
}

module.exports = { InMemoryTenantProvider }
