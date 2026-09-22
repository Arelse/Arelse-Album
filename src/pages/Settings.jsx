import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const THEMES = [
  { id: 'light', label: 'Light', a: '#f5f6fa', b: '#6c3fd1' },
  { id: 'dark', label: 'Dark', a: '#0f0f14', b: '#8a63e6' },
  { id: 'sunset', label: 'Sunset', a: '#2b1a14', b: '#e6763a' },
  { id: 'forest', label: 'Forest', a: '#142218', b: '#3fd17f' },
]

export default function Settings({ theme, setTheme }) {
  const { user } = useAuth()

  return (
    <div>
      <h3>Appearance</h3>
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ marginTop: 0, color: 'var(--text-dim)', fontSize: '0.85rem' }}>Choose a theme for the app.</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
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
        <div className="field"><label>Name</label><input value={user?.name || ''} disabled /></div>
        <div className="field"><label>Email</label><input value={user?.email || ''} disabled /></div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Account editing isn't wired up in this demo build.</p>
      </div>
    </div>
  )
}
