import { useState, useRef, useEffect } from 'react'
import { Bot, Send, ChefHat, AlertCircle, Clock, Users, Check, ShoppingCart, ChevronDown, ChevronUp, Coins, Lightbulb } from 'lucide-react'
import api from '../api/client'

const SUGGESTIONS = [
  'What can I make with eggs and rice?',
  'Give me a cheap pasta recipe under $2',
  'What are easy vegan meals for students?',
  'How do I make chickpea curry?',
  'What ingredients should I buy on a $20 weekly budget?',
]

const SYSTEM_PROMPT = `You are Vellum, an intelligent gastronomy and kitchen optimization assistant.
You MUST respond with a JSON object. Do not output anything else.
JSON Schema:
{
  "message": "Brief, friendly conversational message/answer to the user.",
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Short budget-friendly description",
      "cookTime": "15 mins",
      "servings": 2,
      "costPerServing": 0.60,
      "ingredients": [
        {"name": "rice", "quantity": "200", "unit": "g", "cost": 0.40},
        {"name": "eggs", "quantity": "2", "unit": "pcs", "cost": 0.60}
      ],
      "instructions": [
        "Boil rice...",
        "Scramble eggs..."
      ]
    }
  ],
  "tips": [
    "Budget tip 1...",
    "Budget tip 2..."
  ]
}
If the user is just saying hello or asking a general question (not asking for a recipe), leave the "recipes" array empty.`

const LOCAL_RECIPES = [
  {
    name: "Garlic Egg Fried Rice",
    description: "A quick, savory garlic fried rice tossed with scrambled eggs. Ultimate budget comfort food.",
    cookTime: "15 mins",
    servings: 2,
    costPerServing: 0.60,
    ingredients: [
      { name: "white rice (cooked)", quantity: "300", unit: "g", cost: 0.30 },
      { name: "eggs", quantity: "3", unit: "pcs", cost: 0.60 },
      { name: "garlic cloves", quantity: "4", unit: "pcs", cost: 0.15 },
      { name: "soy sauce & oil", quantity: "2", unit: "tbsp", cost: 0.15 }
    ],
    instructions: [
      "Heat oil in a pan and sauté minced garlic until fragrant and golden.",
      "Add cooked rice, breaking up any clumps, and stir-fry for 3-4 minutes.",
      "Push rice to the side, crack eggs into the empty space, and scramble them until cooked.",
      "Toss the rice and eggs together, season with soy sauce, and serve hot."
    ]
  },
  {
    name: "Creamy Tomato Pasta",
    description: "Rich tomato pasta made with simple pantry ingredients. Satin-smooth and satisfying.",
    cookTime: "20 mins",
    servings: 2,
    costPerServing: 0.85,
    ingredients: [
      { name: "pasta (spaghetti/penne)", quantity: "200", unit: "g", cost: 0.40 },
      { name: "canned crushed tomatoes", quantity: "1", unit: "can", cost: 0.80 },
      { name: "garlic cloves", quantity: "3", unit: "pcs", cost: 0.10 },
      { name: "olive oil & dried herbs", quantity: "2", unit: "tbsp", cost: 0.40 }
    ],
    instructions: [
      "Cook pasta in salted boiling water according to package instructions.",
      "Meanwhile, sizzle sliced garlic in olive oil in a pan, then pour in crushed tomatoes and dried herbs.",
      "Simmer the sauce on medium-low heat for 10 minutes until thickened.",
      "Drain pasta, toss it directly into the sauce, and mix well before serving."
    ]
  },
  {
    name: "Spiced Chickpea Curry",
    description: "Hearty, protein-packed chickpea curry simmered in a warm blend of spices.",
    cookTime: "25 mins",
    servings: 3,
    costPerServing: 0.90,
    ingredients: [
      { name: "canned chickpeas (drained)", quantity: "2", unit: "cans", cost: 1.50 },
      { name: "canned diced tomatoes", quantity: "1", unit: "can", cost: 0.80 },
      { name: "onion (chopped)", quantity: "1", unit: "pc", cost: 0.20 },
      { name: "curry powder & garlic", quantity: "1.5", unit: "tbsp", cost: 0.20 }
    ],
    instructions: [
      "Sauté chopped onions and garlic in a pot until soft and translucent.",
      "Add curry powder and toast for 1 minute until highly aromatic.",
      "Add drained chickpeas and diced tomatoes (with juices). Stir to combine.",
      "Simmer on low heat for 15 minutes, mashing a few chickpeas to thicken the gravy. Serve with rice or bread."
    ]
  },
  {
    name: "Classic Potato & Onion Frittata",
    description: "A thick, golden Italian-style omelette filled with tender potatoes and sweet caramelized onions.",
    cookTime: "25 mins",
    servings: 2,
    costPerServing: 0.70,
    ingredients: [
      { name: "potatoes (sliced thin)", quantity: "2", unit: "pcs", cost: 0.40 },
      { name: "eggs", quantity: "4", unit: "pcs", cost: 0.80 },
      { name: "onion (sliced)", quantity: "1", unit: "pc", cost: 0.20 },
      { name: "cooking oil & salt", quantity: "2", unit: "tbsp", cost: 0.20 }
    ],
    instructions: [
      "Pan-fry thin potato slices and onion in oil until tender and lightly browned.",
      "Whisk eggs in a bowl with a pinch of salt and pepper, then pour over the potatoes in the pan.",
      "Cook on medium-low heat until the edges set, then carefully flip or broil the top until fully cooked.",
      "Slice into wedges and serve warm or at room temperature."
    ]
  },
  {
    name: "Savory Oatmeal",
    description: "A savory twist on classic oats, topped with soy sauce, sesame oil, and a fried egg.",
    cookTime: "10 mins",
    servings: 1,
    costPerServing: 0.55,
    ingredients: [
      { name: "rolled oats", quantity: "50", unit: "g", cost: 0.15 },
      { name: "egg", quantity: "1", unit: "pc", cost: 0.20 },
      { name: "green onion & soy sauce", quantity: "1", unit: "stalk", cost: 0.20 }
    ],
    instructions: [
      "Cook oats in water or vegetable broth on the stove for 5 minutes until creamy.",
      "Fry an egg in a separate pan to your desired doneness (sunny-side up recommended).",
      "Transfer oats to a bowl, stir in a splash of soy sauce and sesame oil.",
      "Top with the fried egg, chopped green onions, and optional chili flakes."
    ]
  }
];

