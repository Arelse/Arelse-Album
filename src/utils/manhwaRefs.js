import { idbGet, idbSet } from './idb.js'

const KEY = 'arelse_manhwa_refs'

export async function getSeries() {
  try {
    const raw = await idbGet(KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load reference series', e)
    return []
  }
}

async function save(series) {
  await idbSet(KEY, JSON.stringify(series))
}

export async function createSeries(name) {
  const current = await getSeries()
  const series = { id: `series_${Date.now()}`, name, examples: [] }
  await save([series, ...current])
  return series
}

export async function addExample(seriesId, embedding, thumbUrl) {
  const current = await getSeries()
  const next = current.map(s => s.id === seriesId
    ? { ...s, examples: [...s.examples, { embedding, thumbUrl, addedAt: Date.now() }] }
    : s)
  await save(next)
  return next
}

export async function deleteSeries(seriesId) {
  const current = await getSeries()
  const next = current.filter(s => s.id !== seriesId)
  await save(next)
  return next
}
