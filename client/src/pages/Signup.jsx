import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function Signup() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'dispatcher',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Registration failed')
                setLoading(false)
                return
            }

            // Store token and redirect
            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('user', JSON.stringify(data.user))
            navigate('/')
        } catch {
            setError('Unable to connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" />
                                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity="0.6" />
                                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.6" />
                                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity="0.3" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="auth-brand">FleetFlow</h1>
                    <p className="auth-subtitle">Enterprise Logistics Management</p>
                </div>

                {/* Form Card */}
                <div className="auth-card">
                    <h2 className="auth-card-title">Create your account</h2>
                    <p className="auth-card-desc">Fill in the details below to get started.</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="name@company.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Role Selector */}
                        <div className="form-group">
                            <label>I am a</label>
                            <div className="role-selector">
                                <button
                                    type="button"
                                    className={`role-option ${form.role === 'manager' ? 'active' : ''}`}
                                    onClick={() => setForm({ ...form, role: 'manager' })}
                                >
                                    <div className="role-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="8.5" cy="7" r="4" />
                                            <line x1="20" y1="8" x2="20" y2="14" />
                                            <line x1="23" y1="11" x2="17" y2="11" />
                                        </svg>
                                    </div>
                                    <div className="role-text">
                                        <span className="role-name">Manager</span>
                                        <span className="role-desc">Oversee operations</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className={`role-option ${form.role === 'dispatcher' ? 'active' : ''}`}
                                    onClick={() => setForm({ ...form, role: 'dispatcher' })}
                                >
                                    <div className="role-icon">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="1" y="3" width="15" height="13" />
                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                            <circle cx="5.5" cy="18.5" r="2.5" />
                                            <circle cx="18.5" cy="18.5" r="2.5" />
                                        </svg>
                                    </div>
                                    <div className="role-text">
                                        <span className="role-name">Dispatcher</span>
                                        <span className="role-desc">Manage deliveries</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-password-wrap">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Minimum 6 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? <span className="btn-spinner"></span> : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account?{' '}
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>

                {/* Footer */}
                <footer className="auth-footer">
                    <p>&copy; 2026 FleetFlow Systems Inc. All rights reserved.</p>
                    <div className="auth-footer-links">
                        <a href="#">Privacy Policy</a>
                        <span>•</span>
                        <a href="#">Terms of Service</a>
                        <span>•</span>
                        <a href="#">Help Center</a>
                    </div>
                </footer>
            </div>
        </div>
    )
}

export default Signup
