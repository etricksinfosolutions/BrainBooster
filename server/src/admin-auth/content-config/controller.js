/**
 * Content-config HTTP controller. Mounted at /api/admin/content.
 *
 *   Level → Activity  (perm LEVEL_ACTIVITY)
 *     GET  /levels            list levels + activities + current assignments
 *     PUT  /levels/:id        { activityId: string | null }
 *
 *   Fun facts         (perm FUN_FACTS — SUPER_ADMIN)
 *     GET/POST /fun-facts, PUT/DELETE /fun-facts/:id
 *
 *   Activity assets   (perm ASSET_MANAGEMENT — SUPER_ADMIN)
 *     GET  /assets            list emojis/images + overrides
 *     PUT  /assets/:key       { imageUrl: string | null }
 *
 * All mutations require the CSRF token. Image fields accept an http(s) URL or a
 * data: URI (so uploads work with no server file storage).
 */

const express = require('express')
const { z } = require('zod')
const { PERMISSIONS } = require('../roles')
const { clientContext } = require('../guards')

// http(s) URL or data: URI (uploaded image/gif), capped so a single asset can't
// exhaust memory. The mount uses an 8 MB JSON limit; keep the field under that.
const imageRef = z
  .string()
  .max(7_000_000)
  .refine((s) => /^https?:\/\//.test(s) || /^data:image\//.test(s), 'must be an http(s) URL or data:image URI')

const factSchema = z.object({
  icon: z.string().max(16).optional(),
  category: z.string().max(60).optional(),
  title: z.string().min(2).max(120),
  text: z.string().min(2).max(600),
  imageUrl: imageRef.nullable().optional(),
  themes: z.array(z.string().max(30)).max(20).optional(),
})
const factPatchSchema = factSchema.partial()
const levelSchema = z.object({ activityId: z.string().max(80).nullable() })
const assetSchema = z.object({ imageUrl: imageRef.nullable() })

function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: 'Invalid input', code: 'VALIDATION', details: parsed.error.flatten().fieldErrors })
    }
    req.body = parsed.data
    next()
  }
}

/**
 * @param {{ services: { levelActivity, funFacts, assets },
 *           guards: ReturnType<import('../guards').makeGuards> }} deps
 */
function createContentConfigRouter({ services, guards }) {
  const router = express.Router()
  const { requirePermission, csrfProtection } = guards
  const { levelActivity, funFacts, assets } = services
  const ctxOf = (req) => {
    const c = clientContext(req)
    return { actor: req.adminSession, ip: c.ip, userAgent: c.userAgent }
  }

  // ---- Level → Activity ----------------------------------------------------
  const levelPerm = requirePermission(PERMISSIONS.LEVEL_ACTIVITY)
  router.get('/levels', levelPerm, (_req, res) => res.json(levelActivity.getConfig()))
  router.put('/levels/:id', levelPerm, csrfProtection, validate(levelSchema), (req, res) => {
    const result = levelActivity.setAssignment(req.params.id, req.body.activityId, ctxOf(req))
    if (!result.ok) return res.status(400).json({ error: result.error, code: 'VALIDATION' })
    res.json({ ok: true, assignments: levelActivity.assignments() })
  })

  // ---- Fun facts -----------------------------------------------------------
  const factPerm = requirePermission(PERMISSIONS.FUN_FACTS)
  router.get('/fun-facts', factPerm, (_req, res) => res.json({ facts: funFacts.list() }))
  router.post('/fun-facts', factPerm, csrfProtection, validate(factSchema), (req, res) => {
    res.status(201).json({ fact: funFacts.create(req.body, ctxOf(req)) })
  })
  router.put('/fun-facts/:id', factPerm, csrfProtection, validate(factPatchSchema), (req, res) => {
    const fact = funFacts.update(req.params.id, req.body, ctxOf(req))
    if (!fact) return res.status(404).json({ error: 'Fun fact not found', code: 'NOT_FOUND' })
    res.json({ fact })
  })
  router.delete('/fun-facts/:id', factPerm, csrfProtection, (req, res) => {
    if (!funFacts.remove(req.params.id, ctxOf(req)))
      return res.status(404).json({ error: 'Fun fact not found', code: 'NOT_FOUND' })
    res.json({ ok: true })
  })

  // ---- Activity assets -----------------------------------------------------
  const assetPerm = requirePermission(PERMISSIONS.ASSET_MANAGEMENT)
  router.get('/assets', assetPerm, (_req, res) => res.json({ assets: assets.list() }))
  router.put('/assets/:key', assetPerm, csrfProtection, validate(assetSchema), (req, res) => {
    const result = assets.setOverride(req.params.key, req.body.imageUrl, ctxOf(req))
    if (!result.ok) return res.status(400).json({ error: result.error, code: 'VALIDATION' })
    res.json({ ok: true })
  })

  return router
}

module.exports = { createContentConfigRouter }
