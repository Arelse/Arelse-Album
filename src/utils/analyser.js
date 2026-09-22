import { MANHWA_DB, MEME_TAGS } from '../data/seed.js'

// Lightweight, fully-offline heuristic analyser.
// Scores each image's tags against the reference manhwa tag sets and the
// meme tag list, then aggregates across the album. This is intentionally
// simple (no bundled ML model / no network calls) so it works inside an
// APK with zero backend. Swap this module out for a real vision model
// behind an API if you want production-grade recognition.
export function analyseAlbum(album) {
  const scores = MANHWA_DB.map(entry => {
    let hits = 0
    let total = 0
    for (const image of album.images) {
      total += image.tags.length || 1
      for (const t of image.tags) {
        if (entry.tags.includes(t)) hits += 1
      }
    }
    return { entry, confidence: total ? hits / total : 0 }
  }).sort((a, b) => b.confidence - a.confidence)

  const memeHits = album.images.reduce((acc, img) => {
    return acc + img.tags.filter(t => MEME_TAGS.includes(t)).length
  }, 0)
  const memeTotal = album.images.reduce((a, img) => a + (img.tags.length || 1), 0)
  const memeConfidence = memeTotal ? memeHits / memeTotal : 0

  const best = scores[0]

  if (memeConfidence > (best?.confidence || 0) && memeConfidence > 0) {
    return {
      type: 'meme',
      label: 'Meme collection',
      confidence: Math.min(0.98, 0.5 + memeConfidence),
      detail: 'Tag signature matches common meme formats/templates.'
    }
  }

  if (best && best.confidence > 0.2) {
    return {
      type: 'manhwa',
      label: best.entry.title,
      confidence: Math.min(0.97, 0.4 + best.confidence),
      detail: `Matched panel tags against "${best.entry.title}" reference set.`
    }
  }

  return {
    type: 'unknown',
    label: 'Unrecognized source',
    confidence: 0,
    detail: 'Not enough tag signal to confidently match a known series or meme format.'
  }
}
