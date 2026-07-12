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
const { OAuthService } = require('./oauth.service');
const { makeGuards } = require('./guards');
const { makeBearerGuard } = require('./bearer.guard');
const { createAuthRouter } = require('./auth.controller');
const { createTenantRouter } = require('./tenant.controller');
const { createOAuthRouter } = require('./oauth.controller');
const { config } = require('./config');

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

  // OAuth2 client-credentials: tenant clientId/secret -> Bearer access token.
  const oauthService = new OAuthService({
    tenantProvider,
    passwordHasher,
    auditService,
    now: opts.now,
  });
  const oauthRouter = createOAuthRouter({ oauthService });
  const requireBearer = makeBearerGuard(oauthService);

  // Idempotently seed the web-app client so the browser build can obtain tokens.
  async function seedWebAppClient() {
    const w = config.webAppClient;
    return tenantService.ensureSeedClient({
      name: w.name,
      clientId: w.clientId,
      clientSecret: w.clientSecret,
      scope: w.scope,
      sessionTimeMinutes: w.sessionTimeMinutes,
      status: 'active',
    });
  }

  return {
    router,
    tenantRouter,
    oauthRouter,
    requireBearer,
    seedWebAppClient,
    oauthService,
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
