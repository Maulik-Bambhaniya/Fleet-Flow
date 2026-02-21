import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function Landing() {
    const navigate = useNavigate()
    const [apiStatus, setApiStatus] = useState('loading')
    const [statusMessage, setStatusMessage] = useState('Checking API...')
    const [user, setUser] = useState(null)

    useEffect(() => {
        // Check if user is logged in
        const stored = sessionStorage.getItem('user') || localStorage.getItem('user')
        if (stored) {
            setUser(JSON.parse(stored))
        }

        const checkApi = async () => {
            try {
                const res = await fetch('/api/status')
                if (!res.ok) throw new Error('API returned non-OK status')
                const data = await res.json()
                setApiStatus(data.status === 'ok' ? 'connected' : 'disconnected')
                setStatusMessage(data.status === 'ok' ? 'API Connected' : 'API Error')
            } catch {
                setApiStatus('disconnected')
                setStatusMessage('API Offline — start the server')
            }
        }
        checkApi()
    }, [])

    const handleLogout = () => {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    return (
        <>
            {/* ── Navbar ── */}
            <nav className="navbar">
                <div className="container">
                    <div className="logo">
                        <div className="logo-icon">⚡</div>
                        Fleet-Flow
                    </div>
                    <ul className="nav-links">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#stack">Tech Stack</a></li>
                        <li><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li>
                    </ul>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#8b8b9e', fontSize: '0.875rem' }}>
                                {user.name} <span style={{ opacity: 0.5 }}>({user.role})</span>
                            </span>
                            <button className="nav-cta" onClick={handleLogout}>Logout</button>
                        </div>
                    ) : (
                        <button className="nav-cta" onClick={() => navigate('/login')}>Sign In</button>
                    )}
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="hero">
                <div className="hero-content">
                    <div className={`status-badge ${apiStatus}`}>
                        {apiStatus === 'loading' ? (
                            <div className="spinner" />
                        ) : (
                            <span className="status-dot" />
                        )}
                        {statusMessage}
                    </div>

                    <h1>
                        Build faster with{' '}
                        <span className="gradient-text">Fleet-Flow</span>
                    </h1>
                    <p>
                        A modern full-stack starter powered by MongoDB, Express, React, and
                        Node.js &mdash; designed so you can ship features, not boilerplate.
                    </p>

                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/signup')}>Start Building</button>
                        <button className="btn-secondary">View Docs</button>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="features" id="features">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Features</span>
                        <h2>Everything you need. Nothing you don&apos;t.</h2>
                    </div>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3>Lightning Fast</h3>
                            <p>
                                Vite-powered HMR on the frontend, Nodemon on the backend.
                                Changes reload instantly during development.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔗</div>
                            <h3>API Proxy Built-In</h3>
                            <p>
                                Seamless frontend-to-backend communication via Vite&apos;s dev
                                proxy &mdash; no CORS headaches during development.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🗄️</div>
                            <h3>Supabase Ready</h3>
                            <p>
                                PostgreSQL via Supabase with connection pooling, auto-table
                                creation, and environment-based config.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Tech Stack ── */}
            <section className="tech-stack" id="stack">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Tech Stack</span>
                        <h2>Powered by the MERN stack</h2>
                    </div>

                    <div className="tech-grid">
                        <div className="tech-item">
                            <div className="tech-icon">🐘</div>
                            <span className="tech-label">PostgreSQL</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">⚙️</div>
                            <span className="tech-label">Express</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">⚛️</div>
                            <span className="tech-label">React</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">🟢</div>
                            <span className="tech-label">Node.js</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="footer">
                <div className="container">
                    <p>
                        Built with <span className="heart">♥</span> using the MERN stack
                        &mdash; Fleet-Flow &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </>
    )
}

export default Landing
