import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'arelse_users'
const SESSION_KEY = 'arelse_session'

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || [] } catch { return [] }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)) }

// Simple non-cryptographic hash - fine for an on-device demo app with no
// server round-trip. Do not reuse this for anything internet-facing.
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0 }
  return String(h)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const users = loadUsers()
    if (users.length === 0) {
      saveUsers([{ email: 'demo@arelse.app', name: 'Demo User', passHash: hash('demo1234') }])
    }
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      const found = loadUsers().find(u => u.email === session)
      if (found) setUser({ email: found.email, name: found.name })
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
    setUser({ email: found.email, name: found.name })
  }

  const register = (name, email, password) => {
    const users = loadUsers()
    const normEmail = email.trim().toLowerCase()
    if (users.some(u => u.email === normEmail)) throw new Error('An account with this email already exists')
    const newUser = { email: normEmail, name: name.trim() || 'New User', passHash: hash(password) }
    saveUsers([...users, newUser])
    localStorage.setItem(SESSION_KEY, newUser.email)
    setUser({ email: newUser.email, name: newUser.name })
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
