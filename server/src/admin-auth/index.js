/**
 * Admin-auth composition root.
 *
 * Instantiates the concrete implementations (seed users + bcrypt today) and
 * wires them into AuthService, then exposes the Express router and the live
 * service instances (the latter for tests / audit-log screens).
 *
 * To migrate off seed users: construct a different UserProvider here (PgUser
 * Provider, LdapUserProvider, …) — nothing else changes.
 */

const { BcryptPasswordHasher } = require('./password.hasher');
const { SeedUserProvider } = require('./user.provider');
const { CaptchaService } = require('./captcha.service');
const { SessionService } = require('./session.service');
const { LoginThrottleService } = require('./throttle.service');
const { AuditService } = require('./audit.service');
const { AuthService } = require('./auth.service');
const { TenantService } = require('./tenant.service');
const { InMemoryTenantProvider } = require('./tenant.provider');
const { makeGuards } = require('./guards');
const { createAuthRouter } = require('./auth.controller');
const { createTenantRouter } = require('./tenant.controller');

/**
 * @param {{ silentAudit?: boolean, userProvider?: object, now?: () => number }} [opts]
 */
function createAdminAuth(opts = {}) {
  const passwordHasher = new BcryptPasswordHasher(12);
  const userProvider = opts.userProvider || new SeedUserProvider(passwordHasher);
  const captchaService = new CaptchaService({ now: opts.now });
  const sessionService = new SessionService({ now: opts.now });
  const throttleService = new LoginThrottleService({ now: opts.now });
  const auditService = new AuditService({ now: opts.now, silent: opts.silentAudit });

  const authService = new AuthService({
    userProvider,
    passwordHasher,
    captchaService,
    sessionService,
    throttleService,
    auditService,
  });

  const guards = makeGuards(authService, auditService);
  const router = createAuthRouter({ authService, auditService, guards });

  // Tenant management (SUPER_ADMIN only) shares the hasher + audit trail.
  const tenantProvider = opts.tenantProvider || new InMemoryTenantProvider();
  const tenantService = new TenantService({
    tenantProvider,
    passwordHasher,
    auditService,
    now: opts.now,
  });
  const tenantRouter = createTenantRouter({ tenantService, guards });

  return {
    router,
    tenantRouter,
    authService,
    tenantService,
    auditService,
    sessionService,
    captchaService,
    throttleService,
    userProvider,
    tenantProvider,
    passwordHasher,
    guards,
  };
}

module.exports = { createAdminAuth };
