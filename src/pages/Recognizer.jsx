import React, { useEffect, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getSeries, createSeries, addExample } from '../utils/manhwaRefs.js'
import { getGallery, markAssigned, resetAssignments } from '../utils/galleryStore.js'
import { getEmbedding, cosineSimilarity } from '../utils/aiAnalyser.js'
import { pickFromGallery } from '../utils/gallery.js'

const THRESHOLD_KEY = 'arelse_match_threshold'
const DEFAULT_THRESHOLD = 0.65

export default function Recognizer() {
  const { albums, createAlbum, addImage } = useData()
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [busySeriesId, setBusySeriesId] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [threshold, setThreshold] = useState(() => {
    const saved = parseFloat(localStorage.getItem(THRESHOLD_KEY))
    return Number.isFinite(saved) ? saved : DEFAULT_THRESHOLD
  })

  useEffect(() => {
    getSeries().then(s => { setSeries(s); setLoading(false) })
  }, [])

  const updateThreshold = (val) => {
    setThreshold(val)
    localStorage.setItem(THRESHOLD_KEY, String(val))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await createSeries(newName.trim())
    setSeries(await getSeries())
    setNewName('')
  }

  const addExamples = async (seriesId) => {
    setBusySeriesId(seriesId)
    try {
      const dataUrls = await pickFromGallery()
      for (const url of dataUrls) {
        const embedding = await getEmbedding(url)
        await addExample(seriesId, embedding, url)
      }
      setSeries(await getSeries())
    } catch (e) {
      if (e?.message && !/cancel/i.test(e.message)) alert('Could not add examples: ' + e.message)
    } finally {
      setBusySeriesId(null)
    }
  }

  const handleResetAssignments = async () => {
    if (!confirm('Clear all match assignments so every gallery photo can be re-scanned? Existing albums and photos are not deleted.')) return
    await resetAssignments()
    alert('Done — re-run "Scan now" whenever you like.')
  }

  const scanGallery = async () => {
    setScanning(true)
    setScanResult(null)
    const gallery = await getGallery()
    const unassigned = gallery.filter(g => !g.matchedSeries)
    let matched = 0

    const albumBySeriesName = new Map(albums.map(a => [a.name, a.id]))

    for (let i = 0; i < unassigned.length; i++) {
      const item = unassigned[i]
      setScanStatus(`Comparing photo ${i + 1} of ${unassigned.length}…`)
      let embedding
      try {
        embedding = await getEmbedding(item.url)
      } catch {
        continue
      }

      const scored = series.map(s => {
        let best = 0
        for (const ex of s.examples) {
          const sim = cosineSimilarity(embedding, ex.embedding)
          if (sim > best) best = sim
        }
        return { series: s, sim: best }
      }).sort((a, b) => b.sim - a.sim)

      const top = scored[0]
      const runnerUp = scored[1]
      const marginOk = !runnerUp || (top.sim - runnerUp.sim) >= 0.02

      if (top && top.sim >= threshold && marginOk) {
        let albumId = albumBySeriesName.get(top.series.name)
        if (!albumId) {
          const album = await createAlbum({ name: top.series.name, category: 'Manhwa', description: 'Auto-created by the Recognizer', coverColor: '#6c3fd1' })
          albumId = album.id
          albumBySeriesName.set(top.series.name, albumId)
        }
        await addImage(albumId, { id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, url: item.url, tags: item.tags || [], addedAt: Date.now() })
        await markAssigned(item.id, top.series.name)
        matched++
      }
    }

    setScanResult({ total: unassigned.length, matched })
    setScanStatus('')
    setScanning(false)
  }

  if (loading) return <div className="skeleton" style={{ height: 200, borderRadius: 14 }} />

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Manhwa Recognizer</h2>
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          Real on-device AI, honestly scoped: it can't name a series out of thin air — no public
          model is trained on manhwa art. What it does is compare the visual "fingerprint" of
          photos in your Whole Gallery against example images you label here. Match strictness
          below is genuinely a best-guess default — tune it against your own results.
        </p>
      </div>

      <form onSubmit={handleCreate} className="card" style={{ marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input style={{ flex: 1, minWidth: 160 }} className="field" placeholder="New series name (e.g. Solo Ascension)"
          value={newName} onChange={e => setNewName(e.target.value)} />
        <button className="btn">+ Add series</button>
      </form>

      {series.length === 0 ? (
        <div className="empty-state">
          <h3>No reference series yet</h3>
          <p>Add a series above, then give it a few example images to learn from.</p>
        </div>
      ) : (
        <div className="grid" style={{ marginBottom: 20 }}>
          {series.map(s => (
            <div key={s.id} className="card">
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: 10 }}>{s.examples.length} example{s.examples.length === 1 ? '' : 's'}</div>
              {s.examples.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 10, overflowX: 'auto' }}>
                  {s.examples.slice(0, 4).map((ex, i) => (
                    <img key={i} src={ex.thumbUrl} alt="" style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                  ))}
                </div>
              )}
              <button className="btn secondary" style={{ width: '100%' }} onClick={() => addExamples(s.id)} disabled={busySeriesId === s.id}>
                {busySeriesId === s.id ? 'Adding…' : '+ Add examples'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          Match strictness: {Math.round(threshold * 100)}%
        </label>
        <input
          type="range" min="0.3" max="0.9" step="0.01" value={threshold}
          onChange={e => updateThreshold(parseFloat(e.target.value))}
          style={{ width: '100%', marginTop: 8 }}
        />
        <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Getting too many wrong matches? Drag right. Getting too few matches? Drag left.
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>Scan Whole Gallery</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Matches unassigned photos against your reference series and auto-creates/fills albums.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn secondary" onClick={handleResetAssignments}>Reset assignments</button>
            <button className="btn" onClick={scanGallery} disabled={scanning || series.length === 0}>
              {scanning ? (scanStatus || 'Scanning…') : 'Scan now'}
            </button>
          </div>
        </div>
        {scanResult && (
          <p style={{ marginTop: 12, marginBottom: 0, fontSize: '0.85rem' }}>
            Matched {scanResult.matched} of {scanResult.total} unassigned photo{scanResult.total === 1 ? '' : 's'}.
          </p>
        )}
      </div>
    </div>
  )
}
