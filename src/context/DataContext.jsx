import React, { createContext, useContext, useEffect, useState } from 'react'
import { seedAlbums } from '../data/seed.js'

const DataContext = createContext(null)
const ALBUMS_KEY = 'arelse_albums'

function load() {
  try {
    const raw = localStorage.getItem(ALBUMS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const seeded = seedAlbums()
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(seeded))
  return seeded
}

function persist(albums) {
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums))
}

const delay = (ms) => new Promise(res => setTimeout(res, ms))

export function DataProvider({ children }) {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate an initial fetch so the dashboard can show a real loading state.
    delay(500).then(() => {
      setAlbums(load())
      setLoading(false)
    })
  }, [])

  // --- Optimistic CRUD ---
  // Each mutation updates local state immediately, persists to localStorage
  // as the "commit", and would roll back on a failed network write in a
  // real backend-connected version.
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
    await delay(200)
    return optimistic
  }

  const updateAlbum = async (id, patch) => {
    setAlbums(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...patch } : a)
      persist(next)
      return next
    })
    await delay(150)
  }

  const deleteAlbum = async (id) => {
    let prevSnapshot
    setAlbums(prev => {
      prevSnapshot = prev
      const next = prev.filter(a => a.id !== id)
      persist(next)
      return next
    })
    await delay(150)
    return () => { setAlbums(prevSnapshot); persist(prevSnapshot) } // rollback handle
  }

  const addImage = async (albumId, image) => {
    setAlbums(prev => {
      const next = prev.map(a => a.id === albumId ? { ...a, images: [...a.images, image] } : a)
      persist(next)
      return next
    })
    await delay(150)
  }

  const removeImage = async (albumId, imageId) => {
    setAlbums(prev => {
      const next = prev.map(a => a.id === albumId ? { ...a, images: a.images.filter(i => i.id !== imageId) } : a)
      persist(next)
      return next
    })
    await delay(100)
  }

  return (
    <DataContext.Provider value={{ albums, loading, createAlbum, updateAlbum, deleteAlbum, addImage, removeImage }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
