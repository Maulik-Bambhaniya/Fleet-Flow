import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', fill: true },
  { icon: 'directions_car', label: 'Vehicle Registry', path: '/vehicles' },
  { icon: 'alt_route', label: 'Trip Dispatcher', path: '/dispatch' },
  { icon: 'build', label: 'Maintenance Logs', path: '/maintenance' },
  { icon: 'receipt_long', label: 'Expenses & Fuel', path: '/expenses' },
  { icon: 'badge', label: 'Driver Profiles', path: '/drivers' },
  { icon: 'bar_chart', label: 'Analytics', path: '/analytics' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-[240px] bg-[#F7F7F5] border-r border-[#E6E6E6] flex flex-col fixed h-full z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-transparent">
        <div className="flex items-center gap-2 text-[#2F3A45]">
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_shipping
          </span>
          <span className="font-bold text-lg tracking-tight text-[#1A1A1A]">FleetFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-[#5A5A5A] uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map(({ icon, label, path, fill }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={
                'flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ' +
                (isActive
                  ? 'bg-white text-[#1A1A1A] border-l-4 border-[#2F3A45] !pl-3 shadow-sm'
                  : 'text-[#5A5A5A] hover:bg-white hover:text-[#1A1A1A]')
              }
            >
              <span
                className="material-symbols-outlined mr-3 text-[20px]"
                style={isActive || fill ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>


    </aside>
  )
}
