import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useCurrency } from '../context/CurrencyContext'
import RecipeCard from '../components/RecipeCard'
import { Coins, Calendar, Trash2, Plus, ArrowRight, Sparkles } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['Breakfast', 'Lunch', 'Dinner']

export default function BudgetPlannerPage() {
  const { rates, symbols, selectedCurrency, convertPrice } = useCurrency()
  const [recipes, setRecipes] = useState([])
  const [activeTab, setActiveTab] = useState('planner') // 'planner' or 'calculator'
  const [activeDay, setActiveDay] = useState('Monday')

  // Calculator State
  const [maxBudgetInput, setMaxBudgetInput] = useState(5)
  const [filteredRecipes, setFilteredRecipes] = useState([])

  // Weekly Planner State (persisted in localStorage)
  const [planner, setPlanner] = useState(() => {
    const saved = localStorage.getItem('student_meal_planner')
    if (saved) {
      try { return JSON.parse(saved) } catch {}
    }
    const defaultPlanner = {}
    DAYS.forEach(day => {
      defaultPlanner[day] = { Breakfast: '', Lunch: '', Dinner: '' }
    })
    return defaultPlanner
  })

  useEffect(() => {
    localStorage.setItem('student_meal_planner', JSON.stringify(planner))
  }, [planner])

  const fetchRecipes = async () => {
    try {
      const res = await api.get('/recipes')
      setRecipes(Array.isArray(res.data) ? res.data : (res.data.recipes || []))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  const rate = rates[selectedCurrency] || 1
  const symbol = symbols[selectedCurrency] || '$'

  // Filter calculator recipes based on selected budget
  useEffect(() => {
    if (recipes.length === 0) return
    const filtered = recipes.filter(r => {
      return parseFloat(r.cost_per_serving) <= parseFloat(maxBudgetInput)
    })
    setFilteredRecipes(filtered)
  }, [recipes, maxBudgetInput])

  // Planner changes
  const handleMealChange = (day, meal, recipeId) => {
    setPlanner(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: recipeId
      }
    }))
  }

  const handleClearMeal = (day, meal) => {
    handleMealChange(day, meal, '')
  }

  const handleClearWeek = () => {
    if (!window.confirm('Are you sure you want to clear the entire weekly planner?')) return
    const cleared = {}
    DAYS.forEach(day => {
      cleared[day] = { Breakfast: '', Lunch: '', Dinner: '' }
    })
    setPlanner(cleared)
  }

  // Calculate costs helper
  const getRecipeCost = useCallback((recipeId) => {
    const recipe = recipes.find(r => r.id === parseInt(recipeId))
    return recipe ? parseFloat(convertPrice(recipe.cost_per_serving)) : 0
  }, [recipes, convertPrice])

  const getRecipeName = (recipeId) => {
    const recipe = recipes.find(r => r.id === parseInt(recipeId))
    return recipe ? recipe.name : ''
  }

  // Calculate day total
  const getDayTotal = (day) => {
    let sum = 0
    MEALS.forEach(meal => {
      const recipeId = planner[day]?.[meal]
      if (recipeId) {
        sum += getRecipeCost(recipeId)
      }
    })
    return sum
  }

  // Calculate weekly total
  const getWeeklyTotal = () => {
    let sum = 0
    DAYS.forEach(day => {
      sum += getDayTotal(day)
    })
    return sum
  }

  // Map currency values for cards
  const displayFilteredRecipes = filteredRecipes.map(r => ({
    ...r,
    cost_per_serving: parseFloat(convertPrice(r.cost_per_serving)),
    total_cost: parseFloat(convertPrice(r.cost_per_serving * r.servings)),
  }))

  return (
    <div className="page-container budget-planner-page">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <Calendar size={24} color="#10b981" />
        <h1 className="page-title">Budget & Planner</h1>
        <p className="page-subtitle">Track your weekly food costs and calculate budgets dynamically</p>
      </div>

      {/* Tabs */}
      <div className="expert-tabs-row">
        <button className={`expert-tab-button ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>
          <Calendar size={16} /> Weekly Meal Planner
        </button>
        <button className={`expert-tab-button ${activeTab === 'calculator' ? 'active' : ''}`} onClick={() => setActiveTab('calculator')}>
          <Coins size={16} /> Budget Calculator
        </button>
      </div>

      {activeTab === 'planner' && (
        <div style={{ textAlign: 'left' }}>
          {/* Summary Row */}
          <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '2rem', gap: '1rem', borderRadius: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Weekly Cost</span>
              <div style={{ fontSize: '2.2rem', color: 'var(--emerald)', fontWeight: '800', fontFamily: "'Outfit', sans-serif", textShadow: '0 0 15px var(--emerald-glow)' }}>
                {symbol}{getWeeklyTotal().toFixed(2)}
              </div>
            </div>
            <button className="btn-secondary" style={{ width: 'auto', padding: '0.6rem 1.6rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={handleClearWeek}>
              <Trash2 size={15} /> Clear Week Plan
            </button>
          </div>

          {/* Day Navigation Bar */}
          <div className="planner-days-nav-container" style={{ position: 'relative', marginBottom: '2.5rem' }}>
            <div className="planner-days-nav" style={{
              position: 'relative',
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '30px',
              padding: '6px',
              overflow: 'hidden',
              width: '100%',
              justifyContent: 'space-between',
              gap: '4px',
              zIndex: 1
            }}>
              {/* Sliding gold focus mask */}
              <div 
                className="sliding-gold-mask"
                style={{
                  position: 'absolute',
                  top: '6px',
                  bottom: '6px',
                  left: `calc((${DAYS.indexOf(activeDay)} * (100% - 12px) / 7) + 6px)`,
                  width: 'calc((100% - 12px) / 7)',
                  background: 'var(--emerald)',
                  borderRadius: '24px',
                  transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 0,
                  boxShadow: '0 4px 15px var(--emerald-glow)'
                }}
              />
              
              {DAYS.map(day => {
                const isSelected = activeDay === day
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: isSelected ? '#000000' : 'var(--text-secondary)',
                      padding: '14px 0',
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      borderRadius: '24px',
                      transition: 'color 300ms ease',
                      fontFamily: "'Outfit', sans-serif"
                    }}
                  >
                    <span className="day-name-desktop">{day}</span>
                    <span className="day-name-mobile" style={{ display: 'none' }}>{day.substring(0, 3)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Day Curated Blueprint Sheet */}
          <div 
            key={activeDay} 
            className="glass-card day-planner-panel" 
            style={{ 
              padding: '2.5rem', 
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
                {activeDay}'s Curated Blueprint
              </h3>
              <span style={{ fontSize: '1.25rem', color: 'var(--emerald)', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
                Est. Total: {symbol}{getDayTotal(activeDay).toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {MEALS.map(meal => {
                const recipeId = planner[activeDay]?.[meal]
                const mealCost = recipeId ? getRecipeCost(recipeId) : 0
                const recipe = recipes.find(r => r.id === parseInt(recipeId))

                return (
                  <div key={meal} style={{ 
                    background: 'var(--bg-neutral)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.08em' }}>{meal}</span>
                    
                    {recipeId ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4' }}>
                            {getRecipeName(recipeId)}
                          </div>
                          <span style={{ fontSize: '0.9rem', color: 'var(--emerald)', fontWeight: '700' }}>{symbol}{mealCost.toFixed(2)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                          {recipe && (
                            <Link to={`/recipe/${recipe.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none' }}>
                              View Blueprint <ArrowRight size={14} />
                            </Link>
                          )}
                          <button 
                            onClick={() => handleClearMeal(activeDay, meal)} 
                            style={{ background: 'rgba(239, 68, 68, 0.08)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                            title="Clear meal"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', flexGrow: 1, minHeight: '80px' }}>
                        <select
                          className="expert-select"
                          style={{ height: '42px', fontSize: '0.825rem', padding: '6px 28px 6px 12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', width: '100%', borderRadius: '8px' }}
                          value=""
                          onChange={e => handleMealChange(activeDay, meal, e.target.value)}
                        >
                          <option value="">+ Assign Blueprint...</option>
                          {recipes.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({symbol}{parseFloat(convertPrice(r.cost_per_serving)).toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div>
          {/* Slider Row */}
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'left', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Budget Calculator</h3>
              <span style={{ fontSize: '1.6rem', color: 'var(--emerald)', fontWeight: '800', fontFamily: "'Outfit', sans-serif", textShadow: '0 0 10px var(--emerald-glow)' }}>
                {symbol}{(maxBudgetInput * rate).toFixed(rate >= 100 ? 0 : 2)}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: 0 }}>
              Adjust the slider to instantly suggest recipes that cost less than this amount per serving.
            </p>
            <div className="expert-slider-wrap">
              <input 
                type="range" 
                className="expert-slider" 
                min="1" 
                max="6" 
                step="0.1"
                value={maxBudgetInput} 
                onChange={e => setMaxBudgetInput(parseFloat(e.target.value))} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '10px', fontWeight: '700' }}>
              <span>{symbol}{(1 * rate).toFixed(rate >= 100 ? 0 : 2)}</span>
              <span>{symbol}{(3.5 * rate).toFixed(rate >= 100 ? 0 : 2)}</span>
              <span>{symbol}{(6 * rate).toFixed(rate >= 100 ? 0 : 2)}</span>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 1.5rem 0', fontFamily: "'Outfit', sans-serif", borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '10px', width: '100%' }}>
              <Coins size={18} color="var(--emerald)" /> Recipes Under {symbol}{(maxBudgetInput * rate).toFixed(rate >= 100 ? 0 : 2)} ({displayFilteredRecipes.length})
            </h2>

            {displayFilteredRecipes.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Coins size={44} color="var(--text-muted)" />
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>No recipes found under this budget limit. Try increasing the slider.</p>
              </div>
            ) : (
              <div className="recipes-grid">
                {displayFilteredRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} symbol={symbol} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
