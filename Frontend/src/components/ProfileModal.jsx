import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { Camera, Trash2, Check, AlertCircle, User, Mail, KeyRound, Sparkles } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../utils/cropImage'

export default function ProfileModal({ onClose }) {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: ''
  })

  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef()

  // Cropping State
  const [tempImageSrc, setTempImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const handleTextChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setTempImageSrc(reader.result)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    })
    reader.readAsDataURL(file)
  }

  const handleCropSave = async () => {
    if (!croppedAreaPixels || !tempImageSrc) return

    setImageUploading(true)
    setError('')
    setSuccess('')

    try {
      const croppedBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels)
      if (!croppedBlob) throw new Error('Failed to crop image')

      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('image', croppedFile)

      const res = await api.post('/user/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      updateUser(res.data)
      setSuccess('Profile picture updated!')
      setTempImageSrc(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload cropped image. Must be under 2MB.')
    } finally {
      setImageUploading(false)
    }
  }

  const handleCropCancel = () => {
    setTempImageSrc(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Remove your profile picture?')) return
    setImageUploading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.delete('/user/profile/image')
      updateUser(res.data)
      setSuccess('Profile picture removed!')
    } catch (err) {
      setError('Failed to remove profile picture.')
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (form.password && form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }

      const res = await api.put('/user/profile', payload)
      updateUser(res.data)
      setSuccess('Profile settings updated successfully!')
      setForm(prev => ({ ...prev, password: '', password_confirmation: '' }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile settings.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box profile-settings-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={tempImageSrc ? handleCropCancel : onClose}>✕</button>
        
        {tempImageSrc ? (
          <div className="cropper-wrapper-layout" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%', marginBottom: '6px' }}>
              <Camera size={20} color="var(--emerald)" /> Crop Photo
            </h2>
            <p className="modal-subtitle" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>Position and zoom to fit inside the circle</p>
            
            <div className="cropper-container-box" style={{ position: 'relative', width: '100%', height: '260px', background: '#0e0e11', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={(area, pixels) => setCroppedAreaPixels(pixels)}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="cropper-zoom-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Zoom</span>
              <input 
                type="range" 
                className="expert-slider" 
                min={1} 
                max={3} 
                step={0.1} 
                value={zoom} 
                onChange={e => setZoom(parseFloat(e.target.value))} 
                style={{ flex: 1 }}
              />
            </div>

            <div className="form-actions-row" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={handleCropCancel} disabled={imageUploading} style={{ width: 'auto', padding: '0.6rem 1.4rem' }}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleCropSave} disabled={imageUploading} style={{ width: 'auto', padding: '0.6rem 1.4rem' }}>
                {imageUploading ? 'Uploading...' : 'Save Avatar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="modal-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}>
              <Sparkles size={20} color="#10b981" /> Profile Settings
            </h2>
            <p className="modal-subtitle">Manage your personal information and profile photo</p>

            {success && <div className="admin-alert success"><Check size={16} /> {success}</div>}
            {error && <div className="admin-alert error"><AlertCircle size={16} /> {error}</div>}

            <div className="profile-avatar-section">
              <div className="profile-avatar-container" onClick={handleAvatarClick}>
                {user?.profile_image_url ? (
                  <img src={user.profile_image_url} alt={user.name} className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-initials">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="profile-avatar-overlay">
                  <Camera size={20} color="#fff" />
                  <span>Change</span>
                </div>
                {imageUploading && (
                  <div className="profile-avatar-loader">
                    <span className="spinner-mini"></span>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelected} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />

              {user?.profile_image_url && (
                <button className="btn-remove-avatar" onClick={handleRemoveAvatar} disabled={imageUploading}>
                  <Trash2 size={13} /> Remove Photo
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <User size={13} /> Full Name
                </label>
                <input 
                  name="name"
                  className="admin-input"
                  value={form.name}
                  onChange={handleTextChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} /> Email Address
                </label>
                <input 
                  name="email"
                  type="email"
                  className="admin-input"
                  value={form.email}
                  onChange={handleTextChange}
                  required
                />
              </div>

              <div className="form-divider" style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <KeyRound size={13} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }} />
                Change Password (Optional)
              </h4>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    name="password"
                    type="password"
                    className="admin-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleTextChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    name="password_confirmation"
                    type="password"
                    className="admin-input"
                    placeholder="••••••••"
                    value={form.password_confirmation}
                    onChange={handleTextChange}
                  />
                </div>
              </div>

              <div className="form-actions-row" style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={onClose} disabled={loading || imageUploading} style={{ width: 'auto', padding: '0.6rem 1.4rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading || imageUploading} style={{ width: 'auto', padding: '0.6rem 1.4rem' }}>
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
