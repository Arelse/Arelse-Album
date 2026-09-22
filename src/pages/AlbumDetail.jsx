import React, { useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { analyseAlbum } from '../utils/analyser.js'

export default function AlbumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { albums, loading, addImage, removeImage } = useData()
  const fileRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [uploading, setUploading] = useState(false)

  if (loading) return <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />

  const album = albums.find(a => a.id === id)
  if (!album) {
    return (
      <div className="empty-state">
        <h3>Album not found</h3>
        <Link to="/albums" className="btn">Back to Albums</Link>
      </div>
    )
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      await addImage(album.id, {
        id: `img_${Date.now()}`,
        url: reader.result,
        tags: [],
        addedAt: Date.now()
      })
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const runAnalyser = async () => {
    setAnalysing(true)
    setAnalysis(null)
    await new Promise(r => setTimeout(r, 700)) // simulate on-device inference
    setAnalysis(analyseAlbum(album))
    setAnalysing(false)
  }

  return (
    <div>
      <Link to="/albums" style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textDecoration: 'none' }}>← Back to Albums</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '10px 0 20px', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 6px' }}>{album.name}</h2>
          <span className="badge outline">{album.category}</span>
          {album.description && <p style={{ color: 'var(--text-dim)', marginTop: 8 }}>{album.description}</p>}
        </div>
        <label className="btn" style={{ cursor: 'pointer' }}>
          {uploading ? 'Uploading…' : '+ Add image'}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>Album Analyser</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Detects which manhwa this album is from, or flags it as a meme collection.
            </p>
          </div>
          <button className="btn secondary" onClick={runAnalyser} disabled={analysing || album.images.length === 0}>
            {analysing ? 'Analysing…' : 'Run analysis'}
          </button>
        </div>

        {analysing && <div className="skeleton" style={{ height: 48, borderRadius: 10, marginTop: 14 }} />}

        {analysis && !analysing && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{analysis.label}</strong>
              <span className="badge">{Math.round(analysis.confidence * 100)}% match</span>
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{analysis.detail}</p>
          </div>
        )}
      </div>

      {album.images.length === 0 ? (
        <div className="empty-state">
          <h3>No images yet</h3>
          <p>Add pages or images to this album to get started.</p>
        </div>
      ) : (
        <div className="image-grid">
          {album.images.map(img => (
            <div key={img.id} style={{ position: 'relative' }}>
              <img src={img.url} alt="" />
              <button
                onClick={() => removeImage(album.id, img.id)}
                className="btn danger"
                style={{ position: 'absolute', top: 6, right: 6, padding: '2px 8px', fontSize: '0.7rem' }}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
