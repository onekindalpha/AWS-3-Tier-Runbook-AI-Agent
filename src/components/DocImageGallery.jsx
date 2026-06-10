import { docImages } from '../data/docImages.js'

function resolvePublicAsset(src) {
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src

  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src

  return `${cleanBase}${cleanSrc}`
}

export default function DocImageGallery() {
  if (!docImages.length) {
    return (
      <div className="doc-gallery-empty">
        <strong>No images extracted from the source document.</strong>
        <p>docs/aws_3tier_manual_ver4.1.0.docx 안에서 추출 가능한 이미지 파일을 찾지 못했습니다.</p>
      </div>
    )
  }

  return (
    <div className="doc-gallery">
      {docImages.map((image, index) => {
        const isBrowserFriendly = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(image.format)
        return (
          <figure className="doc-image-card" key={image.id}>
            {isBrowserFriendly ? (
              <img src={resolvePublicAsset(image.src)} alt={image.caption} />
            ) : (
              <div className="doc-image-unpreviewable">
                <strong>{image.format.toUpperCase()} image extracted</strong>
                <p>브라우저에서 바로 미리보기 어려운 이미지 형식입니다.</p>
              </div>
            )}
            <figcaption>Image {index + 1}</figcaption>
          </figure>
        )
      })}
    </div>
  )
}
