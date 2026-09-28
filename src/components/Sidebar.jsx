import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CATEGORIES } from '../utils/constants.js'

export default function Sidebar({ open }) {
  const { pathname, search } = useLocation()
  const category = new URLSearchParams(search).get('category')
  const cls = (active) => 'nav-link' + (active ? ' active' : '')
  const inAlbums = pathname.startsWith('/albums')

  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div className="brand"><span className="brand-dot" /> Arelsync</div>
      <Link to="/" className={cls(pathname === '/')}>Dashboard</Link>
      <Link to="/albums" className={cls(inAlbums && !category)}>All albums</Link>
      {CATEGORIES.map(c => (
        <Link key={c} to={`/albums?category=${c}`} className={cls(inAlbums && category === c)}>{c}</Link>
      ))}
      <Link to="/gallery" className={cls(pathname === '/gallery')}>Whole Gallery</Link>
      <Link to="/recognizer" className={cls(pathname === '/recognizer')}>Recognizer</Link>
      <Link to="/settings" className={cls(pathname === '/settings')}>Settings</Link>
    </aside>
  )
}
