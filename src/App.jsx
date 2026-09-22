import React, { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Albums from './pages/Albums.jsx'
import AlbumDetail from './pages/AlbumDetail.jsx'
import Settings from './pages/Settings.jsx'

const TITLES = { '/': 'Dashboard', '/albums': 'Albums', '/settings': 'Settings' }

function Shell({ theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || (location.pathname.startsWith('/albums/') ? 'Album' : 'Arelse Album')

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="app-shell">
      <div className={'sidebar-backdrop' + (menuOpen ? ' open' : '')} onClick={() => setMenuOpen(false)} />
      <Sidebar open={menuOpen} />
      <div className="main">
        <Topbar onMenu={() => setMenuOpen(o => !o)} title={title} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/albums/:id" element={<AlbumDetail />} />
            <Route path="/settings" element={<Settings theme={theme} setTheme={setTheme} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function Gate({ theme, setTheme }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Login />
  return (
    <DataProvider>
      <Shell theme={theme} setTheme={setTheme} />
    </DataProvider>
  )
}

export default function App() {
  const [theme, setThemeState] = useState(() => localStorage.getItem('arelse_theme') || 'dark')

  const setTheme = (t) => {
    setThemeState(t)
    localStorage.setItem('arelse_theme', t)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <HashRouter>
      <AuthProvider>
        <Gate theme={theme} setTheme={setTheme} />
      </AuthProvider>
    </HashRouter>
  )
}