function getLocalChefResponse(userPrompt) {
  const query = (userPrompt || '').toLowerCase();
  const matchedRecipes = [];
  
  if (query.includes('rice') || query.includes('egg') || query.includes('garlic')) {
    matchedRecipes.push(LOCAL_RECIPES[0]);
  }
  if (query.includes('pasta') || query.includes('tomato') || query.includes('spaghetti') || query.includes('penne')) {
    matchedRecipes.push(LOCAL_RECIPES[1]);
  }
  if (query.includes('curry') || query.includes('chickpea') || query.includes('spice') || query.includes('garam')) {
    matchedRecipes.push(LOCAL_RECIPES[2]);
  }
  if (query.includes('potato') || query.includes('frittata') || query.includes('omelet') || query.includes('onion')) {
    matchedRecipes.push(LOCAL_RECIPES[3]);
  }
  if (query.includes('oat') || query.includes('porridge') || query.includes('breakfast')) {
    matchedRecipes.push(LOCAL_RECIPES[4]);
  }

  if (matchedRecipes.length === 0) {
    if (query.includes('vegan') || query.includes('vegetarian')) {
      matchedRecipes.push(LOCAL_RECIPES[2]);
    } else {
      matchedRecipes.push(LOCAL_RECIPES[0]);
      matchedRecipes.push(LOCAL_RECIPES[1]);
    }
  }

  let message = "I am currently running in Offline Mode because our AI server is experiencing heavy demand. Here are some excellent, budget-friendly recipes matching your query:";
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    message = "Hello! Our primary AI server is currently resting, but I am Vellum's offline assistant. I can help you with some delicious, quick, and budget-friendly recipes. What ingredients do you have today?";
    return JSON.stringify({
      message: message,
      recipes: [],
      tips: [
        "Store grains and beans in airtight containers to make them last longer.",
        "Buy eggs in bulk; they are the most versatile and cost-effective protein source.",
        "Plan your meals weekly to reduce food waste and save up to 30% on groceries."
      ]
    });
  }

  return JSON.stringify({
    message: message,
    recipes: matchedRecipes,
    tips: [
      "Buy canned tomatoes and dried pasta in bulk to save significantly.",
      "Keep garlic and onions on hand; they are inexpensive flavor bases for almost any meal.",
      "Repurpose leftover cooked rice for stir-fries; cold rice works best!"
    ]
  });
}

