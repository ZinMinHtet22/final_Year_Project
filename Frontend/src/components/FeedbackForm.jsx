import { useState } from 'react'
import { MessageSquare, Send, Check } from 'lucide-react'
import api from '../api/client'

export default function FeedbackForm({ onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api.post('/feedback', { name, email, message })
      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box feedback-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={20} color="var(--emerald)" /> Share Your Thoughts
        </h2>
        <p className="modal-subtitle" style={{ marginBottom: '1.5rem' }}>
          Have a recipe request, found a bug, or want to suggest improvements? We'd love to hear from you!
        </p>

        {success ? (
          <div className="feedback-success-state" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '9999px', backgroundColor: 'var(--emerald-light)', color: 'var(--emerald)', marginBottom: '1.25rem' }}>
              <Check size={28} />
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Thank you!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', margin: 0 }}>
              Your feedback has been successfully submitted and sent to our team.
            </p>
            <button className="btn-primary" onClick={onClose} style={{ marginTop: '1.5rem', width: 'auto', padding: '0.5rem 2rem' }}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div className="error-message" style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Your Name</label>
              <input 
                type="text" 
                className="modal-input" 
                placeholder="Enter your name"
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Email Address</label>
              <input 
                type="email" 
                className="modal-input" 
                placeholder="Enter your email address"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', textAlign: 'left' }}>Message / Suggestion</label>
              <textarea 
                className="modal-input" 
                placeholder="Write your message here... Describe recipes you want or improvements we should make."
                rows={5}
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                style={{ resize: 'vertical', minHeight: '100px' }}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}
            >
              <Send size={14} /> {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
