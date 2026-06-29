import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Sparkles, GraduationCap } from 'lucide-react'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  const handle = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') await login(form.email, form.password)
      else await register(form.name, form.email, form.password, form.password_confirmation)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
          {mode === 'login' ? (
            <>
              <Sparkles size={20} color="#4ade80" /> Welcome Back
            </>
          ) : (
            <>
              <GraduationCap size={20} color="#4ade80" /> Join Vellum
            </>
          )}
        </h2>
        <p className="modal-subtitle">{mode === 'login' ? 'Sign in to save favourites & shopping lists' : 'Create your account'}</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handle} className="auth-form">
          {mode === 'register' && (
            <input className="auth-input" placeholder="Your name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
          )}
          <input className="auth-input" type="email" placeholder="Email address" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />
          <input className="auth-input" type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
          {mode === 'register' && (
            <input className="auth-input" type="password" placeholder="Confirm password" value={form.password_confirmation}
              onChange={e => setForm({...form, password_confirmation: e.target.value})} required />
          )}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="modal-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
