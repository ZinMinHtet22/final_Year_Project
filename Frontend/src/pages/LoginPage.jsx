import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, AlertCircle, UtensilsCrossed, Coins, CookingPot, Activity, Bot, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setError('')

    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const isMockClient = !clientID || clientID.startsWith('your-') || clientID.startsWith('101732053424')

    if (isMockClient) {
      if (window.confirm("A custom Google Client ID is not configured in Vellum.\n\nWould you like to run the Local Developer Google OAuth Mock flow to simulate successful account creation and sign-in?")) {
        setLoading(true)
        try {
          await loginWithGoogle('mock-google-token')
          navigate('/')
        } catch (err) {
          setError(err.response?.data?.message || 'Google mock authentication failed.')
        } finally {
          setLoading(false)
        }
        return
      }
    }

    if (!window.google) {
      setError('Google identity service not loaded yet. Please try again in a moment.')
      return
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientID || '94282488211-15htnukk10j7pho5hck9dk0v4nk6vnkd.apps.googleusercontent.com',
        scope: 'openid profile email',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            setLoading(true)
            try {
              await loginWithGoogle(tokenResponse.access_token)
              navigate('/')
            } catch (err) {
              setError(err.response?.data?.message || 'Google authentication failed.')
            } finally {
              setLoading(false)
            }
          }
        },
        error_callback: (err) => {
          console.error('Google client error:', err)
          setError('Failed to open Google authentication popup.')
        }
      })
      client.requestAccessToken()
    } catch (err) {
      console.error('Google Client setup error:', err)
      setError('Google client configuration failed. Please verify VITE_GOOGLE_CLIENT_ID.')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* Left Side: Brand Panel */}
        <div className="auth-branding-panel">
          <div className="auth-brand-content">
            <div className="auth-brand-logo">
              <div className="logo-emblem-container lg" style={{ filter: 'drop-shadow(0 0 6px var(--emerald))' }}>
                <img src="/logo.png?v=2" className="logo-emblem-img" alt="Vellum Logo" />
              </div>
              <span className="brand-name font-serif" style={{ fontSize: '1.8rem', textAlign: 'left', fontWeight: '300', letterSpacing: '0.08em' }}>
                Vellum
                <div className="brand-tagline" style={{ fontSize: '0.65rem', color: 'var(--emerald)', letterSpacing: '0.18em', fontWeight: '700', marginTop: '4px' }}>INTELLIGENT GASTRONOMY</div>
              </span>
            </div>
            
            <h1 className="auth-brand-title font-serif" style={{ fontWeight: '400', fontSize: '2.5rem', lineHeight: '1.3' }}>Plan Beautifully.<br />Savor Effortlessly.</h1>
            <p className="auth-brand-text">
              Step into a refined space engineered for kitchen optimization. Discover tailored culinary inspiration, align your weekly menus, and balance your lifestyle metrics with absolute peace of mind.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <Coins size={16} />
                </div>
                <span>Fluid global cost alignment tailored to your region</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <CookingPot size={16} />
                </div>
                <span>Intuitive, custom pantry ingredient curation</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <Activity size={16} />
                </div>
                <span>Harmonious daily wellness and lifestyle tracking</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon-wrap">
                  <Bot size={16} />
                </div>
                <span>Your private, intelligent culinary companion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="auth-form-panel">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <LogIn size={40} color="var(--emerald)" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px var(--emerald-glow))' }} />
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', fontFamily: "'Outfit', sans-serif" }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Sign in to access your curated kitchen workspace.</p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            className="btn-google-oauth"
            onClick={handleGoogleLogin}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Luxury divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0 1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'left' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  className="auth-input-soft" 
                  placeholder="Enter your email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '38px', width: '100%' }}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="auth-input-soft" 
                  placeholder="Enter password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px', paddingRight: '40px', width: '100%' }}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '0.5rem', height: '44px', fontSize: '0.95rem' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--emerald)', fontWeight: '600', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
