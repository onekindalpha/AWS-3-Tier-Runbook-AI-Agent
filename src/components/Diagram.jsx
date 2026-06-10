function resolveAsset(src) {
  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  return `${cleanBase}assets/diagrams/${src}`
}

export default function Diagram({ src, title }) {
  if (!src) return null

  return (
    <section className="diagram-card">
      <div className="section-label">Architecture diagram</div>
      <img src={resolveAsset(src)} alt={title} />
    </section>
  )
}
