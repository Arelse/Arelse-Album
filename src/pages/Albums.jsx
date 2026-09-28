import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import AlbumGrid from '../components/AlbumGrid.jsx'
import ViewControls from '../components/ViewControls.jsx'
import { useViewPrefs } from '../utils/viewPrefs.js'
import { CATEGORIES } from '../utils/constants.js'

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
  const [modal, setModal] = useState(null)
  const [merging, setMerging] = useState(false)
  const { layout, setLayout, perRow, setPerRow } = useViewPrefs()

  const filtered = category ? albums.filter(a => a.category === category) : albums

  const duplicateCount = (() => {
    const seen = new Map()
    let extra = 0
    for (const a of albums) {
      const key = a.name.trim().toLowerCase()
      seen.set(key, (seen.get(key) || 0) + 1)
    }
    for (const count of seen.values()) if (count > 1) extra += count - 1
    return extra
  })()

  const handleSave = async (data) => {
    if (modal && modal !== 'new') await updateAlbum(modal.id, data)
    else await createAlbum(data)
    setModal(null)
  }

  const handleDelete = async (a) => {
    if (!confirm(`Delete "${a.name}"? This can't be undone.`)) return
    await deleteAlbum(a.id)
  }

  const mergeDuplicates = async () => {
    if (!confirm(`Merge ${duplicateCount} duplicate album(s) into one each by name? Images will be combined. This can't be undone.`)) return
    setMerging(true)
    const groups = new Map()
    for (const a of albums) {
      const key = a.name.trim().toLowerCase()
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(a)
    }
    for (const group of groups.values()) {
      if (group.length <= 1) continue
      const sorted = [...group].sort((a, b) => a.createdAt - b.createdAt)
      const [keep, ...rest] = sorted
      const mergedImages = [...keep.images]
      const seenIds = new Set(mergedImages.map(i => i.id))
      for (const dup of rest) {
        for (const img of dup.images) {
          if (!seenIds.has(img.id)) { mergedImages.push(img); seenIds.add(img.id) }
        }
      }
      await updateAlbum(keep.id, { images: mergedImages })
      for (const dup of rest) await deleteAlbum(dup.id)
    }
    setMerging(false)
  }

  return (
    <div>
      <div className="tabs">
        <button className={'tab' + (!category ? ' on' : '')} onClick={() => setParams({})}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} className={'tab' + (category === c ? ' on' : '')} onClick={() => setParams({ category: c })}>{c}</button>
        ))}
      </div>

      <div className="section-head">
        <ViewControls layout={layout} setLayout={setLayout} perRow={perRow} setPerRow={setPerRow} />
        <button className="btn" onClick={() => setModal('new')}>+ New album</button>
      </div>

      {duplicateCount > 0 && (
        <div className="card" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: '0.85rem' }}>Found {duplicateCount} duplicate album{duplicateCount === 1 ? '' : 's'} (same name).</span>
          <button className="btn secondary" onClick={mergeDuplicates} disabled={merging}>
            {merging ? 'Merging…' : 'Merge duplicates'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No albums here</h3>
          <p>{category ? `You don't have any "${category}" albums yet.` : 'Create an album, then open it to import real photos from your gallery.'}</p>
          <button className="btn" onClick={() => setModal('new')}>+ New album</button>
        </div>
      ) : (
        <AlbumGrid albums={filtered} layout={layout} perRow={perRow} onEdit={a => setModal(a)} onDelete={handleDelete} />
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
