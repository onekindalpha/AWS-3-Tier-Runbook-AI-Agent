import { useMemo, useState } from 'react'
import { manualImages } from '../data/manualImages.js'

function resolveAsset(src) {
  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src
  return `${cleanBase}${cleanSrc}`
}

function groupImages(images) {
  const map = new Map()
  for (const image of images) {
    const key = image.group || image.caption || 'Source manual images'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(image)
  }
  return Array.from(map.entries()).map(([title, items]) => ({ title, items }))
}

export default function ManualImages() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const filteredImages = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return manualImages
    return manualImages.filter((image) => {
      return `${image.title} ${image.source} ${image.caption} ${image.format}`.toLowerCase().includes(q)
    })
  }, [query])

  const groups = useMemo(() => groupImages(filteredImages), [filteredImages])

  return (
    <section className="feature-panel">
      <div className="feature-header">
        <span className="section-label">Source manual images</span>
        <h2>DOCX 원본 이미지를 action별로 묶어서 확인한다</h2>
        <p>
          각 런북 챕터에 이미지를 반복해서 뿌리지 않고, 원본 이미지 136장을 이 페이지에서 검색·확대합니다.
          이미지 설명은 “확인한 화면”이 아니라 매뉴얼 동작 문장으로 표시합니다.
        </p>
      </div>

      <div className="image-toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="예: RDS, subnet, inbound, health"
        />
        <div>{filteredImages.length} / {manualImages.length} images</div>
      </div>

      <div className="manual-image-groups">
        {groups.map((group) => (
          <section className="manual-image-group" key={group.title}>
            <div className="group-title">
              <strong>{group.title}</strong>
              <span>{group.items.length} image(s)</span>
            </div>

            <div className="manual-image-grid">
              {group.items.map((image) => {
                const canPreview = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(image.format)
                return (
                  <button
                    className="manual-image-card"
                    type="button"
                    key={image.id}
                    onClick={() => setSelected(image)}
                  >
                    <div className="manual-image-top">{image.title}</div>
                    {canPreview ? (
                      <img src={resolveAsset(image.src)} alt={image.caption} />
                    ) : (
                      <div className="manual-image-unpreviewable">{image.format.toUpperCase()}</div>
                    )}
                    <div className="manual-image-caption">{image.caption}</div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <div className="image-modal" onClick={() => setSelected(null)}>
          <div className="image-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="image-modal-header">
              <div>
                <strong>{selected.title}</strong>
                <p>{selected.caption}</p>
              </div>
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
            <img src={resolveAsset(selected.src)} alt={selected.caption} />
            <p className="modal-source">{selected.source}</p>
          </div>
        </div>
      )}
    </section>
  )
}
