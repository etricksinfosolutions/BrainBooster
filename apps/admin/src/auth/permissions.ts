// Display metadata for permissions. The AUTHORITY on which permissions a role
// has is the backend (returned by /me); this map only turns permission codes
// into human labels + icons for the navigation menu. No role→permission logic
// lives here.

export type Permission =
  | 'USER_MANAGEMENT'
  | 'ADMIN_MANAGEMENT'
  | 'PLATFORM_SETTINGS'
  | 'FEATURE_FLAGS'
  | 'ANALYTICS'
  | 'CONTENT'
  | 'GAMES'
  | 'AI_CONFIGURATION'
  | 'SYSTEM_MAINTENANCE'
  | 'AUDIT_LOGS'
  | 'TENANT_MANAGEMENT'
  | 'LEVEL_ACTIVITY'
  | 'FUN_FACTS'
  | 'ASSET_MANAGEMENT'
  | 'DASHBOARD'
  | 'REPORTS'

export type Role = 'SUPER_ADMIN' | 'ADMIN'

export interface AdminProfile {
  id: string
  username: string
  role: Role
  permissions: Permission[]
  issuedAt: string
}

// Menu order + labels. Rendered only for permissions the user actually has.
export const PERMISSION_META: Record<Permission, { label: string; icon: string }> = {
  DASHBOARD: { label: 'Dashboard', icon: '🏠' },
  USER_MANAGEMENT: { label: 'User Management', icon: '👥' },
  ADMIN_MANAGEMENT: { label: 'Admin Management', icon: '🛡️' },
  GAMES: { label: 'Games', icon: '🎮' },
  LEVEL_ACTIVITY: { label: 'Level Activities', icon: '🗺️' },
  CONTENT: { label: 'Content', icon: '📚' },
  FUN_FACTS: { label: 'Fun Facts', icon: '💡' },
  ASSET_MANAGEMENT: { label: 'Activity Assets', icon: '🖼️' },
  ANALYTICS: { label: 'Analytics', icon: '📊' },
  REPORTS: { label: 'Reports', icon: '📈' },
  AI_CONFIGURATION: { label: 'AI Configuration', icon: '🤖' },
  FEATURE_FLAGS: { label: 'Feature Flags', icon: '🚩' },
  PLATFORM_SETTINGS: { label: 'Platform Settings', icon: '⚙️' },
  SYSTEM_MAINTENANCE: { label: 'System Maintenance', icon: '🛠️' },
  TENANT_MANAGEMENT: { label: 'Tenants', icon: '🏢' },
  AUDIT_LOGS: { label: 'Audit Logs', icon: '🧾' },
}

export const MENU_ORDER: Permission[] = [
  'DASHBOARD',
  'USER_MANAGEMENT',
  'ADMIN_MANAGEMENT',
  'GAMES',
  'LEVEL_ACTIVITY',
  'CONTENT',
  'FUN_FACTS',
  'ASSET_MANAGEMENT',
  'ANALYTICS',
  'REPORTS',
  'AI_CONFIGURATION',
  'FEATURE_FLAGS',
  'PLATFORM_SETTINGS',
  'SYSTEM_MAINTENANCE',
  'TENANT_MANAGEMENT',
  'AUDIT_LOGS',
]
