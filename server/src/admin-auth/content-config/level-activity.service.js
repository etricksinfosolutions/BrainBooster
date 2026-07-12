/**
 * Level → Activity assignment.
 *
 * Lets an admin pin a specific activity to a level. When a level has an
 * assignment, ONLY that activity is served there (the web scheduler honours the
 * override). In-memory map now; swap the store for a DB table without changing
 * callers or the controller.
 */

const { CANONICAL_ACTIVITIES, ACTIVITY_IDS, buildLevelMetas } = require('./activity-catalog')

class LevelActivityService {
  /** @param {{ auditService?: object, now?: () => number, totalLevels?: number }} [deps] */
  constructor(deps = {}) {
    /** @type {Map<number, string>} levelId → activityId */
    this._assignments = new Map()
    this._levels = buildLevelMetas(deps.totalLevels)
    this._audit = deps.auditService || null
  }

  /** Full config for the admin screen: levels, available activities, current map. */
  getConfig() {
    return {
      levels: this._levels,
      activities: CANONICAL_ACTIVITIES,
      assignments: this.assignments(),
    }
  }

  /** Plain object { levelId: activityId } of current overrides. */
  assignments() {
    const out = {}
    for (const [levelId, activityId] of this._assignments) out[levelId] = activityId
    return out
  }

  /**
   * Assign an activity to a level (or clear it when activityId is null/''):
   * @returns {{ ok: boolean, error?: string }}
   */
  setAssignment(levelId, activityId, ctx = {}) {
    const id = Number(levelId)
    if (!this._levels.some((l) => l.id === id)) return { ok: false, error: 'unknown_level' }

    if (activityId === null || activityId === '' || activityId === undefined) {
      this._assignments.delete(id)
      this._log('LEVEL_ACTIVITY_CLEARED', ctx, `level:${id}`)
      return { ok: true }
    }
    if (!ACTIVITY_IDS.has(activityId)) return { ok: false, error: 'unknown_activity' }
    this._assignments.set(id, activityId)
    this._log('LEVEL_ACTIVITY_SET', ctx, `level:${id} activity:${activityId}`)
    return { ok: true }
  }

  _log(event, ctx, detail) {
    if (this._audit) {
      this._audit.log({ event, username: ctx.actor && ctx.actor.username, role: ctx.actor && ctx.actor.role, ip: ctx.ip, userAgent: ctx.userAgent, detail })
    }
  }
}

module.exports = { LevelActivityService }
