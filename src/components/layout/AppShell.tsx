import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/tropels', icon: '🧬', label: 'Tropeles' },
  { to: '/signals', icon: '📡', label: 'Señales' },
  { to: '/sectors', icon: '🗺', label: 'Sectores' },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-panel">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-sm font-bold">
              T
            </div>
            <div>
              <p className="text-xs font-display font-semibold text-bright leading-tight">
                TropelCare
              </p>
              <p className="text-[10px] text-muted font-mono leading-tight">
                Control Room
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navegación principal">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-display transition-colors ${
                  isActive
                    ? 'bg-accent/15 text-accent-glow border border-accent/30'
                    : 'text-dim hover:text-bright hover:bg-border/50'
                }`
              }
            >
              <span aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-display text-bright truncate">{user.displayName}</p>
              <p className="text-[10px] text-muted font-mono">{user.teamCode}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dim hover:text-danger hover:bg-danger/10 transition-colors font-display"
          >
            <span aria-hidden>⏻</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" id="main-content">
        <Outlet />
      </main>
    </div>
  )
}
