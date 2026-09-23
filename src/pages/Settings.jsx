import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const THEMES = [
  { id: 'light', label: 'Light', a: '#f5f6fa', b: '#6c3fd1' },
  { id: 'dark', label: 'Dark', a: '#0f0f14', b: '#8a63e6' },
  { id: 'sunset', label: 'Sunset', a: '#2b1a14', b: '#e6763a' },
  { id: 'forest', label: 'Forest', a: '#142218', b: '#3fd17f' },
  { id: 'midnight', label: 'Midnight', a: '#05070f', b: '#4d6bff' },
  { id: 'rose', label: 'Rose', a: '#1a0510', b: '#f0397e' },
  { id: 'ocean', label: 'Ocean', a: '#051620', b: '#21c9e0' },
  { id: 'gold', label: 'Gold', a: '#120f08', b: '#e0b23b' },
  { id: 'cyberpunk', label: 'Cyberpunk', a: '#0a0414', b: '#ff2fb0' },
  { id: 'mono', label: 'Mono', a: '#0b0b0b', b: '#d8d8d8' },
  { id: 'lavender', label: 'Lavender', a: '#f3f0fb', b: '#8a63e6' },
  { id: 'coral', label: 'Coral', a: '#fff4ef', b: '#ff6f4d' },
  { id: 'emerald', label: 'Emerald', a: '#061410', b: '#12d191' },
  { id: 'slate', label: 'Slate', a: '#0e1216', b: '#5b8cff' },
]

export default function Settings({ theme, setTheme }) {
  const { user, logout } = useAuth()

  return (
    <div>
      <h3>Appearance</h3>
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ marginTop: 0, color: 'var(--text-dim)', fontSize: '0.85rem' }}>Choose a theme for the app.</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
          {THEMES.map(t => (
            <div key={t.id} onClick={() => setTheme(t.id)}
              className={'theme-swatch' + (theme === t.id ? ' selected' : '')}
              style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      <h3>Account</h3>
      <div className="card">
        {user?.guest ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            You're using a Guest account — nothing here is tied to an email. Data still saves on
            this device, but won't follow you to a different install.
          </p>
        ) : (
          <>
            <div className="field"><label>Name</label><input value={user?.name || ''} disabled /></div>
            <div className="field"><label>Email</label><input value={user?.email || ''} disabled /></div>
          </>
        )}
        <button className="btn secondary" style={{ width: '100%' }} onClick={logout}>Log out</button>
      </div>
    </div>
  )
}
