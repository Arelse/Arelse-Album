// Reference data the analyser scores AI-derived tags against.
// No demo albums or placeholder images live here anymore — the app now
// starts empty and fills up with whatever you actually import from your
// gallery. MANHWA_DB is a small starter set you can extend yourself: add
// an entry with keywords you know appear in a series' AI tags (or tags
// you add by hand) and the analyser will start matching against it too.
export const MANHWA_DB = [
  { id: 'mh1', title: 'Solo Ascension', tags: ['solo', 'leveling', 'hunter', 'shadow', 'dungeon'] },
  { id: 'mh2', title: 'Crimson Tower', tags: ['tower', 'climb', 'crimson', 'trial', 'floor'] },
  { id: 'mh3', title: 'Moonlit Blade', tags: ['sword', 'moon', 'blade', 'demon', 'night'] },
]

// MobileNet/ImageNet labels that tend to show up on meme-style images
// (text overlays, flat graphics, screenshots, templates) versus ones that
// tend to show up on comic/manhwa-style illustrated pages.
export const MEME_TAGS = ['website', 'web', 'screen', 'envelope', 'menu', 'crossword', 'puzzle', 'advertisement', 'reaction', 'template', 'caption']
export const COMIC_TAGS = ['comic', 'book', 'jigsaw', 'cartoon', 'sketch', 'illustration', 'drawing', 'paper', 'poster']
