import { useState, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */
const MOCK_DRIVERS = [
  {
    id: 'DRV-4821',
    name: 'Sarah Jenkins',
    status: 'On Duty',
    licenseStatus: 'Valid',
    experience: 5,
    safetyScore: 98,
    lastIncident: 'None in 12 mo.',
    initials: 'SJ',
    colorIndex: 0,
  },
  {
    id: 'DRV-3902',
    name: 'Michael Chen',
    status: 'Off Duty',
    licenseStatus: 'Valid',
    experience: 3,
    safetyScore: 94,
    lastIncident: 'Speeding (Warning)',
    initials: 'MC',
    colorIndex: 1,
  },
  {
    id: 'DRV-1104',
    name: 'James Wilson',
    status: 'Suspended',
    licenseStatus: 'Suspended',
    experience: 1,
    safetyScore: 45,
    lastIncident: 'Critical: Multiple Infractions',
    initials: 'JW',
    colorIndex: 2,
  },
  {
    id: 'DRV-5591',
    name: 'Elena Rodriguez',
    status: 'On Duty',
    licenseStatus: 'Expiring Soon',
    experience: 8,
    safetyScore: 78,
    lastIncident: 'Hard Braking Event',
    initials: 'ER',
    colorIndex: 3,
  },
  {
    id: 'DRV-2231',
    name: 'David Kim',
    status: 'Off Duty',
    licenseStatus: 'Valid',
    experience: 4,
    safetyScore: 92,
    lastIncident: 'Minor scratch (6mo ago)',
    initials: 'DK',
    colorIndex: 4,
  },
  {
    id: 'DRV-9921',
    name: 'Lisa Wong',
    status: 'On Duty',
    licenseStatus: 'Valid',
    experience: 2,
    safetyScore: 99,
    lastIncident: 'None',
    initials: 'LW',
    colorIndex: 0,
  },
  {
    id: 'DRV-7712',
    name: 'Marcus Johnson',
    status: 'On Duty',
    licenseStatus: 'Valid',
    experience: 12,
    safetyScore: 96,
    lastIncident: 'None in 24 mo.',
    initials: 'MJ',
    colorIndex: 1,
  },
  {
    id: 'DRV-6603',
    name: 'Priya Patel',
    status: 'Off Duty',
    licenseStatus: 'Valid',
    experience: 7,
    safetyScore: 88,
    lastIncident: 'Minor speeding (8mo ago)',
    initials: 'PP',
    colorIndex: 2,
  },
  {
    id: 'DRV-3310',
    name: 'Carlos Rivera',
    status: 'On Duty',
    licenseStatus: 'Expiring Soon',
    experience: 9,
    safetyScore: 81,
    lastIncident: 'Lane departure warning',
    initials: 'CR',
    colorIndex: 3,
  },
  {
    id: 'DRV-8801',
    name: 'Natalie Brooks',
    status: 'Off Duty',
    licenseStatus: 'Valid',
    experience: 6,
    safetyScore: 95,
    lastIncident: 'None in 18 mo.',
    initials: 'NB',
    colorIndex: 4,
  },
  {
    id: 'DRV-2209',
    name: 'Omar Hassan',
    status: 'Suspended',
    licenseStatus: 'Suspended',
    experience: 2,
    safetyScore: 38,
    lastIncident: 'Critical: Reckless driving',
    initials: 'OH',
    colorIndex: 2,
  },
  {
    id: 'DRV-4450',
    name: 'Tanya Novak',
    status: 'On Duty',
    licenseStatus: 'Valid',
    experience: 10,
    safetyScore: 97,
    lastIncident: 'None in 30 mo.',
    initials: 'TN',
    colorIndex: 0,
  },
]

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#d1fae5', text: '#065f46' },
  { bg: '#fed7aa', text: '#c2410c' },
  { bg: '#ede9fe', text: '#7c3aed' },
]