async function callAI(conversation) {
  const lastUserMsgObj = [...conversation].reverse().find(m => m.role === 'user');
  const lastUserMsg = lastUserMsgObj ? lastUserMsgObj.content : '';

  try {
    const res = await api.post('/chat', { messages: conversation })
    if (res.data && res.data.reply) {
      return res.data.reply
    }
    throw new Error('Empty response from chatbot backend')
  } catch (err) {
    console.warn('Backend chat failed, falling back to client-side AI request:', err.message)
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation,
          model: 'openai',
          private: true
        })
      })

      if (!response.ok) {
        throw new Error(`Client-side fallback failed with status ${response.status}`)
      }

      let text = await response.text()
      text = text.replace(/⚠️\s*\*?IMPORTANT NOTICE\*?[\s\S]*?work normally\./gi, '')
      text = text.replace(/The Pollinations legacy text API[\s\S]*?work normally\./gi, '')
      text = text.trim()

      if (text) {
        return text
      }
      throw new Error('Empty text from fallback AI')
    } catch (fallbackErr) {
      console.warn('Client-side fallback also failed, running local gastronomy engine:', fallbackErr)
      return getLocalChefResponse(lastUserMsg)
    }
  }
}

function tryParseJSON(text) {
  if (!text) return null
  const cleaned = text.trim()
  if (!cleaned.startsWith('{') && !cleaned.includes('{')) return null

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    try {
      const match = cleaned.match(/```json\s*([\s\S]*?)\s*```/)
      if (match && match[1]) {
        return JSON.parse(match[1].trim())
      }
    } catch (err) {}

    try {
      const start = cleaned.indexOf('{')
      const end = cleaned.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(cleaned.substring(start, end + 1))
      }
    } catch (err) {}
  }
  return null
}

