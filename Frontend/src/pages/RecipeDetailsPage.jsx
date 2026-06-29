import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import {
  Coins,
  Clock,
  Users,
  MapPin,
  ChefHat,
  Share2,
  Calendar,
  Star,
  Send,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Check
} from 'lucide-react'

export default function RecipeDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { convertPrice, symbols, selectedCurrency } = useCurrency()
  const [recipe, setRecipe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [reviewError, setReviewError] = useState('')

  // Cooking Timer States
  const [timerSeconds, setTimerSeconds] = useState(300) // default 5 mins
  const [timerInputMinutes, setTimerInputMinutes] = useState(5)
  const [timerActive, setTimerActive] = useState(false)
  const [trackStatus, setTrackStatus] = useState('')
  const [cookStatus, setCookStatus] = useState('')
  const [cookLoading, setCookLoading] = useState(false)

  const handleMarkCooked = async () => {
    if (!user) return alert('Please sign in to log cooked recipes!')
    setCookLoading(true)
    try {
      await api.post('/cooked-recipes', { recipe_id: recipe.id })
      setCookStatus('Marked as Cooked!')
      setTimeout(() => setCookStatus(''), 2000)
      
      // Mirror to daily local tracker as well
      handleTrackNutrition()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to log cooked recipe.')
    } finally {
      setCookLoading(false)
    }
  }

  const handleTrackNutrition = () => {
    if (!recipe || !recipe.nutrition) return
    const today = new Date()
    const offset = today.getTimezoneOffset()
    const localDate = new Date(today.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0]
    const key = `nutrition_log_${localDate}`
    const existingLog = JSON.parse(localStorage.getItem(key) || '{"calories":0,"protein":0,"carbs":0,"fat":0}')
    
    const newLog = {
      calories: existingLog.calories + (recipe.nutrition.calories || 0),
      protein: existingLog.protein + (recipe.nutrition.protein || 0),
      carbs: existingLog.carbs + (recipe.nutrition.carbs || 0),
      fat: existingLog.fat + (recipe.nutrition.fat || 0)
    }
    localStorage.setItem(key, JSON.stringify(newLog))

    const loggedDates = JSON.parse(localStorage.getItem('nutrition_logged_dates') || '[]')
    if (!loggedDates.includes(localDate)) {
      loggedDates.push(localDate)
      localStorage.setItem('nutrition_logged_dates', JSON.stringify(loggedDates))
    }

    setTrackStatus('Added to tracker!')
    setTimeout(() => setTrackStatus(''), 2000)
  }

  // Track Recently Viewed
  useEffect(() => {
    if (recipe) {
      const viewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]')
      const updated = [recipe.id, ...viewed.filter(vid => vid !== recipe.id)].slice(0, 5)
      localStorage.setItem('recently_viewed', JSON.stringify(updated))
    }
  }, [recipe])

  useEffect(() => {
    setTimerSeconds(timerInputMinutes * 60)
  }, [timerInputMinutes])

  useEffect(() => {
    let interval = null
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      setTimerActive(false)
    }
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds])

  const fetchRecipe = async () => {
    try {
      const res = await api.get(`/recipes/${id}`)
      setRecipe(res.data)
      setTimerInputMinutes(res.data.cook_time || 15)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/recipes/${id}/reviews`)
      setReviews(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchRecipe(), fetchReviews()]).finally(() => setLoading(false))
  }, [id])

  const handleAddReview = async e => {
    e.preventDefault()
    if (!comment.trim()) return
    setReviewError('')
    setReviewSuccess('')

    try {
      const res = await api.post(`/recipes/${id}/reviews`, { rating, comment })
      setReviewSuccess('Thank you for rating this recipe!')
      setComment('')
      setRating(5)
      fetchReviews()
      fetchRecipe() // Update average rating
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.')
    }
  }

  const formatTimerTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const text = `Check out this budget recipe: ${recipe.name}`
    
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
    } else {
      navigator.clipboard.writeText(url)
      alert('Recipe URL copied to clipboard!')
    }
  }

  if (loading) return <div className="loading-spinner">Loading recipe details...</div>
  if (!recipe) return <div className="page-container"><p>Recipe not found.</p><Link to="/" className="btn-secondary"><ArrowLeft size={14} /> Back to recipes</Link></div>

  const symbol = symbols[selectedCurrency] || '$'

  return (
    <div className="page-container recipe-details-page">
      <Link to="/" className="btn-secondary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', width: 'auto' }}>
        <ArrowLeft size={14} /> Back to recipes
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left Side - Image and Metadata */}
        <div>
          <div className="breakdown-image" style={{ height: '340px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '1.5rem', position: 'relative' }}>
            <img src={recipe.image_url} alt={recipe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' }} />
            {recipe.is_student_pick && (
              <span className="badge badge-curated" style={{ position: 'absolute', top: '12px', left: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} /> Master Selection
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div className="stat-chip">
              <Clock size={14} /> {recipe.cook_time} min
            </div>
            <div className="stat-chip">
              <Users size={14} /> {recipe.servings} servings
            </div>
            <div className="stat-chip">
              <MapPin size={14} /> {recipe.cuisine}
            </div>
            <div className="stat-chip">
              <ChefHat size={14} /> {recipe.difficulty}
            </div>
          </div>

          {/* Social Sharing */}
          <div className="share-panel">
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Share recipe:</span>
            <button className="btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleShare('whatsapp')}>WhatsApp</button>
            <button className="btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleShare('telegram')}>Telegram</button>
            <button className="btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleShare('link')}><Share2 size={12} /> Copy Link</button>
          </div>
        </div>

        {/* Right Side - Cost Breakdown Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif", fontWeight: 'bold' }}>{recipe.name}</h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#eab308' }}>
                  <Star size={16} fill="#eab308" color="#eab308" />
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{recipe.average_rating || 0}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>({recipe.reviews_count || 0} ratings)</span>
                </div>
              </div>
              <span className="cost-badge" style={{ fontSize: '0.95rem', padding: '6px 14px' }}>{symbol}{convertPrice(recipe.cost_per_serving)}/serving</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '1rem', textAlign: 'left' }}>{recipe.description}</p>
          </div>

          <div className="breakdown-table glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              <Coins size={16} color="var(--emerald)" /> Cost Breakdown
            </h3>
            <div className="breakdown-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>Ingredient</span>
              <span>Quantity</span>
              <span>Cost</span>
            </div>
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {recipe.cost_breakdown?.map((item, i) => (
                <div key={i} className="breakdown-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <span>{item.name}</span>
                  <span>{item.quantity} {item.unit}</span>
                  <span className="item-cost">{symbol}{convertPrice(item.cost)}</span>
                </div>
              ))}
            </div>
            <div className="breakdown-totals" style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.75rem' }}>
              <div className="total-row">
                <span>Total Cost</span>
                <span className="total-val">{symbol}{convertPrice(recipe.total_cost)}</span>
              </div>
              <div className="total-row highlight">
                <span>Per Serving</span>
                <span className="total-val green">{symbol}{convertPrice(recipe.cost_per_serving)}</span>
              </div>
            </div>
          </div>

          {recipe.nutrition && (
            <div className="nutrition-card glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
                <Sparkles size={16} color="var(--emerald)" /> Nutritional Facts
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Calories */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Calories</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{recipe.nutrition.calories} kcal</span>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)', height: '100%', width: `${Math.min(100, (recipe.nutrition.calories / 800) * 100)}%` }} />
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Protein</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{recipe.nutrition.protein}g</span>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #10b981, #059669)', height: '100%', width: `${Math.min(100, (recipe.nutrition.protein / 50) * 100)}%` }} />
                  </div>
                </div>

                {/* Carbs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Carbs</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{recipe.nutrition.carbs}g</span>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #3b82f6, #2563eb)', height: '100%', width: `${Math.min(100, (recipe.nutrition.carbs / 100) * 100)}%` }} />
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Fat</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{recipe.nutrition.fat}g</span>
                  </div>
                  <div style={{ background: 'var(--border-color)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #ec4899, #db2777)', height: '100%', width: `${Math.min(100, (recipe.nutrition.fat / 40) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleTrackNutrition}
                className="btn-primary"
                style={{
                  marginTop: '1.25rem',
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '0.88rem'
                }}
              >
                {trackStatus ? (
                  <>
                    <Check size={14} /> {trackStatus}
                  </>
                ) : (
                  <>
                    + Track to Daily Intake
                  </>
                )}
              </button>

              <button 
                onClick={handleMarkCooked}
                disabled={cookLoading}
                className="btn-primary"
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '0.88rem',
                  background: 'linear-gradient(135deg, #c5a880 0%, #a88a5f 100%)',
                  color: '#121215',
                  border: 'none'
                }}
              >
                {cookStatus ? (
                  <>
                    <Check size={14} /> {cookStatus}
                  </>
                ) : (
                  <>
                    ✓ Mark as Cooked
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Steps & Countdown Timer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Cooking Steps Timeline */}
        <div className="recipe-steps-section glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="steps-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', width: '100%' }}>
            Cooking Instructions
          </h3>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <div className="steps-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="step-item" style={{ display: 'flex', gap: '1rem' }}>
                  <div className="step-badge-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span className="step-number" style={{ background: 'linear-gradient(135deg, var(--emerald), var(--emerald-hover))', color: '#fff', borderRadius: '9999px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {idx + 1}
                    </span>
                    {idx < recipe.instructions.length - 1 && (
                      <div className="step-line" style={{ flexGrow: 1, width: '2px', backgroundColor: 'var(--border-color)', marginTop: '0.5rem' }} />
                    )}
                  </div>
                  <div className="step-content-col" style={{ flexGrow: 1, paddingBottom: '0.25rem' }}>
                    <p className="step-text" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', textAlign: 'left' }}>
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No steps specified for this recipe.</p>
          )}
        </div>

        {/* Cooking Timer Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Custom Countdown Timer Widget */}
          <div className="glass-card" style={{ border: '1px solid var(--border-color)', padding: '2rem', textAlign: 'center', borderRadius: '16px' }}>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 1.5rem 0' }}>
              <Clock size={18} color="var(--emerald)" /> Cooking Timer
            </h3>
            
            <div style={{ fontSize: '3.5rem', fontWeight: '800', fontFamily: 'monospace', color: timerSeconds > 0 ? 'var(--emerald)' : '#ef4444', marginBottom: '1.5rem', textShadow: timerActive ? '0 0 10px var(--emerald-glow)' : 'none' }}>
              {formatTimerTime(timerSeconds)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <button 
                className="btn-primary" 
                onClick={() => setTimerActive(a => !a)}
                style={{ width: 'auto', padding: '0.5rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {timerActive ? <Pause size={14} /> : <Play size={14} />} {timerActive ? 'Pause' : 'Start'}
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => { setTimerActive(false); setTimerSeconds(timerInputMinutes * 60) }}
                style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Configure Timer:</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number"
                  className="admin-input"
                  style={{ width: '80px', textAlign: 'center', height: '36px', padding: '0 8px' }}
                  value={timerInputMinutes}
                  onChange={e => setTimerInputMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings & Comments Block */}
      <div style={{ background: 'var(--bg-neutral)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', textAlign: 'left' }}>
        <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', width: '100%', marginBottom: '1.5rem' }}>
          <MessageSquare size={18} color="var(--emerald)" /> Ratings & Reviews
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Write a Review */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', fontSize: '1.05rem' }}>Write a Review</h4>
            {user ? (
              <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviewSuccess && <div style={{ color: 'var(--emerald)', background: 'var(--emerald-light)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{reviewSuccess}</div>}
                {reviewError && <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{reviewError}</div>}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(val => (
                      <button 
                        key={val} 
                        type="button" 
                        onClick={() => setRating(val)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star size={24} fill={val <= rating ? '#eab308' : 'none'} color={val <= rating ? '#eab308' : '#4b5563'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Your Comment</label>
                  <textarea 
                    className="modal-input"
                    placeholder="Write your cooking experience or comments here..."
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: 'auto', alignSelf: 'flex-start', padding: '0.5rem 1.5rem' }}>
                  <Send size={12} /> Submit Review
                </button>
              </form>
            ) : (
              <div style={{ padding: '1.5rem', background: 'var(--bg-neutral)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>Please sign in to write a recipe review.</p>
                <Link to="/login" className="btn-primary" style={{ display: 'inline-block', width: 'auto', padding: '0.5rem 2rem', textDecoration: 'none' }}>Sign In</Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', fontSize: '1.05rem' }}>User Reviews ({reviews.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
              {reviews.map(rev => (
                <div key={rev.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{rev.user.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < rev.rating ? '#eab308' : 'none'} color={i < rev.rating ? '#eab308' : '#4b5563'} />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 4px 0', lineHeight: '1.4' }}>{rev.comment}</p>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
              ))}
              {reviews.length === 0 && (
                <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', margin: '2rem 0' }}>No reviews yet. Be the first to rate this recipe!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
