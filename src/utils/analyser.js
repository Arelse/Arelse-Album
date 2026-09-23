import { MANHWA_DB, MEME_TAGS, COMIC_TAGS } from '../data/seed.js'

// Scores an album's AI-derived tags against reference sets. This is
// intentionally honest about what it can and can't do: MobileNet (the AI
// model doing the actual classification, see aiAnalyser.js) was trained on
// general real-world objects, not manhwa art, so exact-series matching
// only fires when tags happen to overlap with the small starter reference
// set in data/seed.js (or tags you've added by hand). What it's genuinely
// reliable at is telling comic/illustration-style pages apart from
// meme/screenshot-style images, using real classifier output.
export function analyseAlbum(album) {
  const allTags = album.images.flatMap(i => i.tags || [])
  if (allTags.length === 0) {
    return {
      type: 'unknown',
      label: 'No AI tags yet',
      confidence: 0,
      detail: 'Import or add images (with a connection) so the on-device AI can classify them first.'
    }
  }
  const total = allTags.length
  const score = (list) => list.reduce((acc, t) => acc + allTags.filter(x => x === t).length, 0) / total

  const memeScore = score(MEME_TAGS)
  const comicScore = score(COMIC_TAGS)
  const manhwaScores = MANHWA_DB
    .map(entry => ({ entry, score: score(entry.tags) }))
    .sort((a, b) => b.score - a.score)
  const bestManhwa = manhwaScores[0]

  if (bestManhwa && bestManhwa.score > 0.15) {
    return {
      type: 'manhwa',
      label: bestManhwa.entry.title,
      confidence: Math.min(0.95, 0.4 + bestManhwa.score),
      detail: `Tag overlap with your "${bestManhwa.entry.title}" reference entry.`
    }
  }
  if (memeScore > comicScore && memeScore > 0.08) {
    return {
      type: 'meme',
      label: 'Meme / screenshot collection',
      confidence: Math.min(0.95, 0.5 + memeScore),
      detail: 'AI labels match common meme/screenshot patterns (flat graphics, text, templates).'
    }
  }
  if (comicScore > 0.08) {
    return {
      type: 'comic',
      label: 'Comic / illustrated page',
      confidence: Math.min(0.9, 0.4 + comicScore),
      detail: "AI recognizes comic/illustration style, but can't name the exact series — there's no public manhwa-identification model to match against."
    }
  }
  return {
    type: 'unknown',
    label: 'No strong match',
    confidence: 0,
    detail: "AI labels didn't line up with memes, comic art, or your reference set."
  }
}
