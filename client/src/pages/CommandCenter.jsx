import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const STATUS_CONFIG = {
  on_trip: { label: 'On Trip', pillClass: 'bg-slate-100 text-slate-700', dotClass: 'bg-slate-500' },
  'On Trip': { label: 'On Trip', pillClass: 'bg-slate-100 text-slate-700', dotClass: 'bg-slate-500' },
  available: { label: 'Available', pillClass: 'bg-[#E8F5E9] text-[#2E7D32]', dotClass: 'bg-green-600' },
  'Available': { label: 'Available', pillClass: 'bg-[#E8F5E9] text-[#2E7D32]', dotClass: 'bg-green-600' },
  in_shop: { label: 'In Shop', pillClass: 'bg-[#FFF8E1] text-[#B7791F]', dotClass: 'bg-[#B7791F]' },
  'In Shop': { label: 'In Shop', pillClass: 'bg-[#FFF8E1] text-[#B7791F]', dotClass: 'bg-[#B7791F]' },
  critical: { label: 'Critical', pillClass: 'bg-[#FDECEC] text-[#C53030]', dotClass: 'bg-[#C53030]' },
  'Critical': { label: 'Critical', pillClass: 'bg-[#FDECEC] text-[#C53030]', dotClass: 'bg-[#C53030]' },
}

