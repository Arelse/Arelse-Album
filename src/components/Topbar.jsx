import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Topbar({ onMenu, title }) {
  const { user, logout } = useAuth()
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn secondary" style={{ display: 'none' }} id="menu-btn" onClick={onMenu}>☰</button>
        <button className="btn secondary mobile-only" onClick={onMenu} style={{ padding: '8px 10px' }}>☰</button>
        <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{title}</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{user?.name}</span>
        <button className="btn secondary" onClick={logout}>Log out</button>
      </div>
    </div>
  )
}
