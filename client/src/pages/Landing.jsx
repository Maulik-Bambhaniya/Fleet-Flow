import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

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
                setStatusMessage(data.status === 'ok' ? 'API Connected' : 'API Offline')
            } catch {
                setApiStatus('disconnected')
                setStatusMessage('API Offline')
            }
        }
        checkApi()
    }, [])

    const handleLogout = () => {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
    }

    return (
        <div className="bg-background-base text-slate-deep font-sans antialiased min-h-screen">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <a className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-slate-deep p-1.5 rounded-[8px]">
                                <span className="material-symbols-outlined text-white text-[20px] block">local_shipping</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-deep">FleetFlow</span>
                        </a>
                        <div className="hidden md:flex items-center gap-8">
                            <a className="nav-link" href="#">Product</a>
                            <a className="nav-link" href="#">Solutions</a>
                            <a className="nav-link" href="#">Pricing</a>
                            <a className="nav-link" href="#">Resources</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="hidden sm:block text-sm font-semibold text-secondary-text">
                                    {user.name} <span className="opacity-70">({user.role})</span>
                                </span>
                                <button onClick={() => navigate('/dashboard')} className="hidden sm:block text-sm font-semibold text-secondary-text hover:text-slate-deep px-4 py-2 transition-colors">
                                    Dashboard
                                </button>
                                <button onClick={handleLogout} className="bg-slate-deep hover:bg-slate-deep/90 text-white px-5 py-2.5 rounded-[10px] text-sm font-bold tracking-tight shadow-sm transition-all active:scale-95">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="hidden sm:block text-sm font-semibold text-secondary-text hover:text-slate-deep px-4 py-2 transition-colors">
                                    Login
                                </button>
                                <button onClick={() => navigate('/login')} className="bg-slate-deep hover:bg-slate-deep/90 text-white px-5 py-2.5 rounded-[10px] text-sm font-bold tracking-tight shadow-sm transition-all active:scale-95">
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Hero */}
            <main className="relative pt-32 pb-24 overflow-hidden hero-blueprint">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="max-w-xl">
                            {/* Replaced Version Badge with API Status Badge */}
                            <div className={`inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm ${apiStatus === 'connected' ? 'bg-emerald-50 border-emerald-200' : apiStatus === 'disconnected' ? 'bg-red-50 border-red-200' : ''}`}>
                                <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : apiStatus === 'disconnected' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                                <span className={`text-[11px] font-bold tracking-widest uppercase ${apiStatus === 'connected' ? 'text-emerald-700' : apiStatus === 'disconnected' ? 'text-red-700' : 'text-slate-600'}`}>
                                    {apiStatus === 'loading' ? 'Checking API...' : statusMessage}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                <span className="text-[11px] font-medium text-secondary-text">Human-centric Logistics</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-[0.02em] text-slate-deep mb-6 leading-[1.15]">
                                Master Your Fleet with <span className="text-secondary-text italic font-normal">Precision.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-secondary-text font-medium leading-relaxed mb-10 max-w-lg">
                                Reimagining enterprise logistics through a crafted, human-first lens. Achieve total visibility with our production-ready command center.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <button onClick={() => navigate(user ? '/dashboard' : '/login')} className="w-full sm:w-auto bg-slate-deep hover:bg-slate-800 text-white px-8 py-4 rounded-[10px] text-base font-bold shadow-lg shadow-primary/10 transition-all">
                                    {user ? 'Go to Dashboard' : 'Get Started'}
                                </button>
                                <button className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-deep/30 text-slate-deep px-8 py-4 rounded-[10px] text-base font-bold transition-all flex items-center justify-center gap-2 group">
                                    Explore Features
                                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </button>
                            </div>
                            <div className="mt-12 flex items-center gap-6 opacity-60">
                                <div className="flex -space-x-3">
                                    <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfgUd829j-QCk_Gcu3oNuvru6T3O05eM3GU6rJU7lLJE4P59QZYarcs7qBvV81EmouCLICc-K6Yj8UY1k7Ao78PgbeVr-ux-C_IUG5ZIvQ1eBEEr5rOVIu0_ch7S6g0OEfxzr8s0k0tttbkvDqNcivSm7jq9KZWwoifqRvkKqO_abTZbQy61VaVc23d8Gi_-tkzjuakd0_Lt3sGjrJAQz8GxFx6ifE_ENE9lI9cDnUa3z19LPOdaNPPZ7PNWa5-0n52Ftx_eEyQ7Y" />
                                    <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACeOmxf6_ONhgIualibamZljjSWK8PbPzEYKkEFK72UE1LiB8YOk7WOTSuetA9IVyQxH0oT91WBiXIKyQ3Wiy9LdwpUNXineasvVRXPBeBimldIsI-8y92gcCMSFfy6NXr_HsZUsHASNDDBbGZhMRumMc7Cuj8iG8MXNWpktp-nRyxgfM56I1qBWPX2cAvwZnu08yZaKKwqjEXZ7ZVOzH2qzU9yI-q3NwK8svf-hJ5MWNunU7_-SIfGL558rFxG7T__0oeq0WhX68" />
                                    <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7UuySeo6zlCYj5C34vK0uGgaE6xDVwlsvi_-87SESeD6KbKudT4Xr095tEU1t7f3wGHkc8AKt43tbjihrxilAEjwKcK72ZFzOcbH1vS0-U66IyCdoaQRmHEzriw53F7IvV4ZwJ0d2JnMpillBSw1RlHY61n_sl8-t-tlSvBubjyFw4HQnn6dnUD2hhcnVdtV9aHeJ05K5nP7w2bASTLCkxY4r8Dg5y-U4JXXUGVL9kECsIAZxA2l1RNBdQgou1aUOSLtcMKx6chU" />
                                </div>
                                <p className="text-xs font-semibold text-secondary-text tracking-wide uppercase">Trusted by 2,000+ Operations Managers</p>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="clay-morphic p-4 border border-white/50">
                                <div className="bg-slate-50 rounded-t-xl p-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                                    </div>
                                    <div className="w-48 h-2 bg-slate-200 rounded-full"></div>
                                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                </div>
                                <div className="p-6 grid grid-cols-12 gap-4 h-[400px]">
                                    <div className="col-span-3 space-y-3">
                                        <div className="h-8 bg-slate-deep/5 rounded-md"></div>
                                        <div className="h-8 bg-slate-50 rounded-md"></div>
                                        <div className="h-8 bg-slate-50 rounded-md"></div>
                                        <div className="h-8 bg-slate-50 rounded-md"></div>
                                    </div>
                                    <div className="col-span-9 space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="h-20 bg-slate-50 rounded-xl border border-slate-100"></div>
                                            <div className="h-20 bg-slate-50 rounded-xl border border-slate-100"></div>
                                            <div className="h-20 bg-slate-50 rounded-xl border border-slate-100"></div>
                                        </div>
                                        <div className="h-full bg-slate-100/50 rounded-xl relative overflow-hidden">
                                            <img alt="Map background" className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVHaum7M8alPQFuaivbPkuXjXAMKvsCjPnjEuiT2pbofYs_3SNKhttmOnJBBzb_krkhSBGhEYAuK-p-uLHxTLkBkFTzcZ72cnjS0vZZV2N5Vkx-TdI_E3Ux-LbUmHIDERLZO2XJvwT29QhknAsw2qN50LX4WWgFTIZcoI4p53Eah2pExfy1Omb8g0OPhSDxiUpRpkxY3bVAYH-T28I72GZDC_gdGpxbH3ImzP12o9VHrSVUJanQBECkQgk6FGefeMhMMwfwP_r5fg" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-slate-deep/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-slate-deep">location_on</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 border-2 border-slate-deep/10 rounded-full flex items-center justify-center -z-10">
                                <div className="w-24 h-24 border border-dashed border-slate-deep/20 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>



            {/* System Infrastructure */}
            <section className="py-24 bg-background-base">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20">
                        <h2 className="text-3xl font-extrabold text-slate-deep mb-4">Enterprise-Grade Architecture</h2>
                        <p className="text-secondary-text max-w-2xl font-medium leading-relaxed">Built for operators, by designers. Our platform balances heavy-duty performance with a human touch, ensuring your fleet never misses a beat.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="p-8 rounded-[10px] bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-slate-deep/5 rounded-[8px] flex items-center justify-center text-slate-deep mb-6">
                                <span className="material-symbols-outlined">visibility</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-deep mb-3">Live Fleet Analytics</h3>
                            <p className="text-secondary-text text-sm leading-relaxed">High-fidelity monitoring for every asset in your fleet, optimized for rapid decision making.</p>
                        </div>
                        <div className="p-8 rounded-[10px] bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-slate-deep/5 rounded-[8px] flex items-center justify-center text-slate-deep mb-6">
                                <span className="material-symbols-outlined">route</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-deep mb-3">Intelligent Routing</h3>
                            <p className="text-secondary-text text-sm leading-relaxed">Dynamic pathing that adapts to traffic, weather, and driver fatigue in real-time.</p>
                        </div>
                        <div className="p-8 rounded-[10px] bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-slate-deep/5 rounded-[8px] flex items-center justify-center text-slate-deep mb-6">
                                <span className="material-symbols-outlined">insights</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-deep mb-3">Predictive Scaling</h3>
                            <p className="text-secondary-text text-sm leading-relaxed">Analyze historical performance to forecast demand surges before they happen.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-deep/10 p-1 rounded-[6px]">
                            <span className="material-symbols-outlined text-slate-deep text-[18px] block">local_shipping</span>
                        </div>
                        <span className="text-lg font-bold text-slate-deep">FleetFlow</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest ml-4">© 2026</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <a className="text-xs font-bold text-secondary-text uppercase tracking-[0.15em] hover:text-slate-deep transition-colors" href="#">Privacy</a>
                        <a className="text-xs font-bold text-secondary-text uppercase tracking-[0.15em] hover:text-slate-deep transition-colors" href="#">Terms</a>
                        <a className="text-xs font-bold text-secondary-text uppercase tracking-[0.15em] hover:text-slate-deep transition-colors" href="#">Security</a>
                        <a className="flex items-center gap-1.5 text-xs font-bold text-secondary-text uppercase tracking-[0.15em] hover:text-slate-deep transition-colors" href="#">
                            <span className="material-symbols-outlined text-[16px]">settings</span>
                            Settings
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing
