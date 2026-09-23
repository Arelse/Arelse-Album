import React, { createContext, useContext, useEffect, useState } from 'react'
import { idbGet, idbSet } from '../utils/idb.js'

const DataContext = createContext(null)
const ALBUMS_KEY = 'arelse_albums'

async function load() {
  try {
    const raw = await idbGet(ALBUMS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load albums from storage', e)
  }
  return []
}

// Fire-and-forget persist: called as a side effect inside setAlbums
// updaters below (same pattern as the old localStorage version), just
// backed by IndexedDB now since real gallery photos need much more than
// localStorage's ~5-10MB quota.
function persist(albums) {
  idbSet(ALBUMS_KEY, JSON.stringify(albums)).catch(e => console.error('Failed to save albums', e))
}

const delay = (ms) => new Promise(res => setTimeout(res, ms))

export function DataProvider({ children }) {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await delay(350)
      const data = await load()
      if (!cancelled) {
        setAlbums(data)
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const createAlbum = async (data) => {
    const optimistic = {
      id: `alb_${Date.now()}`,
      name: data.name,
      category: data.category,
      description: data.description || '',
      coverColor: data.coverColor || '#6c3fd1',
      createdAt: Date.now(),
      images: []
    }
    setAlbums(prev => {
      const next = [optimistic, ...prev]
      persist(next)
      return next
    })
    await delay(150)
    return optimistic
  }

  const updateAlbum = async (id, patch) => {
    setAlbums(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...patch } : a)
      persist(next)
      return next
    })
    await delay(100)
  }

  const deleteAlbum = async (id) => {
    let prevSnapshot
    setAlbums(prev => {
      prevSnapshot = prev
      const next = prev.filter(a => a.id !== id)
      persist(next)
      return next
    })
    await delay(100)
    return () => { setAlbums(prevSnapshot); persist(prevSnapshot) }
  }

  const addImage = async (albumId, image) => {
    setAlbums(prev => {
      const next = prev.map(a => a.id === albumId ? { ...a, images: [...a.images, image] } : a)
      persist(next)
      return next
    })
  }

  const removeImage = async (albumId, imageId) => {
    setAlbums(prev => {
      const next = prev.map(a => a.id === albumId ? { ...a, images: a.images.filter(i => i.id !== imageId) } : a)
      persist(next)
      return next
    })
  }

  return (
    <DataContext.Provider value={{ albums, loading, createAlbum, updateAlbum, deleteAlbum, addImage, removeImage }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
