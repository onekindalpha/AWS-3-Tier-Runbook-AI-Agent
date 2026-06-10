import { useMemo, useState } from 'react'
import { chapterImages } from '../data/chapterImages.js'

function resolveAsset(src) {
  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src
  return `${cleanBase}${cleanSrc}`
}

function uniqueActions(images) {
  const seen = new Set()
  const result = []

  for (const image of images) {
    const caption = image.caption || ''
    if (!caption || seen.has(caption)) continue
    seen.add(caption)
    result.push(caption)
  }

  return result
}

export default function ChapterImages({ pageId }) {
  const groups = chapterImages[pageId] || []
  const [activeGroup, setActiveGroup] = useState(null)
  const [zoomImage, setZoomImage] = useState(null)

  const visibleGroups = useMemo(() => {
    return groups.filter((group) => group.images?.length)
  }, [groups])

  if (!visibleGroups.length) return null

  const openGroup = (group) => {
    setActiveGroup(group)
    setZoomImage(null)
  }

  const closeModal = () => {
    setActiveGroup(null)
    setZoomImage(null)
  }

  return (
    <section className="compact-chapter-images">
      <div className="compact-section-head">
        <span className="section-label">Chapter source images</span>
        <strong>{visibleGroups.length} step group(s)</strong>
      </div>

      <div className="compact-group-grid">
        {visibleGroups.map((group) => {
          const previewImages = group.images.slice(0, 3)
          const actions = uniqueActions(group.images)
          const representativeAction = actions[0] || '이 단계의 AWS 설정 값을 선택한다'

          return (
            <button
              type="button"
              className="compact-group-card"
              key={group.title}
              onClick={() => openGroup(group)}
            >
              <div className="compact-group-top">
                <strong title={group.title}>{group.title}</strong>
                <span>{group.images.length}</span>
              </div>

              <div className="compact-thumb-strip">
                {previewImages.map((image) => (
                  <img
                    key={image.id}
                    src={resolveAsset(image.src)}
                    alt={image.caption}
                    loading="lazy"
                  />
                ))}
                {group.images.length > 3 && (
                  <div className="compact-more">+{group.images.length - 3}</div>
                )}
              </div>

              <p title={representativeAction}>{representativeAction}</p>
            </button>
          )
        })}
      </div>

      {activeGroup && (
        <div className="compact-modal" onClick={closeModal}>
          <div className="compact-modal-panel" onClick={(event) => event.stopPropagation()}>
            <header className="compact-modal-head">
              <div>
                <strong>{activeGroup.title}</strong>
                <p>{activeGroup.images.length} image(s)</p>
              </div>
              <button type="button" onClick={closeModal}>Close</button>
            </header>

            {!zoomImage && (
              <div className="compact-modal-grid">
                {activeGroup.images.map((image) => (
                  <button
                    type="button"
                    className="compact-modal-image-card"
                    key={image.id}
                    onClick={() => setZoomImage(image)}
                  >
                    <div>{image.label}</div>
                    <img
                      src={resolveAsset(image.src)}
                      alt={image.caption}
                      loading="lazy"
                    />
                    <p>{image.caption}</p>
                  </button>
                ))}
              </div>
            )}

            {zoomImage && (
              <div className="compact-zoom-view">
                <button
                  type="button"
                  className="compact-back-button"
                  onClick={() => setZoomImage(null)}
                >
                  ← Back to group
                </button>

                <div className="compact-zoom-title">
                  <strong>{zoomImage.label}</strong>
                  <p>{zoomImage.caption}</p>
                </div>

                <img src={resolveAsset(zoomImage.src)} alt={zoomImage.caption} />
                <p className="compact-source">{zoomImage.source}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
