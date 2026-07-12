/**
 * Password hashing abstraction.
 *
 * AuthService depends only on the `PasswordHasher` shape ({ hash, verify,
 * scheme }). Swapping bcrypt for argon2 later is a matter of writing a new
 * implementation and injecting it — AuthService never changes.
 */

const bcrypt = require('bcryptjs');

/**
 * @typedef {Object} PasswordHasher
 * @property {string} scheme                       Identifier, e.g. 'bcrypt'.
 * @property {(plain: string) => Promise<string>} hash
 * @property {(plain: string, hash: string) => Promise<boolean>} verify
 */

/** bcrypt implementation (bcryptjs is already a project dependency). */
class BcryptPasswordHasher {
  /** @param {number} [rounds] */
  constructor(rounds = 12) {
    this.scheme = 'bcrypt';
    this._rounds = rounds;
  }

  /** @param {string} plain */
  async hash(plain) {
    return bcrypt.hash(plain, this._rounds);
  }

  /**
   * Constant-time verification. Returns false (never throws) on malformed hashes
   * so a corrupt record can't leak information via an exception path.
   * @param {string} plain
   * @param {string} hash
   */
  async verify(plain, hash) {
    if (typeof plain !== 'string' || typeof hash !== 'string' || hash.length === 0) {
      return false;
    }
    try {
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }
}

/**
 * Example of the future argon2 seam. Intentionally not wired (argon2 is not a
 * dependency yet); documents that swapping is a pure implementation change.
 * Kept as a factory so importing this file never requires argon2.
 *
 * @returns {PasswordHasher}
 */
function createArgon2Hasher(argon2Module) {
  return {
    scheme: 'argon2',
    async hash(plain) {
      return argon2Module.hash(plain);
    },
    async verify(plain, hash) {
      try {
        return await argon2Module.verify(hash, plain);
      } catch {
        return false;
      }
    },
  };
}

module.exports = { BcryptPasswordHasher, createArgon2Hasher };
