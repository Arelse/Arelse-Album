import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AlbumCover from './AlbumCover.jsx'

function gridStyle(layout, perRow) {
  const gap = layout === 'poster' ? (perRow >= 5 ? 6 : 10) : 16
  let cols
  if (perRow > 0) cols = `repeat(${perRow}, minmax(0, 1fr))`
  else cols = layout === 'poster' ? 'repeat(auto-fill, minmax(96px, 1fr))' : 'repeat(auto-fill, minmax(220px, 1fr))'
  return { display: 'grid', gap, gridTemplateColumns: cols }
}

export default function AlbumGrid({ albums, layout, perRow, onEdit, onDelete }) {
  const [menuFor, setMenuFor] = useState(null)
  const editable = Boolean(onEdit || onDelete)
  const titleSize = perRow >= 6 ? '0.55rem' : perRow === 5 ? '0.62rem' : perRow === 4 ? '0.7rem' : '0.82rem'

  return (
    <>
      <div style={gridStyle(layout, perRow)}>
        {albums.map(a => {
          const art = a.coverImage || (a.images[0] && a.images[0].url)
          if (layout === 'poster') {
            return (
              <div key={a.id} className="poster">
                <Link to={`/albums/${a.id}`} className="poster-link">
                  <div className="poster-art" style={!art ? { background: a.coverColor } : undefined}>
                    {art ? <img src={art} alt="" loading="lazy" /> : <span className="poster-empty">No pages</span>}
                    <span className="poster-badge">{a.images.length}</span>
                    <div className="poster-title" style={{ fontSize: titleSize }}>{a.name}</div>
                  </div>
                </Link>
                {editable && <button className="poster-menu" onClick={() => setMenuFor(a)}>⋯</button>}
              </div>
            )
          }
          return (
            <div key={a.id} className="card">
              <Link to={`/albums/${a.id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                <AlbumCover album={{ ...a, coverImage: art }} />
                <div style={{ fontWeight: 600 }}>{a.name}</div>
              </Link>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
                <span className="badge outline">{a.category}</span>
                {editable && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {onEdit && <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => onEdit(a)}>Edit</button>}
                    {onDelete && <button className="btn danger" style={{ padding: '6px 10px' }} onClick={() => onDelete(a)}>Delete</button>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {menuFor && (
        <div className="modal-overlay" onClick={() => setMenuFor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>{menuFor.name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {onEdit && <button className="btn secondary" onClick={() => { const a = menuFor; setMenuFor(null); onEdit(a) }}>Edit album</button>}
              {onDelete && <button className="btn danger" onClick={() => { const a = menuFor; setMenuFor(null); onDelete(a) }}>Delete album</button>}
              <button className="btn secondary" onClick={() => setMenuFor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
