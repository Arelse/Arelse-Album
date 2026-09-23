import React, { useEffect, useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getSeries, createSeries, addExample } from '../utils/manhwaRefs.js'
import { getGallery, markAssigned } from '../utils/galleryStore.js'
import { getEmbedding, cosineSimilarity } from '../utils/aiAnalyser.js'
import { pickFromGallery } from '../utils/gallery.js'

const MATCH_THRESHOLD = 0.45

export default function Recognizer() {
  const { albums, createAlbum, addImage } = useData()
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [busySeriesId, setBusySeriesId] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState('')
  const [scanResult, setScanResult] = useState(null)

  useEffect(() => {
    getSeries().then(s => { setSeries(s); setLoading(false) })
  }, [])

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

  const scanGallery = async () => {
    setScanning(true)
    setScanResult(null)
    const gallery = await getGallery()
    const unassigned = gallery.filter(g => !g.matchedSeries)
    let matched = 0

    for (let i = 0; i < unassigned.length; i++) {
      const item = unassigned[i]
      setScanStatus(`Comparing photo ${i + 1} of ${unassigned.length}…`)
      let embedding
      try {
        embedding = await getEmbedding(item.url)
      } catch {
        continue
      }
      let best = null
      for (const s of series) {
        for (const ex of s.examples) {
          const sim = cosineSimilarity(embedding, ex.embedding)
          if (!best || sim > best.sim) best = { series: s, sim }
        }
      }
      if (best && best.sim >= MATCH_THRESHOLD) {
        let album = albums.find(a => a.name === best.series.name)
        if (!album) {
          album = await createAlbum({ name: best.series.name, category: 'Manhwa', description: 'Auto-created by the Recognizer', coverColor: '#6c3fd1' })
        }
        await addImage(album.id, { id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, url: item.url, tags: item.tags || [], addedAt: Date.now() })
        await markAssigned(item.id, best.series.name)
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
          photos in your Whole Gallery against example images you label here, using real
          similarity scoring. Add a few example pages per series below, then scan.
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

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>Scan Whole Gallery</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              Matches unassigned photos against your reference series and auto-creates/fills albums.
            </p>
          </div>
          <button className="btn" onClick={scanGallery} disabled={scanning || series.length === 0}>
            {scanning ? (scanStatus || 'Scanning…') : 'Scan now'}
          </button>
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
