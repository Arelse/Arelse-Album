import { idbGet, idbSet } from './idb.js'

const KEY = 'arelse_whole_gallery'

export async function getGallery() {
  try {
    const raw = await idbGet(KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load whole gallery', e)
    return []
  }
}

async function save(items) {
  await idbSet(KEY, JSON.stringify(items))
}

export async function addToGallery(records) {
  const current = await getGallery()
  const next = [...records, ...current]
  await save(next)
  return next
}

export async function removeFromGallery(id) {
  const current = await getGallery()
  const next = current.filter(i => i.id !== id)
  await save(next)
  return next
}

export async function markAssigned(id, seriesName) {
  const current = await getGallery()
  const next = current.map(i => i.id === id ? { ...i, matchedSeries: seriesName } : i)
  await save(next)
  return next
}
