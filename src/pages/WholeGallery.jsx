import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { getGallery, addToGallery, removeFromGallery } from '../utils/galleryStore.js'
import { buildImageRecord } from '../utils/imageRecord.js'
import { pickFromGallery } from '../utils/gallery.js'

export default function WholeGallery() {
  const { albums, addImage } = useData()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [addingTo, setAddingTo] = useState(false)

  useEffect(() => {
    getGallery().then(g => { setItems(g); setLoading(false) })
  }, [])

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const importMore = async () => {
    setImporting(true)
    setStatus('Opening gallery…')
    try {
      const dataUrls = await pickFromGallery()
      const records = []
      for (let i = 0; i < dataUrls.length; i++) {
        setStatus(`Analysing photo ${i + 1} of ${dataUrls.length}…`)
        records.push(await buildImageRecord(dataUrls[i]))
      }
      const next = await addToGallery(records)
      setItems(next)
    } catch (e) {
      if (e?.message && !/cancel/i.test(e.message)) alert('Could not import: ' + e.message)
    } finally {
      setImporting(false)
      setStatus('')
    }
  }

  const removeOne = async (id) => {
    const next = await removeFromGallery(id)
    setItems(next)
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const addSelectedToAlbum = async (albumId) => {
    const chosen = items.filter(i => selected.has(i.id))
    for (const img of chosen) {
      await addImage(albumId, { ...img, id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` })
    }
    setSelected(new Set())
    setAddingTo(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0 }}>Whole Gallery</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Every photo you've imported into Arelsync, in one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selected.size > 0 && (
            <button className="btn secondary" onClick={() => setAddingTo(true)}>Add {selected.size} to album</button>
          )}
          <Link to="/recognizer" className="btn secondary">Manhwa Recognizer</Link>
          <button className="btn" onClick={importMore} disabled={importing}>
            {importing ? (status || 'Working…') : '+ Import'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />)}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>Your gallery is empty</h3>
          <p>Tap "+ Import" to bring real photos in from your device.</p>
        </div>
      ) : (
        <div className="image-grid">
          {items.map(img => (
            <div key={img.id} style={{ position: 'relative' }} onClick={() => toggleSelect(img.id)}>
              <img src={img.url} alt="" style={{ outline: selected.has(img.id) ? '3px solid var(--accent)' : 'none', cursor: 'pointer' }} />
              {img.matchedSeries && <span className="badge" style={{ position: 'absolute', bottom: 6, left: 6, fontSize: '0.65rem' }}>{img.matchedSeries}</span>}
              <button
                onClick={(e) => { e.stopPropagation(); removeOne(img.id) }}
                className="btn danger"
                style={{ position: 'absolute', top: 6, right: 6, padding: '2px 8px', fontSize: '0.7rem' }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {addingTo && (
        <div className="modal-overlay" onClick={() => setAddingTo(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Add to album</h3>
            {albums.length === 0 ? (
              <p style={{ color: 'var(--text-dim)' }}>No albums yet — create one from the Albums page first.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {albums.map(a => (
                  <button key={a.id} className="btn secondary" style={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => addSelectedToAlbum(a.id)}>
                    {a.name}
                  </button>
                ))}
              </div>
            )}
            <button className="btn secondary" style={{ width: '100%', marginTop: 12 }} onClick={() => setAddingTo(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
