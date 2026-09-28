import { getSeries } from './manhwaRefs.js'
import { getEmbedding, cosineSimilarity } from './aiAnalyser.js'
import { MEME_TAGS, COMIC_TAGS } from '../data/seed.js'

const THRESHOLD_KEY = 'arelse_match_threshold'
const MAX_SAMPLE = 12

function readThreshold() {
  const saved = parseFloat(localStorage.getItem(THRESHOLD_KEY))
  return Number.isFinite(saved) ? saved : 0.65
}

function sampleEvenly(items, max) {
  if (items.length <= max) return items
  const out = []
  for (let i = 0; i < max; i++) out.push(items[Math.floor((i * items.length) / max)])
  return out
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('decode failed'))
    img.src = src
  })
}

// Cheap page-shape statistics: aspect ratio (webtoon/manhwa pages are tall)
// and how much of the page is near-white (speech bubbles, panel gutters).
async function imageStats(url) {
  const img = await loadImage(url)
  const w = img.naturalWidth || 1
  const h = img.naturalHeight || 1
  const cw = 48
  const ch = Math.min(160, Math.max(1, Math.round((cw * h) / w)))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, cw, ch)
  const { data } = ctx.getImageData(0, 0, cw, ch)
  let white = 0
  const total = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) white++
  }
  return { ratio: h / w, white: white / total }
}

// Album analyser, two stages:
// 1) Real AI similarity: each sampled page's MobileNet fingerprint is compared
//    with the example pages you gave the Recognizer. If enough pages match one
//    series, that's the answer.
// 2) Fallback when there's no series match: page-shape analysis (tall pages,
//    lots of white bubbles) plus MobileNet labels to say comic vs meme vs other.
// It can only name a series you've taught it — no public model knows manhwa.
export async function analyseAlbum(album, onProgress = () => {}) {
  if (!album.images.length) {
    return { type: 'unknown', label: 'Empty album', confidence: 0, detail: 'Add some pages first, then run the analyser.' }
  }

  const sample = sampleEvenly(album.images, MAX_SAMPLE)
  const threshold = readThreshold()
  const series = (await getSeries()).filter(s => s.examples.length > 0)
  let candidates = []
  let note = ''

  if (series.length === 0) {
    note = 'Tip: add a series with example pages in Recognizer so it can name the exact manhwa.'
  } else {
    const rows = series.map(s => ({ series: s, sims: [] }))
    let embedded = 0
    for (let i = 0; i < sample.length; i++) {
      onProgress(`Comparing page ${i + 1} of ${sample.length}…`)
      let emb
      try {
        emb = await getEmbedding(sample[i].url)
      } catch {
        note = "The AI model couldn't load — it needs a connection the first time."
        break
      }
      embedded++
      for (const row of rows) {
        let best = 0
        for (const ex of row.series.examples) {
          const sim = cosineSimilarity(emb, ex.embedding)
          if (sim > best) best = sim
        }
        row.sims.push(best)
      }
    }

    if (embedded > 0) {
      const scored = rows.map(r => {
        const mean = r.sims.reduce((a, b) => a + b, 0) / r.sims.length
        const hits = r.sims.filter(x => x >= threshold).length
        return { name: r.series.name, mean, hits, share: hits / r.sims.length }
      }).sort((a, b) => b.mean - a.mean)
      candidates = scored.slice(0, 3).map(c => ({ name: c.name, score: c.mean }))

      const best = scored[0]
      const nameMatch = album.name.trim().toLowerCase() === best.name.trim().toLowerCase()
      if (best.share >= 0.4 || (nameMatch && best.share >= 0.15)) {
        return {
          type: 'manhwa',
          label: best.name,
          confidence: Math.min(0.99, (best.share + best.mean) / 2),
          detail: `${best.hits} of ${embedded} sampled pages match your "${best.name}" examples.`,
          candidates
        }
      }
      note = `No series reached the match bar (${Math.round(threshold * 100)}%). Add more example pages, or lower "Match strictness" in Recognizer.`
    }
  }

  onProgress('Checking page shape…')
  const stats = []
  for (const img of sample.slice(0, 8)) {
    try { stats.push(await imageStats(img.url)) } catch { /* skip undecodable */ }
  }
  const n = stats.length || 1
  const tallShare = stats.filter(s => s.ratio >= 1.35).length / n
  const squareShare = stats.filter(s => s.ratio >= 0.7 && s.ratio <= 1.5).length / n
  const whiteShare = stats.filter(s => s.white >= 0.25).length / n

  const allTags = sample.flatMap(i => i.tags || [])
  const tagScore = (list) => (allTags.length ? allTags.filter(t => list.includes(t)).length / allTags.length : 0)
  const memeTag = tagScore(MEME_TAGS)
  const comicTag = tagScore(COMIC_TAGS)

  if (tallShare < 0.5 && ((memeTag > 0.08 && memeTag > comicTag) || (squareShare >= 0.6 && whiteShare >= 0.5))) {
    return {
      type: 'meme',
      label: 'Meme / screenshot collection',
      confidence: Math.min(0.9, 0.5 + memeTag + squareShare * 0.2),
      detail: `Mostly near-square images with flat graphics/text. ${note}`.trim(),
      candidates
    }
  }
  if (tallShare >= 0.5 || comicTag > 0.08) {
    return {
      type: 'comic',
      label: 'Comic / webtoon-style pages',
      confidence: Math.min(0.92, 0.45 + tallShare * 0.4 + comicTag),
      detail: `${Math.round(tallShare * 100)}% of sampled pages are tall webtoon-shaped. ${note}`.trim(),
      candidates
    }
  }
  return {
    type: 'unknown',
    label: 'Photos / other',
    confidence: 0,
    detail: `Doesn't look like comic pages or memes. ${note}`.trim(),
    candidates
  }
}
