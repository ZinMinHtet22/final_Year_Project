import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import api from '../api/client'
import RecipeCard from '../components/RecipeCard'
import ProfileModal from '../components/ProfileModal'
import SubmitRecipeModal from '../components/SubmitRecipeModal'
import { Link } from 'react-router-dom'
import { User, Heart, Clock, Settings, UtensilsCrossed, Calendar, Activity, Edit3, Save, Plus, Trash2 } from 'lucide-react'

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    let start = displayValue
    const end = parseInt(value) || 0
    if (start === end) return

    const duration = 500 // 500ms transition to match visual language
    const startTime = performance.now()
    let animationFrameId

    const updateNumber = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const current = Math.round(start + (end - start) * easeProgress)
      setDisplayValue(current)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber)
      }
    }

    animationFrameId = requestAnimationFrame(updateNumber)
    return () => cancelAnimationFrame(animationFrameId)
  }, [value])

  return <span>{displayValue}</span>
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { rates, symbols, selectedCurrency } = useCurrency()
  const [favorites, setFavorites] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [showSubmitRecipeModal, setShowSubmitRecipeModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [user])

  // Daily Nutrition Tracker States
  const [dailyLog, setDailyLog] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [targets, setTargets] = useState({ calories: 2000, protein: 70, carbs: 250, fat: 70 })
  const [isEditingTargets, setIsEditingTargets] = useState(false)
  const [tempTargets, setTempTargets] = useState({ calories: 2000, protein: 70, carbs: 250, fat: 70 })
  
  // Quick Add States
  const [quickAdd, setQuickAdd] = useState({ calories: '', protein: '', carbs: '', fat: '' })
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const getTodayDateString = () => {
    const today = new Date()
    const offset = today.getTimezoneOffset()
    return new Date(today.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]
  }

  const loadNutritionData = () => {
    const todayStr = getTodayDateString()
    const logKey = `nutrition_log_${todayStr}`
    const storedLog = JSON.parse(localStorage.getItem(logKey) || '{"calories":0,"protein":0,"carbs":0,"fat":0}')
    setDailyLog(storedLog)

    const storedTargets = JSON.parse(localStorage.getItem('nutrition_targets') || '{"calories":2000,"protein":70,"carbs":250,"fat":70}')
    setTargets(storedTargets)
    setTempTargets(storedTargets)
  }

  useEffect(() => {
    loadNutritionData()
  }, [])

  const handleSaveTargets = () => {
    localStorage.setItem('nutrition_targets', JSON.stringify(tempTargets))
    setTargets(tempTargets)
    setIsEditingTargets(false)
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    const todayStr = getTodayDateString()
    const logKey = `nutrition_log_${todayStr}`
    
    const caloriesVal = parseInt(quickAdd.calories) || 0
    const proteinVal = parseInt(quickAdd.protein) || 0
    const carbsVal = parseInt(quickAdd.carbs) || 0
    const fatVal = parseInt(quickAdd.fat) || 0

    const updatedLog = {
      calories: dailyLog.calories + caloriesVal,
      protein: dailyLog.protein + proteinVal,
      carbs: dailyLog.carbs + carbsVal,
      fat: dailyLog.fat + fatVal
    }

    localStorage.setItem(logKey, JSON.stringify(updatedLog))
    setDailyLog(updatedLog)
    setQuickAdd({ calories: '', protein: '', carbs: '', fat: '' })
    setShowQuickAdd(false)

    const loggedDates = JSON.parse(localStorage.getItem('nutrition_logged_dates') || '[]')
    if (!loggedDates.includes(todayStr)) {
      loggedDates.push(todayStr)
      localStorage.setItem('nutrition_logged_dates', JSON.stringify(loggedDates))
    }
  }

  const handleResetLog = () => {
    if (window.confirm("Are you sure you want to clear today's intake log?")) {
      const todayStr = getTodayDateString()
      const logKey = `nutrition_log_${todayStr}`
      const emptyLog = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      localStorage.setItem(logKey, JSON.stringify(emptyLog))
      setDailyLog(emptyLog)
    }
  }

  const fetchProfileData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch favorites
      const favRes = await api.get('/favorites')
      const favRecipes = favRes.data.map(f => f.recipe)
      setFavorites(favRecipes)
      setFavoriteIds(favRecipes.map(r => r.id))

      // Fetch recently viewed from localStorage and API
      const viewedIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]')
      if (viewedIds.length > 0) {
        // Fetch all recipes and filter to match recently viewed ids in order
        const recRes = await api.get('/recipes')
        const allRecipes = Array.isArray(recRes.data) ? recRes.data : (recRes.data.recipes || [])
        const matched = viewedIds
          .map(id => allRecipes.find(r => r.id === id))
          .filter(Boolean)
        setRecentlyViewed(matched)
      }
    } catch (err) {
      console.error('Failed to load profile data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [user])

  const handleToggleFavorite = async recipeId => {
    const isFav = favoriteIds.includes(recipeId)
    if (isFav) {
      await api.delete(`/favorites/${recipeId}`)
      setFavorites(prev => prev.filter(r => r.id !== recipeId))
      setFavoriteIds(prev => prev.filter(id => id !== recipeId))
    } else {
      await api.post('/favorites', { recipe_id: recipeId })
      // refetch favorites to ensure full data structure
      const favRes = await api.get('/favorites')
      setFavorites(favRes.data.map(f => f.recipe))
      setFavoriteIds(favRes.data.map(f => f.recipe.id))
    }
  }

  const rate = rates[selectedCurrency] || 1
  const symbol = symbols[selectedCurrency] || '$'
  const convertPrice = usd => (usd * rate).toFixed(2)

  const displayFavorites = favorites.map(r => ({
    ...r,
    cost_per_serving: parseFloat(convertPrice(r.cost_per_serving)),
    total_cost: parseFloat(convertPrice(r.cost_per_serving * r.servings)),
  }))

  const displayRecentlyViewed = recentlyViewed.map(r => ({
    ...r,
    cost_per_serving: parseFloat(convertPrice(r.cost_per_serving)),
    total_cost: parseFloat(convertPrice(r.cost_per_serving * r.servings)),
  }))

  return (
    <div className="page-container user-profile-page">
      {/* Profile Header */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', padding: '2rem', marginBottom: '2.5rem', textAlign: 'left', borderRadius: '16px' }}>
        <div style={{ position: 'relative' }}>
          {user.profile_image_url && !imageError ? (
            <img 
              src={user.profile_image_url} 
              alt={user.name} 
              onError={() => setImageError(true)}
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--emerald)' }} 
            />
          ) : (
            <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--emerald), #059669)', color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(user.name && user.name[0]) ? user.name[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div style={{ flexGrow: 1 }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif", fontWeight: 'bold' }}>{user.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: '0 0 1rem 0' }}>{user.email}</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
            Role: {user.is_admin ? 'System Administrator' : 'User'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={() => setShowSubmitRecipeModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '0.5rem 1.25rem' }}>
            + Share My Recipe
          </button>
          <button className="btn-secondary" onClick={() => setShowSettings(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '0.5rem 1.25rem' }}>
            <Settings size={14} /> Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* User Stats Card */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Heart size={20} color="#f43f5e" fill="#f43f5e" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}><AnimatedNumber value={favorites.length} /></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Saved</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <Clock size={20} color="var(--emerald)" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}><AnimatedNumber value={recentlyViewed.length} /></div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Recent</div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <Calendar size={20} color="#3b82f6" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{symbol}{selectedCurrency}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Currency</div>
          </div>
        </div>

        {/* Daily Nutrition Tracker Card */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}>
              <Activity size={16} color="var(--emerald)" /> Daily Nutrition
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => {
                  if (isEditingTargets) {
                    handleSaveTargets()
                  } else {
                    setIsEditingTargets(true)
                  }
                }} 
                title={isEditingTargets ? 'Save Targets' : 'Edit Targets'} 
                style={{ color: isEditingTargets ? 'var(--emerald)' : '#9ca3af', padding: '2px', cursor: 'pointer' }}
              >
                {isEditingTargets ? <Save size={14} /> : <Edit3 size={14} />}
              </button>
              <button onClick={handleResetLog} title="Reset Logs" style={{ color: '#ef4444', padding: '2px', cursor: 'pointer' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {isEditingTargets ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Calories (kcal)</label>
                <input 
                  type="number" 
                  value={tempTargets.calories} 
                  onChange={e => setTempTargets({...tempTargets, calories: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Protein (g)</label>
                <input 
                  type="number" 
                  value={tempTargets.protein} 
                  onChange={e => setTempTargets({...tempTargets, protein: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Carbs (g)</label>
                <input 
                  type="number" 
                  value={tempTargets.carbs} 
                  onChange={e => setTempTargets({...tempTargets, carbs: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Fat (g)</label>
                <input 
                  type="number" 
                  value={tempTargets.fat} 
                  onChange={e => setTempTargets({...tempTargets, fat: parseInt(e.target.value) || 0})}
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <button 
                onClick={handleSaveTargets} 
                className="btn-primary" 
                style={{ gridColumn: 'span 2', padding: '6px', fontSize: '0.78rem', marginTop: '4px' }}
              >
                Save Targets
              </button>
            </div>
          ) : showQuickAdd ? (
            <form onSubmit={handleQuickAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Calories (kcal)</label>
                <input 
                  type="number" 
                  value={quickAdd.calories} 
                  onChange={e => setQuickAdd({...quickAdd, calories: e.target.value})}
                  placeholder="e.g. 350"
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Protein (g)</label>
                <input 
                  type="number" 
                  value={quickAdd.protein} 
                  onChange={e => setQuickAdd({...quickAdd, protein: e.target.value})}
                  placeholder="e.g. 20"
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Carbs (g)</label>
                <input 
                  type="number" 
                  value={quickAdd.carbs} 
                  onChange={e => setQuickAdd({...quickAdd, carbs: e.target.value})}
                  placeholder="e.g. 45"
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '2px' }}>Fat (g)</label>
                <input 
                  type="number" 
                  value={quickAdd.fat} 
                  onChange={e => setQuickAdd({...quickAdd, fat: e.target.value})}
                  placeholder="e.g. 10"
                  style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', outline: 'none' }}
                />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}>Add Intake</button>
                <button type="button" className="btn-secondary" onClick={() => setShowQuickAdd(false)} style={{ flex: 1, padding: '6px', fontSize: '0.78rem' }}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Progress: Calories */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  <span>Calories</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    <AnimatedNumber value={dailyLog.calories} /> / <AnimatedNumber value={targets.calories} /> kcal
                  </span>
                </div>
                <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #f59e0b, #ef4444)', 
                    height: '100%', 
                    width: '100%',
                    transform: `scaleX(${Math.min(1, targets.calories > 0 ? dailyLog.calories / targets.calories : 0)})`,
                    transformOrigin: 'left',
                    transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform'
                  }} />
                </div>
              </div>

              {/* Progress: Protein */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  <span>Protein</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    <AnimatedNumber value={dailyLog.protein} /> / <AnimatedNumber value={targets.protein} />g
                  </span>
                </div>
                <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #10b981, #059669)', 
                    height: '100%', 
                    width: '100%',
                    transform: `scaleX(${Math.min(1, targets.protein > 0 ? dailyLog.protein / targets.protein : 0)})`,
                    transformOrigin: 'left',
                    transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform'
                  }} />
                </div>
              </div>

              {/* Progress: Carbs */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  <span>Carbs</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    <AnimatedNumber value={dailyLog.carbs} /> / <AnimatedNumber value={targets.carbs} />g
                  </span>
                </div>
                <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #3b82f6, #2563eb)', 
                    height: '100%', 
                    width: '100%',
                    transform: `scaleX(${Math.min(1, targets.carbs > 0 ? dailyLog.carbs / targets.carbs : 0)})`,
                    transformOrigin: 'left',
                    transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform'
                  }} />
                </div>
              </div>

              {/* Progress: Fat */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  <span>Fat</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    <AnimatedNumber value={dailyLog.fat} /> / <AnimatedNumber value={targets.fat} />g
                  </span>
                </div>
                <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #ec4899, #db2777)', 
                    height: '100%', 
                    width: '100%',
                    transform: `scaleX(${Math.min(1, targets.fat > 0 ? dailyLog.fat / targets.fat : 0)})`,
                    transformOrigin: 'left',
                    transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform'
                  }} />
                </div>
              </div>

              <button 
                onClick={() => setShowQuickAdd(true)} 
                className="btn-secondary" 
                style={{ 
                  marginTop: '6px', 
                  padding: '6px', 
                  fontSize: '0.78rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px',
                  border: '1px dashed var(--border-color)'
                }}
              >
                <Plus size={12} /> Log Manual Nutrition
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      <div style={{ marginBottom: '3rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 1.5rem 0', fontFamily: "'Outfit', sans-serif", borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <Heart size={18} color="#ef4444" fill="#ef4444" /> My Favorites ({favorites.length})
        </h2>
        {loading ? (
          <div className="loading-spinner">Loading favorites...</div>
        ) : displayFavorites.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem' }}>
            <UtensilsCrossed size={36} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-secondary)', margin: '10px 0 0 0', fontSize: '0.9rem' }}>No favorited recipes yet. Start saving ones you like!</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {displayFavorites.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} symbol={symbol}
                isFavorited={favoriteIds.includes(recipe.id)}
                onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </div>

      {/* Recently Viewed Section */}
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 1.5rem 0', fontFamily: "'Outfit', sans-serif", borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <Clock size={18} color="var(--emerald)" /> Recently Viewed
        </h2>
        {displayRecentlyViewed.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem' }}>
            <Clock size={36} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-secondary)', margin: '10px 0 0 0', fontSize: '0.9rem' }}>You haven't viewed any recipe details recently.</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {displayRecentlyViewed.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} symbol={symbol}
                isFavorited={favoriteIds.includes(recipe.id)}
                onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </div>

      {showSettings && <ProfileModal onClose={() => { setShowSettings(false); fetchProfileData(); }} />}
      {showSubmitRecipeModal && <SubmitRecipeModal onClose={() => setShowSubmitRecipeModal(false)} />}
    </div>
  )
}