function BotRecipeCard({ recipe }) {
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddIngredients = async (e) => {
    e.stopPropagation() // Prevent header click collapsing card
    if (added || adding) return
    setAdding(true)
    try {
      for (const ing of recipe.ingredients) {
        const parsedQty = parseFloat(ing.quantity) || 1.0
        await api.post('/shopping-list', {
          name: ing.name,
          quantity: parsedQty,
          unit: ing.unit || 'pcs'
        })
      }
      setAdded(true)
    } catch (err) {
      console.error('Failed to add ingredients:', err)
      alert('Please sign in to add ingredients to your shopping list.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="bot-recipe-card">
      <div className="bot-recipe-header" onClick={() => setExpanded(!expanded)}>
        <div className="bot-recipe-title-row">
          <h4 className="bot-recipe-title">{recipe.name}</h4>
          <span className="bot-recipe-cost" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Coins size={13} /> {recipe.costPerServing ? `$${parseFloat(recipe.costPerServing).toFixed(2)}/serv` : 'Budget'}
          </span>
        </div>
        {recipe.description && <p className="bot-recipe-desc">{recipe.description}</p>}
        
        <div className="bot-recipe-meta">
          <span className="bot-meta-item"><Clock size={13} /> {recipe.cookTime || '15 mins'}</span>
          <span className="bot-meta-item"><Users size={13} /> {recipe.servings || 2} serv</span>
          <span className="bot-recipe-expand">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="bot-recipe-details">
          <div className="bot-details-section">
            <h5 className="bot-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingCart size={14} /> Ingredients Breakdown
            </h5>
            <ul className="bot-ingredients-list">
              {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                <li key={i} className="bot-ingredient-item">
                  <span className="bot-ing-name">{ing.name}</span>
                  <span className="bot-ing-qty">{ing.quantity} {ing.unit || ''}</span>
                  {ing.cost && <span className="bot-ing-cost">${parseFloat(ing.cost).toFixed(2)}</span>}
                </li>
              ))}
            </ul>
          </div>

          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="bot-details-section">
              <h5 className="bot-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ChefHat size={14} /> Steps
              </h5>
              <ol className="bot-steps-list">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="bot-step-item">{step}</li>
                ))}
              </ol>
            </div>
          )}

          <button 
            className={`btn-bot-add-list ${added ? 'added' : ''}`}
            onClick={handleAddIngredients}
            disabled={adding}
          >
            {adding ? (
              <span>Adding...</span>
            ) : added ? (
              <>
                <Check size={14} /> Added to Shopping List!
              </>
            ) : (
              <>
                <ShoppingCart size={14} /> Add all to Shopping List
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ChefBotPage() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello. Welcome to Vellum.\n\nConsider me your personal guide to a more refined kitchen. Whether you are looking for a moment of inspiration or a perfectly curated recipe, I am here to ensure your culinary journey is effortless. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    const conversation = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.filter(m => m.role !== 'error').map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user', content: m.text
      })),
      { role: 'user', content: text }
    ]

    try {
      const reply = await callAI(conversation)
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', text: err.message }])
    }
    setLoading(false)
  }

  const renderBubbleContent = (msg) => {
    if (msg.role === 'error') {
      return (
        <div className="bubble-text error-bubble" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <AlertCircle size={14} /> {msg.text}
        </div>
      )
    }
    if (msg.role === 'user') {
      return <div className="bubble-text">{msg.text}</div>
    }

    // Custom luxury welcome card for bot greeting
    if (msg.role === 'bot' && msg.text.startsWith("Hello. Welcome to Vellum.")) {
      return (
        <div className="bubble-text luxury-welcome-card">
          <div className="welcome-card-brand">Vellum</div>
          <div className="welcome-card-subtitle font-serif">Your Curated Culinary Sommelier</div>
          <div className="welcome-card-divider"></div>
          <p className="welcome-card-body">
            Consider me your personal guide to a more refined kitchen. Whether you are looking for a moment of inspiration or a perfectly curated recipe, I am here to ensure your culinary journey is effortless.
          </p>
          <div className="welcome-card-footer">How can I help you today?</div>
        </div>
      )
    }

    // Try parsing bot responses as JSON
    const parsed = tryParseJSON(msg.text)
    if (parsed) {
      return (
        <div className="bubble-text parsed-json">
          {parsed.message && <p className="parsed-message">{parsed.message}</p>}
          
          {parsed.recipes && parsed.recipes.length > 0 && (
            <div className="parsed-recipes">
              {parsed.recipes.map((recipe, idx) => (
                <BotRecipeCard key={idx} recipe={recipe} />
              ))}
            </div>
          )}

          {parsed.tips && parsed.tips.length > 0 && (
            <div className="parsed-tips">
              <div className="tips-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={14} /> Smart Budget Tips
              </div>
              <ul>
                {parsed.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    }

    return <div className="bubble-text">{msg.text}</div>
  }

  return (
    <div className="page-container chef-bot-page">
      <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
        <div className="logo-emblem-container" style={{ filter: 'drop-shadow(0 0 6px var(--emerald-glow))' }}>
          <img src="/logo.png?v=2" className="logo-emblem-img" alt="Vellum Logo" />
        </div>
        <div>
          <h1 className="page-title font-serif letter-spacing-wide" style={{ margin: 0, fontWeight: 500 }}>Vellum Chef Bot</h1>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>Intelligent Gastronomy. Meticulously Planned.</p>
        </div>
      </div>

      <div className="expert-chat-container">
        <div className="chat-messages" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`expert-chat-bubble ${msg.role}`}>
              {msg.role === 'bot' && (
                <div className="bot-avatar">
                  <ChefHat size={18} color="#fff" />
                </div>
              )}
              {msg.role === 'error' && (
                <div className="bot-avatar error-avatar">
                  <AlertCircle size={18} color="#fff" />
                </div>
              )}
              {renderBubbleContent(msg)}
            </div>
          ))}
          {loading && (
            <div className="expert-chat-bubble bot">
              <div className="bot-avatar">
                <ChefHat size={18} color="#fff" />
              </div>
              <div className="bubble-text typing"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-suggestions" style={{ justifyContent: 'center' }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
          ))}
        </div>

        <div className="chat-input-row">
          <input className="expert-input" placeholder="Ask Vellum anything..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()} />
          <button 
            className="btn-send-luxury" 
            onClick={() => sendMessage()} 
            disabled={loading}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
