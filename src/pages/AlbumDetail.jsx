import React, { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { analyseAlbum } from '../utils/analyser.js'
import { classifyImage } from '../utils/aiAnalyser.js'
import { pickFromGallery } from '../utils/gallery.js'

function newImageId() {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export default function AlbumDetail() {
  const { id } = useParams()
  const { albums, loading, addImage, removeImage } = useData()
  const fileRef = useRef(null)
  const [analysis, setAnalysis] = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState('')

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

  const buildImageRecord = async (dataUrl) => {
    let tags = []
    try {
      const result = await classifyImage(dataUrl)
      tags = result.tags
    } catch (e) {
      console.warn('AI classification skipped:', e.message)
    }
    return { id: newImageId(), url: dataUrl, tags, addedAt: Date.now() }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportStatus('Analysing image…')
    const reader = new FileReader()
    reader.onload = async () => {
      const record = await buildImageRecord(reader.result)
      await addImage(album.id, record)
      setImporting(false)
      setImportStatus('')
      if (fileRef.current) fileRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const importFromGallery = async () => {
    setImporting(true)
    setImportStatus('Opening gallery…')
    try {
      const dataUrls = await pickFromGallery()
      for (let i = 0; i < dataUrls.length; i++) {
        setImportStatus(`Analysing photo ${i + 1} of ${dataUrls.length}…`)
        const record = await buildImageRecord(dataUrls[i])
        await addImage(album.id, record)
      }
    } catch (e) {
      if (e?.message && !/cancel/i.test(e.message)) {
        alert('Could not import from gallery: ' + e.message)
      }
    } finally {
      setImporting(false)
      setImportStatus('')
    }
  }

  const runAnalyser = async () => {
    setAnalysing(true)
    setAnalysis(null)
    await new Promise(r => setTimeout(r, 400))
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={importFromGallery} disabled={importing}>
            {importing ? (importStatus || 'Working…') : '+ Import from gallery'}
          </button>
          <label className="btn secondary" style={{ cursor: 'pointer' }}>
            Add single file
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={importing} />
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>Album Analyser</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Uses real on-device AI (MobileNet) to tell comic/illustrated pages apart from memes and screenshots.
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
              {analysis.confidence > 0 && <span className="badge">{Math.round(analysis.confidence * 100)}% match</span>}
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>{analysis.detail}</p>
          </div>
        )}
      </div>

      {album.images.length === 0 ? (
        <div className="empty-state">
          <h3>No images yet</h3>
          <p>Tap "Import from gallery" to pull real photos in from your device.</p>
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
