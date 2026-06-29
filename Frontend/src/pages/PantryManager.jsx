import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { Plus, Trash2, Loader, Apple, ClipboardList, Sparkles } from 'lucide-react'

export default function PantryManager() {
  const { user } = useAuth()
  const { selectedCurrency } = useCurrency()
  const [pantryItems, setPantryItems] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [quantity, setQuantity] = useState('100')
  const [unit, setUnit] = useState('g')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch user pantry items and master list of ingredients
  useEffect(() => {
    fetchPantry()
    fetchMasterIngredients()
  }, [])

  const fetchPantry = async () => {
    setLoading(true)
    try {
      const res = await api.get('/pantry')
      setPantryItems(res.data)
    } catch (err) {
      console.error('Failed to load pantry items:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMasterIngredients = async () => {
    try {
      const res = await api.get('/ingredients')
      setIngredients(res.data)
    } catch (err) {
      console.error('Failed to load ingredients:', err)
    }
  }

  // Autocomplete filtering
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim().length > 0) {
      const filtered = ingredients.filter(i =>
        i.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const selectIngredient = (ing) => {
    setSearchQuery(ing.name)
    setUnit(ing.unit || 'g')
    setSuggestions([])
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setActionLoading(true)
    try {
      const res = await api.post('/pantry', {
        ingredient_name: searchQuery,
        quantity: parseFloat(quantity)
      })
      
      // Update local state smoothly
      const updatedItem = res.data
      setPantryItems(prev => {
        const exists = prev.find(item => item.ingredient_name.toLowerCase() === updatedItem.ingredient_name.toLowerCase())
        if (exists) {
          return prev.map(item => item.id === exists.id ? updatedItem : item)
        }
        return [...prev, updatedItem].sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name))
      })

      // Reset form
      setSearchQuery('')
      setQuantity('100')
      setUnit('g')
    } catch (err) {
      console.error('Failed to add pantry item:', err)
      alert('Could not add item to pantry.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveItem = async (id) => {
    try {
      await api.delete(`/pantry/${id}`)
      setPantryItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Failed to remove pantry item:', err)
      alert('Could not remove item from pantry.')
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Premium Luxury Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="pantry-page-title" style={{ 
          fontSize: '2.5rem', 
          color: 'var(--text-primary)', 
          fontFamily: "'Outfit', sans-serif", 
          fontWeight: 'bold', 
          margin: 0,
          background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--emerald) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Apple size={32} color="var(--emerald)" /> Smart Pantry Curator
        </h1>
        <p className="pantry-page-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '8px', letterSpacing: '0.02em' }}>
          Curate your home inventory. Recipes will dynamically calculate shopping costs based on what you already own.
        </p>
      </div>

      {/* Responsive grid: stacks on mobile via CSS class */}
      <div className="pantry-grid">
        {/* Left Side: Curation Form */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-lg)',
          alignSelf: 'start'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--emerald)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <Plus size={18} /> Add Ingredient
          </h2>

          <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Ingredient Input with Autocomplete */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '6px' }}>
                Ingredient Name
              </label>
              <input
                type="text"
                placeholder="Type e.g., Chicken Breast, Olive Oil..."
                value={searchQuery}
                onChange={handleSearchChange}
                required
                className="form-control"
                style={{ 
                  width: '100%', 
                  background: 'var(--bg-neutral)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
              
              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0 0 8px 8px',
                  zIndex: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  overflow: 'hidden'
                }}>
                  {suggestions.map(ing => (
                    <div 
                      key={ing.id}
                      onClick={() => selectIngredient(ing)}
                      className="autocomplete-item"
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        fontSize: '0.88rem',
                        transition: 'all 0.15s ease',
                        borderBottom: '1px solid var(--border-color)'
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>{ing.name}</strong> <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>({ing.unit})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity Input */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', marginBottom: '6px' }}>
                  Quantity
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="form-control"
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-neutral)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{
                background: 'var(--bg-neutral)',
                border: '1px solid var(--border-color)',
                color: 'var(--emerald)',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 'bold',
                minWidth: '50px',
                textAlign: 'center',
                fontSize: '0.9rem'
              }}>
                {unit}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={actionLoading}
              className="btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                border: 'none',
                background: 'linear-gradient(135deg, var(--emerald) 0%, var(--emerald-hover) 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              {actionLoading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              Add to Pantry
            </button>
          </form>
        </div>

        {/* Right Side: Pantry List */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '340px'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            <ClipboardList size={18} color="var(--emerald)" /> Your Ingredients ({pantryItems.length})
          </h2>

          {loading ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <Loader className="animate-spin" size={24} />
            </div>
          ) : pantryItems.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flex: 1, 
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: '2rem 1rem'
            }}>
              <Apple size={36} style={{ color: 'var(--text-primary)', opacity: 0.15, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your pantry is currently empty.</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Add ingredients to get started!</p>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              maxHeight: '400px', 
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {pantryItems.map(item => (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--bg-neutral)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    gap: '12px'
                  }}
                  className="pantry-item-row"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.ingredient_name}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>
                      Quantity: <strong style={{ color: 'var(--emerald)' }}>{parseFloat(item.quantity)}</strong> {item.unit || 'g'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(239, 68, 68, 0.65)',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    title="Remove item"
                    className="btn-delete-pantry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
