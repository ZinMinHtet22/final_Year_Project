import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { useCurrency } from '../context/CurrencyContext'
import { Heart, Clock, Users, ShoppingCart, TrendingUp, Sparkles, Star } from 'lucide-react'

export default function RecipeCard({ recipe, isFavorited, onToggleFavorite, symbol = '$' }) {
  const [addedToList, setAddedToList] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { rates, selectedCurrency } = useCurrency()

  const rate = rates[selectedCurrency] || 1
  const decimals = rate >= 100 ? 0 : 2

  const lowThreshold = 1.50 * rate
  const highThreshold = 3.00 * rate
  const maxThreshold = 5.0 * rate

  const isLow = recipe.cost_per_serving <= lowThreshold
  const isMedium = recipe.cost_per_serving > lowThreshold && recipe.cost_per_serving <= highThreshold
  const meterText = isLow ? 'Low Cost' : isMedium ? 'Moderate' : 'Premium'
  const meterClass = isLow ? 'low' : isMedium ? 'medium' : 'high'

  const handleFavorite = async e => {
    e.stopPropagation()
    if (!user) return alert('Please sign in to save favorites!')
    onToggleFavorite(recipe.id)
  }

  const handleAddToList = async e => {
    e.stopPropagation()
    if (!user) return alert('Please sign in to use shopping list!')
    try {
      await api.post('/shopping-list/add-recipe', { recipe_id: recipe.id })
      setAddedToList(true)
      setTimeout(() => setAddedToList(false), 2000)
    } catch {}
  }

  const difficultyColor = { Easy: '#16a34a', Medium: '#ca8a04', Hard: '#dc2626', Expert: '#a855f7' }

  return (
    <div className="recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)}>
      <div className="card-image-wrap">
        <img src={recipe.image_url} alt={recipe.name} className="card-image"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' }} />
        <div className="card-badges">
          {recipe.is_student_pick && (
            <span className="badge badge-curated" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} /> Master Selection
            </span>
          )}
          <span className="badge badge-cuisine">{recipe.cuisine}</span>
        </div>
        {onToggleFavorite && (
          <button className={`btn-heart ${isFavorited ? 'hearted' : ''}`} onClick={handleFavorite}>
            <Heart size={16} fill={isFavorited ? '#ef4444' : 'none'} color={isFavorited ? '#ef4444' : '#fff'} />
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="difficulty" style={{ color: difficultyColor[recipe.difficulty] }}>
            ● {recipe.difficulty}
          </span>
          {recipe.average_rating > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.8rem', color: '#eab308', fontWeight: 'bold' }}>
              <Star size={12} fill="#eab308" color="#eab308" /> {recipe.average_rating}
            </span>
          )}
          <span className="cost-badge">{symbol}{recipe.cost_per_serving.toFixed(decimals)}/serving</span>
        </div>

        <h3 className="card-title">{recipe.name}</h3>
        <p className="card-desc">{recipe.description}</p>

        {/* Creative Budget Match Meter */}
        <div className="budget-meter-wrap">
          <div className="budget-meter-label">
            <span>Budget Match</span>
            <span className={`budget-meter-text ${meterClass}`}>
              {meterText}
            </span>
          </div>
          <div className="budget-meter-bar">
            <div 
              className={`budget-meter-fill ${meterClass}`} 
              style={{ width: `${Math.min((recipe.cost_per_serving / maxThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="card-stats">
          <span className="stat-item"><Clock size={13} /> {recipe.cook_time} min</span>
          <span className="stat-item"><Users size={13} /> {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span>
          <span className="total-cost"><TrendingUp size={13} /> {symbol}{recipe.total_cost.toFixed(decimals)}</span>
        </div>

        {/* Missing Ingredients / Pantry Cost Matching Detection */}
        {user && recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && recipe.pantry_empty && (
          <div className="missing-ingredients-bar" style={{ marginBottom: '14px', padding: '6px 10px', background: 'rgba(197, 168, 128, 0.06)', borderRadius: '6px', border: '1px solid rgba(197, 168, 128, 0.2)', fontSize: '0.78rem', textAlign: 'left' }}>
            <div style={{ color: '#c5a880', fontWeight: 'bold', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pantry Empty — {recipe.missing_count} item{recipe.missing_count > 1 ? 's' : ''} needed</span>
              <span style={{ color: '#c5a880' }}>Est: {symbol}{(recipe.estimated_shopping_cost * rate).toFixed(decimals)}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {recipe.missing_ingredients.map(ing => ing.name).join(', ')}
            </div>
          </div>
        )}
        {user && recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && !recipe.pantry_empty && (
          <div className="missing-ingredients-bar" style={{ marginBottom: '14px', padding: '6px 10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '0.78rem', textAlign: 'left' }}>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Pantry Missing: {recipe.missing_count} item{recipe.missing_count > 1 ? 's' : ''}</span>
              <span style={{ color: '#c5a880' }}>Est: {symbol}{(recipe.estimated_shopping_cost * rate).toFixed(decimals)}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {recipe.missing_ingredients.map(ing => ing.name).join(', ')}
            </div>
          </div>
        )}
        {user && recipe.missing_count === 0 && (
          <div className="missing-ingredients-bar" style={{ marginBottom: '14px', padding: '6px 10px', background: 'rgba(22, 163, 74, 0.08)', borderRadius: '6px', border: '1px solid rgba(22, 163, 74, 0.15)', fontSize: '0.78rem', color: '#16a34a', fontWeight: 'bold', textAlign: 'left' }}>
            ✓ Ready to cook! (All pantry ingredients match)
          </div>
        )}
        {!user && recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
          <div className="missing-ingredients-bar" style={{ marginBottom: '14px', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.78rem', textAlign: 'left' }}>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Recipe Ingredients</span>
              <span style={{ color: '#c5a880' }}>Est. Cost: {symbol}{(recipe.estimated_shopping_cost * rate).toFixed(decimals)}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {recipe.missing_ingredients.map(ing => ing.name).join(', ')}
            </div>
          </div>
        )}

        <div className="card-tags">
          {recipe.dietary_tags?.slice(0, 3).map(tag => (
            <span key={tag.name} className="diet-tag"
              style={{ background: tag.color + '22', color: tag.color, borderColor: tag.color + '44' }}>
              {tag.name}
            </span>
          ))}
          {recipe.dietary_tags?.length > 3 && (
            <span className="diet-tag">+{recipe.dietary_tags.length - 3}</span>
          )}
        </div>

        <div className="card-actions">
          <button className="btn-breakdown" onClick={e => { e.stopPropagation(); navigate(`/recipe/${recipe.id}`); }}>
            View Details →
          </button>
          <button className={`btn-add-list ${addedToList ? 'added' : ''}`} onClick={handleAddToList}>
            <ShoppingCart size={13} /> {addedToList ? 'Added!' : 'List'}
          </button>
        </div>
      </div>
    </div>
  )
}
