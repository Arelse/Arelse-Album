import React from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import AlbumGrid from '../components/AlbumGrid.jsx'
import ViewControls from '../components/ViewControls.jsx'
import { useViewPrefs } from '../utils/viewPrefs.js'
import { SERIES_CATEGORIES } from '../utils/constants.js'

export default function Dashboard() {
  const { albums, loading } = useData()
  const { layout, setLayout, perRow, setPerRow } = useViewPrefs()

  const totalImages = albums.reduce((a, al) => a + al.images.length, 0)
  const seriesCount = albums.filter(a => SERIES_CATEGORIES.includes(a.category)).length
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

  const recent = [...albums].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12)

  return (
    <div>
      <div className="stat-row">
        <div className="card"><div className="stat-value">{albums.length}</div><div className="stat-label">Total albums</div></div>
        <div className="card"><div className="stat-value">{totalImages}</div><div className="stat-label">Total images</div></div>
        <div className="card"><div className="stat-value">{seriesCount}</div><div className="stat-label">Series albums</div></div>
        <div className="card"><div className="stat-value">{memeCount}</div><div className="stat-label">Meme albums</div></div>
      </div>

      <div className="section-head">
        <h3 style={{ margin: 0 }}>Recent albums</h3>
        <Link to="/albums" style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none' }}>View all →</Link>
      </div>
      <div style={{ marginBottom: 14 }}>
        <ViewControls layout={layout} setLayout={setLayout} perRow={perRow} setPerRow={setPerRow} />
      </div>
      <AlbumGrid albums={recent} layout={layout} perRow={perRow} />
    </div>
  )
}
