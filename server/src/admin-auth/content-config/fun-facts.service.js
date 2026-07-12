/**
 * Fun-facts management (SUPER_ADMIN). CRUD over "Did you know?" facts, each with
 * an optional image/GIF (stored as a URL or a data: URI so uploads work without
 * server file storage). In-memory store, seeded with a starter set; swappable to
 * a DB table.
 */

const crypto = require('crypto')

const SEED_FACTS = [
  { icon: '🌍', category: 'Geography', title: 'The Water Planet', text: 'Earth is the only planet we know of with liquid water on its surface.', themes: ['space', 'general'] },
  { icon: '🚀', category: 'Space', title: 'One Million Earths', text: 'The Sun is so big that about one million Earths could fit inside it!', themes: ['space'] },
  { icon: '🦖', category: 'Dinosaurs', title: 'Big and Small Dinos', text: 'Some dinosaurs were smaller than a chicken, others longer than a bus!', themes: ['dino'] },
  { icon: '🌊', category: 'Oceans', title: 'The Ocean Helps You Breathe', text: 'More than half the oxygen you breathe comes from tiny ocean plants.', themes: ['ocean', 'general'] },
]

class FunFactsService {
  /** @param {{ auditService?: object, now?: () => number }} [deps] */
  constructor(deps = {}) {
    /** @type {Map<string, object>} */
    this._store = new Map()
    this._now = deps.now || Date.now
    this._audit = deps.auditService || null
    for (const f of SEED_FACTS) this._insert(f)
  }

  _iso() {
    return new Date(this._now()).toISOString()
  }

  _insert(input) {
    const now = this._iso()
    const fact = {
      id: crypto.randomUUID(),
      icon: input.icon || '💡',
      category: input.category || 'General',
      title: input.title,
      text: input.text,
      imageUrl: input.imageUrl || null,
      themes: Array.isArray(input.themes) ? input.themes : [],
      createdAt: now,
      updatedAt: now,
    }
    this._store.set(fact.id, fact)
    return fact
  }

  list() {
    return [...this._store.values()].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  }

  get(id) {
    return this._store.get(id) || null
  }

  create(input, ctx = {}) {
    const fact = this._insert(input)
    this._log('FUN_FACT_CREATED', ctx, fact.title)
    return fact
  }

  update(id, patch, ctx = {}) {
    const existing = this._store.get(id)
    if (!existing) return null
    const next = {
      ...existing,
      icon: patch.icon !== undefined ? patch.icon : existing.icon,
      category: patch.category !== undefined ? patch.category : existing.category,
      title: patch.title !== undefined ? patch.title : existing.title,
      text: patch.text !== undefined ? patch.text : existing.text,
      imageUrl: patch.imageUrl !== undefined ? patch.imageUrl : existing.imageUrl,
      themes: patch.themes !== undefined ? patch.themes : existing.themes,
      updatedAt: this._iso(),
    }
    this._store.set(id, next)
    this._log('FUN_FACT_UPDATED', ctx, next.title)
    return next
  }

  remove(id, ctx = {}) {
    const existing = this._store.get(id)
    if (!existing) return false
    this._store.delete(id)
    this._log('FUN_FACT_DELETED', ctx, existing.title)
    return true
  }

  _log(event, ctx, detail) {
    if (this._audit) {
      this._audit.log({ event, username: ctx.actor && ctx.actor.username, role: ctx.actor && ctx.actor.role, ip: ctx.ip, userAgent: ctx.userAgent, detail })
    }
  }
}

module.exports = { FunFactsService }
