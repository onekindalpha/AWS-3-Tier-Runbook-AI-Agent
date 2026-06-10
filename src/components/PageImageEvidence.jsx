import { docImagesByPage } from '../data/docImagesByPage.js'

function resolvePublicAsset(src) {
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src

  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src

  return `${cleanBase}${cleanSrc}`
}

export default function PageImageEvidence({ pageId }) {
  const images = docImagesByPage[pageId] || []

  if (!images.length) {
    return (
      <div className="page-image-empty">
        <strong>이 챕터에 연결된 문서 이미지는 없습니다.</strong>
        <p>자동 분류 기준에 맞는 DOCX 이미지만 표시합니다. 전체 이미지를 반복 출력하지 않습니다.</p>
      </div>
    )
  }

  return (
    <div className="page-image-grid">
      {images.map((image, index) => {
        const isBrowserFriendly = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(image.format)

        return (
          <figure className="page-image-card" key={`${image.src}-${index}`}>
            <div className="image-card-top" title={image.chapterLabel}>
              {image.chapterLabel}
            </div>

            {isBrowserFriendly ? (
              <img src={resolvePublicAsset(image.src)} alt={image.caption} />
            ) : (
              <div className="image-unpreviewable">
                <strong>{image.format.toUpperCase()} 이미지 추출됨</strong>
                <p>브라우저에서 직접 미리보기 어려운 형식입니다.</p>
              </div>
            )}

            <figcaption className="image-card-caption" title={image.caption}>
              {image.caption}
            </figcaption>

            {image.confidence === 'review' && (
              <div className="image-review-badge">분류 확인 필요</div>
            )}
          </figure>
        )
      })}
    </div>
  )
}
