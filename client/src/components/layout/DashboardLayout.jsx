import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children, breadcrumb }) {
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const user = (() => {
    try {
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const displayName = user?.name || 'Guest User'
  const displayRole = user?.role === 'manager' ? 'Fleet Manager' : (user?.role || 'Dispatcher')

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="h-screen overflow-hidden flex bg-[#F7F7F5]">
      <Sidebar />

      <main className="flex-1 ml-[240px] flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E6E6E6] flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
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
          <div className="flex-1 max-w-lg mx-8 hidden sm:block">
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

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-1 text-left rounded-lg p-1 hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[#1A1A1A]">{displayName}</p>
                  <p className="text-xs text-[#5A5A5A]">{displayRole}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-[#2F3A45] flex items-center justify-center text-white text-sm font-semibold border border-gray-200">
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{displayRole}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
