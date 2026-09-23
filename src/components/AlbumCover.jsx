import React from 'react'

export default function AlbumCover({ album }) {
  return (
    <div className="album-cover" style={!album.coverImage ? { background: album.coverColor } : undefined}>
      {album.coverImage && <img src={album.coverImage} alt="" className="album-cover-img" />}
      <span className="cover-badge">{album.images.length}</span>
      {!album.coverImage && <span className="cover-fallback-label">pages</span>}
    </div>
  )
}
