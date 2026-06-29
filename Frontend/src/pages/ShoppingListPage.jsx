import { useState, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { ShoppingCart, ShoppingBag, Trash2, Check, X } from 'lucide-react'

export default function ShoppingListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { convertPrice, symbols, selectedCurrency } = useCurrency()

  useEffect(() => {
    if (!user) { setLoading(false); return }
    api.get('/shopping-list').then(res => setItems(res.data)).finally(() => setLoading(false))
  }, [user])

  const toggle = async item => {
    const res = await api.patch(`/shopping-list/${item.id}/toggle`)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_checked: res.data.is_checked } : i))
  }

  const remove = async id => {
    await api.delete(`/shopping-list/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearAll = async () => {
    await api.delete('/shopping-list')
    setItems([])
  }

  const totalCost = items.reduce((sum, i) => sum + i.cost, 0)
  const checkedCount = items.filter(i => i.is_checked).length
  const symbol = symbols[selectedCurrency] || '$'

  if (!user) return (
    <div className="page-container">
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '500px', margin: '3rem auto' }}>
        <ShoppingCart size={48} color="var(--text-secondary)" />
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Sign in to use your shopping list</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Add ingredients from any recipe directly to your list</p>
      </div>
    </div>
  )

  return (
    <div className="page-container shopping-list-page">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={24} color="var(--emerald)" style={{ filter: 'drop-shadow(0 0 8px var(--emerald-glow))' }} />
            <h1 className="page-title" style={{ margin: 0 }}>Shopping List</h1>
          </div>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>{checkedCount}/{items.length} items checked · Est. {symbol}{convertPrice(totalCost)}</p>
        </div>
        {items.length > 0 && (
          <button className="btn-secondary" style={{ width: 'auto', padding: '0.6rem 1.4rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={clearAll}>
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {loading ? <div className="loading-spinner">Loading...</div>
      : items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '500px', margin: '3rem auto' }}>
          <ShoppingBag size={48} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>Your shopping list is empty</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Go to a recipe and click the cart button to add ingredients</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="shopping-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map(item => (
              <div key={item.id} className={`shopping-item ${item.is_checked ? 'checked' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: item.is_checked ? 'var(--bg-neutral)' : 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', transition: 'all 0.2s ease' }}>
                <label className="shopping-check" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.is_checked} onChange={() => toggle(item)} />
                  <span className="checkmark"></span>
                </label>
                <div className="shopping-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span className="shopping-name" style={{ fontSize: '0.95rem', fontWeight: '600', color: item.is_checked ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.is_checked ? 'line-through' : 'none' }}>{item.ingredient}</span>
                  <span className="shopping-qty" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.quantity} {item.unit}</span>
                </div>
                <span className="shopping-cost" style={{ fontSize: '0.95rem', fontWeight: '700', color: item.is_checked ? 'var(--text-muted)' : 'var(--emerald)' }}>{symbol}{convertPrice(item.cost)}</span>
                <button className="btn-remove" style={{ background: 'var(--bg-neutral)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => remove(item.id)}>
                  <X size={14} />
                </button>
              </div>
            ))}
            <div className="shopping-total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Estimated Cost</span>
              <span className="total-price" style={{ fontSize: '1.4rem', color: 'var(--emerald)', fontWeight: '800', fontFamily: "'Outfit', sans-serif", textShadow: '0 0 10px var(--emerald-glow)' }}>{symbol}{convertPrice(totalCost)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
