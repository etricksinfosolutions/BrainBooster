/**
 * UserProvider abstraction.
 *
 * The authentication layer talks to this interface only, so the backing store
 * can later become PostgreSQL, MongoDB, LDAP, OAuth, or SSO without changing
 * AuthService. A provider must expose:
 *
 *   findByUsername(username) -> Promise<AdminUser | null>
 *   findById(id)            -> Promise<AdminUser | null>
 *
 * An AdminUser is: { id, username, role, passwordHash }. Providers are the ONLY
 * place credentials live — they never leak into controllers or services.
 */

/**
 * @typedef {import('./password.hasher').PasswordHasher} PasswordHasher
 * @typedef {Object} AdminUser
 * @property {string} id
 * @property {string} username
 * @property {import('./roles').Role} role
 * @property {string} passwordHash
 */

const { ROLES } = require('./roles');

/**
 * Development seed provider. The two hardcoded credentials exist as plaintext
 * constants ONLY here; they are hashed once at construction so the rest of the
 * system only ever sees `passwordHash`. This is the single file to delete when
 * moving to a persistent store.
 */
class SeedUserProvider {
  /**
   * @param {PasswordHasher} hasher
   * @param {Array<{id?:string, username:string, password:string, role:string}>} [seed]
   */
  constructor(hasher, seed) {
    this.name = 'seed';
    this._hasher = hasher;
    this._byUsername = new Map();
    this._byId = new Map();
    this._ready = this._load(
      seed || [
        { username: 'superadmin', password: 'superadmin', role: ROLES.SUPER_ADMIN },
        { username: 'admin', password: 'admin', role: ROLES.ADMIN },
      ]
    );
  }

  /** @param {Array<{id?:string, username:string, password:string, role:string}>} seed */
  async _load(seed) {
    for (const [i, s] of seed.entries()) {
      const passwordHash = await this._hasher.hash(s.password);
      const user = {
        id: s.id || `seed-${i + 1}`,
        username: s.username.toLowerCase(),
        role: s.role,
        passwordHash,
      };
      this._byUsername.set(user.username, user);
      this._byId.set(user.id, user);
    }
  }

  /** Resolves once seed hashing has finished (providers may be async to init). */
  async ready() {
    await this._ready;
    return this;
  }

  /**
   * @param {string} username
   * @returns {Promise<AdminUser | null>}
   */
  async findByUsername(username) {
    await this._ready;
    if (typeof username !== 'string') return null;
    return this._byUsername.get(username.trim().toLowerCase()) || null;
  }

  /**
   * @param {string} id
   * @returns {Promise<AdminUser | null>}
   */
  async findById(id) {
    await this._ready;
    return this._byId.get(id) || null;
  }
}

module.exports = { SeedUserProvider };
