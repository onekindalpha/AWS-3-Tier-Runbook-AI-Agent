import VisualEvidence from './VisualEvidence.jsx'
import RagSearch from './RagSearch.jsx'

function asArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function TextBlock({ title, items }) {
  if (!items.length) return null

  return (
    <section className="text-block">
      <h2>{title}</h2>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </section>
  )
}

export default function PageViewer({ page, currentIndex, total, onPrev, onNext }) {
  const problemItems = asArray(page.problem)
  const causeItems = asArray(page.cause)
  const actionItems = [
    ...asArray(page.actions),
    ...asArray(page.configured),
    ...asArray(page.result),
  ]
  const validationItems = [
    ...asArray(page.checklist),
    ...asArray(page.validation),
  ]

  return (
    <main className="content">
      <div className="progress-line">
        <span>Page {currentIndex + 1} / {total}</span>
        <span>{Math.round(((currentIndex + 1) / total) * 100)}%</span>
      </div>

      <section className="hero">
        <span className="eyebrow">AWS 3-Tier Architecture</span>
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </section>

      {page.id === 'doc-search' ? (
        <RagSearch />
      ) : (
        <>
          <VisualEvidence page={page} />

          <div className="problem-grid">
            <TextBlock title="Problem" items={problemItems} />
            <TextBlock title="Cause" items={causeItems} />
            <TextBlock title="Configured / Result" items={actionItems} />
          </div>

          {!!validationItems.length && (
            <section className="checklist">
              <h2>Validation Checklist</h2>
              <ul>
                {validationItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <div className="nav-buttons">
        <button onClick={onPrev} disabled={currentIndex === 0}>← Previous</button>
        <button onClick={onNext} disabled={currentIndex === total - 1}>Next →</button>
      </div>
    </main>
  )
}
