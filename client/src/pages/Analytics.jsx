import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Analytics.css'

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */
const NAV_ITEMS = [
    { label: 'Command Center', icon: '📊', path: '/dashboard' },
    { label: 'Vehicle Registry', icon: '🚛', path: '/vehicles' },
    { label: 'Trip Dispatcher', icon: '🗺️', path: '/dispatch' },
    { label: 'Maintenance Logs', icon: '🔧', path: '/maintenance' },
    { label: 'Expenses & Fuel', icon: '🧾', path: '/expenses' },
    { label: 'Driver Profiles', icon: '👤', path: '/drivers' },
    { label: 'Analytics & Reports', icon: '📈', path: '/analytics' },
]

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export default function Analytics() {
    const navigate = useNavigate()
    const location = useLocation()
    const user = { name: 'Sarah Jenkins', role: 'Fleet Controller' }

    const [timeframe, setTimeframe] = useState('30 Days')
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('http://localhost:5000/api/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const json = await res.json()
                    setDashboardData(json)
                } else {
                    console.error("Failed to load analytics data")
                }
            } catch (err) {
                console.error("API Error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    /* ── Handlers ── */
    const handleExportCSV = () => {
        if (!dashboardData) return;
        let csv = 'Metrics Summary\nMetric,Value,Change\n'
        dashboardData.kpis.forEach(k => {
            csv += `"${k.label}","${k.value}","${k.change}"\n`
        })

        csv += '\nMonthly Cost per Vehicle\nVehicle,Fuel Cost,Maintenance Cost\n'
        dashboardData.monthly_costs.forEach(m => {
            csv += `"${m.v}","${m.cost}","${m.maint}"\n`
        })

        csv += '\nROI Leaders\nVehicle,Net Profit / Cost\n'
        dashboardData.roi_leaders.forEach(r => {
            csv += `"${r.id}","${r.percent}%"\n`
        })

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'analytics_report.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleExportPDF = () => {
        window.print()
    }

    /* ── SVG Line Chart ── */
    const renderLineChart = () => {
        if (!dashboardData || !dashboardData.charts) return null
        const chartData = dashboardData.charts[timeframe]
        const width = 800
        const height = 260
        const padX = 40, padY = 20
        const innerW = width - padX * 2
        const innerH = height - padY * 2

        const minVal = 0
        const maxVal = 120 // padding for visuals

        const xStep = innerW / (chartData.length - 1)

        const getCurve = () => {
            let path = `M ${padX},${padY + innerH - (chartData[0].val / maxVal) * innerH}`
            for (let i = 0; i < chartData.length - 1; i++) {
                const currX = padX + i * xStep
                const currY = padY + innerH - (chartData[i].val / maxVal) * innerH
                const nextX = padX + (i + 1) * xStep
                const nextY = padY + innerH - (chartData[i + 1].val / maxVal) * innerH
                const cpX = currX + xStep / 2
                path += ` C ${cpX},${currY} ${cpX},${nextY} ${nextX},${nextY}`
            }
            // draw tail extending off edge (as in mockup)
            const tailX = width + 20
            const tailY = padY + innerH - (75 / maxVal) * innerH
            path += ` C ${padX + (chartData.length - 1) * xStep + 20},${padY + innerH - (chartData[chartData.length - 1].val / maxVal) * innerH} ${width},${tailY} ${tailX},${tailY}`
            return path
        }

        return (
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                {/* Horizontal Grid lines 0%, 25%, 50%, 75%, 100% */}
                {[0, 25, 50, 75, 100].map(pct => {
                    const y = padY + innerH - (pct / 100) * innerH
                    return (
                        <g key={pct}>
                            <text x={padX - 10} y={y + 4} fontSize="11" fill="#9ca3af" textAnchor="end">{pct}%</text>
                            <line x1={padX} y1={y} x2={width} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                        </g>
                    )
                })}
                {/* X Axis Labels */}
                {chartData.map((d, i) => (
                    <text key={i} x={padX + i * xStep} y={height - 5} fontSize="11" fill="#9ca3af" textAnchor="middle">
                        {d.label}
                    </text>
                ))}

                {/* The main wavy line */}
                <path d={getCurve()} fill="none" stroke="#1f2937" strokeWidth="2.5" />

                {/* Floating Dots */}
                {chartData.map((d, i) => (
                    <circle
                        key={i}
                        cx={padX + i * xStep + (i === 0 ? 20 : i === 1 ? -20 : i === 3 ? -10 : i === 4 ? -20 : 0)}
                        cy={padY + innerH - (d.dot / maxVal) * innerH}
                        r="2.5"
                        fill="#1f2937"
                    />
                ))}
            </svg>
        )
    }

    /* ── SVG Donut Chart ── */
    const renderDonut = () => {
        // Diesel 70%, Electric 20%, Hybrid 10%
        const cx = 100, cy = 100, r = 70
        const strokeW = 20
        const circumference = 2 * Math.PI * r

        // Offset calculations
        const dPct = 0.70, ePct = 0.20, hPct = 0.10
        const dLen = dPct * circumference
        const eLen = ePct * circumference
        const hLen = hPct * circumference

        const dOffset = 0
        const eOffset = -dLen
        const hOffset = -(dLen + eLen)

        return (
            <div className="ana-donut-container">
                <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                    <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Hybrid (Light) */}
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#cbd5e1" strokeWidth={strokeW}
                            strokeDasharray={`${hLen} ${circumference}`} strokeDashoffset={hOffset} />
                        {/* Electric (Blue/Gray) */}
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth={strokeW}
                            strokeDasharray={`${eLen} ${circumference}`} strokeDashoffset={eOffset} />
                        {/* Diesel (Dark) */}
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth={strokeW}
                            strokeDasharray={`${dLen} ${circumference}`} strokeDashoffset={dOffset} />
                    </svg>
                    {/* Center Text */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1d23', lineHeight: 1 }}>8.4</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginTop: '2px' }}>MPG AVG</div>
                    </div>
                </div>

                <div className="ana-donut-legend">
                    <div className="ana-legend-item">
                        <div className="ana-legend-label">
                            <div className="ana-legend-dot" style={{ background: '#1f2937' }}></div>
                            Diesel (Heavy)
                        </div>
                        <div className="ana-legend-value">70%</div>
                    </div>
                    <div className="ana-legend-item">
                        <div className="ana-legend-label">
                            <div className="ana-legend-dot" style={{ background: '#94a3b8' }}></div>
                            Electric
                        </div>
                        <div className="ana-legend-value">20%</div>
                    </div>
                    <div className="ana-legend-item">
                        <div className="ana-legend-label">
                            <div className="ana-legend-dot" style={{ background: '#cbd5e1' }}></div>
                            Hybrid
                        </div>
                        <div className="ana-legend-value">10%</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="analytics-layout">
            {/* ── Sidebar ── */}
            <aside className="ana-sidebar">
                <div className="ana-sidebar-logo">
                    <div className="logo-icon">🚐</div>
                    <div>
                        FleetFlow
                        <span className="logo-sub">Enterprise Logistics</span>
                    </div>
                </div>
                <ul className="ana-sidebar-nav">
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
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <ul className="ana-sidebar-nav">
                        <li>
                            <a href="/settings" onClick={e => e.preventDefault()}>
                                <span className="nav-icon">⚙️</span> System Settings
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* ── Main Area ── */}
            <main className="ana-main">
                {/* Topbar */}
                <div className="ana-topbar">
                    <div className="ana-breadcrumb">
                        Dashboard <span>›</span> <span>Analytics &amp; Financial Reports</span>
                    </div>
                    <div className="ana-search">
                        <span style={{ marginRight: 8, color: '#9ca3af' }}>🔍</span>
                        <input type="text" placeholder="Search reports, vehicles, or metrics..." />
                    </div>
                    <div className="ana-topbar-right">
                        <button className="ana-bell">🔔<span className="badge" /></button>
                        <div className="ana-user">
                            <div className="ana-user-info">
                                <div className="ana-user-name">{user.name}</div>
                                <div className="ana-user-role">{user.role}</div>
                            </div>
                            <div className="ana-avatar">SJ</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="ana-content">
                    {/* Header */}
                    <div className="ana-header">
                        <div>
                            <h1>Analytics &amp; Financial Reports</h1>
                            <p>Comprehensive performance metrics for Q3 2023</p>
                        </div>
                        <div className="ana-header-actions">
                            <button className="btn-ana-export-csv" onClick={handleExportCSV}>
                                📥 Export CSV
                            </button>
                            <button className="btn-ana-export-pdf" onClick={handleExportPDF}>
                                📄 Export PDF
                            </button>
                        </div>
                    </div>

                    {loading || !dashboardData ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading analytics dashboard...</div>
                    ) : (
                        <>
                            {/* KPI Row */}
                            <div className="ana-kpi-row">
                                {dashboardData.kpis?.map((kpi, i) => (
                                    <div key={i} className="ana-kpi-card">
                                        <div className="ana-kpi-info">
                                            <div className="ana-kpi-label">{kpi.label}</div>
                                            <div className="ana-kpi-value">{kpi.value}</div>
                                            <div className={`ana-kpi-change ${kpi.type}`}>
                                                {kpi.change.startsWith('+') ? '↗' : '↘'} {kpi.change}
                                            </div>
                                        </div>
                                        <div className="ana-kpi-icon">
                                            {kpi.icon}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Middle Row (Charts) */}
                            <div className="ana-middle-row">
                                <div className="ana-chart-card">
                                    <div className="ana-chart-header">
                                        <div className="ana-chart-title">Fleet Utilization Trend</div>
                                        <div className="ana-chart-toggle">
                                            {['30 Days', '90 Days', 'Year'].map(t => (
                                                <button
                                                    key={t}
                                                    className={timeframe === t ? 'active' : ''}
                                                    onClick={() => setTimeframe(t)}
                                                >{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ana-svg-container">
                                        {renderLineChart()}
                                    </div>
                                </div>

                                <div className="ana-chart-card">
                                    <div className="ana-chart-header" style={{ marginBottom: 0 }}>
                                        <div className="ana-chart-title">
                                            Fuel Efficiency
                                            <span className="info-icon">i</span>
                                        </div>
                                    </div>
                                    {renderDonut()}
                                </div>
                            </div>

                            {/* Bottom Row */}
                            <div className="ana-bottom-row">
                                {/* Cost List */}
                                <div className="ana-chart-card">
                                    <div className="ana-chart-header">
                                        <div className="ana-chart-title">Monthly Cost per Vehicle</div>
                                        <a href="#" className="ana-view-all" onClick={e => e.preventDefault()}>View All</a>
                                    </div>
                                    <div className="ana-cost-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {/* Table Headerish row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 8px 8px', borderBottom: '1px solid #f3f4f6' }}>
                                            <div className="ana-header-label" style={{ flex: 2 }}>VEHICLE</div>
                                            <div className="ana-header-label" style={{ flex: 1, textAlign: 'right' }}>FUEL</div>
                                            <div className="ana-header-label" style={{ flex: 1, textAlign: 'right' }}>MAINT.</div>
                                        </div>
                                        {dashboardData.monthly_costs?.map((m, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 8px', borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
                                                <div style={{ flex: 2, fontSize: '0.85rem', fontWeight: 600, color: '#1a1d23' }}>{m.v}</div>
                                                <div style={{ flex: 1, textAlign: 'right', fontSize: '0.85rem', color: '#4b5563' }}>{m.cost}</div>
                                                <div style={{ flex: 1, textAlign: 'right', fontSize: '0.85rem', color: '#4b5563' }}>{m.maint}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ROI Leaders */}
                                <div className="ana-chart-card">
                                    <div className="ana-chart-header">
                                        <div className="ana-chart-title">ROI Leaders</div>
                                        <div className="ana-header-label" style={{ textTransform: 'none' }}>Net Profit / Cost</div>
                                    </div>
                                    <div className="ana-roi-list">
                                        {dashboardData.roi_leaders?.map((r, i) => (
                                            <div key={i} className="ana-roi-item">
                                                <div className="ana-roi-label">{r.id}</div>
                                                <div className="ana-roi-bar-bg">
                                                    <div className="ana-roi-bar-fill" style={{ width: `${r.percent > 100 ? 100 : r.percent}%`, background: r.color }} />
                                                </div>
                                                <div className="ana-roi-value">{r.percent}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
