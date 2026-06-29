import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { UtensilsCrossed, Heart, ShoppingCart, Bot, ChefHat, LogOut, User, SlidersHorizontal, Calendar, Sun, Moon, Menu, X, LineChart, ShieldAlert } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Mobile Menu Drawer State
  const [isOpen, setIsOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Desktop Profile Dropdown State
  const [profileOpen, setProfileOpen] = useState(false)

  // Close menu drawer/dropdown on route change and reset avatar image error
  useEffect(() => {
    setIsOpen(false)
    setProfileOpen(false)
  }, [location])

  useEffect(() => {
    setImageError(false)
  }, [user])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return
    const handleClose = () => setProfileOpen(false)
    document.addEventListener('click', handleClose)
    return () => document.removeEventListener('click', handleClose)
  }, [profileOpen])

  // Navigation items for desktop (excluding Admin/Console which go to dropdown)
  const desktopNavItems = [
    { path: '/', label: 'Recipes', icon: <UtensilsCrossed size={16} /> },
    { path: '/budget', label: 'Planner', icon: <Calendar size={16} /> },
    { path: '/favorites', label: 'Favorites', icon: <Heart size={16} /> },
    { path: '/shopping-list', label: 'Shopping List', icon: <ShoppingCart size={16} /> },
    { path: '/chef-bot', label: 'Chef Bot', icon: <Bot size={16} /> },
  ]

  if (user) {
    desktopNavItems.push({ path: '/pantry', label: 'Pantry', icon: <ChefHat size={16} /> })
    desktopNavItems.push({ path: '/analytics', label: 'Analytics', icon: <LineChart size={16} /> })
  }

  // Navigation items for mobile (includes all pages vertically)
  const mobileNavItems = [...desktopNavItems]
  if (user && user.is_admin) {
    mobileNavItems.push({ path: '/admin', label: 'Admin', icon: <SlidersHorizontal size={16} /> })
    mobileNavItems.push({ path: '/admin/system-stats', label: 'Console', icon: <ShieldAlert size={16} /> })
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', position: 'relative' }}>
          <div className="navbar-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <div className="logo-emblem-container">
                <img src="/logo.png?v=2" className="logo-emblem-img" alt="Vellum Logo" />
              </div>
              <div>
                <div className="brand-name">Vellum</div>
                <div className="brand-tagline">the art of kitchen blueprinting</div>
              </div>
            </Link>
          </div>

          {/* Hamburger menu button for mobile viewports */}
          <button
            className="navbar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="navbar-links-desktop">
            {desktopNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link-desktop ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon} <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="navbar-auth-desktop">
            <button
              onClick={toggleTheme}
              className="btn-theme-toggle-desktop"
              title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              <span key={theme} className="theme-toggle-spring">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </span>
            </button>

            {user ? (
              <div className="user-dropdown-container">
                <button
                  className="user-dropdown-trigger"
                  onClick={(e) => {
                    e.stopPropagation()
                    setProfileOpen(!profileOpen)
                  }}
                  title="User Profile Menu"
                >
                  {user.profile_image_url && !imageError ? (
                    <img
                      src={user.profile_image_url}
                      className="user-avatar-img-nav"
                      alt={user.name || 'User'}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="user-avatar-initial">
                      {(user.name && user.name[0]) ? user.name[0].toUpperCase() : 'U'}
                    </span>
                  )}
                  <span className="user-name-text">{user.name}</span>
                </button>

                {profileOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-header">
                      <div className="dropdown-user-name">{user.name}</div>
                      <div className="dropdown-user-email">{user.email || 'System Admin'}</div>
                    </div>
                    <div className="dropdown-divider"></div>

                    <Link to="/profile" className="dropdown-item">
                      <User size={15} /> My Profile
                    </Link>

                    {user.is_admin && (
                      <>
                        <Link to="/admin" className="dropdown-item">
                          <SlidersHorizontal size={15} /> Admin Settings
                        </Link>
                        <Link to="/admin/system-stats" className="dropdown-item">
                          <ShieldAlert size={15} /> System Console
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item btn-dropdown-logout" onClick={logout}>
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <User size={15} /> Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop to close menu when clicking outside on mobile */}
      {isOpen && (
        <div className="navbar-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* --- MOBILE NAVIGATION DRAWER --- */}
      <div className={`navbar-menu-mobile ${isOpen ? 'is-open' : ''}`}>
        <div className="navbar-links-mobile">
          {mobileNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link-mobile ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-auth-mobile">
          <div className="mobile-auth-theme-row">
            <span>Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="btn-theme-toggle-mobile"
            >
              <span key={theme} className="theme-toggle-spring">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </span>
            </button>
          </div>

          {user ? (
            <div className="mobile-user-profile-section">
              <Link to="/profile" className="mobile-user-card" onClick={() => setIsOpen(false)}>
                {user.profile_image_url && !imageError ? (
                  <img
                    src={user.profile_image_url}
                    className="user-avatar-img-nav"
                    alt={user.name || 'User'}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="user-avatar-initial">
                    {(user.name && user.name[0]) ? user.name[0].toUpperCase() : 'U'}
                  </span>
                )}
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-email">{user.email || 'System Admin'}</div>
                </div>
              </Link>
              <button className="btn-logout-mobile" onClick={() => { setIsOpen(false); logout(); }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-login-mobile"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
