import Diagram from './Diagram.jsx'
import ChapterImages from './ChapterImages.jsx'
function Block({ title, items }) {
  if (!items?.length) return null

  return (
    <section className="info-block">
      <h2>{title}</h2>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </section>
  )
}

export default function RunbookPage({ page }) {
  return (
    <>
      <Diagram src={page.diagram} title={page.title} />

      <div className="runbook-grid">
        <Block title="Problem" items={page.problem} />
        <Block title="Manual steps" items={page.configured} />
        <Block title="Validation" items={page.validation} />
      </div>
      <ChapterImages pageId={page.id} />
    </>
  )
}
