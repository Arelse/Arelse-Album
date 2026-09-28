import { useState } from 'react'

const LAYOUT_KEY = 'arelse_layout'
const PERROW_KEY = 'arelse_per_row'

// Shared display preferences (poster vs card layout, and how many albums
// per row). perRow of 0 means "Auto" — the browser fits as many as it can.
export function useViewPrefs() {
  const [layout, setLayoutState] = useState(() => (localStorage.getItem(LAYOUT_KEY) === 'cards' ? 'cards' : 'poster'))
  const [perRow, setPerRowState] = useState(() => {
    const raw = localStorage.getItem(PERROW_KEY)
    if (raw === null) return 4
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n >= 0 && n <= 10 ? n : 4
  })

  const setLayout = (v) => {
    setLayoutState(v)
    localStorage.setItem(LAYOUT_KEY, v)
  }
  const setPerRow = (n) => {
    setPerRowState(n)
    localStorage.setItem(PERROW_KEY, String(n))
  }

  return { layout, setLayout, perRow, setPerRow }
}
