import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'

const CATEGORIES = ['Manhwa', 'Memes', 'Other']
const COLORS = ['#6c3fd1', '#e6a817', '#4a6fd6', '#3fd17f', '#e6763a', '#c0392b']

function AlbumModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || '')
  const [category, setCategory] = useState(initial?.category || 'Manhwa')
  const [description, setDescription] = useState(initial?.description || '')
  const [coverColor, setCoverColor] = useState(initial?.coverColor || COLORS[0])
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    await onSave({ name: name.trim(), category, description, coverColor })
    setBusy(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h3 style={{ marginTop: 0 }}>{initial ? 'Edit album' : 'New album'}</h3>
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} autoFocus required placeholder="e.g. Crimson Tower - Ch. 5" />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional notes" />
        </div>
        <div className="field">
          <label>Cover color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setCoverColor(c)}
                style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', border: coverColor === c ? '2px solid var(--text)' : '2px solid transparent' }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button type="button" className="btn secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn" style={{ flex: 1 }} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}

export default function Albums() {
  const { albums, loading, createAlbum, updateAlbum, deleteAlbum } = useData()
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const [modal, setModal] = useState(null) // null | 'new' | album object

  const filtered = category ? albums.filter(a => a.category === category) : albums

  const handleSave = async (data) => {
    if (modal && modal !== 'new') await updateAlbum(modal.id, data)
    else await createAlbum(data)
    setModal(null)
  }

  const handleDelete = async (a) => {
    if (!confirm(`Delete "${a.name}"? This can't be undone.`)) return
    await deleteAlbum(a.id)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={'btn ' + (!category ? '' : 'secondary')} onClick={() => setParams({})}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} className={'btn ' + (category === c ? '' : 'secondary')} onClick={() => setParams({ category: c })}>{c}</button>
          ))}
        </div>
        <button className="btn" onClick={() => setModal('new')}>+ New album</button>
      </div>

      {loading ? (
        <div className="grid">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No albums here</h3>
          <p>{category ? \You don't have any "${category}" albums yet.` : 'Create an album, then open it to import real photos from your gallery.'}`</p>
          <button className="btn" onClick={() => setModal('new')}>+ New album</button>
        </div>
      ) : (
        <div className="grid">
          {filtered.map(a => (
            <div key={a.id} className="card">
              <Link to={`/albums/${a.id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                <div className="album-cover" style={{ background: a.coverColor }}>{a.images.length} pages</div>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
              </Link>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span className="badge outline">{a.category}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn secondary" style={{ padding: '6px 10px' }} onClick={() => setModal(a)}>Edit</button>
                  <button className="btn danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(a)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <AlbumModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
