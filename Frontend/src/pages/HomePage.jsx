import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api/client'
import RecipeCard from '../components/RecipeCard'
import FilterPanel from '../components/FilterPanel'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { Search, Sparkles, CookingPot, UtensilsCrossed, SlidersHorizontal, Mic, MicOff, ChevronDown } from 'lucide-react'

const DEFAULT_FILTERS = { cuisine: 'All', category: 'All', max_budget: 6, max_cook_time: 90, student_only: '', dietary_tags: '', currency: 'USD', sort_by: 'default' }

const extractSearchKeyword = (transcript) => {
  if (!transcript) return '';
  let text = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  
  const prefixes = [
    /^(show me|give me|find|search for|look for|tell me about|how to make|how to cook|i want to make|i want to cook|i want to eat|i want|want to make|want to cook|can you show me|can you find)\s+/i,
    /^(recipes? for|recipes? with|recipes? about|recipes? of|recipes? containing|anything with|something with|meals? with|dishes? with|food with)\s+/i,
    /^(recipe|recipes|meals?|food|dishes?)\s+/i
  ];
  
  let matchFound = true;
  while (matchFound) {
    matchFound = false;
    for (const regex of prefixes) {
      if (regex.test(text)) {
        text = text.replace(regex, '').trim();
        matchFound = true;
      }
    }
  }
  
  const suffixes = [
    /\s+(recipes?|dishes?|meals?|food)$/i
  ];
  
  matchFound = true;
  while (matchFound) {
    matchFound = false;
    for (const regex of suffixes) {
      if (regex.test(text)) {
        text = text.replace(regex, '').trim();
        matchFound = true;
      }
    }
  }
  
  text = text.replace(/^(with|about|for|containing|of|to|a|an|the)\s+/i, '').trim();
  text = text.replace(/\s+(with|about|for|containing|of|to|a|an|the)$/i, '').trim();
  
  return text || transcript.trim();
};

