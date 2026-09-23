import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'arelse_users'
const SESSION_KEY = 'arelse_session'

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || [] } catch { return [] }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)) }

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0 }
  return String(h)
}

// Note on "real Google/Gmail sign-in": genuine Google OAuth requires an
// OAuth client registered in Google Cloud Console under your own account,
// tied to this app's package name and signing certificate fingerprint —
// credentials only you can create. Wiring the native plugin blind (without
// those credentials and without a way to test-build here) risks silently
// breaking the whole APK build. What's implemented instead, and is fully
// real: local email/password accounts (below), and a real Guest mode that
// needs no email at all.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      if (session === '__guest__') {
        setUser({ email: null, name: 'Guest', guest: true })
      } else {
        const found = loadUsers().find(u => u.email === session)
        if (found) setUser({ email: found.email, name: found.name, guest: false })
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const users = loadUsers()
    const found = users.find(u => u.email === email.trim().toLowerCase())
    if (!found || found.passHash !== hash(password)) {
      throw new Error('Invalid email or password')
    }
    localStorage.setItem(SESSION_KEY, found.email)
    setUser({ email: found.email, name: found.name, guest: false })
  }

  const register = (name, email, password) => {
    const users = loadUsers()
    const normEmail = email.trim().toLowerCase()
    if (users.some(u => u.email === normEmail)) throw new Error('An account with this email already exists')
    const newUser = { email: normEmail, name: name.trim() || 'New User', passHash: hash(password) }
    saveUsers([...users, newUser])
    localStorage.setItem(SESSION_KEY, newUser.email)
    setUser({ email: newUser.email, name: newUser.name, guest: false })
  }

  const loginAsGuest = () => {
    localStorage.setItem(SESSION_KEY, '__guest__')
    setUser({ email: null, name: 'Guest', guest: true })
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
