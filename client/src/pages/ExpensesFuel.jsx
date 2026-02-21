import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import './ExpensesFuel.css'

/* ═══════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════ */
const MOCK_VEHICLES = [
    { id: 'v1', name: 'Volvo FH16', code: 'V-102' },
    { id: 'v2', name: 'Kenworth T680', code: 'V-205' },
    { id: 'v3', name: 'Freightliner', code: 'V-108' },
    { id: 'v4', name: 'Mack Anthem', code: 'V-331' },
]

const MOCK_EXPENSES = [
    { id: 'e1', trip_id: 'TR-2026-8901', date: '2026-02-24', vehicle_name: 'Volvo FH16', vehicle_code: 'V-102', route_from: 'Seattle', route_to: 'Portland', fuel_cost: 342.50, maint_cost: null },
    { id: 'e2', trip_id: 'TR-2026-8894', date: '2026-02-23', vehicle_name: 'Kenworth T680', vehicle_code: 'V-205', route_from: 'Chicago', route_to: 'Detroit', fuel_cost: 512.80, maint_cost: 120.00 },
    { id: 'e3', trip_id: 'TR-2026-8872', date: '2026-02-22', vehicle_name: 'Freightliner', vehicle_code: 'V-108', route_from: 'Dallas', route_to: 'Houston', fuel_cost: 215.45, maint_cost: null },
    { id: 'e4', trip_id: 'TR-2026-8850', date: '2026-02-21', vehicle_name: 'Volvo FH16', vehicle_code: 'V-102', route_from: 'Portland', route_to: 'Seattle', fuel_cost: 320.10, maint_cost: null },
    { id: 'e5', trip_id: 'TR-2026-8849', date: '2026-02-20', vehicle_name: 'Mack Anthem', vehicle_code: 'V-331', route_from: 'Miami', route_to: 'Orlando', fuel_cost: 185.90, maint_cost: 55.00 },
    { id: 'e6', trip_id: 'TR-2026-8835', date: '2026-02-19', vehicle_name: 'Kenworth T680', vehicle_code: 'V-205', route_from: 'Detroit', route_to: 'Toronto', fuel_cost: 445.60, maint_cost: null },
]

// Hardcoded chart data for visual fidelity
const CHART_DATA = {
    weekly: [
        { day: 'Mon', fuel: 3300, maint: 1800 },
        { day: 'Tue', fuel: 3500, maint: 1700 },
        { day: 'Wed', fuel: 3100, maint: 2100 },
        { day: 'Thu', fuel: 2900, maint: 2100 },
        { day: 'Fri', fuel: 3900, maint: 1200 },
        { day: 'Sat', fuel: 4600, maint: 500 },
        { day: 'Sun', fuel: 4000, maint: 1600 },
    ],
    monthly: [
        { day: 'W1', fuel: 12500, maint: 3200 },
        { day: 'W2', fuel: 14200, maint: 4100 },
        { day: 'W3', fuel: 11800, maint: 2500 },
        { day: 'W4', fuel: 13900, maint: 5800 },
    ]
}

/* ═══════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════ */
function fmt$(val) {
    if (val == null) return '-'
    return parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: '2-digit',
    })
}

