import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import AlbumCover from '../components/AlbumCover.jsx'

export default function Dashboard() {
  const { albums, loading } = useData()

  const totalImages = albums.reduce((a, al) => a + al.images.length, 0)
  const manhwaCount = albums.filter(a => a.category === 'Manhwa').length
  const memeCount = albums.filter(a => a.category === 'Memes').length

  if (loading) {
    return (
      <div>
        <div className="stat-row">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}
        </div>
        <div className="grid">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />)}
        </div>
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="empty-state">
        <h3>No albums yet</h3>
        <p>Create your first album, then import real photos from your gallery.</p>
        <Link to="/albums" className="btn">Go to Albums</Link>
      </div>
    )
  }

  const recent = [...albums].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6)

  return (
    <div>
      <div className="stat-row">
        <div className="card"><div className="stat-value">{albums.length}</div><div className="stat-label">Total albums</div></div>
        <div className="card"><div className="stat-value">{totalImages}</div><div className="stat-label">Total images</div></div>
        <div className="card"><div className="stat-value">{manhwaCount}</div><div className="stat-label">Manhwa albums</div></div>
        <div className="card"><div className="stat-value">{memeCount}</div><div className="stat-label">Meme albums</div></div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Recent albums</h3>
      <div className="grid">
        {recent.map(a => (
          <Link key={a.id} to={`/albums/${a.id}`} className="card" style={{ textDecoration: 'none', color: 'var(--text)' }}>
            <AlbumCover album={a} />
            <div style={{ fontWeight: 600 }}>{a.name}</div>
            <span className="badge outline" style={{ marginTop: 6 }}>{a.category}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
