import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar({ open }) {
  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '')
  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div className="brand"><span className="brand-dot" /> Arelsync</div>
      <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
      <NavLink to="/albums" className={linkClass}>Albums</NavLink>
      <NavLink to="/albums?category=Manhwa" className={linkClass}>Manhwa</NavLink>
      <NavLink to="/albums?category=Memes" className={linkClass}>Memes</NavLink>
      <NavLink to="/gallery" className={linkClass}>Whole Gallery</NavLink>
      <NavLink to="/recognizer" className={linkClass}>Recognizer</NavLink>
      <NavLink to="/settings" className={linkClass}>Settings</NavLink>
    </aside>
  )
}
