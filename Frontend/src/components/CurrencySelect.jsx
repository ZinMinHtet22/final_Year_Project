import { useState, useRef, useEffect } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { Search, Check, ChevronDown } from 'lucide-react'

export default function CurrencySelect({ value, onChange }) {
  const { currencies } = useCurrency()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef()
  const searchRef = useRef()

  const selected = currencies.find(c => c.code === value) || currencies.find(c => c.code === 'USD') || { code: 'USD', name: 'US Dollar', symbol: '$' }
  const filtered = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    const handler = e => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = code => { onChange(code); setOpen(false); setSearch('') }

  return (
    <div className="currency-select-wrap" ref={ref}>
      <button className="currency-trigger" onClick={() => setOpen(o => !o)}>
        <span className="currency-symbol">{selected.symbol}</span>
        <span className="currency-label">{selected.code} — {selected.name}</span>
        <ChevronDown size={14} className={`currency-arrow ${open ? 'open' : ''}`} />
      </button>

      {open && (
        <div className="currency-dropdown">
          <div className="currency-search-wrap">
            <Search size={13} color="#9ca3af" />
            <input ref={searchRef} className="currency-search" placeholder="Search currency..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="currency-list">
            {filtered.length === 0 ? (
              <div className="currency-empty">No results found</div>
            ) : filtered.map(c => (
              <button key={c.code} className={`currency-option ${c.code === value ? 'active' : ''}`}
                onClick={() => select(c.code)}>
                <span className="currency-opt-symbol">{c.symbol}</span>
                <span className="currency-opt-code">{c.code}</span>
                <span className="currency-opt-name">— {c.name}</span>
                {c.code === value && <Check size={13} color="#16a34a" style={{marginLeft:'auto'}} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
