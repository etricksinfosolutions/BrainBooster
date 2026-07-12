import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { MENU_ORDER, PERMISSION_META, type Permission } from '../auth/permissions'
import { AuditLogPanel } from './AuditLogPanel'
import { TenantsPanel } from './TenantsPanel'
import { Logo } from './Logo'

/** Authenticated shell: role-filtered navigation + section content. */
export function Dashboard() {
  const { user, logout } = useAuth()
  const granted = MENU_ORDER.filter((p) => user?.permissions.includes(p))
  const [active, setActive] = useState<Permission>(granted[0] || 'DASHBOARD')

  if (!user) return null

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo />
          <span>BrainBooster</span>
        </div>
        <nav aria-label="Sections">
          {granted.map((p) => (
            <button
              key={p}
              className={`nav-item${p === active ? ' active' : ''}`}
              aria-current={p === active ? 'page' : undefined}
              onClick={() => setActive(p)}
            >
              <span aria-hidden="true">{PERMISSION_META[p].icon}</span>
              {PERMISSION_META[p].label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <strong>{PERMISSION_META[active].label}</strong>
          </div>
          <div className="topbar-right">
            <span className="who">
              {user.username} · <span className="role-badge">{user.role}</span>
            </span>
            <button className="btn" onClick={() => void logout()}>
              Log out
            </button>
          </div>
        </header>

        <section className="content">
          {active === 'AUDIT_LOGS' ? (
            <AuditLogPanel />
          ) : active === 'TENANT_MANAGEMENT' ? (
            <TenantsPanel />
          ) : active === 'DASHBOARD' ? (
            <div className="panel">
              <h2>Welcome, {user.username}</h2>
              <p className="muted">
                You are signed in as <strong>{user.role}</strong>. Your role grants {user.permissions.length}{' '}
                capabilities, listed in the navigation.
              </p>
              <ul className="perm-grid">
                {user.permissions.map((p) => (
                  <li key={p}>
                    <span aria-hidden="true">{PERMISSION_META[p].icon}</span> {PERMISSION_META[p].label}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="panel">
              <h2>
                {PERMISSION_META[active].icon} {PERMISSION_META[active].label}
              </h2>
              <p className="muted">
                Access authorized for role <strong>{user.role}</strong> via the{' '}
                <code>{active}</code> permission. This module is gated by the authorization layer.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
