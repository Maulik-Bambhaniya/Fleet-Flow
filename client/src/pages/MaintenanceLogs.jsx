import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './MaintenanceLogs.css'

/* ═══════════════════════════════════════════════════
   MOCK DATA — vehicles & maintenance logs
   ═══════════════════════════════════════════════════ */
const MOCK_VEHICLES = [
    { id: 'v1', name: 'Volvo FH16 - #402', license_plate: 'V78-992-KL', type: 'Truck', max_capacity: 18000, odometer: 125000, status: 'In Shop' },
    { id: 'v2', name: 'Mercedes Actros - #205', license_plate: 'M45-123-ZZ', type: 'Truck', max_capacity: 15000, odometer: 98000, status: 'In Shop' },
    { id: 'v3', name: 'Scania R500 - #112', license_plate: 'S88-554-PL', type: 'Truck', max_capacity: 20000, odometer: 210000, status: 'Available' },
    { id: 'v4', name: 'Ford Transit - #VAN04', license_plate: 'F12-332-NY', type: 'Van', max_capacity: 1500, odometer: 45000, status: 'Available' },
    { id: 'v5', name: 'Kenworth T680 - #301', license_plate: 'K99-112-TX', type: 'Truck', max_capacity: 22000, odometer: 175000, status: 'In Shop' },
    { id: 'v6', name: 'Volvo VNL - #410', license_plate: 'V22-118-CA', type: 'Truck', max_capacity: 19000, odometer: 142000, status: 'Available' },
    { id: 'v7', name: 'Ram ProMaster - #VAN09', license_plate: 'R44-991-FL', type: 'Van', max_capacity: 1800, odometer: 62000, status: 'Available' },
    { id: 'v8', name: 'Peterbilt 579 - #550', license_plate: 'P11-223-AZ', type: 'Truck', max_capacity: 24000, odometer: 198000, status: 'In Shop' },
]

const MOCK_LOGS = [
    { id: 'ml1', vehicle_id: 'v1', vehicle_name: 'Volvo FH16 - #402', license_plate: 'V78-992-KL', vehicle_type: 'Truck', service_type: 'Engine Transmission Failure', cost: 4250, service_date: '2026-01-24', status: 'Critical', notes: 'Major failure — requires full rebuild' },
    { id: 'ml2', vehicle_id: 'v2', vehicle_name: 'Mercedes Actros - #205', license_plate: 'M45-123-ZZ', vehicle_type: 'Truck', service_type: 'Brake Pad Replacement', cost: 850, service_date: '2026-02-15', status: 'In Shop', notes: 'Front and rear axle brake pads' },
    { id: 'ml3', vehicle_id: 'v3', vehicle_name: 'Scania R500 - #112', license_plate: 'S88-554-PL', vehicle_type: 'Truck', service_type: 'Routine Oil Change & Filters', cost: 320, service_date: '2026-02-10', status: 'Completed', notes: 'Standard 15,000km service' },
    { id: 'ml4', vehicle_id: 'v4', vehicle_name: 'Ford Transit - #VAN04', license_plate: 'F12-332-NY', vehicle_type: 'Van', service_type: 'Alternator Check', cost: 450, service_date: '2026-02-25', status: 'Scheduled', notes: 'Intermittent charging issue reported' },
    { id: 'ml5', vehicle_id: 'v5', vehicle_name: 'Kenworth T680 - #301', license_plate: 'K99-112-TX', vehicle_type: 'Truck', service_type: 'AC System Overhaul', cost: 1200, service_date: '2026-02-18', status: 'In Shop', notes: 'Compressor replacement + recharge' },
    { id: 'ml6', vehicle_id: 'v6', vehicle_name: 'Volvo VNL - #410', license_plate: 'V22-118-CA', vehicle_type: 'Truck', service_type: 'Tire Rotation (All Axles)', cost: 550, service_date: '2026-02-08', status: 'Completed', notes: 'All 18 tires rotated and inspected' },
    { id: 'ml7', vehicle_id: 'v7', vehicle_name: 'Ram ProMaster - #VAN09', license_plate: 'R44-991-FL', vehicle_type: 'Van', service_type: 'Bumper Repair', cost: 1100, service_date: '2026-01-15', status: 'Completed', notes: 'Minor collision damage repaired' },
    { id: 'ml8', vehicle_id: 'v8', vehicle_name: 'Peterbilt 579 - #550', license_plate: 'P11-223-AZ', vehicle_type: 'Truck', service_type: 'Coolant Leak / Overheating', cost: null, service_date: '2026-02-19', status: 'Critical', notes: 'Investigating radiator and head gasket' },
]

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
const SERVICE_ICONS = {
    'Engine': '🔧', 'Transmission': '🔧', 'Brake': '🛞', 'Oil Change': '🛢️',
    'Filter': '🛢️', 'Alternator': '⚡', 'AC': '❄️', 'Tire': '🛞',
    'Bumper': '🔩', 'Coolant': '⚠️', 'Overheating': '⚠️', 'default': '🔧',
}

