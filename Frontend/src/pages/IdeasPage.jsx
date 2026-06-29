import { Lightbulb, Bot, Mic, ShieldAlert, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react'

export default function IdeasPage() {
  const roadmapItems = [
    {
      title: 'AI Chatbot Chef Assistant',
      description: 'An intelligent companion (prototype live under Chef Bot) capable of recognizing food ingredients from photos of students\' fridges, offering custom substitutions, and guiding them step-by-step through preparation.',
      status: 'Prototype Live',
      progress: 60,
      icon: <Bot size={24} color="#10b981" />,
      colorClass: 'green'
    },
    {
      title: 'Voice Search & Navigation',
      description: 'Hands-free voice recognition allowing students to search for recipes, toggle ingredients, and scroll through instructions using voice commands—preventing messy screens while cooking.',
      status: 'Planned',
      progress: 10,
      icon: <Mic size={24} color="#3b82f6" />,
      colorClass: 'blue'
    },
    {
      title: 'Nutrition Tracking Integration',
      description: 'Complete macronutrient and caloric tracker showing protein, carbohydrate, and fat metrics dynamically relative to the student\'s daily dietary caps and fitness targets.',
      status: 'In Development',
      progress: 40,
      icon: <ShieldAlert size={24} color="#a855f7" />,
      colorClass: 'purple'
    },
    {
      title: 'Native Mobile App version',
      description: 'A cross-platform React Native app for iOS and Android, allowing students to access shopping lists offline, sync planners with Google Calendar, and use lock-screen interactive timers.',
      status: 'Planned',
      progress: 5,
      icon: <Smartphone size={24} color="#ec4899" />,
      colorClass: 'pink'
    },
    {
      title: 'AI Meal Recommendations',
      description: 'An advanced recommendation engine utilizing machine learning to curate weekly menu options based on local grocery flyers discounts, past rating metrics, and custom spending caps.',
      status: 'In Development',
      progress: 35,
      icon: <Sparkles size={24} color="#eab308" />,
      colorClass: 'yellow'
    }
  ]

  return (
    <div className="page-container ideas-page" style={{ textAlign: 'left' }}>
      <div className="page-header" style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Lightbulb size={24} color="#eab308" style={{ filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))' }} />
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Project Roadmap & Future Ideas</h1>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>Proposed expansions and features for the next phase of the Vellum platform</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {roadmapItems.map((item, idx) => (
          <div 
            key={idx} 
            className="glass-card" 
            style={{ 
              padding: '1.5rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              position: 'relative',
              borderRadius: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ background: 'var(--bg-neutral)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <span className={`badge-expert ${item.colorClass === 'yellow' ? 'orange' : item.colorClass === 'pink' ? 'purple' : item.colorClass}`}>
                {item.status}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '4px 0 0 0', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
              {item.title}
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0, flexGrow: 1 }}>
              {item.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '700' }}>
                <span>Phase Progress</span>
                <span style={{ color: 'var(--text-primary)' }}>{item.progress}%</span>
              </div>
              <div style={{ background: 'var(--border-color)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  className={`progress-bar-fill-${item.colorClass}`}
                  style={{ 
                    height: '100%', 
                    width: `${item.progress}%`,
                    background: item.colorClass === 'green' ? 'linear-gradient(90deg, #10b981, #059669)'
                             : item.colorClass === 'blue' ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                             : item.colorClass === 'purple' ? 'linear-gradient(90deg, #a855f7, #7e22ce)'
                             : item.colorClass === 'pink' ? 'linear-gradient(90deg, #ec4899, #be185d)'
                             : 'linear-gradient(90deg, #eab308, #ca8a04)'
                  }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div 
        className="glass-card"
        style={{ 
          marginTop: '3rem', 
          background: 'linear-gradient(135deg, var(--emerald-light), rgba(16, 185, 129, 0.02))', 
          border: '1px solid var(--border-color)', 
          padding: '1.5rem 2rem',
          borderRadius: '16px'
        }}
      >
        <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
          <CheckCircle2 size={18} color="var(--emerald)" /> Architecture & Implementation Standards
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', margin: 0 }}>
          Future integrations are architected to scale dynamically using our active Sanctum API endpoints, multi-currency context triggers, and local SQLite data models.
        </p>
      </div>
    </div>
  )
}
