import { useState, useEffect } from 'react'
import api from '../api/client'
import { Check, AlertCircle, Sparkles, Plus, Trash2 } from 'lucide-react'

export default function SubmitRecipeModal({ onClose }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    cuisine: '',
    category: 'Breakfast',
    difficulty: 'Easy',
    cook_time: 15,
    servings: 2,
    image_url: '',
    dietary_tags: '',
  })

  const [ingredientsList, setIngredientsList] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([
    { id: '', quantity: '' }
  ])
  const [instructions, setInstructions] = useState([''])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const res = await api.get('/ingredients')
        setIngredientsList(res.data)
      } catch (err) {
        console.error('Failed to load ingredients list', err)
      }
    }
    loadIngredients()
  }, [])

  const handleTextChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddIngredientRow = () => {
    setSelectedIngredients([...selectedIngredients, { id: '', quantity: '' }])
  }

  const handleRemoveIngredientRow = idx => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== idx))
  }

  const handleIngredientChange = (idx, field, value) => {
    const updated = selectedIngredients.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value }
      }
      return item
    })
    setSelectedIngredients(updated)
  }

  const handleAddInstructionStep = () => {
    setInstructions([...instructions, ''])
  }

  const handleRemoveInstructionStep = idx => {
    setInstructions(instructions.filter((_, i) => i !== idx))
  }

  const handleInstructionChange = (idx, value) => {
    const updated = instructions.map((step, i) => (i === idx ? value : step))
    setInstructions(updated)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate ingredients
    const validIngredients = selectedIngredients.filter(ing => ing.id && ing.quantity > 0)
    if (validIngredients.length === 0) {
      setError('Please add at least one valid ingredient with quantity.')
      setLoading(false)
      return
    }

    // Validate instructions
    const validInstructions = instructions.filter(step => step.trim())
    if (validInstructions.length === 0) {
      setError('Please add at least one instruction step.')
      setLoading(false)
      return
    }

    // Parse dietary tags
    const tagsArray = form.dietary_tags
      ? form.dietary_tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    try {
      const payload = {
        name: form.name,
        description: form.description,
        cuisine: form.cuisine,
        category: form.category,
        difficulty: form.difficulty,
        cook_time: parseInt(form.cook_time),
        servings: parseInt(form.servings),
        image_url: form.image_url || null,
        dietary_tags: tagsArray,
        ingredients: validIngredients.map(ing => ({
          id: parseInt(ing.id),
          quantity: parseFloat(ing.quantity)
        })),
        instructions: validInstructions
      }

      await api.post('/user/recipes', payload)
      setSuccess('Recipe submitted successfully! It is pending administrator approval.')
      
      // Reset form
      setForm({
        name: '',
        description: '',
        cuisine: '',
        category: 'Breakfast',
        difficulty: 'Easy',
        cook_time: 15,
        servings: 2,
        image_url: '',
        dietary_tags: '',
      })
      setSelectedIngredients([{ id: '', quantity: '' }])
      setInstructions([''])

      // Close modal after delay
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit recipe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box submit-recipe-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
          <Sparkles size={20} color="var(--emerald)" /> Share Your Recipe
        </h2>
        <p className="modal-subtitle">Submit your cheap & delicious meal for approval</p>

        {success && <div className="admin-alert success" style={{ marginBottom: '1.5rem' }}><Check size={16} /> {success}</div>}
        {error && <div className="admin-alert error" style={{ marginBottom: '1.5rem' }}><AlertCircle size={16} /> {error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Recipe Name</label>
            <input
              name="name"
              className="admin-input"
              placeholder="e.g. Garlic Egg Fried Rice"
              value={form.name}
              onChange={handleTextChange}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Cuisine Type</label>
              <input
                name="cuisine"
                className="admin-input"
                placeholder="e.g. Asian, Italian, Mexican"
                value={form.cuisine}
                onChange={handleTextChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select name="category" className="admin-input" value={form.category} onChange={handleTextChange}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Cook Time (mins)</label>
              <input
                name="cook_time"
                type="number"
                min="1"
                className="admin-input"
                value={form.cook_time}
                onChange={handleTextChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Servings</label>
              <input
                name="servings"
                type="number"
                min="1"
                className="admin-input"
                value={form.servings}
                onChange={handleTextChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select name="difficulty" className="admin-input" value={form.difficulty} onChange={handleTextChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="admin-input"
              placeholder="Give a brief description, total estimate budget, or highlights of this meal..."
              rows={3}
              value={form.description}
              onChange={handleTextChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Recipe Image URL (Optional)</label>
            <input
              name="image_url"
              className="admin-input"
              placeholder="e.g. https://images.unsplash.com/... (or leave blank for default image)"
              value={form.image_url}
              onChange={handleTextChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dietary Tags (Optional, comma-separated)</label>
            <input
              name="dietary_tags"
              className="admin-input"
              placeholder="e.g. Vegetarian, Gluten-Free, High-Protein"
              value={form.dietary_tags}
              onChange={handleTextChange}
            />
          </div>

          <div className="form-divider" style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

          {/* Ingredients Section */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Ingredients Required</span>
              <button type="button" className="btn-secondary" onClick={handleAddIngredientRow} style={{ width: 'auto', padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={12} /> Add Ingredient
              </button>
            </label>

            <div className="form-ingredients-rows" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedIngredients.map((item, idx) => {
                const selectedIng = ingredientsList.find(i => i.id === parseInt(item.id))
                const unit = selectedIng ? selectedIng.unit : ''
                return (
                  <div key={idx} className="ingredient-row" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                      className="admin-input"
                      style={{ flex: 2 }}
                      value={item.id}
                      onChange={e => handleIngredientChange(idx, 'id', e.target.value)}
                      required
                    >
                      <option value="">-- Select Ingredient --</option>
                      {ingredientsList.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      className="admin-input"
                      style={{ flex: 1 }}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                      required
                    />

                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '40px' }}>{unit}</span>

                    <button
                      type="button"
                      onClick={() => handleRemoveIngredientRow(idx)}
                      disabled={selectedIngredients.length === 1}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="form-divider" style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

          {/* Instructions Steps Section */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Cooking Steps</span>
              <button type="button" className="btn-secondary" onClick={handleAddInstructionStep} style={{ width: 'auto', padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={12} /> Add Step
              </button>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {instructions.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ background: 'var(--emerald-light)', color: 'var(--emerald)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 'bold', marginTop: '6px' }}>
                    {idx + 1}
                  </span>
                  
                  <textarea
                    className="admin-input"
                    style={{ flex: 1 }}
                    placeholder={`Step ${idx + 1} instructions...`}
                    rows={2}
                    value={step}
                    onChange={e => handleInstructionChange(idx, e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveInstructionStep(idx)}
                    disabled={instructions.length === 1}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', padding: '4px', marginTop: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions-row" style={{ marginTop: '2rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting Recipe...' : 'Submit Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