export default function CommandCenter() {
  const [stats, setStats] = useState({ activeFleet: 0, maintenanceAlerts: 0, fleetUtilization: 0, pendingCargoOrders: 0 })
  const [fleet, setFleet] = useState({ total: 0, available: 0, onTrip: 0, inShop: 0, critical: 0 })
  const [vehicles, setVehicles] = useState([])
  const [weeklyBars, setWeeklyBars] = useState([])
  const [totalVehicles, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [chartView, setChartView] = useState('Weekly')
  const limit = 4

  // Fetch dashboard stats, fleet status, and weekly utilization
  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.ok ? r.json() : null),
      fetch('/api/dashboard/fleet-status').then(r => r.ok ? r.json() : null),
      fetch('/api/dashboard/weekly-utilization').then(r => r.ok ? r.json() : null),
    ]).then(([s, f, w]) => {
      if (s) setStats(s)
      if (f) setFleet(f)
      if (w && Array.isArray(w)) {
        setWeeklyBars(w.map(d => ({
          day: d.day,
          pct: parseFloat(d.utilization_percentage) || 0,
          dim: d.day === 'Sat' || d.day === 'Sun'
        })))
      }
    }).catch(() => { }).finally(() => setLoading(false))
  }, [])

  // Fetch vehicles for the list
  useEffect(() => {
    fetch('/api/vehicles')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (Array.isArray(d)) {
          setTotal(d.length)
          const start = (page - 1) * limit
          setVehicles(d.slice(start, start + limit))
        }
      })
      .catch(() => { })
  }, [page])

  const totalPages = Math.ceil(totalVehicles / limit)
  const fleetTotal = fleet.total || 1
  const totalPages = Math.ceil(totalVehicles / limit)
  const fleetTotal = fleet.total || 1

  // Conic gradient percentages
  const avPct = Math.round((fleet.available / fleetTotal) * 100)
  const otPct = Math.round((fleet.onTrip / fleetTotal) * 100)
  const isPct = Math.round((fleet.inShop / fleetTotal) * 100)
  const crPct = 100 - avPct - otPct - isPct
  const avPct = Math.round((fleet.available / fleetTotal) * 100)
  const otPct = Math.round((fleet.onTrip / fleetTotal) * 100)
  const isPct = Math.round((fleet.inShop / fleetTotal) * 100)
  const crPct = 100 - avPct - otPct - isPct

  const donutGradient = `conic-gradient(
    #2E7D32 0% ${avPct}%,
    #2F3A45 ${avPct}% ${avPct + otPct}%,
    #B7791F ${avPct + otPct}% ${avPct + otPct + isPct}%,
    #C53030 ${avPct + otPct + isPct}% 100%
  )`

  return (
    <DashboardLayout breadcrumb={['Dashboard', 'Command Center']}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[28px] font-medium text-[#1A1A1A] tracking-tight">Command Center</h1>
            <p className="text-[#5A5A5A] mt-1">Real-time overview of fleet operations and alerts.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-[#E6E6E6] text-[#5A5A5A] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Export Report
            </button>
            <button className="px-4 py-2 bg-[#2F3A45] text-white text-sm font-medium rounded-lg hover:bg-[#1f262e] transition-colors shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Dispatch
            </button>
          </div>
        </div>

        {/* ── Stat Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Fleet */}
          <div className="bg-white p-6 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E6E6E6] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>+5%
              </span>
            </div>
            <div className="text-[32px] font-semibold text-[#1A1A1A]">{stats.activeFleet}</div>
            <div className="text-sm text-[#5A5A5A] font-medium mt-1">Active Fleet</div>
          </div>

          {/* Maintenance Alerts */}
          <div className="bg-white p-6 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E6E6E6] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-[#FFF8E1] text-[#B7791F]">
                <span className="material-symbols-outlined">build_circle</span>
              </div>
              <span className="flex items-center text-xs font-medium text-[#B7791F] bg-[#FFF8E1] px-2 py-1 rounded">
                Requires Action
              </span>
            </div>
            <div className="text-[32px] font-semibold text-[#1A1A1A]">{stats.maintenanceAlerts}</div>
            <div className="text-sm text-[#5A5A5A] font-medium mt-1">Maintenance Alerts</div>
          </div>

          {/* Fleet Utilization */}
          <div className="bg-white p-6 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E6E6E6] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                Optimal
              </span>
            </div>
            <div className="text-[32px] font-semibold text-[#1A1A1A]">{stats.fleetUtilization}%</div>
            <div className="text-sm text-[#5A5A5A] font-medium mt-1">Fleet Utilization</div>
          </div>

          {/* Pending Cargo Orders */}
          <div className="bg-white p-6 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E6E6E6] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
            </div>
            <div className="text-[32px] font-semibold text-[#1A1A1A]">{stats.pendingCargoOrders}</div>
            <div className="text-sm text-[#5A5A5A] font-medium mt-1">Pending Cargo Orders</div>
          </div>
        </div>

        {/* ── Charts Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">

          {/* Weekly Utilization Trend */}
          <div className="bg-white rounded-[10px] border border-[#E6E6E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 col-span-1 lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-[#1A1A1A]">Weekly Utilization Trend</h3>
              <div className="flex gap-2 text-sm">
                {['Weekly', 'Monthly'].map(v => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`px-3 py-1 rounded text-sm font-medium transition ${chartView === v
                      ? 'bg-gray-100 text-[#1A1A1A]'
                      : 'text-[#5A5A5A] hover:text-[#1A1A1A]'
                      }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2 border-b border-gray-100">
              {weeklyBars.map(({ day, pct, dim }) => (
                <div key={day} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group">
                  <div className="relative w-full max-w-[40px] h-[60%] bg-slate-100 rounded-sm overflow-hidden">
                    <div
                      className={`absolute bottom-0 w-full bg-[#2F3A45] rounded-t-sm transition-all duration-500 group-hover:opacity-100 ${dim ? 'opacity-40' : 'opacity-80'}`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#5A5A5A] font-medium">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet Status Donut */}
          <div className="bg-white rounded-[10px] border border-[#E6E6E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 col-span-1 flex flex-col">
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-6">Fleet Status</h3>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="relative w-48 h-48 rounded-full border-[12px] border-slate-100 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: donutGradient,
                    WebkitMask: 'radial-gradient(transparent 58%, black 59%)',
                    mask: 'radial-gradient(transparent 58%, black 59%)',
                  }}
                />
                <div className="text-center z-10">
                  <span className="block text-3xl font-bold text-[#1A1A1A]">{fleet.total}</span>
                  <span className="text-xs text-[#5A5A5A] uppercase font-semibold">Total Vehicles</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { color: '#2E7D32', label: 'Available', value: fleet.available, pct: avPct },
                { color: '#2F3A45', label: 'On Trip', value: fleet.onTrip, pct: otPct },
                { color: '#B7791F', label: 'In Shop', value: fleet.inShop, pct: isPct },
                { color: '#C53030', label: 'Critical', value: fleet.critical, pct: crPct },
                { color: '#2F3A45', label: 'On Trip', value: fleet.onTrip, pct: otPct },
                { color: '#B7791F', label: 'In Shop', value: fleet.inShop, pct: isPct },
                { color: '#C53030', label: 'Critical', value: fleet.critical, pct: crPct },
              ].map(({ color, label, value, pct }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[#5A5A5A]">{label}</span>
                  </div>
                  <span className="font-medium">{value} ({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Live Vehicle Activity ──────────────────────────────────── */}
        <div className="bg-white rounded-[10px] border border-[#E6E6E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E6E6E6] flex justify-between items-center">
            <h3 className="text-lg font-medium text-[#1A1A1A]">Live Vehicle Activity</h3>
            <div className="flex gap-2">
              <button className="p-1.5 text-[#5A5A5A] hover:text-[#1A1A1A] rounded hover:bg-gray-100">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
              </button>
              <button className="p-1.5 text-[#5A5A5A] hover:text-[#1A1A1A] rounded hover:bg-gray-100">
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] text-[#5A5A5A] text-xs uppercase font-semibold tracking-wider border-b border-[#E6E6E6]">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Driver</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {vehicles.map((v) => {
                  const s = STATUS_CONFIG[v.status] || STATUS_CONFIG.available
                  const s = STATUS_CONFIG[v.status] || STATUS_CONFIG.available
                  const cap = v.capacity_percentage ?? 0
                  const capColorClass = v.capColor || (cap >= 90 ? 'bg-red-500' : cap >= 50 ? 'bg-blue-600' : 'bg-green-600')

                  return (
                    <tr key={v.id} className="border-b border-[#E6E6E6] hover:bg-[#FDFDFD] transition-colors">
                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                          </div>
                          <div>
                            <div className="font-medium text-[#1A1A1A]">{v.name}</div>
                            <div className="text-xs text-[#5A5A5A]">{v.license_plate}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center ${s.pillClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${s.dotClass}`} />
                          {s.label}
                        </span>
                      </td>

                      {/* Driver */}
                      <td className="px-6 py-4">
                        {v.driver_name ? (
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${v.driverColor || 'bg-indigo-100 text-indigo-700'}`}>
                              {v.driver_initials || v.driver_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[#1A1A1A]">{v.driver_name}</span>
                          </div>
                        ) : (
                          <span className="text-[#5A5A5A] italic">--</span>
                        )}
                      </td>

                      {/* Region */}
                      <td className="px-6 py-4 text-[#5A5A5A]">{v.region || '--'}</td>

                      {/* Capacity */}
                      <td className="px-6 py-4">
                        {v.status === 'in_shop' ? (
                          <>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '0%' }} />
                            </div>
                            <span className="text-xs text-[#5A5A5A] mt-1 block">N/A</span>
                          </>
                        ) : cap === 0 ? (
                          <>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div className={`${capColorClass} h-1.5 rounded-full`} style={{ width: '0%' }} />
                            </div>
                            <span className="text-xs text-[#5A5A5A] mt-1 block">Empty</span>
                          </>
                        ) : (
                          <>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div className={`${capColorClass} h-1.5 rounded-full`} style={{ width: `${cap}%` }} />
                            </div>
                            <span className="text-xs text-[#5A5A5A] mt-1 block">{cap}% Full</span>
                          </>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#5A5A5A] hover:text-[#2F3A45] font-medium text-xs">View</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3 border-t border-[#E6E6E6] flex items-center justify-between text-sm text-[#5A5A5A]">
            <div>
              Showing {Math.min((page - 1) * limit + 1, totalVehicles)}–{Math.min(page * limit, totalVehicles)} of {totalVehicles} vehicles
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 border border-[#E6E6E6] rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 border border-[#E6E6E6] rounded hover:bg-gray-50 disabled:opacity-50 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </DashboardLayout>
  )
}
