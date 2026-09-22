// Small reference DB the "analyser" matches against. In a real deployment this
// would be a proper image-embedding index; here it's a lightweight keyword +
// color-signature heuristic so the analyser works fully offline, on-device.
export const MANHWA_DB = [
  { id: 'mh1', title: 'Solo Ascension', tags: ['solo', 'leveling', 'hunter', 'shadow', 'dungeon'], palette: ['#1b1033', '#6c3fd1'] },
  { id: 'mh2', title: 'Crimson Tower', tags: ['tower', 'climb', 'crimson', 'trial', 'floor'], palette: ['#3a0d0d', '#c0392b'] },
  { id: 'mh3', title: 'Moonlit Blade', tags: ['sword', 'moon', 'blade', 'demon', 'night'], palette: ['#0d1b3a', '#4a6fd6'] },
  { id: 'mh4', title: 'Verdant Academy', tags: ['school', 'academy', 'magic', 'student', 'uniform'], palette: ['#0d3a1e', '#3fd17f'] },
  { id: 'mh5', title: 'Iron Regressor', tags: ['regressor', 'iron', 'revenge', 'past', 'timeloop'], palette: ['#2b2b2b', '#9a9a9a'] },
]

export const MEME_TAGS = ['reaction', 'template', 'caption', 'format', 'relatable', 'wojak', 'drake']

const placeholder = (seed, colorA, colorB) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='400' height='560'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${colorA}'/>
        <stop offset='100%' stop-color='${colorB}'/>
      </linearGradient>
    </defs>
    <rect width='400' height='560' fill='url(#g)'/>
    <text x='50%' y='50%' fill='white' font-size='28' font-family='sans-serif' text-anchor='middle' opacity='0.85'>${seed}</text>
  </svg>`)}`

let imgId = 0
const img = (label, colorA, colorB, tags) => ({
  id: `img_${++imgId}`,
  url: placeholder(label, colorA, colorB),
  tags,
  addedAt: Date.now() - Math.floor(Math.random() * 1e10)
})

export function seedAlbums() {
  return [
    {
      id: 'alb_1',
      name: 'Solo Ascension - Ch. 42',
      category: 'Manhwa',
      description: 'Scanlation pages from the latest chapter drop.',
      coverColor: '#6c3fd1',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      images: [
        img('Page 01', '#1b1033', '#6c3fd1', ['solo', 'shadow', 'hunter']),
        img('Page 02', '#1b1033', '#6c3fd1', ['dungeon', 'leveling']),
        img('Page 03', '#1b1033', '#6c3fd1', ['solo', 'blade']),
      ]
    },
    {
      id: 'alb_2',
      name: 'Weekend Meme Dump',
      category: 'Memes',
      description: 'Stuff saved from group chats.',
      coverColor: '#e6a817',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      images: [
        img('meme_1', '#e6a817', '#b5651d', ['reaction', 'template']),
        img('meme_2', '#e6a817', '#b5651d', ['drake', 'format']),
      ]
    },
    {
      id: 'alb_3',
      name: 'Moonlit Blade Collection',
      category: 'Manhwa',
      description: 'Full arc, chapters 10-18.',
      coverColor: '#4a6fd6',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
      images: [
        img('Page 01', '#0d1b3a', '#4a6fd6', ['sword', 'moon']),
        img('Page 02', '#0d1b3a', '#4a6fd6', ['demon', 'night']),
        img('Page 03', '#0d1b3a', '#4a6fd6', ['blade']),
        img('Page 04', '#0d1b3a', '#4a6fd6', ['moon', 'sword']),
      ]
    },
    {
      id: 'alb_4',
      name: 'Unsorted Screenshots',
      category: 'Other',
      description: 'Needs sorting.',
      coverColor: '#5a6b7a',
      createdAt: Date.now() - 1000 * 60 * 60 * 3,
      images: [
        img('shot_1', '#3a3f47', '#5a6b7a', []),
      ]
    }
  ]
}
