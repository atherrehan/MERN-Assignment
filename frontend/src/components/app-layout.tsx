import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/countries', label: 'Countries', end: false },
  { to: '/states', label: 'States', end: false },
] as const

function NavItems() {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

/**
 * Shared application shell: persistent header, sidebar navigation, footer, and an
 * <Outlet /> for the routed page. Wraps every route so the nav is always visible.
 * Responsive: sidebar on md+, the same links collapse into the header on small screens.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="flex h-14 items-center gap-4 px-4">
          <NavLink to="/" className="text-lg font-semibold">
            Country &amp; State
          </NavLink>
          {/* On small screens the nav lives in the header. */}
          <nav className="ml-auto flex gap-1 md:hidden">
            <NavItems />
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r bg-background p-3 md:block">
          <nav className="flex flex-col gap-1">
            <NavItems />
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>

      <footer className="border-t bg-background">
        <div className="px-4 py-3 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Country &amp; State Management
        </div>
      </footer>
    </div>
  )
}
