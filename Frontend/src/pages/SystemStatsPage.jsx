import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Shield, Users, Radio, ToggleLeft, ToggleRight, Lock, Key, AlertTriangle, Loader, Server, Globe, Smartphone, Monitor, Tablet } from 'lucide-react'

const parseUserAgent = (userAgent) => {
  if (!userAgent) return { type: 'unknown', name: 'Unknown Device', os: '', browser: '' }
  
  const ua = userAgent.toLowerCase()
  let type = 'desktop'
  let name = 'Desktop'
  let os = 'Unknown OS'
  let browser = 'Unknown Browser'
  
  // Detect OS
  if (ua.includes('windows')) {
    os = 'Windows'
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS'
  } else if (ua.includes('android')) {
    os = 'Android'
    type = 'mobile'
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = ua.includes('ipad') ? 'iPadOS' : 'iOS'
    type = ua.includes('ipad') ? 'tablet' : 'mobile'
  } else if (ua.includes('linux')) {
    os = 'Linux'
  }
  
  // Detect Device Type specifically
  if (ua.includes('mobile') || ua.includes('phone')) {
    type = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    type = 'tablet'
  }
  
  // Detect Browser
  if (ua.includes('firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('chrome') || ua.includes('crios')) {
    browser = 'Chrome'
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')) {
    browser = 'Safari'
  } else if (ua.includes('edge') || ua.includes('edg/')) {
    browser = 'Edge'
  } else if (ua.includes('opr/') || ua.includes('opera')) {
    browser = 'Opera'
  }
  
  // Set nice name
  if (type === 'mobile') {
    name = os === 'iOS' ? 'iPhone' : `${os} Phone`
  } else if (type === 'tablet') {
    name = os === 'iPadOS' ? 'iPad' : `${os} Tablet`
  } else {
    name = `${os} PC`
  }
  
  return { type, name, os, browser }
}

export default function SystemStatsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggleLoading, setToggleLoading] = useState(false)

  // Double check authorization on frontend
  const isAdmin = user && user.is_admin

  useEffect(() => {
    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/system-stats')
      setStats(res.data)
    } catch (err) {
      console.error('Failed to load system stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMaintenance = async () => {
    if (!stats) return
    const newState = !stats.maintenance_mode
    const msg = newState
      ? 'WARNING: Activating Maintenance Mode will block all API endpoints for standard users. Proceed?'
      : 'Deactivate Maintenance Mode and restore standard user routing access?'
    
    if (!window.confirm(msg)) return

    setToggleLoading(true)
    try {
      const res = await api.post('/admin/toggle-maintenance', { active: newState })
      setStats(prev => ({
        ...prev,
        maintenance_mode: res.data.maintenance_mode
      }))
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err)
      alert('Failed to update maintenance mode status.')
    } finally {
      setToggleLoading(false)
    }
  }

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (!isAdmin) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '3rem 2rem', borderRadius: '16px', maxWidth: '480px', width: '100%' }}>
          <Lock size={48} color="#ef4444" style={{ marginBottom: '1.25rem' }} />
          <h1 style={{ fontSize: '1.75rem', color: '#fff', fontFamily: "'Outfit', sans-serif", margin: '0 0 10px 0', fontWeight: 'bold' }}>Access Forbidden</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0, wordBreak: 'break-word' }}>
            This command deck is restricted to system administrators. Unauthorized access attempts are monitored and recorded.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="page-container" style={{ maxWidth: '950px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Admin Title Banner */}
      <div className="admin-header-row" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '1.5rem', 
        marginBottom: '2.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={36} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <h1 className="admin-page-title" style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 'bold' }}>
              Admin Command Deck
            </h1>
            <span style={{ fontSize: '0.8rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>
              Administrator Security Console
            </span>
          </div>
        </div>

        {/* Real-time System Status Indicator */}
        <div className="admin-status-badge" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          background: stats?.maintenance_mode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: stats?.maintenance_mode ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
          padding: '8px 16px',
          borderRadius: '24px',
          flexShrink: 0
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: stats?.maintenance_mode ? '#ef4444' : '#10b981',
            display: 'inline-block',
            animation: stats?.maintenance_mode ? 'pulseRed 1.8s infinite' : 'none'
          }} />
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            color: stats?.maintenance_mode ? '#ef4444' : '#10b981',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap'
          }}>
            {stats?.maintenance_mode ? 'UNDER MAINTENANCE' : 'SYSTEM OPERATIONAL'}
          </span>
        </div>
      </div>

      {/* Main grid — uses responsive CSS class */}
      <div className="admin-grid">
        {/* Left Hand: Controls Deck */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Core Metrics */}
          <div className="glass-panel" style={{ 
            padding: '2rem', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ 
              background: 'var(--emerald-light)', 
              border: '1px solid var(--nav-active-border)', 
              width: '56px', 
              height: '56px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Users size={28} color="var(--emerald)" />
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Curators</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1 }}>
                {stats?.total_users}
              </div>
            </div>
          </div>

          {/* Maintenance Control Widget */}
          <div className="glass-panel" style={{ 
            padding: '2rem', 
            border: '1px solid rgba(239, 68, 68, 0.25)', 
            background: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)'
          }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              color: '#ef4444', 
              margin: '0 0 8px 0', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18} /> System Intercept Switch
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
              Maintenance mode stops incoming traffic to user-facing pages, returning a 503 error code to prevent database writes during upgrades.
            </p>

            <button
              onClick={handleToggleMaintenance}
              disabled={toggleLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: stats?.maintenance_mode ? '1px solid #10b981' : '1px solid #ef4444',
                background: stats?.maintenance_mode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                color: stats?.maintenance_mode ? '#10b981' : '#ef4444',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
              className="btn-maintenance-toggle"
            >
              {toggleLoading ? (
                <Loader className="animate-spin" size={18} />
              ) : stats?.maintenance_mode ? (
                <>
                  <ToggleRight size={22} /> Disable Maintenance Mode
                </>
              ) : (
                <>
                  <ToggleLeft size={22} /> Enable Maintenance Mode
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Hand: Log Monitor */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-card)', 
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-primary)', 
            margin: '0 0 1.25rem 0', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Server size={18} color="var(--emerald)" /> Curator Login Stream
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {stats?.latest_logins.length === 0 ? (
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No recent logins recorded.
              </div>
            ) : (
              stats?.latest_logins.map(log => (
                <div 
                  key={log.id} 
                  className="admin-log-entry"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-neutral)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: '800', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      color: log.activity_type === 'signup' ? '#10b981' : 'var(--emerald)',
                      background: log.activity_type === 'signup' ? 'rgba(16, 185, 129, 0.08)' : 'var(--emerald-light)',
                      border: log.activity_type === 'signup' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--nav-active-border)'
                    }}>
                      {log.activity_type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                    {log.email}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }} title="IP Address">
                      <Globe size={11} /> {log.ip_address || 'Unknown IP'}
                    </span>
                    {log.user_agent && (() => {
                      const device = parseUserAgent(log.user_agent);
                      return (
                        <span 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' }} 
                          title={log.user_agent}
                        >
                          {device.type === 'mobile' ? (
                            <Smartphone size={11} color="var(--emerald)" />
                          ) : device.type === 'tablet' ? (
                            <Tablet size={11} color="var(--emerald)" />
                          ) : (
                            <Monitor size={11} color="var(--emerald)" />
                          )}
                          <span>{device.name} ({device.browser})</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
