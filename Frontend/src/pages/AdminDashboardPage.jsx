import { useState, useEffect } from 'react'
import api from '../api/client'
import { useCurrency } from '../context/CurrencyContext'
import {
  Users,
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Coins,
  Clock,
  MapPin,
  ChefHat,
  ListPlus,
  AlertCircle,
  Heart,
  MessageSquare,
  Globe
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { refreshCurrencies } = useCurrency()
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [users, setUsers] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [feedback, setFeedback] = useState([])
  const [pendingRecipes, setPendingRecipes] = useState([])
  const [pendingSearch, setPendingSearch] = useState('')

  // Modal States
  const [showRecipeModal, setShowRecipeModal] = useState(false)
  const [recipeModalMode, setRecipeModalMode] = useState('add') // 'add' or 'edit'
  const [editingRecipeId, setEditingRecipeId] = useState(null)
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    cuisine: '',
    category: 'Breakfast',
    difficulty: 'Easy',
    cook_time: 15,
    servings: 2,
    image_url: '',
    is_student_pick: false,
    dietary_tags: [],
    ingredients: [], // Array of { id, quantity }
    instructions: [''] // Array of strings (steps)
  })

  const [showIngredientModal, setShowIngredientModal] = useState(false)
  const [ingredientModalMode, setIngredientModalMode] = useState('add') // 'add' or 'edit'
  const [editingIngredientId, setEditingIngredientId] = useState(null)
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    unit: 'g',
    cost_per_unit: 0.01
  })

  // Exchange rate inline edit state
  const [editingCurrencyCode, setEditingCurrencyCode] = useState(null)
  const [editingRateValue, setEditingRateValue] = useState('')

  // Messages
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Search Filters (Local)
  const [recipeSearch, setRecipeSearch] = useState('')
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [currencySearch, setCurrencySearch] = useState('')
  const [feedbackSearch, setFeedbackSearch] = useState('')

  useEffect(() => {
    fetchStats()
    fetchRecipes()
    fetchIngredients()
    fetchUsers()
    fetchCurrenciesList()
    fetchFeedbackList()
    fetchPendingRecipes()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchRecipes = async () => {
    try {
      const res = await api.get('/admin/recipes')
      setRecipes(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/admin/ingredients')
      setIngredients(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCurrenciesList = async () => {
    try {
      const res = await api.get('/admin/currencies')
      setCurrencies(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchFeedbackList = async () => {
    try {
      const res = await api.get('/admin/feedback')
      setFeedback(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPendingRecipes = async () => {
    try {
      const res = await api.get('/admin/recipes/pending')
      setPendingRecipes(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleApproveRecipe = async (id) => {
    try {
      await api.put(`/admin/recipes/${id}/approve`)
      showNotification('Recipe approved and is now live!')
      fetchPendingRecipes()
      fetchRecipes()
      fetchStats()
    } catch (err) {
      showNotification('Failed to approve recipe', true)
    }
  }

  const handleRejectRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to reject and delete this recipe submission?')) return
    try {
      await api.delete(`/admin/recipes/${id}`)
      showNotification('Recipe submission rejected and deleted.')
      fetchPendingRecipes()
    } catch (err) {
      showNotification('Failed to reject recipe', true)
    }
  }

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(''), 4000)
    } else {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  // --- INGREDIENT CRUD ACTIONS ---

  const handleSaveIngredient = async (e) => {
    e.preventDefault()
    try {
      if (ingredientModalMode === 'add') {
        await api.post('/admin/ingredients', ingredientForm)
        showNotification('Ingredient created successfully!')
      } else {
        await api.put(`/admin/ingredients/${editingIngredientId}`, ingredientForm)
        showNotification('Ingredient updated successfully!')
      }
      setShowIngredientModal(false)
      fetchIngredients()
      fetchRecipes() // Recipes cost_per_serving could change
      fetchStats()
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save ingredient', true)
    }
  }

  const handleEditIngredientClick = (ing) => {
    setIngredientModalMode('edit')
    setEditingIngredientId(ing.id)
    setIngredientForm({
      name: ing.name,
      unit: ing.unit,
      cost_per_unit: ing.cost_per_unit
    })
    setShowIngredientModal(true)
  }

  const handleDeleteIngredient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ingredient? Recipes using it will lose this link.')) return
    try {
      await api.delete(`/admin/ingredients/${id}`)
      showNotification('Ingredient deleted successfully!')
      fetchIngredients()
      fetchRecipes()
      fetchStats()
    } catch (err) {
      showNotification('Failed to delete ingredient', true)
    }
  }

  const handleAddIngredientClick = () => {
    setIngredientModalMode('add')
    setIngredientForm({ name: '', unit: 'g', cost_per_unit: 0.01 })
    setShowIngredientModal(true)
  }

  // --- RECIPE CRUD ACTIONS ---

  const handleAddRecipeIngredientRow = () => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: ingredients[0]?.id || '', quantity: 100 }]
    }))
  }

  const handleRemoveRecipeIngredientRow = (index) => {
    setRecipeForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const handleRecipeIngredientChange = (index, field, value) => {
    setRecipeForm(prev => {
      const updated = [...prev.ingredients]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, ingredients: updated }
    })
  }

  const handleDietaryTagToggle = (tag) => {
    setRecipeForm(prev => {
      const current = prev.dietary_tags
      const updated = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag]
      return { ...prev, dietary_tags: updated }
    })
  }

  const handleAddRecipeStep = () => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const handleRemoveRecipeStep = (index) => {
    setRecipeForm(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const handleRecipeStepChange = (index, value) => {
    setRecipeForm(prev => {
      const updated = [...prev.instructions]
      updated[index] = value
      return { ...prev, instructions: updated }
    })
  }

  const handleSaveRecipe = async (e) => {
    e.preventDefault()
    if (recipeForm.ingredients.length === 0) {
      alert('Please add at least one ingredient to this recipe.')
      return
    }

    // Filter out empty instructions steps
    const cleanedForm = {
      ...recipeForm,
      instructions: recipeForm.instructions.filter(step => step.trim() !== '')
    }

    try {
      if (recipeModalMode === 'add') {
        await api.post('/admin/recipes', cleanedForm)
        showNotification('Recipe created successfully!')
      } else {
        await api.put(`/admin/recipes/${editingRecipeId}`, cleanedForm)
        showNotification('Recipe updated successfully!')
      }
      setShowRecipeModal(false)
      fetchRecipes()
      fetchStats()
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save recipe', true)
    }
  }

  const handleAddRecipeClick = () => {
    setRecipeModalMode('add')
    setRecipeForm({
      name: '',
      description: '',
      cuisine: '',
      category: 'Breakfast',
      difficulty: 'Easy',
      cook_time: 15,
      servings: 2,
      image_url: '',
      is_student_pick: false,
      dietary_tags: [],
      ingredients: [],
      instructions: ['']
    })
    setShowRecipeModal(true)
  }

  const handleEditRecipeClick = (recipe) => {
    setRecipeModalMode('edit')
    setEditingRecipeId(recipe.id)
    setRecipeForm({
      name: recipe.name,
      description: recipe.description,
      cuisine: recipe.cuisine,
      category: recipe.category || 'Breakfast',
      difficulty: recipe.difficulty,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      image_url: recipe.image_url || '',
      is_student_pick: recipe.is_student_pick,
      dietary_tags: recipe.dietary_tags.map(t => t.name),
      ingredients: recipe.ingredients.map(i => ({ id: i.id, quantity: i.quantity })),
      instructions: recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions : ['']
    })
    setShowRecipeModal(true)
  }

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return
    try {
      await api.delete(`/admin/recipes/${id}`)
      showNotification('Recipe deleted successfully!')
      fetchRecipes()
      fetchStats()
    } catch (err) {
      showNotification('Failed to delete recipe', true)
    }
  }

  // --- USER ACTIONS ---

  const handleToggleUserRole = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}/role`)
      showNotification(`Updated role for ${user.name}!`)
      fetchUsers()
      fetchStats()
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to change role', true)
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? Their favorites and shopping lists will be cleared.')) return
    try {
      await api.delete(`/admin/users/${id}`)
      showNotification('User deleted successfully!')
      fetchUsers()
      fetchStats()
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete user', true)
    }
  }

  // --- CURRENCY ACTIONS ---

  const handleStartEditRate = (curr) => {
    setEditingCurrencyCode(curr.code)
    setEditingRateValue(curr.exchange_rate.toString())
  }

  const handleSaveRate = async (code) => {
    const rate = parseFloat(editingRateValue)
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid positive exchange rate.')
      return
    }

    try {
      await api.put(`/admin/currencies/${code}`, { exchange_rate: rate })
      showNotification(`Exchange rate for ${code} updated successfully!`)
      setEditingCurrencyCode(null)
      fetchCurrenciesList()
      refreshCurrencies() // update context rates
      fetchStats()
    } catch (err) {
      showNotification('Failed to update exchange rate.', true)
    }
  }

  // --- FEEDBACK ACTIONS ---

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback message?')) return
    try {
      await api.delete(`/admin/feedback/${id}`)
      showNotification('Feedback deleted successfully!')
      fetchFeedbackList()
    } catch (err) {
      showNotification('Failed to delete feedback message', true)
    }
  }

  // Dietary tags choices available
  const DIETARY_CHOICES = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'High-Protein']

  // Local Searches
  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(recipeSearch.toLowerCase()))
  )

  const filteredIngredients = ingredients.filter(i =>
    i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredCurrencies = currencies.filter(c =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  )

  const filteredFeedback = feedback.filter(f =>
    f.name.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
    f.email.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
    f.message.toLowerCase().includes(feedbackSearch.toLowerCase())
  )

  return (
    <div className="page-container admin-page">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <UtensilsCrossed size={24} color="#10b981" />
        <h1 className="page-title">Admin Control Panel</h1>
        <p className="page-subtitle">Configure recipes, ingredients, currencies, and moderate user accounts</p>
      </div>

      {/* Notifications */}
      {successMsg && <div className="admin-alert success"><Check size={16} /> {successMsg}</div>}
      {errorMsg && <div className="admin-alert error"><AlertCircle size={16} /> {errorMsg}</div>}

      {/* Tab Navigation */}
      <div className="admin-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
        <button className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          Stats Overview
        </button>
        <button className={`admin-tab-btn ${activeTab === 'recipes' ? 'active' : ''}`} onClick={() => setActiveTab('recipes')}>
          Recipes ({recipes.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>
          Ingredients ({ingredients.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          Users ({users.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'currencies' ? 'active' : ''}`} onClick={() => setActiveTab('currencies')}>
          Currencies ({currencies.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
          Feedback ({feedback.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending Approvals ({pendingRecipes.length})
        </button>
      </div>

      <div className="admin-tab-content">
        {/* --- STATS TAB --- */}
        {activeTab === 'stats' && (
          <div>
            <div className="admin-stats-grid">
              {stats ? (
                <>
                  <div className="admin-stat-card">
                    <Users size={32} color="#10b981" />
                    <div className="stat-info">
                      <span className="stat-label">Total Registered Users</span>
                      <span className="stat-value">{stats.total_users}</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <UtensilsCrossed size={32} color="#10b981" />
                    <div className="stat-info">
                      <span className="stat-label">Total Recipes Live</span>
                      <span className="stat-value">{stats.total_recipes}</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <ListPlus size={32} color="#10b981" />
                    <div className="stat-info">
                      <span className="stat-label">Available Ingredients</span>
                      <span className="stat-value">{stats.total_ingredients}</span>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <Coins size={32} color="#10b981" />
                    <div className="stat-info">
                      <span className="stat-label">Avg. Cost per Serving</span>
                      <span className="stat-value">${stats.average_cost_per_serving}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p>Loading administration statistics...</p>
              )}
            </div>

            {/* Popularity Columns */}
            {stats && (
              <div className="stats-columns-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Most Saved Recipes */}
                <div className="stats-table-card" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <Heart size={16} color="#f43f5e" fill="#f43f5e" /> Most Saved Recipes
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stats.most_saved_recipes?.map((item, index) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-neutral)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem', textAlign: 'left' }}>{index + 1}. {item.name}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold', color: '#f43f5e' }}>
                          {item.favorites_count} saves
                        </span>
                      </div>
                    ))}
                    {(!stats.most_saved_recipes || stats.most_saved_recipes.length === 0) && (
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>No favorites data yet.</p>
                    )}
                  </div>
                </div>

                {/* Popular Ingredients */}
                <div className="stats-table-card" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <UtensilsCrossed size={16} color="#10b981" /> Popular Ingredients
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stats.popular_ingredients?.map((item, index) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-neutral)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem', textAlign: 'left' }}>{index + 1}. {item.name}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>
                          used in {item.recipes_count} recipes
                        </span>
                      </div>
                    ))}
                    {(!stats.popular_ingredients || stats.popular_ingredients.length === 0) && (
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>No ingredients data yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- RECIPES TAB --- */}
        {activeTab === 'recipes' && (
          <div className="admin-data-section">
            <div className="section-actions-row">
              <input
                className="admin-search-input"
                placeholder="Search by name, category, or cuisine..."
                value={recipeSearch}
                onChange={e => setRecipeSearch(e.target.value)}
              />
              <button className="btn-primary" onClick={handleAddRecipeClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add New Recipe
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Recipe</th>
                    <th>Cuisine</th>
                    <th>Cook Time</th>
                    <th>Servings</th>
                    <th>Cost/Serving</th>
                    <th>Total Cost</th>
                    <th>Favorites</th>
                    <th>Master Selection</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map(recipe => (
                    <tr key={recipe.id}>
                      <td>
                        <div style={{ fontWeight: 'bold' }}>{recipe.name}</div>
                        <div style={{ fontSize: '11px', color: '#10b981', textTransform: 'uppercase', fontWeight: 'bold' }}>{recipe.category || 'Uncategorized'}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{recipe.dietary_tags.map(t => t.name).join(', ')}</div>
                      </td>
                      <td>{recipe.cuisine}</td>
                      <td>{recipe.cook_time}m</td>
                      <td>{recipe.servings}</td>
                      <td style={{ color: '#4ade80' }}>${recipe.cost_per_serving.toFixed(2)}</td>
                      <td>${recipe.total_cost.toFixed(2)}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f43f5e' }}>
                          <Heart size={12} fill="#f43f5e" color="#f43f5e" /> {recipe.favorites_count || 0}
                        </span>
                      </td>
                      <td>{recipe.is_student_pick ? <span className="admin-badge student">Yes</span> : <span className="admin-badge text-muted">No</span>}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-action-edit" onClick={() => handleEditRecipeClick(recipe)}>
                            <Edit size={14} />
                          </button>
                          <button className="btn-action-delete" onClick={() => handleDeleteRecipe(recipe.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRecipes.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', color: '#9ca3af' }}>No recipes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- INGREDIENTS TAB --- */}
        {activeTab === 'ingredients' && (
          <div className="admin-data-section">
            <div className="section-actions-row">
              <input
                className="admin-search-input"
                placeholder="Search ingredients..."
                value={ingredientSearch}
                onChange={e => setIngredientSearch(e.target.value)}
              />
              <button className="btn-primary" onClick={handleAddIngredientClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Ingredient
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Standard Unit</th>
                    <th>Cost per Unit (USD)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map(ing => (
                    <tr key={ing.id}>
                      <td>#{ing.id}</td>
                      <td style={{ fontWeight: 'bold' }}>{ing.name}</td>
                      <td>{ing.unit}</td>
                      <td style={{ color: '#4ade80' }}>${ing.cost_per_unit}</td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-action-edit" onClick={() => handleEditIngredientClick(ing)}>
                            <Edit size={14} />
                          </button>
                          <button className="btn-action-delete" onClick={() => handleDeleteIngredient(ing.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredIngredients.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>No ingredients found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="admin-data-section">
            <div className="section-actions-row">
              <input
                className="admin-search-input"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 'bold' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.is_admin ? (
                          <span className="admin-badge admin-badge-role admin">Admin</span>
                        ) : (
                          <span className="admin-badge admin-badge-role student">User</span>
                        )}
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className={`btn-action-toggle ${u.is_admin ? 'admin' : ''}`}
                            onClick={() => handleToggleUserRole(u)}
                            title="Toggle Admin/User Role"
                          >
                            {u.is_admin ? 'Demote' : 'Promote'}
                          </button>
                          <button className="btn-action-delete" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- CURRENCIES TAB --- */}
        {activeTab === 'currencies' && (
          <div className="admin-data-section">
            <div className="section-actions-row">
              <input
                className="admin-search-input"
                placeholder="Search currencies by code or name..."
                value={currencySearch}
                onChange={e => setCurrencySearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Currency Code</th>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Exchange Rate (per USD)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCurrencies.map(curr => (
                    <tr key={curr.code}>
                      <td style={{ fontWeight: 'bold' }}>{curr.code}</td>
                      <td style={{ fontSize: '1.1rem' }}>{curr.symbol}</td>
                      <td>{curr.name}</td>
                      <td>
                        {editingCurrencyCode === curr.code ? (
                          <input 
                            type="number"
                            step="0.000001"
                            className="admin-input"
                            style={{ width: '120px', padding: '2px 8px', height: '30px' }}
                            value={editingRateValue}
                            onChange={e => setEditingRateValue(e.target.value)}
                          />
                        ) : (
                          <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{curr.exchange_rate}</span>
                        )}
                      </td>
                      <td>
                        {editingCurrencyCode === curr.code ? (
                          <div className="actions-cell">
                            <button className="btn-action-edit" onClick={() => handleSaveRate(curr.code)} title="Save Rate">
                              <Check size={14} color="#10b981" />
                            </button>
                            <button className="btn-action-delete" onClick={() => setEditingCurrencyCode(null)} title="Cancel">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button className="btn-action-edit" onClick={() => handleStartEditRate(curr)} title="Edit Rate">
                            <Edit size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCurrencies.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>No currencies found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- FEEDBACK TAB --- */}
        {activeTab === 'feedback' && (
          <div className="admin-data-section">
            <div className="section-actions-row">
              <input
                className="admin-search-input"
                placeholder="Search feedback content..."
                value={feedbackSearch}
                onChange={e => setFeedbackSearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.map(f => (
                    <tr key={f.id}>
                      <td style={{ width: '220px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold' }}>{f.name}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{f.email}</div>
                      </td>
                      <td style={{ textAlign: 'left', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                        {f.message}
                      </td>
                      <td style={{ width: '150px', fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(f.created_at).toLocaleString()}
                      </td>
                      <td style={{ width: '80px' }}>
                        <button className="btn-action-delete" onClick={() => handleDeleteFeedback(f.id)} title="Delete message">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredFeedback.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af' }}>No feedback submissions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PENDING APPROVALS TAB --- */}
        {activeTab === 'pending' && (
          <div className="admin-data-section">
            <div className="section-actions-row">
              <input
                className="admin-search-input"
                placeholder="Search pending recipes by name, cuisine, or category..."
                value={pendingSearch}
                onChange={e => setPendingSearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Recipe Detail</th>
                    <th>Cuisine & Category</th>
                    <th>Uploaded By</th>
                    <th>Ingredients Needed</th>
                    <th>Instructions Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRecipes
                    .filter(r => 
                      r.name.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                      r.cuisine.toLowerCase().includes(pendingSearch.toLowerCase()) ||
                      r.category.toLowerCase().includes(pendingSearch.toLowerCase())
                    )
                    .map(recipe => (
                      <tr key={recipe.id}>
                        <td style={{ textAlign: 'left', minWidth: '180px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{recipe.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                            {recipe.description}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px' }}>
                            {recipe.cook_time} mins • {recipe.servings} servings • {recipe.difficulty}
                          </div>
                          {recipe.image_url && (
                            <a href={recipe.image_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--emerald)', display: 'block', marginTop: '4px' }}>
                              View Image Link
                            </a>
                          )}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 'bold' }}>{recipe.cuisine}</div>
                          <span className="admin-badge student" style={{ fontSize: '10px' }}>{recipe.category}</span>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                            {recipe.dietary_tags.map(t => t.name).join(', ')}
                          </div>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>
                          {recipe.author}
                        </td>
                        <td style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                            {recipe.ingredients.map(ing => (
                              <li key={ing.id}>
                                {ing.name}: {ing.quantity} {ing.unit}
                              </li>
                            ))}
                          </ul>
                          <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', marginTop: '4px' }}>
                            Est. Cost: ${recipe.total_cost} (${recipe.cost_per_serving}/serving)
                          </div>
                        </td>
                        <td style={{ textAlign: 'left', fontSize: '0.85rem', color: '#9ca3af', maxWidth: '300px' }}>
                          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                            {recipe.instructions.map((step, index) => (
                              <li key={index} style={{ marginBottom: '4px' }}>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              className="btn-action-edit"
                              style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', width: 'auto' }}
                              onClick={() => handleApproveRecipe(recipe.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-action-delete"
                              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', width: 'auto' }}
                              onClick={() => handleRejectRecipe(recipe.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {pendingRecipes.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                        No pending approvals queue. All recipes are currently approved and live!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT RECIPE MODAL --- */}
      {showRecipeModal && (
        <div className="modal-overlay" onClick={() => setShowRecipeModal(false)}>
          <div className="modal-box admin-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRecipeModal(false)}>✕</button>
            <h2 className="modal-title">{recipeModalMode === 'add' ? 'Add New Recipe' : 'Edit Recipe'}</h2>
            <p className="modal-subtitle">Values automatically compute cost values on the database</p>

            <form onSubmit={handleSaveRecipe} className="admin-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Recipe Name *</label>
                  <input
                    className="admin-input"
                    value={recipeForm.name}
                    onChange={e => setRecipeForm({ ...recipeForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="admin-input select"
                    value={recipeForm.category}
                    onChange={e => setRecipeForm({ ...recipeForm, category: e.target.value })}
                    required
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cuisine *</label>
                  <input
                    className="admin-input"
                    value={recipeForm.cuisine}
                    onChange={e => setRecipeForm({ ...recipeForm, cuisine: e.target.value })}
                    required
                    placeholder="e.g. Italian, Asian"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty *</label>
                  <select
                    className="admin-input select"
                    value={recipeForm.difficulty}
                    onChange={e => setRecipeForm({ ...recipeForm, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cook Time (min) *</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={recipeForm.cook_time}
                    onChange={e => setRecipeForm({ ...recipeForm, cook_time: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Servings *</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={recipeForm.servings}
                    onChange={e => setRecipeForm({ ...recipeForm, servings: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div className="form-group" style={{ justifyContent: 'center' }}>
                  <label className="form-checkbox-label" style={{ marginTop: '1.75rem' }}>
                    <input
                      type="checkbox"
                      checked={recipeForm.is_student_pick}
                      onChange={e => setRecipeForm({ ...recipeForm, is_student_pick: e.target.checked })}
                    />
                    <span>Master Selection</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="admin-input"
                  style={{ height: '70px', resize: 'vertical' }}
                  value={recipeForm.description}
                  onChange={e => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="admin-input"
                  placeholder="https://images.unsplash.com/..."
                  value={recipeForm.image_url}
                  onChange={e => setRecipeForm({ ...recipeForm, image_url: e.target.value })}
                />
              </div>

              {/* Dietary Tags */}
              <div className="form-group">
                <label className="form-label">Dietary Tags</label>
                <div className="tags-checkbox-grid">
                  {DIETARY_CHOICES.map(tag => (
                    <label key={tag} className="tag-checkbox-item">
                      <input
                        type="checkbox"
                        checked={recipeForm.dietary_tags.includes(tag)}
                        onChange={() => handleDietaryTagToggle(tag)}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ingredients List */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Recipe Ingredients *</label>
                  <button type="button" className="btn-add-ingredient-row" onClick={handleAddRecipeIngredientRow}>
                    + Add Ingredient Row
                  </button>
                </div>

                <div className="form-ingredients-rows" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {recipeForm.ingredients.map((row, idx) => {
                    const selectedIng = ingredients.find(i => i.id == row.id)
                    return (
                      <div key={idx} className="ingredient-row">
                        <select
                          className="admin-input select"
                          style={{ flex: 2 }}
                          value={row.id}
                          onChange={e => handleRecipeIngredientChange(idx, 'id', e.target.value)}
                        >
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.unit}) — ${ing.cost_per_unit}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          className="admin-input"
                          style={{ flex: 1 }}
                          placeholder="Quantity"
                          value={row.quantity}
                          onChange={e => handleRecipeIngredientChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                        <span className="unit-label" style={{ width: '40px' }}>{selectedIng?.unit || ''}</span>
                        <button type="button" className="btn-remove-row" onClick={() => handleRemoveRecipeIngredientRow(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    )
                  })}
                  {recipeForm.ingredients.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '10px' }}>No ingredients added yet. Please add at least one row.</p>
                  )}
                </div>
              </div>

              {/* Recipe Steps/Instructions */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Cooking Instructions (Steps) *</label>
                  <button type="button" className="btn-add-ingredient-row" onClick={handleAddRecipeStep}>
                    + Add Step
                  </button>
                </div>
                <div className="form-ingredients-rows" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {recipeForm.instructions?.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981', minWidth: '24px' }}>
                        #{idx + 1}
                      </span>
                      <input
                        className="admin-input"
                        placeholder={`Step ${idx + 1} instructions...`}
                        value={step}
                        onChange={e => handleRecipeStepChange(idx, e.target.value)}
                        required
                      />
                      <button type="button" className="btn-remove-row" onClick={() => handleRemoveRecipeStep(idx)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {(!recipeForm.instructions || recipeForm.instructions.length === 0) && (
                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', padding: '10px' }}>No steps added yet.</p>
                  )}
                </div>
              </div>

              <div className="form-actions-row" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowRecipeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {recipeModalMode === 'add' ? 'Create Recipe' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT INGREDIENT MODAL --- */}
      {showIngredientModal && (
        <div className="modal-overlay" onClick={() => setShowIngredientModal(false)}>
          <div className="modal-box admin-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowIngredientModal(false)}>✕</button>
            <h2 className="modal-title">{ingredientModalMode === 'add' ? 'Add Ingredient' : 'Edit Ingredient'}</h2>
            <p className="modal-subtitle">Configures baseline ingredient costs for recipes</p>

            <form onSubmit={handleSaveIngredient} className="admin-form">
              <div className="form-group">
                <label className="form-label">Ingredient Name *</label>
                <input
                  className="admin-input"
                  value={ingredientForm.name}
                  onChange={e => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Measurement Unit *</label>
                <input
                  className="admin-input"
                  placeholder="e.g. g, ml, piece, tbsp"
                  value={ingredientForm.unit}
                  onChange={e => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost per Unit (USD) *</label>
                <input
                  type="number"
                  step="0.0001"
                  className="admin-input"
                  value={ingredientForm.cost_per_unit}
                  onChange={e => setIngredientForm({ ...ingredientForm, cost_per_unit: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-actions-row">
                <button type="button" className="btn-secondary" onClick={() => setShowIngredientModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {ingredientModalMode === 'add' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
