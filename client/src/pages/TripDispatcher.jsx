import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import './TripDispatcher.css'

// ---------- helpers ----------
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function getToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token')
}

function getUser() {
    try {
        const raw = sessionStorage.getItem('user') || localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function getInitials(name = '') {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
}

function avatarColor(name = '') {
    const colors = [
        { bg: '#dbeafe', text: '#1d4ed8' },
        { bg: '#fce7f3', text: '#be185d' },
        { bg: '#d1fae5', text: '#065f46' },
        { bg: '#fed7aa', text: '#c2410c' },
        { bg: '#ede9fe', text: '#7c3aed' },
    ]
    const idx = (name.charCodeAt(0) || 0) % colors.length
    return colors[idx]
}

function formatDeparture(dt) {
    if (!dt) return 'Unscheduled'
    try {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(dt))
    } catch {
        return dt
    }
}

// ---------- Sidebar nav items ----------
const NAV_ITEMS = [
    { label: 'Command Center', icon: 'dashboard', to: '/dashboard' },
    { label: 'Vehicle Registry', icon: 'directions_car', to: '/vehicles' },
    { label: 'Trip Dispatcher', icon: 'alt_route', to: '/dispatch' },
    { label: 'Maintenance Logs', icon: 'build', to: '/maintenance' },
    { label: 'Expenses & Fuel', icon: 'receipt_long', to: '/expenses' },
    { label: 'Driver Profiles', icon: 'badge', to: '/drivers' },
    { label: 'Analytics', icon: 'analytics', to: '/analytics' },
]

const CARGO_TYPES = [
    'General Freight',
    'Refrigerated Goods',
    'Hazardous Materials',
    'Heavy Machinery',
    'Fragile Items',
]

const PAGE_LIMIT = 8

// ═════════════════════════════════════════════════════════
//  COMPONENT
// ═════════════════════════════════════════════════════════
export default function TripDispatcher() {
    const navigate = useNavigate()

    // ── Auth ──
    const _user = getUser()
    const token = getToken()

    useEffect(() => {
        if (!token) navigate('/login', { replace: true })
    }, [token, navigate])

    // ── Dropdown data ──
    const [vehicles, setVehicles] = useState([])
    const [drivers, setDrivers] = useState([])

    // ── Form state ──
    const [form, setForm] = useState({
        origin: '',
        destination: '',
        scheduled_departure: '',
        cargo_type: 'General Freight',
        vehicle_id: '',
        vehicle_name: '',
        driver_name: '',
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    // ── Table state ──
    const [trips, setTrips] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [tableError, setTableError] = useState('')
    const [filter, setFilter] = useState('all')   // all | active | drafts
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    // ─────────── Fetch vehicles & drivers on mount ───────────
    useEffect(() => {
        fetch(`${API}/api/vehicles`)
            .then((r) => r.json())
            .then((data) => setVehicles(Array.isArray(data) ? data : []))
            .catch(() => setVehicles([]))

        fetch(`${API}/api/drivers`)
            .then((r) => r.json())
            .then((data) => setDrivers(Array.isArray(data) ? data : []))
            .catch(() => setDrivers([]))
    }, [])

    // ─────────── Fetch trips ───────────
    const fetchTrips = useCallback(async () => {
        setLoading(true)
        setTableError('')
        try {
            const params = new URLSearchParams({
                status: filter,
                page,
                limit: PAGE_LIMIT,
            })
            const res = await fetch(`${API}/api/trips?${params}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to load trips')
            setTrips(Array.isArray(data.trips) ? data.trips : [])
            setTotal(typeof data.total === 'number' ? data.total : 0)
        } catch (err) {
            setTableError(err.message)
        } finally {
            setLoading(false)
        }
    }, [filter, page])

    useEffect(() => { fetchTrips() }, [fetchTrips])

    // ─────────── Form handlers ───────────
    function handleFieldChange(e) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (name === 'vehicle_id') {
            const v = vehicles.find((x) => x.id === value)
            setForm((prev) => ({ ...prev, vehicle_id: value, vehicle_name: v ? v.name : '' }))
        }
    }

    async function submitForm(status) {
        setFormError('')
        setFormSuccess('')

        if (!form.origin.trim()) return setFormError('Origin is required.')
        if (!form.destination.trim()) return setFormError('Destination is required.')
        if (status === 'dispatched' && !form.vehicle_id) return setFormError('Please select a vehicle.')
        if (status === 'dispatched' && !form.driver_name) return setFormError('Please select a driver.')

        setSubmitting(true)
        try {
            const res = await fetch(`${API}/api/trips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...form, status }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create trip')

            setFormSuccess(
                status === 'draft'
                    ? `Draft saved — ${data.trip_id}`
                    : `Trip ${data.trip_id} dispatched successfully!`
            )
            // Reset form
            setForm({
                origin: '', destination: '', scheduled_departure: '',
                cargo_type: 'General Freight', vehicle_id: '',
                vehicle_name: '', driver_name: '', notes: '',
            })
            // Refresh table
            setPage(1)
            setFilter('all')
            fetchTrips()
        } catch (err) {
            setFormError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    // ─────────── Cancel trip ───────────
    async function cancelTrip(id) {
        if (!window.confirm('Cancel this trip?')) return
        try {
            const res = await fetch(`${API}/api/trips/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Failed to cancel trip')
            fetchTrips()
        } catch (err) {
            setTableError(err.message)
        }
    }

    // ─────────── Derived ───────────
    const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

    const filteredTrips = search.trim()
        ? trips.filter(
            (t) =>
                t.trip_id?.toLowerCase().includes(search.toLowerCase()) ||
                t.origin?.toLowerCase().includes(search.toLowerCase()) ||
                t.destination?.toLowerCase().includes(search.toLowerCase()) ||
                t.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
                t.vehicle_name?.toLowerCase().includes(search.toLowerCase())
        )
        : trips

    // ─────────── Not yet authenticated ───────────
    if (!token) return null

    // ═══════════════════════════════════════
    return (
        <DashboardLayout breadcrumb={['Workspaces', 'Fleet Operations', 'Trip Dispatcher']}>
            <main className="td-content">

                    {/* ══ LEFT — Dispatch Form ══ */}
                    <div className="td-panel-left">
                        <div className="td-form-card">
                            <div className="td-form-head">
                                <h2>Create New Dispatch</h2>
                                <p>Assign vehicle and route details.</p>
                            </div>

                            <div className="td-form-body">
                                {formError && <div className="td-banner error">{formError}</div>}
                                {formSuccess && <div className="td-banner success">{formSuccess}</div>}

                                {/* Route Information */}
                                <div>
                                    <div className="td-section-label">Route Information</div>

                                    <div className="td-field-row">
                                        <div className="td-field-group">
                                            <label className="td-label">Origin</label>
                                            <div className="td-input-wrap">
                                                <span className="material-symbols-outlined">my_location</span>
                                                <input
                                                    className="td-input has-icon"
                                                    type="text"
                                                    name="origin"
                                                    placeholder="City or Warehouse"
                                                    value={form.origin}
                                                    onChange={handleFieldChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="td-field-group">
                                            <label className="td-label">Destination</label>
                                            <div className="td-input-wrap">
                                                <span className="material-symbols-outlined">pin_drop</span>
                                                <input
                                                    className="td-input has-icon"
                                                    type="text"
                                                    name="destination"
                                                    placeholder="City or Warehouse"
                                                    value={form.destination}
                                                    onChange={handleFieldChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="td-field-group" style={{ marginTop: 14 }}>
                                        <label className="td-label">Scheduled Departure</label>
                                        <input
                                            className="td-input"
                                            type="datetime-local"
                                            name="scheduled_departure"
                                            value={form.scheduled_departure}
                                            onChange={handleFieldChange}
                                        />
                                    </div>

                                    <div className="td-field-group" style={{ marginTop: 14 }}>
                                        <label className="td-label">Cargo Type</label>
                                        <select
                                            className="td-select"
                                            name="cargo_type"
                                            value={form.cargo_type}
                                            onChange={handleFieldChange}
                                        >
                                            {CARGO_TYPES.map((ct) => (
                                                <option key={ct} value={ct}>{ct}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <hr className="td-hr" />

                                {/* Assignment */}
                                <div>
                                    <div className="td-section-label">Assignment</div>

                                    <div className="td-field-group">
                                        <label className="td-label">Vehicle</label>
                                        <div className="td-select-wrap">
                                            <span className="material-symbols-outlined icon-left">local_shipping</span>
                                            <select
                                                className="td-select has-icon"
                                                name="vehicle_id"
                                                value={form.vehicle_id}
                                                onChange={handleFieldChange}
                                                style={{ paddingLeft: 36, paddingRight: 32 }}
                                            >
                                                <option value="">Select available vehicle</option>
                                                {vehicles.map((v) => (
                                                    <option
                                                        key={v.id}
                                                        value={v.id}
                                                        disabled={v.status !== 'available'}
                                                    >
                                                        {v.name}{v.status !== 'available' ? ` (${v.status.replace('_', ' ')})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined icon-right">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="td-field-group" style={{ marginTop: 14 }}>
                                        <label className="td-label">Driver</label>
                                        <div className="td-select-wrap">
                                            <span className="material-symbols-outlined icon-left">person</span>
                                            <select
                                                className="td-select has-icon"
                                                name="driver_name"
                                                value={form.driver_name}
                                                onChange={handleFieldChange}
                                                style={{ paddingLeft: 36, paddingRight: 32 }}
                                            >
                                                <option value="">Select available driver</option>
                                                {drivers.map((d) => (
                                                    <option
                                                        key={d.id}
                                                        value={d.name}
                                                        disabled={d.status !== 'available'}
                                                    >
                                                        {d.name}{d.status !== 'available' ? ` (${d.status.replace('_', ' ')})` : ' (Available)'}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined icon-right">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="td-field-group">
                                    <label className="td-label">Dispatch Notes</label>
                                    <textarea
                                        className="td-textarea"
                                        name="notes"
                                        placeholder="Special handling instructions…"
                                        value={form.notes}
                                        onChange={handleFieldChange}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="td-form-footer">
                                <div className="td-form-actions">
                                    <button
                                        className="td-btn-secondary"
                                        onClick={() => submitForm('draft')}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving…' : 'Save Draft'}
                                    </button>
                                    <button
                                        className="td-btn-primary"
                                        onClick={() => submitForm('dispatched')}
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? <span className="td-spinner" />
                                            : <>
                                                <span>Dispatch</span>
                                                <span className="material-symbols-outlined">send</span>
                                            </>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ RIGHT — Active Dispatches ══ */}
                    <div className="td-panel-right">
                        <div className="td-table-card">

                            {/* Table header */}
                            <div className="td-table-head">
                                <div className="td-table-head-left">
                                    <h2>Active Dispatches</h2>
                                    <p>Monitor real-time status of ongoing trips.</p>
                                </div>
                                <div className="td-table-head-right">
                                    <div className="td-topbar-search" style={{ marginRight: 8 }}>
                                        <span className="material-symbols-outlined">search</span>
                                        <input
                                            type="text"
                                            placeholder="Search trips…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="td-filter-tabs" role="group">
                                        {['all', 'active', 'drafts'].map((f) => (
                                            <button
                                                key={f}
                                                className={`td-filter-tab${filter === f ? ' active' : ''}`}
                                                onClick={() => { setFilter(f); setPage(1) }}
                                            >
                                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="td-icon-btn" onClick={fetchTrips} title="Refresh">
                                        <span className="material-symbols-outlined">refresh</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table body */}
                            {tableError && (
                                <div className="td-banner error" style={{ margin: '12px 24px 0' }}>
                                    {tableError}
                                </div>
                            )}

                            <div className="td-table-wrap">
                                <table className="td-table">
                                    <thead>
                                        <tr>
                                            <th>Trip ID</th>
                                            <th>Route</th>
                                            <th>Vehicle</th>
                                            <th>Driver</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading
                                            ? Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i} className="td-skeleton-row">
                                                    <td><div className="td-skeleton-cell" style={{ width: 90 }} /></td>
                                                    <td><div className="td-skeleton-cell" style={{ width: 140 }} /></td>
                                                    <td><div className="td-skeleton-cell" style={{ width: 120 }} /></td>
                                                    <td><div className="td-skeleton-cell" style={{ width: 100 }} /></td>
                                                    <td><div className="td-skeleton-cell" style={{ width: 70 }} /></td>
                                                    <td><div className="td-skeleton-cell" style={{ width: 30, marginLeft: 'auto' }} /></td>
                                                </tr>
                                            ))
                                            : filteredTrips.length === 0
                                                ? (
                                                    <tr>
                                                        <td colSpan={6}>
                                                            <div className="td-empty">
                                                                <div><span className="material-symbols-outlined">alt_route</span></div>
                                                                <h3>No dispatches found</h3>
                                                                <p>
                                                                    {search
                                                                        ? 'No trips match your search.'
                                                                        : 'Create your first dispatch using the form on the left.'}
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                                : filteredTrips.map((trip) => {
                                                    const av = avatarColor(trip.driver_name || '')
                                                    const initials = getInitials(trip.driver_name || '--')
                                                    return (
                                                        <tr
                                                            key={trip.id}
                                                            className={trip.status === 'cancelled' ? 'cancelled' : ''}
                                                        >
                                                            <td>
                                                                <span className="td-trip-id">#{trip.trip_id}</span>
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    <span className="td-route-main">{trip.origin}</span>
                                                                    <span className="td-route-arrow">→</span>
                                                                    <span className="td-route-main">{trip.destination}</span>
                                                                </div>
                                                                <div className="td-route-sub">
                                                                    {trip.scheduled_departure
                                                                        ? `Dep: ${formatDeparture(trip.scheduled_departure)}`
                                                                        : 'Unscheduled'}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="td-vehicle-cell">
                                                                    <span className="material-symbols-outlined">local_shipping</span>
                                                                    {trip.vehicle_name || <em style={{ color: '#9ca3af' }}>Unassigned</em>}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {trip.driver_name
                                                                    ? (
                                                                        <div className="td-driver-cell">
                                                                            <div
                                                                                className="td-driver-avatar"
                                                                                style={{ background: av.bg, color: av.text }}
                                                                            >
                                                                                {initials}
                                                                            </div>
                                                                            {trip.driver_name}
                                                                        </div>
                                                                    )
                                                                    : <em style={{ color: '#9ca3af' }}>Unassigned</em>
                                                                }
                                                            </td>
                                                            <td>
                                                                <span className={`td-pill ${trip.status}`}>
                                                                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="td-row-actions">
                                                                    {trip.status !== 'cancelled' && trip.status !== 'completed' && (
                                                                        <button
                                                                            className="td-action-btn"
                                                                            title="Cancel trip"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                cancelTrip(trip.id)
                                                                            }}
                                                                        >
                                                                            <span className="material-symbols-outlined">cancel</span>
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        className="td-action-btn"
                                                                        title="More options"
                                                                    >
                                                                        <span className="material-symbols-outlined">more_vert</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="td-pagination">
                                <div className="td-pagination-info">
                                    Showing{' '}
                                    <strong>{total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1}</strong>
                                    {' – '}
                                    <strong>{Math.min(page * PAGE_LIMIT, total)}</strong>
                                    {' of '}
                                    <strong>{total}</strong> results
                                </div>
                                <nav className="td-pagination-nav" aria-label="Pagination">
                                    <button
                                        className="td-page-btn"
                                        onClick={() => setPage((p) => p - 1)}
                                        disabled={page <= 1}
                                        aria-label="Previous page"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle' }}>chevron_left</span>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                        <button
                                            key={n}
                                            className={`td-page-btn${page === n ? ' active' : ''}`}
                                            onClick={() => setPage(n)}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                    <button
                                        className="td-page-btn"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={page >= totalPages}
                                        aria-label="Next page"
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