function getServiceIcon(serviceType) {
    const t = serviceType.toLowerCase()
    for (const [k, icon] of Object.entries(SERVICE_ICONS)) {
        if (k !== 'default' && t.includes(k.toLowerCase())) return icon
    }
    return SERVICE_ICONS.default
}

function getVehicleIcon(type) {
    if (type === 'Van') return '🚐'
    if (type === 'Bike') return '🏍️'
    return '🚛'
}

function fmt$(val) {
    if (val == null) return null
    return parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: '2-digit',
    })
}

function uid() { return 'ml' + Date.now() + Math.random().toString(36).slice(2, 6) }

const NAV_ITEMS = [
    { label: 'Command Center', icon: '📊', path: '/dashboard' },
    { label: 'Vehicle Registry', icon: '🚛', path: '/vehicles' },
    { label: 'Trip Dispatcher', icon: '🗺️', path: '/trips' },
    { label: 'Maintenance Logs', icon: '🔧', path: '/maintenance' },
    { label: 'Expenses & Fuel', icon: '⛽', path: '/expenses' },
    { label: 'Driver Profiles', icon: '👤', path: '/drivers' },
    { label: 'Analytics & Reports', icon: '📈', path: '/analytics' },
]

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function MaintenanceLogs() {
    const navigate = useNavigate()
    const location = useLocation()

    const user = { name: 'Sarah Jenkins', role: 'manager' }

    /* ── state ── */
    const [logs, setLogs] = useState(MOCK_LOGS)
    const [vehicles] = useState(MOCK_VEHICLES)
    const [filters, setFilters] = useState({ vehicle_id: '', status: '', period: 'all' })
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState(null)
    const [formData, setFormData] = useState({
        vehicle_id: '', service_type: '', cost: '',
        service_date: new Date().toISOString().split('T')[0],
        status: 'Scheduled', notes: '',
    })

    /* ── toast helper ── */
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }, [])

    /* ── derived / filtered data ── */
    const filteredLogs = useMemo(() => {
        let result = [...logs]

        if (filters.vehicle_id) {
            result = result.filter((l) => l.vehicle_id === filters.vehicle_id)
        }
        if (filters.status) {
            result = result.filter((l) => l.status === filters.status)
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(
                (l) =>
                    l.vehicle_name.toLowerCase().includes(q) ||
                    l.license_plate.toLowerCase().includes(q) ||
                    l.service_type.toLowerCase().includes(q)
            )
        }
        if (filters.period === 'month') {
            const now = new Date()
            const first = new Date(now.getFullYear(), now.getMonth(), 1)
            result = result.filter((l) => {
                const d = new Date(l.service_date)
                return d >= first && d <= now
            })
        } else if (filters.period === 'week') {
            const now = new Date()
            const weekAgo = new Date(now.getTime() - 7 * 86400000)
            result = result.filter((l) => {
                const d = new Date(l.service_date)
                return d >= weekAgo && d <= now
            })
        }

        return result.sort((a, b) => new Date(b.service_date) - new Date(a.service_date))
    }, [logs, filters, search])

    /* ── KPI stats (computed from ALL logs, not filtered) ── */
    const stats = useMemo(() => {
        const year = new Date().getFullYear()
        const now = new Date()
        const next7 = new Date(now.getTime() + 7 * 86400000)

        const totalCost = logs
            .filter((l) => new Date(l.service_date).getFullYear() === year && l.cost != null)
            .reduce((sum, l) => sum + parseFloat(l.cost), 0)

        const inShop = new Set(
            logs.filter((l) => l.status === 'In Shop' || l.status === 'Critical').map((l) => l.vehicle_id)
        ).size

        const critical = logs.filter((l) => l.status === 'Critical').length

        const scheduled = logs.filter((l) => {
            if (l.status !== 'Scheduled') return false
            const d = new Date(l.service_date)
            return d >= now && d <= next7
        }).length

        return { total_cost_ytd: totalCost, in_shop_count: inShop, critical_count: critical, scheduled_count: scheduled }
    }, [logs])

    /* ── form handlers ── */
    const handleFormChange = (e) => {
        setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.vehicle_id || !formData.service_type) {
            showToast('Vehicle and service type are required', 'error')
            return
        }

        setSubmitting(true)

        // Simulate tiny delay for realism
        setTimeout(() => {
            const vehicle = vehicles.find((v) => v.id === formData.vehicle_id)
            const newLog = {
                id: uid(),
                vehicle_id: formData.vehicle_id,
                vehicle_name: vehicle?.name || 'Unknown',
                license_plate: vehicle?.license_plate || '',
                vehicle_type: vehicle?.type || 'Truck',
                service_type: formData.service_type,
                cost: formData.cost ? parseFloat(formData.cost) : null,
                service_date: formData.service_date,
                status: formData.status,
                notes: formData.notes,
            }

            setLogs((prev) => [newLog, ...prev])
            showToast('Maintenance log created successfully')
            setShowModal(false)
            setFormData({
                vehicle_id: '', service_type: '', cost: '',
                service_date: new Date().toISOString().split('T')[0],
                status: 'Scheduled', notes: '',
            })
            setSubmitting(false)
        }, 400)
    }

    /* ── CSV export ── */
    const handleExport = () => {
        const header = 'Vehicle,License Plate,Service Type,Cost,Date,Status,Notes\n'
        const rows = filteredLogs.map((l) => {
            const cost = l.cost != null ? `$${fmt$(l.cost)}` : 'TBD'
            const notes = (l.notes || '').replace(/"/g, '""')
            return `"${l.vehicle_name}","${l.license_plate}","${l.service_type}","${cost}","${fmtDate(l.service_date)}","${l.status}","${notes}"`
        })
        const csv = header + rows.join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'maintenance_logs.csv'
        a.click()
        URL.revokeObjectURL(url)
        showToast('CSV exported successfully')
    }

    /* ── delete handler ── */
    const handleDelete = (id) => {
        setLogs((prev) => prev.filter((l) => l.id !== id))
        showToast('Maintenance log deleted')
    }

    /* ── status pill class ── */
    const statusClass = (s) => {
        switch (s) {
            case 'Critical': return 'critical'
            case 'In Shop': return 'in-shop'
            case 'Completed': return 'completed'
            case 'Scheduled': return 'scheduled'
            default: return ''
        }
    }

    /* ═══════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════ */
    return (
        <div className="maintenance-layout">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">⚡</div>
                    FleetFlow
                </div>
                <ul className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.path}>
                            <a
                                href={item.path}
                                className={location.pathname === item.path ? 'active' : ''}
                                onClick={(e) => { e.preventDefault(); navigate(item.path) }}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="sidebar-bottom">
                    <ul className="sidebar-nav">
                        <li>
                            <a href="/settings" onClick={(e) => { e.preventDefault(); navigate('/settings') }}>
                                <span className="nav-icon">⚙️</span>
                                Settings
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="maintenance-main">
                {/* Top Bar */}
                <div className="topbar">
                    <div className="topbar-breadcrumb">
                        Fleet Management / <span>Maintenance &amp; Service Logs</span>
                    </div>
                    <div className="topbar-search">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search logs, vehicles, or service IDs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-bell" aria-label="Notifications">
                            🔔<span className="badge" />
                        </button>
                        <div className="topbar-user">
                            <div className="topbar-user-info">
                                <div className="topbar-user-name">{user.name}</div>
                                <div className="topbar-user-role">Fleet Manager</div>
                            </div>
                            <div className="topbar-avatar">SJ</div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="page-content">
                    {/* Header */}
                    <div className="page-header">
                        <div>
                            <h1>Maintenance &amp; Service Logs</h1>
                            <p>Track vehicle repairs, scheduled maintenance, and associated costs.</p>
                        </div>
                        <button className="btn-add-maintenance" onClick={() => setShowModal(true)}>
                            <span>+</span> Add Maintenance
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div>
                                <div className="kpi-label">Total Cost (YTD)</div>
                                <div className="kpi-value cost">{fmt$(stats.total_cost_ytd)}</div>
                            </div>
                            <div className="kpi-icon cost-icon">💲</div>
                        </div>
                        <div className="kpi-card">
                            <div>
                                <div className="kpi-label">In Shop</div>
                                <div className="kpi-value shop">
                                    {stats.in_shop_count}<span className="kpi-unit">Vehicles</span>
                                </div>
                            </div>
                            <div className="kpi-icon shop-icon">🔧</div>
                        </div>
                        <div className="kpi-card">
                            <div>
                                <div className="kpi-label">Critical Alerts</div>
                                <div className="kpi-value critical">
                                    {stats.critical_count}<span className="kpi-unit">Pending</span>
                                </div>
                            </div>
                            <div className="kpi-icon critical-icon">⚠️</div>
                        </div>
                        <div className="kpi-card">
                            <div>
                                <div className="kpi-label">Scheduled (Next 7 Days)</div>
                                <div className="kpi-value">{stats.scheduled_count}</div>
                            </div>
                            <div className="kpi-icon scheduled-icon">📅</div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="filter-bar">
                        <div className="filter-group">
                            <select className="filter-select" value={filters.vehicle_id}
                                onChange={(e) => setFilters((p) => ({ ...p, vehicle_id: e.target.value }))}>
                                <option value="">All Vehicles</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>

                            <select className="filter-select" value={filters.status}
                                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
                                <option value="">All Statuses</option>
                                <option value="Critical">Critical</option>
                                <option value="In Shop">In Shop</option>
                                <option value="Completed">Completed</option>
                                <option value="Scheduled">Scheduled</option>
                            </select>

                            <select className="filter-select" value={filters.period}
                                onChange={(e) => setFilters((p) => ({ ...p, period: e.target.value }))}>
                                <option value="all">All Time</option>
                                <option value="month">This Month</option>
                                <option value="week">This Week</option>
                            </select>
                        </div>
                        <button className="btn-export" onClick={handleExport}>
                            📥 Export CSV
                        </button>
                    </div>

                    {/* Data Table */}
                    <div className="table-container">
                        {filteredLogs.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🔧</div>
                                <p>No maintenance logs found. Try adjusting your filters or add a new record.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>Service Type</th>
                                        <th>Cost</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>
                                                <div className="vehicle-cell">
                                                    <div className="vehicle-icon-wrapper">
                                                        {getVehicleIcon(log.vehicle_type)}
                                                    </div>
                                                    <div>
                                                        <div className="vehicle-name">{log.vehicle_name}</div>
                                                        <div className="vehicle-plate">{log.license_plate}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="service-cell">
                                                    <span className="service-icon">{getServiceIcon(log.service_type)}</span>
                                                    {log.service_type}
                                                </div>
                                            </td>
                                            <td>
                                                {log.cost != null ? (
                                                    <span className={`cost-value${log.status === 'Scheduled' ? ' estimated' : ''}`}>
                                                        {log.status === 'Scheduled' ? 'Est. ' : ''}${fmt$(log.cost)}
                                                    </span>
                                                ) : (
                                                    <span className="cost-value tbd">TBD</span>
                                                )}
                                            </td>
                                            <td><span className="date-value">{fmtDate(log.service_date)}</span></td>
                                            <td>
                                                <span className={`status-pill ${statusClass(log.status)}`}>
                                                    <span className="status-dot" />
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-delete-row" onClick={() => handleDelete(log.id)} title="Delete">
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Add Maintenance Modal ── */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Maintenance Log</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Vehicle *</label>
                                    <select name="vehicle_id" value={formData.vehicle_id} onChange={handleFormChange} required>
                                        <option value="">Select a vehicle...</option>
                                        {vehicles.map((v) => (
                                            <option key={v.id} value={v.id}>{v.name} — {v.license_plate}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Service Type *</label>
                                    <input type="text" name="service_type" placeholder="e.g. Engine Transmission Failure"
                                        value={formData.service_type} onChange={handleFormChange} required />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cost ($)</label>
                                        <input type="number" name="cost" placeholder="0.00" step="0.01" min="0"
                                            value={formData.cost} onChange={handleFormChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Service Date</label>
                                        <input type="date" name="service_date"
                                            value={formData.service_date} onChange={handleFormChange} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="In Shop">In Shop</option>
                                        <option value="Critical">Critical</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea name="notes" placeholder="Optional notes about this maintenance..."
                                        value={formData.notes} onChange={handleFormChange} />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Create Log'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
        </div>
    )
}