const ITEMS_PER_PAGE = 8

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
function getScoreColor(score) {
  if (score >= 90) return { text: '#2E7D32', bar: '#2E7D32' }
  if (score >= 75) return { text: '#EAB308', bar: '#EAB308' }
  return { text: '#C53030', bar: '#C53030' }
}

function getLicenseConfig(status) {
  switch (status) {
    case 'Valid':
      return { icon: 'verified', color: '#2E7D32', label: 'Valid' }
    case 'Expiring Soon':
      return { icon: 'warning', color: '#B7791F', label: 'Expiring Soon' }
    case 'Suspended':
      return { icon: 'block', color: '#C53030', label: 'Suspended' }
    default:
      return { icon: 'help', color: '#5A5A5A', label: status }
  }
}

function getStatusConfig(status) {
  switch (status) {
    case 'On Duty':
      return { bg: '#E8F5E9', text: '#2E7D32' }
    case 'Off Duty':
      return { bg: '#F3F4F6', text: '#4B5563' }
    case 'Suspended':
      return { bg: '#FDECEC', text: '#C53030' }
    default:
      return { bg: '#F3F4F6', text: '#4B5563' }
  }
}

/* ═══════════════════════════════════════════════════
   ADD DRIVER MODAL
   ═══════════════════════════════════════════════════ */
function AddDriverModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    experience: '',
    licenseStatus: 'Valid',
    status: 'Off Duty',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setTimeout(() => {
      const initials = form.name.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
      const newDriver = {
        id: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: form.name.trim(),
        status: form.status,
        licenseStatus: form.licenseStatus,
        experience: parseInt(form.experience) || 0,
        safetyScore: 100,
        lastIncident: 'None',
        initials,
        colorIndex: Math.floor(Math.random() * 5),
      }
      onAdd(newDriver)
      setSubmitting(false)
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6E6E6]">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A]">Add New Driver</h2>
            <p className="text-sm text-[#5A5A5A] mt-0.5">Onboard a new team member to your fleet.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#5A5A5A]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Smith"
              className="w-full border border-[#E6E6E6] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F3A45] focus:border-transparent transition"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Years of Experience
            </label>
            <input
              type="number"
              name="experience"
              min="0"
              max="50"
              value={form.experience}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full border border-[#E6E6E6] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F3A45] focus:border-transparent transition"
            />
          </div>

          {/* License Status */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              License Status
            </label>
            <select
              name="licenseStatus"
              value={form.licenseStatus}
              onChange={handleChange}
              className="w-full border border-[#E6E6E6] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F3A45] focus:border-transparent transition"
            >
              <option>Valid</option>
              <option>Expiring Soon</option>
              <option>Suspended</option>
            </select>
          </div>

          {/* Duty Status */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Duty Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-[#E6E6E6] rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2F3A45] focus:border-transparent transition"
            >
              <option>On Duty</option>
              <option>Off Duty</option>
              <option>Suspended</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#E6E6E6] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#2F3A45] text-white rounded-lg text-sm font-medium hover:bg-[#1f262e] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  Adding…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Add Driver
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   VIEW PROFILE MODAL
   ═══════════════════════════════════════════════════ */
function ViewProfileModal({ driver, onClose }) {
  if (!driver) return null
  const avatar = AVATAR_COLORS[driver.colorIndex % AVATAR_COLORS.length]
  const scoreColor = getScoreColor(driver.safetyScore)
  const licCfg = getLicenseConfig(driver.licenseStatus)
  const statusCfg = getStatusConfig(driver.status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header Band */}
        <div className="h-24 rounded-t-2xl bg-gradient-to-r from-[#2F3A45] to-[#4a5568] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-10 mb-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold border-4 border-white shadow-md"
            style={{ background: avatar.bg, color: avatar.text }}
          >
            {driver.initials}
          </div>
        </div>

        {/* Name & Status */}
        <div className="text-center px-6 pb-2">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">{driver.name}</h2>
          <p className="text-sm text-[#5A5A5A] mt-0.5">{driver.id}</p>
          <span
            className="inline-flex items-center mt-2 px-3 py-0.5 rounded-full text-xs font-medium"
            style={{ background: statusCfg.bg, color: statusCfg.text }}
          >
            {driver.status}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-px bg-[#E6E6E6] mx-6 mt-4 rounded-xl overflow-hidden">
          <div className="bg-white p-4 text-center">
            <div className="text-xl font-bold text-[#1A1A1A]">{driver.experience}</div>
            <div className="text-xs text-[#5A5A5A] mt-0.5">Yrs Experience</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="text-xl font-bold" style={{ color: scoreColor.text }}>{driver.safetyScore}</div>
            <div className="text-xs text-[#5A5A5A] mt-0.5">Safety Score</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="text-xl font-bold" style={{ color: licCfg.color }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {licCfg.icon}
              </span>
            </div>
            <div className="text-xs text-[#5A5A5A] mt-0.5">License</div>
          </div>
        </div>

        {/* Safety Score Bar */}
        <div className="mx-6 mt-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#5A5A5A]">Safety Score</span>
            <span className="text-sm font-bold" style={{ color: scoreColor.text }}>{driver.safetyScore}/100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${driver.safetyScore}%`, background: scoreColor.bar }}
            />
          </div>
        </div>

        {/* Last Incident */}
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E6E6E6]">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#5A5A5A] mt-0.5">history</span>
            <div>
              <div className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-0.5">Last Incident</div>
              <div
                className="text-sm font-medium"
                style={{ color: driver.safetyScore < 50 ? '#C53030' : '#1A1A1A' }}
              >
                {driver.lastIncident}
              </div>
            </div>
          </div>
        </div>

        {/* License Status */}
        <div className="mx-6 mt-3 mb-6 p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E6E6E6]">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ color: licCfg.color, fontVariationSettings: "'FILL' 1" }}
            >
              {licCfg.icon}
            </span>
            <div>
              <div className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-0.5">License Status</div>
              <div className="text-sm font-medium" style={{ color: licCfg.color }}>{licCfg.label}</div>
            </div>
          </div>
        </div>

        {/* Close */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#2F3A45] text-white rounded-lg text-sm font-medium hover:bg-[#1f262e] transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   DRIVER CARD
   ═══════════════════════════════════════════════════ */
function DriverCard({ driver, onViewProfile }) {
  const avatar = AVATAR_COLORS[driver.colorIndex % AVATAR_COLORS.length]
  const scoreColor = getScoreColor(driver.safetyScore)
  const licCfg = getLicenseConfig(driver.licenseStatus)
  const statusCfg = getStatusConfig(driver.status)
  const isSuspended = driver.status === 'Suspended'

  return (
    <div
      className={`
        bg-white border rounded-[10px] shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group
        ${isSuspended ? 'border-l-4 border-l-[#C53030] border-[#E6E6E6]' : 'border-[#E6E6E6]'}
      `}
      onClick={() => onViewProfile(driver)}
    >
      {/* Top Row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 border border-white shadow-sm"
            style={{
              background: avatar.bg,
              color: avatar.text,
              filter: isSuspended ? 'grayscale(1)' : 'none',
            }}
          >
            {driver.initials}
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A1A] text-[15px] leading-tight">{driver.name}</h3>
            <p className="text-[12px] text-[#5A5A5A] mt-0.5">ID: {driver.id}</p>
          </div>
        </div>
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{ background: statusCfg.bg, color: statusCfg.text }}
        >
          {driver.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {/* License */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-[13px] text-[#5A5A5A]">License Status</span>
          <span
            className="text-[13px] font-medium flex items-center gap-1"
            style={{ color: licCfg.color }}
          >
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {licCfg.icon}
            </span>
            {licCfg.label}
          </span>
        </div>

        {/* Experience */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-[13px] text-[#5A5A5A]">Experience</span>
          <span className="text-[13px] font-medium text-[#1A1A1A]">{driver.experience} Yr{driver.experience !== 1 ? 's' : ''}</span>
        </div>

        {/* Safety Score */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-[#5A5A5A] font-medium">Safety Score</span>
            <span className="text-[14px] font-bold" style={{ color: scoreColor.text }}>
              {driver.safetyScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${driver.safetyScore}%`, background: scoreColor.bar }}
            />
          </div>
          <p
            className="text-[11px] mt-2"
            style={{ color: driver.safetyScore < 50 ? '#C53030' : '#9ca3af' }}
          >
            {driver.lastIncident}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-[#E6E6E6] flex justify-end">
        <button
          className="text-[13px] font-medium text-[#5A5A5A] hover:text-[#2F3A45] flex items-center gap-1 group-hover:underline"
          onClick={(e) => { e.stopPropagation(); onViewProfile(driver) }}
        >
          View Profile
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function DriverProfiles() {
  const [drivers, setDrivers] = useState(MOCK_DRIVERS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterLicense, setFilterLicense] = useState('All')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [toast, setToast] = useState(null)

  /* ── Toast ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  /* ── Derived stats ── */
  const stats = useMemo(() => ({
    total: drivers.length,
    onDuty: drivers.filter(d => d.status === 'On Duty').length,
    safetyRisk: drivers.filter(d => d.safetyScore < 60).length,
    expiringLicenses: drivers.filter(d => d.licenseStatus === 'Expiring Soon').length,
  }), [drivers])

  /* ── Filtered & paginated ── */
  const filtered = useMemo(() => {
    let result = [...drivers]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'All') result = result.filter(d => d.status === filterStatus)
    if (filterLicense !== 'All') result = result.filter(d => d.licenseStatus === filterLicense)
    return result
  }, [drivers, search, filterStatus, filterLicense])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (dir) => {
    setCurrentPage(p => Math.min(Math.max(1, p + dir), totalPages))
  }

  /* ── Add driver ── */
  const handleAddDriver = (newDriver) => {
    setDrivers(prev => [newDriver, ...prev])
    setShowAddModal(false)
    showToast(`${newDriver.name} has been added to the fleet.`)
    setCurrentPage(1)
  }

  const activeFiltersCount = [filterStatus !== 'All', filterLicense !== 'All'].filter(Boolean).length

  return (
    <DashboardLayout breadcrumb={['Workspaces', 'Fleet Operations', 'Driver Profiles & Safety']}>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A1A1A] tracking-tight">Driver Profiles</h1>
          <p className="text-sm text-[#5A5A5A] mt-1">Manage driver roster, compliance status, and safety metrics.</p>
        </div>
        <div className="flex gap-3">
          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(p => !p)}
              className="px-4 py-2 bg-white border border-[#E6E6E6] rounded-lg text-sm font-medium text-[#5A5A5A] hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#2F3A45] text-white text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#E6E6E6] rounded-xl shadow-lg z-30 p-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-2">Duty Status</div>
                  {['All', 'On Duty', 'Off Duty', 'Suspended'].map(s => (
                    <label key={s} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input
                        type="radio"
                        name="filterStatus"
                        checked={filterStatus === s}
                        onChange={() => { setFilterStatus(s); setCurrentPage(1) }}
                        className="accent-[#2F3A45]"
                      />
                      <span className="text-sm text-[#1A1A1A]">{s}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#5A5A5A] uppercase tracking-wide mb-2">License Status</div>
                  {['All', 'Valid', 'Expiring Soon', 'Suspended'].map(s => (
                    <label key={s} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input
                        type="radio"
                        name="filterLicense"
                        checked={filterLicense === s}
                        onChange={() => { setFilterLicense(s); setCurrentPage(1) }}
                        className="accent-[#2F3A45]"
                      />
                      <span className="text-sm text-[#1A1A1A]">{s}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => { setFilterStatus('All'); setFilterLicense('All'); setCurrentPage(1) }}
                  className="w-full text-xs text-[#5A5A5A] hover:text-[#1A1A1A] underline text-left"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Add Driver */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#2F3A45] text-white rounded-lg text-sm font-medium hover:bg-[#1f262e] transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Driver
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white border border-[#E6E6E6] rounded-[10px] shadow-sm p-5 flex items-start justify-between">
          <div>
            <div className="text-[13px] text-[#5A5A5A] font-medium mb-1">Total Drivers</div>
            <div className="text-[26px] font-semibold text-[#1A1A1A]">{stats.total}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <span className="material-symbols-outlined text-gray-400">group</span>
          </div>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-[10px] shadow-sm p-5 flex items-start justify-between">
          <div>
            <div className="text-[13px] text-[#5A5A5A] font-medium mb-1">On Duty</div>
            <div className="text-[26px] font-semibold text-[#1A1A1A]">{stats.onDuty}</div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: '#E8F5E9' }}>
            <span className="material-symbols-outlined" style={{ color: '#2E7D32' }}>check_circle</span>
          </div>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-[10px] shadow-sm p-5 flex items-start justify-between">
          <div>
            <div className="text-[13px] text-[#5A5A5A] font-medium mb-1">Safety Risk</div>
            <div className="text-[26px] font-semibold text-[#1A1A1A]">{stats.safetyRisk}</div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: '#FDECEC' }}>
            <span className="material-symbols-outlined" style={{ color: '#C53030' }}>warning</span>
          </div>
        </div>

        <div className="bg-white border border-[#E6E6E6] rounded-[10px] shadow-sm p-5 flex items-start justify-between">
          <div>
            <div className="text-[13px] text-[#5A5A5A] font-medium mb-1">Expiring Licenses</div>
            <div className="text-[26px] font-semibold text-[#1A1A1A]">{stats.expiringLicenses}</div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: '#FFF8E1' }}>
            <span className="material-symbols-outlined" style={{ color: '#B7791F' }}>schedule</span>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            placeholder="Search drivers or ID…"
            className="w-full border border-[#E6E6E6] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F3A45] focus:border-transparent bg-white transition"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setCurrentPage(1) }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Driver Grid ── */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3">person_search</span>
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">No drivers found</h3>
          <p className="text-sm text-[#5A5A5A]">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map(driver => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onViewProfile={setSelectedDriver}
            />
          ))}

          {/* Add New Driver Card — only on last page */}
          {currentPage === totalPages && (
            <div
              onClick={() => setShowAddModal(true)}
              className="bg-transparent border-2 border-dashed border-[#E6E6E6] rounded-[10px] p-6 hover:bg-white hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-center items-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-[32px]">add</span>
              </div>
              <h3 className="font-semibold text-[#1A1A1A] text-[15px] mb-1">Add New Driver</h3>
              <p className="text-[12px] text-[#5A5A5A] text-center mb-4">Onboard a new team member to your fleet.</p>
              <span className="text-[13px] font-medium text-[#2F3A45] hover:underline">Start Onboarding</span>
            </div>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      <div className="mt-8 flex items-center justify-between border-t border-[#E6E6E6] pt-6">
        <div className="text-[13px] text-[#5A5A5A]">
          Showing{' '}
          <span className="font-medium text-[#1A1A1A]">
            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
          </span>{' '}
          of <span className="font-medium text-[#1A1A1A]">{filtered.length}</span> drivers
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg bg-white text-[13px] text-[#5A5A5A] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-[#E6E6E6] rounded-lg bg-white text-[13px] text-[#5A5A5A] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddDriverModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDriver}
        />
      )}
      {selectedDriver && (
        <ViewProfileModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border transition-all ${
            toast.type === 'success'
              ? 'bg-white border-[#E6E6E6] text-[#1A1A1A]'
              : 'bg-[#FDECEC] border-[#FDECEC] text-[#C53030]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ color: toast.type === 'success' ? '#2E7D32' : '#C53030', fontVariationSettings: "'FILL' 1" }}
          >
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Click-outside to close filter menu */}
      {showFilterMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
      )}
    </DashboardLayout>
  )
}
