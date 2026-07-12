/**
 * Activity asset management (SUPER_ADMIN). Lists every emoji/image used by the
 * activity catalogue and lets an admin override an entry with a custom image/GIF
 * (URL or data: URI). Overrides are keyed by the emoji glyph so any activity
 * using that glyph picks up the replacement. In-memory; swappable to a DB/CDN.
 */

const { CANONICAL_ACTIVITIES } = require('./activity-catalog')

class AssetsService {
  /** @param {{ auditService?: object, now?: () => number }} [deps] */
  constructor(deps = {}) {
    this._now = deps.now || Date.now
    this._audit = deps.auditService || null
    /** @type {Map<string, { imageUrl: string|null, updatedAt: string }>} keyed by emoji */
    this._overrides = new Map()
    // Derive the base asset list from the activity catalogue (unique emojis and
    // which activities use each).
    /** @type {Map<string, { emoji: string, usedBy: string[] }>} */
    this._base = new Map()
    for (const a of CANONICAL_ACTIVITIES) {
      const entry = this._base.get(a.emoji || a.icon) || { emoji: a.icon, usedBy: [] }
      entry.usedBy.push(a.id)
      this._base.set(a.icon, entry)
    }
  }

  _iso() {
    return new Date(this._now()).toISOString()
  }

  /** All assets with any override applied. */
  list() {
    return [...this._base.entries()].map(([emoji, meta]) => {
      const ov = this._overrides.get(emoji)
      return {
        key: emoji,
        emoji,
        usedBy: meta.usedBy,
        imageUrl: ov ? ov.imageUrl : null,
        overridden: Boolean(ov && ov.imageUrl),
        updatedAt: ov ? ov.updatedAt : null,
      }
    })
  }

  /** Just the active overrides { emoji: imageUrl } — consumed by the web app. */
  overrides() {
    const out = {}
    for (const [emoji, ov] of this._overrides) if (ov.imageUrl) out[emoji] = ov.imageUrl
    return out
  }

  /**
   * Set (or clear, when imageUrl is null/'') the override for an asset key.
   * @returns {{ ok: boolean, error?: string }}
   */
  setOverride(key, imageUrl, ctx = {}) {
    if (!this._base.has(key)) return { ok: false, error: 'unknown_asset' }
    if (!imageUrl) {
      this._overrides.delete(key)
      this._log('ASSET_OVERRIDE_CLEARED', ctx, `asset:${key}`)
      return { ok: true }
    }
    this._overrides.set(key, { imageUrl, updatedAt: this._iso() })
    this._log('ASSET_OVERRIDE_SET', ctx, `asset:${key}`)
    return { ok: true }
  }

  _log(event, ctx, detail) {
    if (this._audit) {
      this._audit.log({ event, username: ctx.actor && ctx.actor.username, role: ctx.actor && ctx.actor.role, ip: ctx.ip, userAgent: ctx.userAgent, detail })
    }
  }
}

module.exports = { AssetsService }
