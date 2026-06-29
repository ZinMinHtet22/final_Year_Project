import { useState, useEffect } from 'react'
import { Coins, Clock, Users, MapPin, ChefHat } from 'lucide-react'
import api from '../api/client'
import { useCurrency } from '../context/CurrencyContext'

export default function CostBreakdownModal({ recipeId, recipeName, onClose }) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const { convertPrice, symbols, selectedCurrency } = useCurrency()

  useEffect(() => {
    api.get(`/recipes/${recipeId}`).then(res => setRecipe(res.data)).finally(() => setLoading(false))
  }, [recipeId])

  const symbol = symbols[selectedCurrency] || '$'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box breakdown-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Coins size={20} color="var(--emerald)" /> Cost Breakdown
        </h2>
        <p className="modal-subtitle">{recipeName}</p>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : recipe ? (
          <>
            <div className="breakdown-image">
              <img src={recipe.image_url} alt={recipe.name}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' }} />
            </div>

            <div className="breakdown-stats">
              <div className="stat-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {recipe.cook_time} min
              </div>
              <div className="stat-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} /> {recipe.servings} servings
              </div>
              <div className="stat-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} /> {recipe.cuisine}
              </div>
              <div className="stat-chip" style={{ color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ChefHat size={13} color="var(--emerald)" /> {recipe.difficulty}
              </div>
            </div>

            <div className="breakdown-table">
              <div className="breakdown-header">
                <span>Ingredient</span>
                <span>Quantity</span>
                <span>Cost</span>
              </div>
              {recipe.cost_breakdown?.map((item, i) => (
                <div key={i} className="breakdown-row">
                  <span>{item.name}</span>
                  <span>{item.quantity} {item.unit}</span>
                  <span className="item-cost">{symbol}{convertPrice(item.cost)}</span>
                </div>
              ))}
            </div>

            <div className="breakdown-totals">
              <div className="total-row">
                <span>Total Cost</span>
                <span className="total-val">{symbol}{convertPrice(recipe.total_cost)}</span>
              </div>
              <div className="total-row highlight">
                <span>Per Serving</span>
                <span className="total-val green">{symbol}{convertPrice(recipe.cost_per_serving)}</span>
              </div>
            </div>

            {/* Cooking Steps Timeline */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="recipe-steps-section" style={{ marginTop: '2rem' }}>
                <h3 className="steps-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', width: '100%' }}>
                  Cooking Instructions
                </h3>
                <div className="steps-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.5rem' }}>
                  {recipe.instructions.map((step, idx) => (
                    <div key={idx} className="step-item" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="step-badge-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span className="step-number" style={{ background: 'linear-gradient(135deg, var(--emerald), var(--emerald-hover))', color: '#fff', borderRadius: '9999px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          {idx + 1}
                        </span>
                        {idx < recipe.instructions.length - 1 && (
                          <div className="step-line" style={{ flexGrow: 1, width: '2px', backgroundColor: 'var(--border-color)', marginTop: '0.5rem', marginBottom: '0.25rem' }} />
                        )}
                      </div>
                      <div className="step-content-col" style={{ flexGrow: 1, paddingBottom: '0.25rem' }}>
                        <p className="step-text" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.5', textAlign: 'left' }}>
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : <p>Recipe not found.</p>}
      </div>
    </div>
  )
}
