/**
 * Tenant management HTTP controller. Mounted at /api/admin/tenants.
 * SUPER_ADMIN only (guarded by the TENANT_MANAGEMENT permission); all mutations
 * additionally require the CSRF token. The plaintext client secret is returned
 * only in the create / rotate-secret responses.
 */

const express = require('express')
const { z } = require('zod')
const { PERMISSIONS } = require('./roles')
const { TENANT_STATUSES } = require('./tenant.service')
const { clientContext } = require('./guards')

const scopeToken = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9:_-]+$/, 'scopes are lowercase tokens (a-z 0-9 : _ -)')

const createSchema = z.object({
  name: z.string().min(2).max(80),
  sessionTimeMinutes: z.number().int().min(1).max(1440),
  scope: z.array(scopeToken).max(50).default([]),
  status: z.enum(TENANT_STATUSES).optional(),
})

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  sessionTimeMinutes: z.number().int().min(1).max(1440).optional(),
  scope: z.array(scopeToken).max(50).optional(),
})

const statusSchema = z.object({ status: z.enum(TENANT_STATUSES) })

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
 * @param {{ tenantService: import('./tenant.service').TenantService,
 *           guards: ReturnType<import('./guards').makeGuards> }} deps
 */
function createTenantRouter({ tenantService, guards }) {
  const router = express.Router()
  const { requirePermission, csrfProtection } = guards
  // Every tenant route requires the TENANT_MANAGEMENT permission (SUPER_ADMIN).
  router.use(requirePermission(PERMISSIONS.TENANT_MANAGEMENT))

  const ctxOf = (req) => {
    const c = clientContext(req)
    return { actor: req.adminSession, ip: c.ip, userAgent: c.userAgent }
  }
  const notFound = (res) => res.status(404).json({ error: 'Tenant not found', code: 'NOT_FOUND' })

  router.get('/', async (_req, res, next) => {
    try {
      res.json({ tenants: await tenantService.list() })
    } catch (err) { next(err) }
  })

  router.post('/', csrfProtection, validate(createSchema), async (req, res, next) => {
    try {
      const { tenant } = await tenantService.create(req.body, ctxOf(req))
      res.status(201).json({ tenant })
    } catch (err) { next(err) }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      const tenant = await tenantService.get(req.params.id)
      if (!tenant) return notFound(res)
      res.json({ tenant })
    } catch (err) { next(err) }
  })

  router.patch('/:id', csrfProtection, validate(updateSchema), async (req, res, next) => {
    try {
      const tenant = await tenantService.update(req.params.id, req.body, ctxOf(req))
      if (!tenant) return notFound(res)
      res.json({ tenant })
    } catch (err) { next(err) }
  })

  router.patch('/:id/status', csrfProtection, validate(statusSchema), async (req, res, next) => {
    try {
      const tenant = await tenantService.setStatus(req.params.id, req.body.status, ctxOf(req))
      if (!tenant) return notFound(res)
      if (tenant.error) return res.status(400).json({ error: 'Invalid status', code: 'VALIDATION' })
      res.json({ tenant })
    } catch (err) { next(err) }
  })

  router.post('/:id/rotate-secret', csrfProtection, async (req, res, next) => {
    try {
      const tenant = await tenantService.rotateSecret(req.params.id, ctxOf(req))
      if (!tenant) return notFound(res)
      res.json({ tenant })
    } catch (err) { next(err) }
  })

  router.delete('/:id', csrfProtection, async (req, res, next) => {
    try {
      const tenant = await tenantService.remove(req.params.id, ctxOf(req))
      if (!tenant) return notFound(res)
      res.json({ tenant })
    } catch (err) { next(err) }
  })

  return router
}

module.exports = { createTenantRouter }
