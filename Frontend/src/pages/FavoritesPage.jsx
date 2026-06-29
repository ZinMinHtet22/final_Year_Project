import { useState, useEffect } from 'react'
import api from '../api/client'
import RecipeCard from '../components/RecipeCard'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { Heart } from 'lucide-react'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [favoriteIds, setFavoriteIds] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { rates, symbols, selectedCurrency } = useCurrency()

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get('/favorites').then(res => {
      setFavorites(res.data.map(f => f.recipe))
      setFavoriteIds(res.data.map(f => f.recipe.id))
    }).finally(() => setLoading(false))
  }, [user])

  const handleToggle = async recipeId => {
    await api.delete(`/favorites/${recipeId}`)
    setFavorites(prev => prev.filter(r => r.id !== recipeId))
    setFavoriteIds(prev => prev.filter(id => id !== recipeId))
  }

  const rate = rates[selectedCurrency] || 1
  const symbol = symbols[selectedCurrency] || '$'
  const convertPrice = usd => (usd * rate).toFixed(2)

  const displayFavorites = favorites.map(r => ({
    ...r,
    cost_per_serving: parseFloat(convertPrice(r.cost_per_serving)),
    total_cost: parseFloat(convertPrice(r.cost_per_serving * r.servings)),
  }))

  if (!user) return (
    <div className="page-container">
      <div className="empty-state">
        <Heart size={48} color="#d1d5db" />
        <h3>Sign in to see your favorites</h3>
        <p>Create an account to save recipes you love</p>
      </div>
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <Heart size={24} color="#ef4444" fill="#ef4444" />
        <h1 className="page-title">My Favorites</h1>
        <p className="page-subtitle">{favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}</p>
      </div>
      {loading ? (
        <div className="loading-grid">{[...Array(3)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
      ) : favorites.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} color="#d1d5db" />
          <h3>No favorites yet</h3>
          <p>Browse recipes and tap the heart to save your favorites</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {displayFavorites.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} symbol={symbol}
              isFavorited={favoriteIds.includes(recipe.id)}
              onToggleFavorite={handleToggle} />
          ))}
        </div>
      )}
    </div>
  )
}
