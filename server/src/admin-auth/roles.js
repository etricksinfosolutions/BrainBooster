/**
 * Authorization layer — the SINGLE source of truth for roles and permissions.
 *
 * No permission is hardcoded anywhere else in the codebase; controllers and
 * guards ask this module. Adding a role or moving a permission is a one-file
 * change.
 */

/** @typedef {'SUPER_ADMIN' | 'ADMIN'} Role */

const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
});

/**
 * Every permission the portal knows about. Screens/features reference these
 * constants; they never hardcode role strings.
 */
const PERMISSIONS = Object.freeze({
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  ADMIN_MANAGEMENT: 'ADMIN_MANAGEMENT',
  PLATFORM_SETTINGS: 'PLATFORM_SETTINGS',
  FEATURE_FLAGS: 'FEATURE_FLAGS',
  ANALYTICS: 'ANALYTICS',
  CONTENT: 'CONTENT',
  GAMES: 'GAMES',
  AI_CONFIGURATION: 'AI_CONFIGURATION',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  AUDIT_LOGS: 'AUDIT_LOGS',
  TENANT_MANAGEMENT: 'TENANT_MANAGEMENT',
  LEVEL_ACTIVITY: 'LEVEL_ACTIVITY',
  FUN_FACTS: 'FUN_FACTS',
  ASSET_MANAGEMENT: 'ASSET_MANAGEMENT',
  DASHBOARD: 'DASHBOARD',
  REPORTS: 'REPORTS',
});

/** Role → permission set. ADMIN is deliberately a subset of SUPER_ADMIN. */
const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: Object.freeze([
    PERMISSIONS.USER_MANAGEMENT,
    PERMISSIONS.ADMIN_MANAGEMENT,
    PERMISSIONS.PLATFORM_SETTINGS,
    PERMISSIONS.FEATURE_FLAGS,
    PERMISSIONS.ANALYTICS,
    PERMISSIONS.CONTENT,
    PERMISSIONS.GAMES,
    PERMISSIONS.AI_CONFIGURATION,
    PERMISSIONS.SYSTEM_MAINTENANCE,
    PERMISSIONS.AUDIT_LOGS,
    PERMISSIONS.TENANT_MANAGEMENT,
    PERMISSIONS.LEVEL_ACTIVITY,
    PERMISSIONS.FUN_FACTS,
    PERMISSIONS.ASSET_MANAGEMENT,
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.REPORTS,
  ]),
  [ROLES.ADMIN]: Object.freeze([
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.GAMES,
    PERMISSIONS.CONTENT,
    PERMISSIONS.REPORTS,
    PERMISSIONS.ANALYTICS,
    // Level→activity assignment is content configuration, available to ADMIN too.
    PERMISSIONS.LEVEL_ACTIVITY,
  ]),
});

/** @param {string} role */
function isRole(role) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

/** Permissions granted to a role (empty array for unknown roles). */
function permissionsFor(role) {
  return ROLE_PERMISSIONS[role] ? [...ROLE_PERMISSIONS[role]] : [];
}

/** True if the role grants the permission. */
function roleHasPermission(role, permission) {
  const set = ROLE_PERMISSIONS[role];
  return Boolean(set && set.includes(permission));
}

/** True if the role is in the allow-list. Empty allow-list means "any known role". */
function roleAllowed(role, allowedRoles) {
  if (!isRole(role)) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  isRole,
  permissionsFor,
  roleHasPermission,
  roleAllowed,
};
