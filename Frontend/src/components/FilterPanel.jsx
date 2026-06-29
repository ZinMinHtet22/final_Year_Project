import { useCurrency } from '../context/CurrencyContext'
import CurrencySelect from './CurrencySelect'
import { Globe, LayoutList, Clock, GraduationCap, ChevronDown } from 'lucide-react'

export default function FilterPanel({ filters, onChange, onClear, onClose, sortBy = 'default', onSortChange }) {
  const { rates, symbols } = useCurrency()
  const cuisines = ['All', 'Italian', 'Asian', 'American', 'Indian', 'Mexican', 'Mediterranean']
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks']
  const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'High-Protein']
  const budgetPresets = [1.5, 2, 3, 4.5, 6]
  const timePresets = [15, 30, 45, 60, 90]
  const currency = filters.currency || 'USD'
  const rate = rates[currency] || 1
  const symbol = symbols[currency] || '$'
  const convertedBudget = (parseFloat(filters.max_budget || 6) * rate)

  const toggleDiet = tag => {
    const current = filters.dietary_tags ? filters.dietary_tags.split(',').filter(Boolean) : []
    const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]
    onChange({ dietary_tags: updated.join(',') })
  }

  const selectedTags = filters.dietary_tags ? filters.dietary_tags.split(',').filter(Boolean) : []
  const maxBudget = parseFloat(filters.max_budget || 6)
  const maxTime = parseInt(filters.max_cook_time || 90)

  return (
    <aside className="filter-panel">
      {onClose && (
        <button className="mobile-filter-close" onClick={onClose}>×</button>
      )}
      <h3 className="filter-title">Filters</h3>

      {/* Sort By */}
      <div className="filter-section">
        <label className="filter-label">Sort Recipes</label>
        <div className="select-wrap" style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
          <select 
            className="filter-select" 
            style={{ 
              width: '100%',
              padding: '10px 32px 10px 14px', 
              background: 'var(--bg-neutral)', 
              border: 'none', 
              color: 'var(--text-primary)', 
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
            value={sortBy} 
            onChange={e => onSortChange(e.target.value)}
          >
            <option value="default">Default (Relevance)</option>
            <option value="cheapest">Cheapest serving first</option>
            <option value="fastest">Fastest cook time</option>
            <option value="fewest">Fewest ingredients</option>
          </select>
          <div style={{ position: 'absolute', right: '14px', pointerEvents: 'none', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="filter-divider" />

      {/* Currency */}
      <div className="filter-section">
        <label className="filter-label"><Globe size={14} className="filter-icon-svg" /> Currency</label>
        <CurrencySelect value={filters.currency || 'USD'} onChange={code => onChange({ currency: code })} />
      </div>

      <div className="filter-divider" />

      {/* Max Budget */}
      <div className="filter-section">
        <div className="filter-label-row">
          <label className="filter-label"><LayoutList size={14} className="filter-icon-svg" /> Max Budget <span className="label-sub">(per serving)</span></label>
          <span className="filter-value">{symbol}{convertedBudget.toFixed(rate >= 100 ? 0 : 2)}</span>
        </div>
        <input type="range" className="filter-range" min="1" max="6" step="0.1"
          value={maxBudget}
          onChange={e => onChange({ max_budget: e.target.value })} />
        <div className="preset-chips">
          {budgetPresets.map(p => (
            <button key={p} className={`preset-chip ${parseFloat(filters.max_budget || 6) === p ? 'active' : ''}`}
              onClick={() => onChange({ max_budget: p })}>
              {symbol}{(p * rate).toFixed(rate >= 100 ? 0 : 2)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Cooking Time */}
      <div className="filter-section">
        <div className="filter-label-row">
          <label className="filter-label"><Clock size={14} className="filter-icon-svg" /> Cooking Time</label>
          <span className="filter-value">≤ {maxTime} min</span>
        </div>
        <input type="range" className="filter-range" min="15" max="90" step="15"
          value={maxTime}
          onChange={e => onChange({ max_cook_time: e.target.value })} />
        <div className="preset-chips">
          {timePresets.map(t => (
            <button key={t} className={`preset-chip ${maxTime === t ? 'active' : ''}`}
              onClick={() => onChange({ max_cook_time: t })}>
              {t}m
            </button>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Student Friendly */}
      <div className={`student-toggle-card ${filters.student_only === 'true' ? 'active' : ''}`}>
        <div className="student-toggle-left">
          <GraduationCap size={22} color={filters.student_only === 'true' ? 'var(--emerald)' : '#6b7280'} />
          <div>
            <div className="student-label">Curated Selections Only</div>
            <div className="student-sub">Streamlined, elegant choices</div>
          </div>
        </div>
        <label className="toggle">
          <input type="checkbox" checked={filters.student_only === 'true'}
            onChange={e => onChange({ student_only: e.target.checked ? 'true' : '' })} />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="filter-divider" />

      {/* Category */}
      <div className="filter-section">
        <label className="filter-label">Meal Category</label>
        <div className="cuisine-chips">
          {categories.map(cat => (
            <button key={cat} className={`cuisine-chip ${(filters.category || 'All') === cat ? 'active' : ''}`}
              onClick={() => onChange({ category: cat })}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Cuisine */}
      <div className="filter-section">
        <label className="filter-label">Cuisine</label>
        <div className="cuisine-chips">
          {cuisines.map(c => (
            <button key={c} className={`cuisine-chip ${(filters.cuisine || 'All') === c ? 'active' : ''}`}
              onClick={() => onChange({ cuisine: c })}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-divider" />

      {/* Dietary */}
      <div className="filter-section">
        <label className="filter-label">Dietary Preferences</label>
        <div className="diet-chips">
          {dietaryOptions.map(d => (
            <button key={d} className={`diet-chip ${selectedTags.includes(d) ? 'active' : ''}`}
              onClick={() => toggleDiet(d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-clear" onClick={onClear}>Clear All Filters</button>
    </aside>
  )
}
