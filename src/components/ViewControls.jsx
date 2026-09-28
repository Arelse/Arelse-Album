import React from 'react'

const PRESETS = [0, 2, 3, 4, 5, 6]

export default function ViewControls({ layout, setLayout, perRow, setPerRow }) {
  return (
    <div className="view-controls">
      <div className="seg">
        <button className={layout === 'poster' ? 'on' : ''} onClick={() => setLayout('poster')}>Posters</button>
        <button className={layout === 'cards' ? 'on' : ''} onClick={() => setLayout('cards')}>Cards</button>
      </div>
      <div className="seg">
        {PRESETS.map(n => (
          <button key={n} className={perRow === n ? 'on' : ''} onClick={() => setPerRow(n)}>
            {n === 0 ? 'Auto' : n}
          </button>
        ))}
      </div>
      <label className="custom-per-row">
        Per row
        <input
          type="number" min="1" max="10" placeholder="–"
          value={perRow > 0 ? perRow : ''}
          onChange={e => {
            const n = parseInt(e.target.value, 10)
            if (Number.isFinite(n)) setPerRow(Math.min(10, Math.max(1, n)))
          }}
        />
      </label>
    </div>
  )
}
