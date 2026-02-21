import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout({ children, breadcrumb }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}')
    } catch {
      return { name: 'Sarah Jenkins', role: 'manager' }
    }
  })()

  const displayName = user?.name || 'Sarah Jenkins'
  const displayRole = user?.role === 'manager' ? 'Fleet Manager' : 'Dispatcher'

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null)
      setShowResults(false)
      return
    }

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setSearchResults(data)
            setShowResults(true)
          }
        })
        .catch(() => { })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleResultClick = (type, item) => {
    setShowResults(false)
    setSearchQuery('')
    switch (type) {
      case 'vehicle': navigate('/vehicles'); break
      case 'driver': navigate('/drivers'); break
      case 'trip': navigate('/dispatch'); break
      case 'maintenance': navigate('/maintenance'); break
    }
  }

  const totalResults = searchResults
    ? searchResults.vehicles.length + searchResults.drivers.length + searchResults.trips.length + searchResults.maintenance.length
    : 0

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
          <div className="flex-1 max-w-lg mx-8 relative" ref={searchRef}>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#2F3A45] text-[20px]">
                search
              </span>
              <input
                className="w-full bg-[#F7F7F5] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#2F3A45] placeholder-gray-500 transition-all"
                placeholder="Search fleet, drivers, or trip ID..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchResults && totalResults > 0) setShowResults(true) }}
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[400px] overflow-y-auto z-50">
                {totalResults === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <>
                    {/* Vehicles */}
                    {searchResults.vehicles.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                          <span className="material-symbols-outlined text-sm mr-1 align-middle">directions_car</span>
                          Vehicles ({searchResults.vehicles.length})
                        </div>
                        {searchResults.vehicles.map(v => (
                          <button
                            key={v.id}
                            onClick={() => handleResultClick('vehicle', v)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50"
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-blue-600 text-sm">directions_car</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                              <p className="text-xs text-gray-500">{v.license_plate} · {v.region || 'No region'}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === 'Available' ? 'bg-green-100 text-green-700' :
                                v.status === 'On Trip' ? 'bg-blue-100 text-blue-700' :
                                  v.status === 'In Shop' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                              }`}>{v.status}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Drivers */}
                    {searchResults.drivers.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                          <span className="material-symbols-outlined text-sm mr-1 align-middle">badge</span>
                          Drivers ({searchResults.drivers.length})
                        </div>
                        {searchResults.drivers.map(d => (
                          <button
                            key={d.id}
                            onClick={() => handleResultClick('driver', d)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50"
                          >
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-purple-600 text-sm">person</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{d.name}</p>
                              <p className="text-xs text-gray-500">{d.license_id} · {d.experience_yrs}yr exp · Score: {d.safety_score}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'available' ? 'bg-green-100 text-green-700' :
                                d.status === 'on_duty' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                              }`}>{d.status}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Trips */}
                    {searchResults.trips.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                          <span className="material-symbols-outlined text-sm mr-1 align-middle">alt_route</span>
                          Trips ({searchResults.trips.length})
                        </div>
                        {searchResults.trips.map(t => (
                          <button
                            key={t.id}
                            onClick={() => handleResultClick('trip', t)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50"
                          >
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-orange-600 text-sm">alt_route</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{t.trip_id}</p>
                              <p className="text-xs text-gray-500">{t.origin} → {t.destination} · {t.cargo_type}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-700' :
                                t.status === 'dispatched' ? 'bg-blue-100 text-blue-700' :
                                  t.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                              }`}>{t.status}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Maintenance */}
                    {searchResults.maintenance.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                          <span className="material-symbols-outlined text-sm mr-1 align-middle">build</span>
                          Maintenance ({searchResults.maintenance.length})
                        </div>
                        {searchResults.maintenance.map(m => (
                          <button
                            key={m.id}
                            onClick={() => handleResultClick('maintenance', m)}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-amber-600 text-sm">build</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{m.service_type}</p>
                              <p className="text-xs text-gray-500">{m.vehicle_name || 'Unknown vehicle'} · {m.status}</p>
                            </div>
                            {m.cost && <span className="text-xs font-medium text-gray-700">${parseFloat(m.cost).toFixed(0)}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
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