function uid() { return 'e' + Date.now() + Math.random().toString(36).slice(2, 6) }

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function ExpensesFuel() {
    const navigate = useNavigate()

    const user = { name: 'Alex Morgan', role: 'Finance Director' }

    /* ── State ── */
    const [expenses, setExpenses] = useState(MOCK_EXPENSES)
    const [search, setSearch] = useState('')
    const [timeframe, setTimeframe] = useState('weekly') // chart toggle
    const [showModal, setShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState(null)
    const [formData, setFormData] = useState({
        trip_id: '', vehicle_id: '', route_from: '', route_to: '',
        date: new Date().toISOString().split('T')[0],
        fuel_cost: '', maint_cost: '', notes: '',
    })

    /* ── Filter / Sort State ── */
    const [filterVehicle, setFilterVehicle] = useState('All')
    const [sortBy, setSortBy] = useState('date') // 'date', 'cost'
    const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
    const [showFilterMenu, setShowFilterMenu] = useState(false)
    const [showSortMenu, setShowSortMenu] = useState(false)

    /* ── Toast ── */
    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    /* ── Derived Data ── */
    const filteredExpenses = useMemo(() => {
        let result = [...expenses]

        // Search
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(e =>
                e.trip_id.toLowerCase().includes(q) ||
                e.vehicle_name.toLowerCase().includes(q) ||
                e.route_from.toLowerCase().includes(q) ||
                e.route_to.toLowerCase().includes(q)
            )
        }

        // Filter by Vehicle
        if (filterVehicle !== 'All') {
            result = result.filter(e => e.vehicle_name === filterVehicle)
        }

        // Sort
        return result.sort((a, b) => {
            let valA = a[sortBy]
            let valB = b[sortBy]

            if (sortBy === 'cost') {
                valA = (parseFloat(a.fuel_cost || 0) + parseFloat(a.maint_cost || 0))
                valB = (parseFloat(b.fuel_cost || 0) + parseFloat(b.maint_cost || 0))
            } else if (sortBy === 'date') {
                valA = new Date(a.date).getTime()
                valB = new Date(b.date).getTime()
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1
            return 0
        })
    }, [expenses, search, filterVehicle, sortBy, sortOrder])

    /* ── Handlers ── */
    const handleFormChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.trip_id || !formData.vehicle_id) {
            showToast('Trip ID and Vehicle are required', 'error')
            return
        }

        setSubmitting(true)
        setTimeout(() => {
            const vehicle = MOCK_VEHICLES.find(v => v.id === formData.vehicle_id)
            const newExp = {
                id: uid(),
                trip_id: formData.trip_id,
                date: formData.date,
                vehicle_name: vehicle?.name || 'Unknown',
                vehicle_code: vehicle?.code || 'N/A',
                route_from: formData.route_from || 'Unknown',
                route_to: formData.route_to || 'Unknown',
                fuel_cost: formData.fuel_cost ? parseFloat(formData.fuel_cost) : 0,
                maint_cost: formData.maint_cost ? parseFloat(formData.maint_cost) : null,
            }

            setExpenses(prev => [newExp, ...prev])
            showToast('Expense logged successfully')
            setShowModal(false)
            setSubmitting(false)
            setFormData({
                trip_id: '', vehicle_id: '', route_from: '', route_to: '',
                date: new Date().toISOString().split('T')[0], fuel_cost: '', maint_cost: '', notes: ''
            })
        }, 400)
    }

    const handleDelete = (id) => {
        setExpenses(p => p.filter(e => e.id !== id))
        showToast('Expense deleted')
    }

    const handleExport = () => {
        const header = 'Trip ID,Date,Vehicle,Route,Fuel Cost,Maintenance Cost,Total\n'
        const rows = filteredExpenses.map(e => {
            const total = (parseFloat(e.fuel_cost || 0) + parseFloat(e.maint_cost || 0)).toFixed(2)
            return `"${e.trip_id}","${e.date}","${e.vehicle_name}","${e.route_from} to ${e.route_to}",${e.fuel_cost || 0},${e.maint_cost || 0},${total}`
        })
        const csv = header + rows.join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'expenses.csv'
        a.click()
        URL.revokeObjectURL(url)
        showToast('Exported CSV successfully')
    }

    /* ── Chart Rendering (SVG) ── */
    const renderChart = () => {
        const data = CHART_DATA[timeframe]
        const width = 800
        const height = 200
        const padX = 40, padY = 20
        const innerW = width - padX * 2
        const innerH = height - padY * 2

        // Max value for scaling
        const maxVal = 5000 // Fixed scale for visual consistency with mockup: $5k max

        // Points calculation
        const xStep = innerW / (data.length - 1)

        const getPts = (key) => data.map((d, i) => {
            const x = padX + i * xStep
            const y = padY + innerH - (d[key] / maxVal) * innerH
            return `${x},${y}`
        }).join(' ')

        // Bezier curve approximation path for smoothness
        const getCurve = (key) => {
            if (data.length === 0) return ''
            let path = `M ${padX},${padY + innerH - (data[0][key] / maxVal) * innerH}`
            for (let i = 0; i < data.length - 1; i++) {
                const currX = padX + i * xStep
                const currY = padY + innerH - (data[i][key] / maxVal) * innerH
                const nextX = padX + (i + 1) * xStep
                const nextY = padY + innerH - (data[i + 1][key] / maxVal) * innerH
                const cpX = currX + xStep / 2
                path += ` C ${cpX},${currY} ${cpX},${nextY} ${nextX},${nextY}`
            }
            return path
        }

        return (
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(i => {
                    const y = padY + innerH - (i / 5) * innerH
                    return (
                        <g key={i}>
                            <text x={padX - 10} y={y + 4} fontSize="11" fill="#9ca3af" textAnchor="end">
                                ${i}k
                            </text>
                            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
                        </g>
                    )
                })}
                {/* X Axis Labels */}
                {data.map((d, i) => (
                    <text key={i} x={padX + i * xStep} y={height - 2} fontSize="11" fill="#9ca3af" textAnchor="middle">
                        {d.day}
                    </text>
                ))}

                {/* Lines */}
                {/* Maintenance (dashed orange) */}
                <path d={getCurve('maint')} fill="none" stroke="#dcb274" strokeWidth="2" strokeDasharray="6 4" />

                {/* Fuel (solid dark) */}
                <path d={getCurve('fuel')} fill="none" stroke="#1a1d23" strokeWidth="2.5" />

                {/* Data Points (Fuel) */}
                {data.map((d, i) => (
                    <circle key={i} cx={padX + i * xStep} cy={padY + innerH - (d.fuel / maxVal) * innerH} r="3.5" fill="#1a1d23" stroke="#fff" strokeWidth="1.5" />
                ))}
            </svg>
        )
    }

    /* ═══════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════ */
    return (
        <DashboardLayout breadcrumb={['Workspaces', 'Fleet Operations', 'Expenses & Fuel']}>
                <div className="exp-content">
                    {/* Header */}
                    <div className="exp-header">
                        <div>
                            <h1>Expenses &amp; Fuel Logs</h1>
                            <p>Review operational costs for completed trips and fleet maintenance.</p>
                        </div>
                        <div className="exp-header-actions">
                            <button className="btn-export-csv" onClick={handleExport}>
                                📥 Export CSV
                            </button>
                            <button className="btn-log-expense" onClick={() => setShowModal(true)}>
                                <span>+</span> Log Expense
                            </button>
                        </div>
                    </div>

                    {/* Top Row — KPIs + Chart */}
                    <div className="exp-top-row">
                        <div className="exp-kpi-stack">
                            <div className="exp-kpi-card">
                                <div>
                                    <div className="exp-kpi-label">Total Expenses (MTD)</div>
                                    <div className="exp-kpi-value">$42,850.25</div>
                                    <div className="exp-kpi-change up">↘ 2.4% vs last month</div>
                                </div>
                                <div className="exp-kpi-icon cost-icon">💵</div>
                            </div>
                            <div className="exp-kpi-card">
                                <div>
                                    <div className="exp-kpi-label">Fuel Efficiency Avg</div>
                                    <div className="exp-kpi-value">6.8<span className="unit">MPG</span></div>
                                    <div className="exp-kpi-change neutral">— 0% change</div>
                                </div>
                                <div className="exp-kpi-icon efficiency-icon">⛽</div>
                            </div>
                        </div>

                        <div className="exp-chart-card">
                            <div className="exp-chart-header">
                                <div className="exp-chart-title">Cost Trend Analysis</div>
                                <div className="exp-chart-toggle">
                                    <button
                                        className={timeframe === 'weekly' ? 'active' : ''}
                                        onClick={() => setTimeframe('weekly')}
                                    >Weekly</button>
                                    <button
                                        className={timeframe === 'monthly' ? 'active' : ''}
                                        onClick={() => setTimeframe('monthly')}
                                    >Monthly</button>
                                </div>
                            </div>
                            <div className="exp-chart-body">
                                {renderChart()}
                            </div>
                            <div className="exp-chart-legend">
                                <span className="legend-item"><span className="legend-dot fuel"></span> Fuel Cost</span>
                                <span className="legend-item"><span className="legend-dot maintenance"></span> Maintenance Cost</span>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="exp-table-section">
                        <div className="exp-table-header">
                            <div className="exp-table-title">Recent Trip Expenses</div>
                            <div className="exp-table-actions" style={{ position: 'relative' }}>
                                <button className={`btn-filter ${filterVehicle !== 'All' ? 'active' : ''}`} onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}>
                                    <span>≡</span> Filter
                                </button>
                                {showFilterMenu && (
                                    <div className="filter-dropdown" style={{ position: 'absolute', top: '100%', right: '70px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '150px', marginTop: '4px' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Vehicle</div>
                                        <select
                                            value={filterVehicle}
                                            onChange={e => { setFilterVehicle(e.target.value); setShowFilterMenu(false) }}
                                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                                        >
                                            <option value="All">All Vehicles</option>
                                            {MOCK_VEHICLES.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <button className={`btn-sort ${sortOrder !== 'desc' || sortBy !== 'date' ? 'active' : ''}`} onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}>
                                    <span>↕</span> Sort
                                </button>
                                {showSortMenu && (
                                    <div className="sort-dropdown" style={{ position: 'absolute', top: '100%', right: '0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '160px', marginTop: '4px' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Sort By</div>
                                        <select
                                            value={sortBy}
                                            onChange={e => setSortBy(e.target.value)}
                                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.85rem', marginBottom: '8px' }}
                                        >
                                            <option value="date">Date</option>
                                            <option value="cost">Total Cost</option>
                                        </select>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => { setSortOrder('asc'); setShowSortMenu(false); }}
                                                style={{ flex: 1, padding: '4px', fontSize: '0.8rem', background: sortOrder === 'asc' ? '#1a1d23' : '#f4f6fa', color: sortOrder === 'asc' ? '#fff' : '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >Asc ⬆</button>
                                            <button
                                                onClick={() => { setSortOrder('desc'); setShowSortMenu(false); }}
                                                style={{ flex: 1, padding: '4px', fontSize: '0.8rem', background: sortOrder === 'desc' ? '#1a1d23' : '#f4f6fa', color: sortOrder === 'desc' ? '#fff' : '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                            >Desc ⬇</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {filteredExpenses.length === 0 ? (
                            <div className="exp-empty-state">
                                <div className="empty-icon">🧾</div>
                                <p>No expenses found. Adjust your search or add a new record.</p>
                            </div>
                        ) : (
                            <table className="exp-data-table">
                                <thead>
                                    <tr>
                                        <th>Trip ID</th>
                                        <th>Date Completed</th>
                                        <th>Vehicle</th>
                                        <th>Route</th>
                                        <th>Fuel Cost</th>
                                        <th>Maintenance</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((exp) => (
                                        <tr key={exp.id}>
                                            <td className="trip-id">{exp.trip_id}</td>
                                            <td>{fmtDate(exp.date)}</td>
                                            <td>
                                                <div className="vehicle-cell-exp">
                                                    <span className="v-icon">🚛</span>
                                                    <span className="v-name">{exp.vehicle_name}</span>
                                                    <span className="v-code">({exp.vehicle_code})</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="route-cell">
                                                    <span>{exp.route_from}</span>
                                                    <span className="route-arrow">→</span>
                                                    <span>{exp.route_to}</span>
                                                </div>
                                            </td>
                                            <td className="fuel-cost">${fmt$(exp.fuel_cost)}</td>
                                            <td className={`maint-cost ${!exp.maint_cost ? 'empty' : ''}`}>
                                                {exp.maint_cost ? `$${fmt$(exp.maint_cost)}` : '-'}
                                            </td>
                                            <td className="total-cost">
                                                ${fmt$((parseFloat(exp.fuel_cost || 0) + parseFloat(exp.maint_cost || 0)))}
                                            </td>
                                            <td>
                                                <button className="btn-delete-exp" onClick={() => handleDelete(exp.id)} title="Delete row">
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

            {/* ── Modal ── */}
            {showModal && (
                <div className="exp-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="exp-modal" onClick={e => e.stopPropagation()}>
                        <div className="exp-modal-header">
                            <h2>Log New Expense</h2>
                            <button className="exp-modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="exp-modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="exp-form-row">
                                    <div className="exp-form-group">
                                        <label>Trip ID *</label>
                                        <input type="text" name="trip_id" placeholder="e.g. TR-2026-9000"
                                            value={formData.trip_id} onChange={handleFormChange} required />
                                    </div>
                                    <div className="exp-form-group">
                                        <label>Vehicle *</label>
                                        <select name="vehicle_id" value={formData.vehicle_id} onChange={handleFormChange} required>
                                            <option value="">Select a vehicle...</option>
                                            {MOCK_VEHICLES.map(v => (
                                                <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="exp-form-row">
                                    <div className="exp-form-group">
                                        <label>Route From</label>
                                        <input type="text" name="route_from" placeholder="City, State"
                                            value={formData.route_from} onChange={handleFormChange} />
                                    </div>
                                    <div className="exp-form-group">
                                        <label>Route To</label>
                                        <input type="text" name="route_to" placeholder="City, State"
                                            value={formData.route_to} onChange={handleFormChange} />
                                    </div>
                                </div>

                                <div className="exp-form-row">
                                    <div className="exp-form-group">
                                        <label>Fuel Cost ($) *</label>
                                        <input type="number" name="fuel_cost" step="0.01" min="0" placeholder="0.00"
                                            value={formData.fuel_cost} onChange={handleFormChange} required />
                                    </div>
                                    <div className="exp-form-group">
                                        <label>Maintenance Cost ($)</label>
                                        <input type="number" name="maint_cost" step="0.01" min="0" placeholder="0.00"
                                            value={formData.maint_cost} onChange={handleFormChange} />
                                    </div>
                                </div>

                                <div className="exp-form-group">
                                    <label>Date Completed</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleFormChange} />
                                </div>

                                <div className="exp-form-group">
                                    <label>Notes</label>
                                    <textarea name="notes" placeholder="Optional notes about this trip..."
                                        value={formData.notes} onChange={handleFormChange} />
                                </div>

                                <div className="exp-modal-actions">
                                    <button type="button" className="exp-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="exp-btn-submit" disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Log Expense'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <div className={`exp-toast ${toast.type}`}>{toast.message}</div>}
        </DashboardLayout>
    )
}
