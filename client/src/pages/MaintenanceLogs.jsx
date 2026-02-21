import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import './MaintenanceLogs.css'

// ── helpers ──
function getToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token')
}
function getUser() {
    try {
        const raw = sessionStorage.getItem('user') || localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    } catch { return null }
}
function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')
}
function avatarColor(name = '') {
    const colors = [
        { bg: '#dbeafe', text: '#1d4ed8' }, { bg: '#fce7f3', text: '#be185d' },
        { bg: '#d1fae5', text: '#065f46' }, { bg: '#fed7aa', text: '#c2410c' },
        { bg: '#ede9fe', text: '#7c3aed' },
    ]
    return colors[(name.charCodeAt(0) || 0) % colors.length]
}
function fmtDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: '2-digit',
    })
}
function fmt$(val) {
    if (val == null) return null
    return parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function uid() { return 'ml' + Date.now() + Math.random().toString(36).slice(2, 6) }

// ── Nav items (matching TripDispatcher) ──
const NAV_ITEMS = [
    { label: 'Command Center', icon: 'dashboard', to: '/dashboard' },
    { label: 'Vehicle Registry', icon: 'directions_car', to: '/vehicles' },
    { label: 'Trip Dispatcher', icon: 'alt_route', to: '/dispatch' },
    { label: 'Maintenance Logs', icon: 'build', to: '/maintenance' },
    { label: 'Expenses & Fuel', icon: 'receipt_long', to: '/expenses' },
    { label: 'Driver Profiles', icon: 'badge', to: '/drivers' },
    { label: 'Analytics', icon: 'analytics', to: '/analytics' },
]

const SERVICE_TYPES = [
    'Engine Transmission Failure', 'Brake Pad Replacement', 'Routine Oil Change & Filters',
    'Alternator Check', 'AC System Overhaul', 'Tire Rotation (All Axles)',
    'Bumper Repair', 'Coolant Leak / Overheating', 'Battery Replacement',
    'Suspension Check', 'Wheel Alignment', 'Custom…',
]

const STATUS_OPTIONS = ['Scheduled', 'In Shop', 'Critical', 'Completed']

const MOCK_VEHICLES = [
    { id: 'v1', name: 'Volvo FH16', plate: 'V78-992-KL' },
    { id: 'v2', name: 'Mercedes Actros', plate: 'M45-123-ZZ' },
    { id: 'v3', name: 'Scania R500', plate: 'S88-554-PL' },
    { id: 'v4', name: 'Ford Transit', plate: 'F12-332-NY' },
    { id: 'v5', name: 'Kenworth T680', plate: 'K99-112-TX' },
]

const MOCK_LOGS = [
    { id: 'ml1', vehicle_name: 'Volvo FH16', plate: 'V78-992-KL', service_type: 'Engine Transmission Failure', cost: 4250, service_date: '2026-01-24', status: 'Critical', notes: 'Major failure — requires full rebuild' },
    { id: 'ml2', vehicle_name: 'Mercedes Actros', plate: 'M45-123-ZZ', service_type: 'Brake Pad Replacement', cost: 850, service_date: '2026-02-15', status: 'In Shop', notes: 'Front and rear axle brake pads' },
    { id: 'ml3', vehicle_name: 'Scania R500', plate: 'S88-554-PL', service_type: 'Routine Oil Change & Filters', cost: 320, service_date: '2026-02-10', status: 'Completed', notes: 'Standard 15,000 km service' },
    { id: 'ml4', vehicle_name: 'Ford Transit', plate: 'F12-332-NY', service_type: 'Alternator Check', cost: 450, service_date: '2026-02-25', status: 'Scheduled', notes: 'Intermittent charging issue reported' },
    { id: 'ml5', vehicle_name: 'Kenworth T680', plate: 'K99-112-TX', service_type: 'AC System Overhaul', cost: 1200, service_date: '2026-02-18', status: 'In Shop', notes: 'Compressor replacement + recharge' },
]

const PILL_STATUS = {
    'Critical': 'ml-pill critical',
    'In Shop': 'ml-pill in-shop',
    'Completed': 'ml-pill completed',
    'Scheduled': 'ml-pill scheduled',
}

const PAGE_LIMIT = 8

// ═════════════════════════════════════════════════════════
export default function MaintenanceLogs() {
    const navigate = useNavigate()
    const token = getToken()
    const user = getUser()

    useEffect(() => { if (!token) navigate('/login', { replace: true }) }, [token, navigate])

    // form state
    const [form, setForm] = useState({
        vehicle_name: '', plate: '', service_type: '', custom_service: '',
        cost: '', service_date: new Date().toISOString().split('T')[0],
        status: 'Scheduled', notes: '',
    })
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // table state
    const [logs, setLogs] = useState(MOCK_LOGS)
    const [filter, setFilter] = useState('all')   // all | in-shop | critical | completed | scheduled
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    // handle form
    function handleField(e) {
        const { name, value } = e.target
        setForm(p => ({ ...p, [name]: value }))
        if (name === 'vehicle_name') {
            const v = MOCK_VEHICLES.find(x => x.name === value)
            setForm(p => ({ ...p, vehicle_name: value, plate: v?.plate || '' }))
        }
    }

    function submitForm(status_override) {
        setFormError(''); setFormSuccess('')
        const serviceType = form.service_type === 'Custom…' ? form.custom_service : form.service_type
        if (!form.vehicle_name) return setFormError('Please select a vehicle.')
        if (!serviceType.trim()) return setFormError('Service type is required.')

        setSubmitting(true)
        setTimeout(() => {
            const newLog = {
                id: uid(),
                vehicle_name: form.vehicle_name,
                plate: form.plate,
                service_type: serviceType,
                cost: form.cost ? parseFloat(form.cost) : null,
                service_date: form.service_date,
                status: status_override || form.status,
                notes: form.notes,
            }
            setLogs(prev => [newLog, ...prev])
            setFormSuccess(`Log created — ${form.vehicle_name} / ${serviceType}`)
            setForm({
                vehicle_name: '', plate: '', service_type: '', custom_service: '',
                cost: '', service_date: new Date().toISOString().split('T')[0],
                status: 'Scheduled', notes: '',
            })
            setPage(1); setFilter('all')
            setSubmitting(false)
        }, 300)
    }

    function deleteLog(id) {
        if (!window.confirm('Delete this maintenance log?')) return
        setLogs(prev => prev.filter(l => l.id !== id))
    }

    // derived / filtered
    const filtered = useMemo(() => {
        let result = [...logs]
        if (filter === 'in-shop') result = result.filter(l => l.status === 'In Shop')
        if (filter === 'critical') result = result.filter(l => l.status === 'Critical')
        if (filter === 'completed') result = result.filter(l => l.status === 'Completed')
        if (filter === 'scheduled') result = result.filter(l => l.status === 'Scheduled')
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(l =>
                l.vehicle_name.toLowerCase().includes(q) ||
                l.plate.toLowerCase().includes(q) ||
                l.service_type.toLowerCase().includes(q)
            )
        }
        return result.sort((a, b) => new Date(b.service_date) - new Date(a.service_date))
    }, [logs, filter, search])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_LIMIT))
    const paginated = filtered.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT)

    if (!token) return null

    const av = avatarColor(user?.name || '')

    return (
        <DashboardLayout>
            <main className="ml-content">

                    {/* ══ LEFT — Add Log Form ══ */}
                    <div className="ml-panel-left">
                        <div className="ml-form-card">
                            <div className="ml-form-head">
                                <h2>Log Maintenance</h2>
                                <p>Record a new service or repair event.</p>
                            </div>

                            <div className="ml-form-body">
                                {formError && <div className="ml-banner error">{formError}</div>}
                                {formSuccess && <div className="ml-banner success">{formSuccess}</div>}

                                {/* Vehicle section */}
                                <div>
                                    <div className="ml-section-label">Vehicle</div>

                                    <div className="ml-field-group">
                                        <label className="ml-label">Vehicle</label>
                                        <div className="ml-select-wrap">
                                            <span className="material-symbols-outlined icon-left">local_shipping</span>
                                            <select
                                                className="ml-select has-icon"
                                                name="vehicle_name"
                                                value={form.vehicle_name}
                                                onChange={handleField}
                                                style={{ paddingLeft: 36, paddingRight: 32 }}
                                            >
                                                <option value="">Select a vehicle</option>
                                                {MOCK_VEHICLES.map(v => (
                                                    <option key={v.id} value={v.name}>{v.name} — {v.plate}</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined icon-right">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="ml-hr" />

                                {/* Service section */}
                                <div>
                                    <div className="ml-section-label">Service Details</div>

                                    <div className="ml-field-group">
                                        <label className="ml-label">Service Type</label>
                                        <div className="ml-select-wrap">
                                            <span className="material-symbols-outlined icon-left">build</span>
                                            <select
                                                className="ml-select has-icon"
                                                name="service_type"
                                                value={form.service_type}
                                                onChange={handleField}
                                                style={{ paddingLeft: 36, paddingRight: 32 }}
                                            >
                                                <option value="">Select service type</option>
                                                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <span className="material-symbols-outlined icon-right">expand_more</span>
                                        </div>
                                    </div>

                                    {form.service_type === 'Custom…' && (
                                        <div className="ml-field-group" style={{ marginTop: 14 }}>
                                            <label className="ml-label">Custom Service Description</label>
                                            <div className="ml-input-wrap">
                                                <span className="material-symbols-outlined">edit_note</span>
                                                <input
                                                    className="ml-input has-icon"
                                                    type="text"
                                                    name="custom_service"
                                                    placeholder="Describe the service…"
                                                    value={form.custom_service}
                                                    onChange={handleField}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="ml-field-row" style={{ marginTop: 14 }}>
                                        <div className="ml-field-group">
                                            <label className="ml-label">Cost ($)</label>
                                            <div className="ml-input-wrap">
                                                <span className="material-symbols-outlined">payments</span>
                                                <input
                                                    className="ml-input has-icon"
                                                    type="number"
                                                    name="cost"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.cost}
                                                    onChange={handleField}
                                                />
                                            </div>
                                        </div>

                                        <div className="ml-field-group">
                                            <label className="ml-label">Service Date</label>
                                            <input
                                                className="ml-input"
                                                type="date"
                                                name="service_date"
                                                value={form.service_date}
                                                onChange={handleField}
                                            />
                                        </div>
                                    </div>

                                    <div className="ml-field-group" style={{ marginTop: 14 }}>
                                        <label className="ml-label">Status</label>
                                        <div className="ml-select-wrap">
                                            <span className="material-symbols-outlined icon-left">flag</span>
                                            <select
                                                className="ml-select has-icon"
                                                name="status"
                                                value={form.status}
                                                onChange={handleField}
                                            >
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <span className="material-symbols-outlined icon-right">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="ml-field-group" style={{ marginTop: 14 }}>
                                        <label className="ml-label">Notes</label>
                                        <textarea
                                            className="ml-textarea"
                                            name="notes"
                                            placeholder="Additional details or instructions…"
                                            value={form.notes}
                                            onChange={handleField}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="ml-form-footer">
                                <div className="ml-form-actions">
                                    <button
                                        className="ml-btn-secondary"
                                        onClick={() => submitForm('Scheduled')}
                                        disabled={submitting}
                                    >
                                        Schedule
                                    </button>
                                    <button
                                        className="ml-btn-primary"
                                        onClick={() => submitForm()}
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? <span className="ml-spinner" />
                                            : <>
                                                <span>Log Entry</span>
                                                <span className="material-symbols-outlined">add_task</span>
                                            </>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ RIGHT — Maintenance Table ══ */}
                    <div className="ml-panel-right">
                        <div className="ml-table-card">

                            <div className="ml-table-head">
                                <div className="ml-table-head-left">
                                    <h2>Maintenance Records</h2>
                                    <p>View and manage all service logs.</p>
                                </div>
                                <div className="ml-table-head-right">
                                    <div className="ml-filter-tabs" role="group">
                                        {[
                                            { key: 'all', label: 'All' },
                                            { key: 'in-shop', label: 'In Shop' },
                                            { key: 'critical', label: 'Critical' },
                                            { key: 'scheduled', label: 'Scheduled' },
                                            { key: 'completed', label: 'Completed' },
                                        ].map(f => (
                                            <button
                                                key={f.key}
                                                className={`ml-filter-tab${filter === f.key ? ' active' : ''}`}
                                                onClick={() => { setFilter(f.key); setPage(1) }}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="ml-icon-btn" title="Refresh" onClick={() => setPage(1)}>
                                        <span className="material-symbols-outlined">refresh</span>
                                    </button>
                                </div>
                            </div>

                            <div className="ml-table-wrap">
                                <table className="ml-table">
                                    <thead>
                                        <tr>
                                            <th>Vehicle</th>
                                            <th>Service Type</th>
                                            <th>Cost</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.length === 0
                                            ? (
                                                <tr>
                                                    <td colSpan={6}>
                                                        <div className="ml-empty">
                                                            <span className="material-symbols-outlined">build_circle</span>
                                                            <h3>No records found</h3>
                                                            <p>
                                                                {search ? 'No logs match your search.' : 'Add a maintenance log using the form on the left.'}
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                            : paginated.map(log => (
                                                <tr key={log.id}>
                                                    <td>
                                                        <div className="ml-vehicle-cell">
                                                            <div className="ml-vehicle-icon">
                                                                <span className="material-symbols-outlined">local_shipping</span>
                                                            </div>
                                                            <div>
                                                                <div className="ml-vehicle-name">{log.vehicle_name}</div>
                                                                <div className="ml-vehicle-plate">{log.plate}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ml-service-cell">
                                                            <span className="material-symbols-outlined">build</span>
                                                            {log.service_type}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {log.cost != null
                                                            ? <span className="ml-cost">${fmt$(log.cost)}</span>
                                                            : <span className="ml-cost tbd">TBD</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <span className="ml-date">{fmtDate(log.service_date)}</span>
                                                    </td>
                                                    <td>
                                                        <span className={PILL_STATUS[log.status] || 'ml-pill'}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="ml-row-actions">
                                                            <button
                                                                className="ml-action-btn"
                                                                title="Delete log"
                                                                onClick={() => deleteLog(log.id)}
                                                            >
                                                                <span className="material-symbols-outlined">delete</span>
                                                            </button>
                                                            <button className="ml-action-btn" title="More options">
                                                                <span className="material-symbols-outlined">more_vert</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="ml-pagination">
                                <div className="ml-pagination-info">
                                    Showing{' '}
                                    <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1}</strong>
                                    {' – '}
                                    <strong>{Math.min(page * PAGE_LIMIT, filtered.length)}</strong>
                                    {' of '}
                                    <strong>{filtered.length}</strong> results
                                </div>
                                <nav className="ml-pagination-nav" aria-label="Pagination">
                                    <button
                                        className="ml-page-btn"
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page <= 1}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle' }}>chevron_left</span>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                                        <button
                                            key={n}
                                            className={`ml-page-btn${page === n ? ' active' : ''}`}
                                            onClick={() => setPage(n)}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <button
                                        className="ml-page-btn"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= totalPages}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle' }}>chevron_right</span>
                                    </button>
                                </nav>
                            </div>

                        </div>
                    </div>

            </main>
        </DashboardLayout>
    )
}
