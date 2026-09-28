import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ViewControls from '../components/ViewControls.jsx'
import { useViewPrefs } from '../utils/viewPrefs.js'

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
  { id: 'aurora', label: 'Aurora ✦', a: '#0f1530', b: '#19d3c5' },
  { id: 'royal', label: 'Royal ✦', a: '#101733', b: '#d4af37' },
  { id: 'sakura', label: 'Sakura ✦', a: '#fff1f5', b: '#ec5f92' },
  { id: 'obsidian', label: 'Obsidian ✦', a: '#050507', b: '#a78bfa' },
  { id: 'crimson', label: 'Crimson ✦', a: '#1d0c12', b: '#ff3b5c' },
  { id: 'sapphire', label: 'Sapphire ✦', a: '#0a1c34', b: '#3b82f6' },
]

export default function Settings({ theme, setTheme, premium, setPremium }) {
  const { user, logout } = useAuth()
  const { layout, setLayout, perRow, setPerRow } = useViewPrefs()

  return (
    <div>
      <h3>Appearance</h3>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div>
            <strong>Premium UI</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              Glass panels, gradient buttons, glow and soft animations.
            </p>
          </div>
          <div className="seg">
            <button className={premium ? 'on' : ''} onClick={() => setPremium(true)}>On</button>
            <button className={!premium ? 'on' : ''} onClick={() => setPremium(false)}>Off</button>
          </div>
        </div>
        <p style={{ marginTop: 0, color: 'var(--text-dim)', fontSize: '0.85rem' }}>Theme (✦ = premium gradient themes)</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
          {THEMES.map(t => (
            <div key={t.id} onClick={() => setTheme(t.id)}
              className={'theme-swatch' + (theme === t.id ? ' selected' : '')}
              style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }}>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      <h3>Album layout</h3>
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ marginTop: 0, color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Posters is the compact cover-art grid. Pick a fixed number per row, Auto, or type your own.
        </p>
        <ViewControls layout={layout} setLayout={setLayout} perRow={perRow} setPerRow={setPerRow} />
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
