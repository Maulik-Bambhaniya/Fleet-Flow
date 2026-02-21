import Sidebar from './Sidebar'

export default function DashboardLayout({ children, breadcrumb }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}')
    } catch {
      return { name: 'Sarah Jenkins', role: 'manager' }
    }
  })()

  const displayName = user?.name || 'Sarah Jenkins'
  const displayRole = user?.role === 'manager' ? 'Fleet Manager' : 'Dispatcher'

  return (
    <div className="h-screen overflow-hidden flex">
      <Sidebar />

      <main className="flex-1 ml-[240px] flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E6E6E6] flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-[#5A5A5A]">
            {breadcrumb?.map((crumb, i) => (
              <span key={i} className="flex items-center">
                {i > 0 && (
                  <span className="material-symbols-outlined text-base mx-2 text-gray-400">chevron_right</span>
                )}
                <span className={i === breadcrumb.length - 1 ? 'font-medium text-[#1A1A1A]' : 'hover:text-[#1A1A1A] cursor-pointer'}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#2F3A45] text-[20px]">
                search
              </span>
              <input
                className="w-full bg-[#F7F7F5] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F3A45] placeholder-gray-500 transition-all"
                placeholder="Search fleet, drivers, or trip ID..."
                type="text"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-[#5A5A5A] hover:bg-gray-100 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#1A1A1A]">{displayName}</p>
                <p className="text-xs text-[#5A5A5A]">{displayRole}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#2F3A45] flex items-center justify-center text-white text-sm font-semibold border border-gray-200">
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
