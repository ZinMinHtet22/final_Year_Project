import { useState, useRef, useEffect } from 'react'
import { Bot, Send, ChefHat, AlertCircle, Clock, Users, Check, ShoppingCart, ChevronDown, ChevronUp, Coins, Lightbulb, X, MessageSquare } from 'lucide-react'
import api from '../api/client'

const SUGGESTIONS = [
  'What can I make with eggs and rice?',
  'Pasta recipe under $2',
  'Easy vegan student meals',
  'How to make chickpea curry',
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

function TypewriterText({ text, speed = 10, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const timerRef = useRef()

  useEffect(() => {
    setDisplayedText('')
    if (timerRef.current) clearInterval(timerRef.current)

    if (!text) {
      if (onComplete) onComplete()
      return
    }

    let currentIndex = 0
    timerRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        const nextChar = text.charAt(currentIndex)
        setDisplayedText(prev => prev + nextChar)
        currentIndex += 1
      } else {
        clearInterval(timerRef.current)
        if (onComplete) onComplete()
      }
    }, speed)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [text, speed])

  return <span>{displayedText}</span>
}

function ChatBubbleContent({ msg, onScroll }) {
  const [typingComplete, setTypingComplete] = useState(false)

  useEffect(() => {
    if (typingComplete && onScroll) {
      onScroll()
    }
  }, [typingComplete])

  if (msg.role === 'error') {
    return (
      <div className="bubble-text error-bubble" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 14px', fontSize: '0.8rem' }}>
        <AlertCircle size={12} /> {msg.text}
      </div>
    )
  }
  if (msg.role === 'user') {
    return <div className="bubble-text" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>{msg.text}</div>
  }

  const parsed = tryParseJSON(msg.text)
  if (parsed) {
    return (
      <div className="bubble-text parsed-json" style={{ padding: '10px 14px', fontSize: '0.82rem', width: '100%' }}>
        {parsed.message && (
          <p className="parsed-message" style={{ fontSize: '0.82rem', margin: 0 }}>
            <TypewriterText text={parsed.message} onComplete={() => setTypingComplete(true)} />
          </p>
        )}
        
        <div style={{
          maxHeight: typingComplete ? '1000px' : '0px',
          opacity: typingComplete ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'max-height, opacity'
        }}>
          {parsed.recipes && parsed.recipes.length > 0 && (
            <div className="parsed-recipes" style={{ marginTop: '12px' }}>
              {parsed.recipes.map((recipe, idx) => (
                <WidgetBotRecipeCard key={idx} recipe={recipe} />
              ))}
            </div>
          )}

          {parsed.tips && parsed.tips.length > 0 && (
            <div className="parsed-tips" style={{ padding: '10px', marginTop: '12px', background: 'var(--bg-neutral)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div className="tips-title" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--emerald)', marginBottom: '6px' }}>
                <Lightbulb size={12} /> Budget Tips
              </div>
              <ul style={{ paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {parsed.tips.map((tip, idx) => (
                  <li key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bubble-text" style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
      <TypewriterText text={msg.text} onComplete={() => setTypingComplete(true)} />
    </div>
  )
}

function WidgetBotRecipeCard({ recipe }) {
  const [expanded, setExpanded] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddIngredients = async (e) => {
    e.stopPropagation()
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
    <div className="bot-recipe-card" style={{ margin: '4px 0' }}>
      <div className="bot-recipe-header" onClick={() => setExpanded(!expanded)} style={{ padding: '10px' }}>
        <div className="bot-recipe-title-row">
          <h4 className="bot-recipe-title" style={{ fontSize: '0.85rem' }}>{recipe.name}</h4>
          <span className="bot-recipe-cost" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '1px 6px' }}>
            <Coins size={11} /> {recipe.costPerServing ? `$${parseFloat(recipe.costPerServing).toFixed(2)}/serv` : 'Budget'}
          </span>
        </div>
        <div className="bot-recipe-meta" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
          <span className="bot-meta-item"><Clock size={11} /> {recipe.cookTime || '15 mins'}</span>
          <span className="bot-meta-item"><Users size={11} /> {recipe.servings || 2} serv</span>
          <span className="bot-recipe-expand" style={{ marginLeft: 'auto' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="bot-recipe-details" style={{ padding: '10px', fontSize: '0.78rem' }}>
          <div className="bot-details-section">
            <h5 className="bot-section-title" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShoppingCart size={12} /> Ingredients
            </h5>
            <ul className="bot-ingredients-list" style={{ gap: '2px' }}>
              {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                <li key={i} className="bot-ingredient-item" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                  <span className="bot-ing-name">{ing.name}</span>
                  <span className="bot-ing-qty">{ing.quantity} {ing.unit || ''}</span>
                  {ing.cost && <span className="bot-ing-cost">${parseFloat(ing.cost).toFixed(2)}</span>}
                </li>
              ))}
            </ul>
          </div>

          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="bot-details-section">
              <h5 className="bot-section-title" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ChefHat size={12} /> Steps
              </h5>
              <ol className="bot-steps-list" style={{ paddingLeft: '12px' }}>
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="bot-step-item" style={{ fontSize: '0.75rem' }}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          <button 
            className={`btn-bot-add-list ${added ? 'added' : ''}`}
            onClick={handleAddIngredients}
            disabled={adding}
            style={{ padding: '8px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
          >
            {adding ? (
              <span>Adding...</span>
            ) : added ? (
              <>
                <Check size={12} /> Added!
              </>
            ) : (
              <>
                <ShoppingCart size={12} /> Add to Shopping List
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ChefBotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello. Welcome to Vellum.\n\nConsider me your personal guide to a more refined kitchen. Whether you are looking for a moment of inspiration or a perfectly curated recipe, I am here to ensure your culinary journey is effortless. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { 
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) 
    }
  }, [messages, isOpen])

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

  // renderBubbleContent removed in favor of ChatBubbleContent component

  return (
    <div className="chef-bot-widget-container" style={{ position: 'fixed', bottom: '92px', right: '24px', zIndex: 9999 }}>
      {/* Floating Button */}
      <button 
        className={`btn-chef-bot-floating ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Vellum"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--emerald), var(--emerald-hover))',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px var(--emerald-glow)',
          transition: 'all 0.25s ease'
        }}
      >
        {isOpen ? <X size={20} /> : <Bot size={20} />}
      </button>

      {/* Collapsible Chat Window */}
      {isOpen && (
        <div 
          className="widget-chat-window" 
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '0',
            width: '350px',
            height: '480px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'modalGlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Header */}
          <div 
            className="widget-chat-header" 
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-neutral)'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ChefHat size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', textAlign: 'left' }}>Vellum Assistant</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }}></span>
                Online
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div 
            className="chat-messages" 
            style={{
              flex: 1,
              height: 'auto',
              padding: '12px 16px',
              gap: '10px',
              overflowY: 'auto'
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`} style={{ maxWidth: '90%', gap: '8px' }}>
                {msg.role === 'bot' && (
                  <div className="bot-avatar" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>
                    <ChefHat size={14} color="#fff" />
                  </div>
                )}
                {msg.role === 'error' && (
                  <div className="bot-avatar error-avatar" style={{ width: '28px', height: '28px' }}>
                    <AlertCircle size={14} color="#fff" />
                  </div>
                )}
                <ChatBubbleContent msg={msg} onScroll={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })} />
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot" style={{ gap: '8px' }}>
                <div className="bot-avatar" style={{ width: '28px', height: '28px' }}>
                  <ChefHat size={14} color="#fff" />
                </div>
                <div className="bubble-text typing" style={{ padding: '10px 14px' }}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div 
            className="chat-suggestions" 
            style={{
              padding: '8px 12px',
              gap: '4px',
              background: 'var(--bg-neutral)',
              maxHeight: '80px',
              overflowY: 'auto'
            }}
          >
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i} 
                className="suggestion-chip" 
                onClick={() => sendMessage(s)}
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.72rem', 
                  borderRadius: '12px',
                  animationDelay: `${(i + 1) * 80}ms`
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div 
            className="chat-input-row" 
            style={{
              padding: '10px 12px',
              gap: '8px',
              background: 'var(--bg-card)'
            }}
          >
            <input 
              className="chat-input" 
              placeholder="Ask Vellum..."
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            />
            <button 
              className="btn-send" 
              onClick={() => sendMessage()} 
              disabled={loading}
              style={{ width: '36px', height: '36px' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
