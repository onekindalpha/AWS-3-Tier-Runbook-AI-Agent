import { useEffect, useMemo, useState } from 'react'
import PageImageEvidence from './PageImageEvidence.jsx'

function resolvePublicAsset(src) {
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src

  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanSrc = src.startsWith('/') ? src.slice(1) : src

  return `${cleanBase}${cleanSrc}`
}

function AssetImage({ src, alt, className, fallbackText }) {
  const resolvedSrc = useMemo(() => resolvePublicAsset(src), [src])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    setStatus(src ? 'loading' : 'missing')
  }, [src])

  if (!src || status === 'missing') {
    return (
      <div className="image-fallback">
        <strong>Diagram not configured</strong>
        <p>{fallbackText}</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="image-fallback">
        <strong>Diagram failed to load</strong>
        <p>{resolvedSrc}</p>
      </div>
    )
  }

  return (
    <div className="image-wrap">
      <img
        src={resolvedSrc}
        alt={alt}
        className={className}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      {status === 'loading' && <div className="image-loading">Loading diagram...</div>}
    </div>
  )
}

export default function VisualEvidence({ page }) {
  return (
    <section className="visual-section">
      <div className="section-heading">
        <span className="eyebrow">Visual evidence</span>
        <h2>{page.title} diagram and related source images</h2>
        <p className="section-desc">
          이 챕터와 관련된 도식화와 DOCX 원본 이미지만 표시합니다.
        </p>
      </div>

      <div className="visual-grid single-diagram">
        <div className="visual-card">
          <div className="visual-label">{page.title} structure</div>
          <AssetImage
            src={page.diagram}
            alt={`${page.title} diagram`}
            className="diagram-image"
            fallbackText="기본 SVG 도식화를 불러오지 못했습니다."
          />
        </div>
      </div>

      <div className="source-doc-section">
        <div className="visual-label">Related images from the source document</div>
        <PageImageEvidence pageId={page.id} />
      </div>
    </section>
  )
}
