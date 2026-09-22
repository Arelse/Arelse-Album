import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('demo@arelse.app')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') login(email, password)
      else register(name, email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <form className="card" style={{ width: '100%', maxWidth: 380 }} onSubmit={submit}>
        <div className="brand" style={{ marginBottom: 18 }}><span className="brand-dot" /> Arelse Album</div>
        <p style={{ color: 'var(--text-dim)', marginTop: -8, fontSize: '0.88rem' }}>
          {mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account.'}
        </p>

        {mode === 'register' && (
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</div>}

        <button className="btn" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          {mode === 'login' ? (
            <>No account? <a href="#" onClick={e => { e.preventDefault(); setMode('register') }} style={{ color: 'var(--accent)' }}>Register</a></>
          ) : (
            <>Have an account? <a href="#" onClick={e => { e.preventDefault(); setMode('login') }} style={{ color: 'var(--accent)' }}>Sign in</a></>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Demo login: demo@arelse.app / demo1234
        </div>
      </form>
    </div>
  )
}