export default function HomePage() {
  const { rates, symbols, selectedCurrency, changeCurrency } = useCurrency()
  const [recipes, setRecipes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS, currency: selectedCurrency }))
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('default')
  const [totalCount, setTotalCount] = useState(0)
  const debounceRef = useRef(null)

  const [recommendations, setRecommendations] = useState([])
  const [recOffset, setRecOffset] = useState(0)
  const [itemsVisible, setItemsVisible] = useState(3)
  const HERO_BACKGROUNDS = [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600',
    'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1600',
    'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=1600',
    'https://images.unsplash.com/photo-1490815248614-8305d691f21e?w=1600',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600',
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1600',
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=1600',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1600',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1600'
  ]
  const [activeBgIndex, setActiveBgIndex] = useState(0)
  const [isHeroHovered, setIsHeroHovered] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const POPULAR_INGREDIENTS = ['egg', 'rice', 'tomato', 'onion', 'chicken', 'pasta', 'garlic', 'cheese']

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-US'

      rec.onstart = () => {
        setIsListening(true)
      }

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          const cleaned = extractSearchKeyword(transcript)
          setSearch(cleaned)
          setTimeout(() => {
            document.querySelector('.content-layout')?.scrollIntoView({ behavior: 'smooth' })
          }, 300)
        }
      }

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
  }, [])

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported or initialized in this browser. Please try Chrome, Edge, or Safari.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
      }
    }
  }

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/recipes/recommendations')
        const shuffled = [...res.data].sort(() => Math.random() - 0.5)
        setRecommendations(shuffled)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
      }
    }
    fetchRecommendations()
  }, [user])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsVisible(3)
      } else if (window.innerWidth >= 640) {
        setItemsVisible(2)
      } else {
        setItemsVisible(1)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (recommendations.length <= itemsVisible) {
      setRecOffset(0)
      return
    }
    const interval = setInterval(() => {
      setRecOffset(prev => {
        const maxOffset = recommendations.length - itemsVisible
        return prev >= maxOffset ? 0 : prev + 1
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [recommendations, itemsVisible])

  useEffect(() => {
    if (!isHeroHovered) return
    const bgInterval = setInterval(() => {
      setActiveBgIndex(prev => (prev + 1) % HERO_BACKGROUNDS.length)
    }, 3500)
    return () => clearInterval(bgInterval)
  }, [isHeroHovered])

  useEffect(() => {
    setFilters(prev => ({ ...prev, currency: selectedCurrency }))
  }, [selectedCurrency])

  const fetchRecipes = useCallback(async (activeFilters, activeSearch, activeIngredients) => {
    setLoading(true)
    try {
      const params = {}
      if (activeFilters.cuisine && activeFilters.cuisine !== 'All') params.cuisine = activeFilters.cuisine
      if (activeFilters.category && activeFilters.category !== 'All') params.category = activeFilters.category
      if (activeFilters.max_budget) {
        params.max_budget = activeFilters.max_budget
      }
      if (activeFilters.max_cook_time) params.max_cook_time = activeFilters.max_cook_time
      if (activeFilters.student_only === 'true') params.student_only = 'true'
      if (activeFilters.dietary_tags) params.dietary_tags = activeFilters.dietary_tags
      params.sort = sortBy
      if (activeSearch) params.search = activeSearch
      if (activeIngredients.length) params.ingredients = activeIngredients.join(',')
      const res = await api.get('/recipes', { params })
      const data = res.data
      if (Array.isArray(data)) {
        setRecipes(data)
        setTotalCount(data.length)
      } else {
        setRecipes(data.recipes || [])
        setTotalCount(data.total ?? (data.recipes?.length || 0))
      }
    } finally {
      setLoading(false)
    }
  }, [rates, sortBy])

  const lastSortBy = useRef(sortBy)
  useEffect(() => {
    if (lastSortBy.current !== sortBy) {
      lastSortBy.current = sortBy
      fetchRecipes(filters, search, ingredients)
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchRecipes(filters, search, ingredients)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [filters, search, ingredients, fetchRecipes, sortBy])

  const fetchFavorites = useCallback(async () => {
    if (!user) return setFavorites([])
    try {
      const res = await api.get('/favorites')
      setFavorites(res.data.map(f => f.recipe.id))
    } catch {}
  }, [user])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  const handleFilterChange = newFilters => {
    if (newFilters.currency) {
      changeCurrency(newFilters.currency)
    }
    setFilters(prev => ({ ...prev, ...newFilters }))
  }
  const handleClearFilters = () => { 
    setFilters({ ...DEFAULT_FILTERS, currency: selectedCurrency })
    setSearch('')
    setIngredients([])
    setSortBy('default')
  }

  const handleToggleFavorite = async recipeId => {
    const isFav = favorites.includes(recipeId)
    if (isFav) {
      await api.delete(`/favorites/${recipeId}`)
      setFavorites(prev => prev.filter(id => id !== recipeId))
    } else {
      await api.post('/favorites', { recipe_id: recipeId })
      setFavorites(prev => [...prev, recipeId])
    }
  }

  const currency = filters.currency || 'USD'
  const rate = rates[currency] || 1
  const symbol = symbols[currency] || '$'
  const convertPrice = usd => (usd * rate).toFixed(2)

  const displayRecipes = recipes.map(r => ({
    ...r,
    cost_per_serving: parseFloat(convertPrice(r.cost_per_serving)),
    total_cost: parseFloat(convertPrice(r.total_cost)),
    _symbol: symbol,
  }))

  return (
    <div className="home-page" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* Hero */}
      <div 
        className="hero" 
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => {
          setIsHeroHovered(false)
          setActiveBgIndex(0)
        }}
        style={{
          borderBottom: '1px solid var(--border-color)',
          minHeight: '85vh',
          width: '100%',
          marginTop: '-72px',
          paddingTop: '100px',
          paddingBottom: '60px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem'
        }}
      >
        {HERO_BACKGROUNDS.map((url, idx) => (
          <div
            key={url}
            style={{
              position: 'absolute',
              inset: 0,
              background: `url('${url}') no-repeat center center/cover`,
              zIndex: 0,
              opacity: activeBgIndex === idx ? 0.65 : 0,
              transition: 'opacity 1.5s ease-in-out, transform 8s ease-out',
              pointerEvents: 'none',
              transform: activeBgIndex === idx && isHeroHovered ? 'scale(1.08) translate(-10px, -5px)' : 'scale(1.02)'
            }}
          />
        ))}
        <div className="hero-overlay" style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
        <div className="hero-content" style={{
          maxWidth: '850px',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '3rem 1.5rem'
        }}>
          <div className="hero-badge font-serif text-gold" style={{
            border: '1px solid var(--emerald)',
            background: 'rgba(18, 18, 21, 0.65)',
            backdropFilter: 'blur(8px)',
            padding: '5px 14px',
            borderRadius: '30px',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            fontSize: '0.68rem',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: '3rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}>
            AN ELEVATED CULINARY EXPERIENCE
          </div>
          <h1 className="hero-title font-serif" style={{
            letterSpacing: '0.04em',
            fontSize: '3.6rem',
            fontWeight: '600',
            lineHeight: '1.25',
            marginTop: '0px',
            marginBottom: '2.5rem',
            padding: '1.5rem 0',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            Intelligent Gastronomy. Meticulously Planned.
          </h1>
          <p className="hero-subtitle" style={{ 
            color: 'rgba(255, 255, 255, 0.85)', 
            fontSize: '1.15rem', 
            fontWeight: '300', 
            lineHeight: '1.8', 
            maxWidth: '720px', 
            marginBottom: '4rem',
            padding: '0 1.5rem'
          }}>
            Welcome to a seamless way to curate your kitchen. Craft exquisite, chef-inspired meals tailored harmoniously to your personal lifestyle, utilizing the ingredients you love with fluid, elegant ease.
          </p>
          <form 
            onSubmit={e => {
              e.preventDefault();
              if (search.trim()) {
                setIngredients(prev => [...new Set([...prev, search.trim().toLowerCase()])])
                setSearch('');
                setTimeout(() => {
                  document.querySelector('.content-layout')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }
            }}
            className="hero-search" 
            style={{
              background: 'rgba(18, 18, 21, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              borderRadius: '30px',
              padding: '14px 28px',
              width: '100%',
              maxWidth: '600px',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Search size={18} className="search-icon" style={{ color: 'var(--emerald)' }} />
            <input 
              className="search-input" 
              placeholder={isListening ? "Listening for blueprint criteria..." : "Search recipes, ingredients, cuisines..."}
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ color: '#ffffff', background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: '0.95rem' }}
            />
            <button 
              type="button" 
              className={`btn-voice-search ${isListening ? 'pulse-mic-glow' : ''}`} 
              onClick={handleVoiceSearch}
              title={isListening ? 'Listening... click to stop' : 'Search with your voice'}
              style={{ 
                color: isListening ? 'var(--emerald)' : 'var(--text-secondary)', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                transition: 'all 0.3s'
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </form>

          {/* Consolidated Quick-select badges and Active tags directly under primary search */}
          <div className="search-tags-container" style={{ 
            width: '100%', 
            maxWidth: '600px', 
            marginTop: '2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem', 
            alignItems: 'center' 
          }}>
            {/* Quick-select badges */}
            <div className="quick-select-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', fontWeight: '500' }}>Quick ingredients:</span>
              {['egg', 'rice', 'tomato', 'onion', 'chicken'].map(ing => {
                const isChecked = ingredients.some(i => i.toLowerCase() === ing.toLowerCase());
                return (
                  <label 
                    key={ing} 
                    className={`popular-ingredient-checkbox ${isChecked ? 'active' : ''}`}
                    style={{
                      background: isChecked ? 'var(--emerald)' : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${isChecked ? 'var(--emerald)' : 'rgba(255, 255, 255, 0.15)'}`,
                      color: isChecked ? '#000000' : '#ffffff',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontWeight: '600',
                      boxShadow: isChecked ? '0 4px 12px var(--emerald-glow)' : 'none',
                      transform: isChecked ? 'scale(1.08)' : 'scale(1)',
                      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s, border-color 0.3s, color 0.3s, box-shadow 0.3s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setIngredients(prev => prev.filter(i => i.toLowerCase() !== ing.toLowerCase()));
                        } else {
                          setIngredients(prev => [...prev, ing]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <span>{ing}</span>
                  </label>
                );
              })}
            </div>

            {/* Active pantry tags */}
            {ingredients.length > 0 && (
              <div className="active-pantry-tags" style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                justifyContent: 'center', 
                alignItems: 'center', 
                background: 'rgba(18, 18, 21, 0.65)', 
                backdropFilter: 'blur(12px)',
                padding: '10px 20px', 
                borderRadius: '24px', 
                border: '1px solid rgba(255, 255, 255, 0.12)',
                marginTop: '0.5rem',
                animation: 'tagPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <span style={{ color: 'var(--emerald)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>Pantry:</span>
                {ingredients.map(ing => (
                  <span key={ing} className="ingredient-tag spring-tag" style={{
                    background: 'var(--emerald-light)',
                    border: '1px solid rgba(197, 168, 128, 0.25)',
                    color: 'var(--emerald)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '600'
                  }}>
                    {ing} 
                    <button 
                      onClick={() => setIngredients(prev => prev.filter(i => i !== ing))}
                      style={{ color: 'var(--emerald)', fontWeight: '800', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button 
                  className="btn-clear-ing" 
                  onClick={() => setIngredients([])} 
                  style={{ 
                    color: '#ef4444', 
                    fontSize: '0.8rem', 
                    fontWeight: '600', 
                    textDecoration: 'underline', 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer',
                    marginLeft: '8px'
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="hero-scroll-indicator" style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          cursor: 'pointer',
          transition: 'color 0.3s'
        }} onClick={() => document.querySelector('.content-layout')?.scrollIntoView({ behavior: 'smooth' })}>
          <span>Scroll to explore</span>
          <ChevronDown size={16} className="bounce-chevron" style={{ color: 'var(--emerald)' }} />
        </div>
      </div>

      <div className={`content-layout ${showMobileFilters ? 'mobile-filters-open' : ''}`} style={{ 
        display: 'flex', 
        gap: '0', 
        minHeight: 'calc(100vh - 200px)',
        paddingTop: '5rem'
      }}>
        <button 
          className="btn-mobile-filter-trigger" 
          onClick={() => setShowMobileFilters(true)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
        >
          <SlidersHorizontal size={16} /> Filters & Currency
        </button>

        {showMobileFilters && (
          <div className="mobile-filter-backdrop" onClick={() => setShowMobileFilters(false)} style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }} />
        )}

        <FilterPanel 
          filters={filters} 
          onChange={handleFilterChange} 
          onClear={handleClearFilters} 
          onClose={() => setShowMobileFilters(false)}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="recipes-section" style={{ flex: 1, padding: '2rem 3rem' }}>
          
          {/* AI Recommended Section */}
          {recommendations.length > 0 && (
            <div className="recommendations-container" style={{
              background: 'var(--bg-neutral)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              marginBottom: '3rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div className="recommendations-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <h2 className="recommendations-title font-serif text-gold" style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <Sparkles size={18} className="sparkle-icon" /> Selections Crafted for You
                  </h2>
                  <p className="recommendations-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {user 
                      ? "Curated gastronomic suggestions personalized based on your favorites and planning habits" 
                      : "Meticulously curated favorites to get you started"}
                  </p>
                </div>
                {/* Carousel Navigation Buttons */}
                {recommendations.length > itemsVisible && (
                  <div className="carousel-controls" style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setRecOffset(prev => prev === 0 ? recommendations.length - itemsVisible : prev - 1)}
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)', 
                        borderRadius: '50%', 
                        width: '36px', 
                        height: '36px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer' 
                      }}
                      className="carousel-btn"
                    >
                      &larr;
                    </button>
                    <button 
                      onClick={() => setRecOffset(prev => prev >= recommendations.length - itemsVisible ? 0 : prev + 1)}
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-primary)', 
                        borderRadius: '50%', 
                        width: '36px', 
                        height: '36px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer' 
                      }}
                      className="carousel-btn"
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>
              <div className="recommendations-viewport">
                <div 
                  className="recommendations-slider" 
                  style={{ 
                    '--rec-offset': recOffset 
                  }}
                >
                  {recommendations.map((recipe, idx) => (
                    <div 
                      key={`rec-wrap-${recipe.id}`} 
                      className="recommendations-card-wrapper"
                      style={{
                        opacity: idx >= recOffset && idx < recOffset + itemsVisible ? 1 : 0.4
                      }}
                    >
                      <RecipeCard 
                        recipe={{
                          ...recipe,
                          cost_per_serving: parseFloat(convertPrice(recipe.cost_per_serving)),
                          total_cost: parseFloat(convertPrice(recipe.total_cost)),
                          _symbol: symbol,
                        }} 
                        symbol={symbol}
                        isFavorited={favorites.includes(recipe.id)}
                        onToggleFavorite={handleToggleFavorite} 
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Carousel Pagination Dots */}
              {recommendations.length > itemsVisible && (
                <div className="carousel-dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                  {[...Array(recommendations.length - itemsVisible + 1)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRecOffset(idx)}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: recOffset === idx ? 'var(--emerald)' : 'var(--border-color)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.3s'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
            <span className="results-count" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {totalCount} recipe{totalCount !== 1 ? 's' : ''} found
              {sortBy !== 'default' && (
                <span style={{ color: 'var(--emerald)', marginLeft: '6px', fontWeight: '600' }}>
                  • Sorted by {sortBy === 'cheapest' ? 'cheapest first' : sortBy === 'fastest' ? 'fastest cook time' : 'fewest ingredients'}
                </span>
              )}
            </span>
            <span className="results-note" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Prices in {symbol} ({currency})</span>
          </div>
 
          {loading ? (
            <div className="loading-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card" style={{ height: '320px', borderRadius: '12px' }} />
              ))}
            </div>
          ) : displayRecipes.length === 0 ? (
            <div className="empty-state" style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <UtensilsCrossed size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 className="font-serif" style={{ fontSize: '1.45rem', marginBottom: '8px' }}>No recipes found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div key={JSON.stringify(filters) + search + ingredients.join(',') + sortBy} className="recipes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {displayRecipes.map((recipe, idx) => (
                <div key={`recipe-wrap-${recipe.id}`} className={`recipe-card-reveal reveal-stagger-${idx % 8}`}>
                  <RecipeCard 
                    recipe={recipe} 
                    symbol={symbol}
                    isFavorited={favorites.includes(recipe.id)}
                    onToggleFavorite={handleToggleFavorite} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
