import { useMemo, useState } from 'react'
import { pages } from './data/pages.js'
import RunbookPage from './components/RunbookPage.jsx'
import RagSearch from './components/RagSearch.jsx'
import RagAgent from './components/RagAgent.jsx'

function initialIndex() {
  const hash = window.location.hash.replace('#', '')
  const index = pages.findIndex((page) => page.id === hash)
  return index >= 0 ? index : 0
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [query, setQuery] = useState('')

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pages
    return pages.filter((page) => `${page.title} ${page.nav} ${page.subtitle}`.toLowerCase().includes(q))
  }, [query])

  const page = pages[currentIndex]

  const moveTo = (index) => {
    setCurrentIndex(index)
    window.location.hash = pages[index].id
  }

  const renderPage = () => {
    if (page.type === 'rag') return <RagSearch />
    if (page.type === 'agent') return <RagAgent />
    return <RunbookPage page={page} />
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">AWS</div>
          <div>
            <h1>Manual RAG Assistant</h1>
            <p>3-Tier Runbook · Search · Agent Actions</p>
          </div>
        </div>

        <input
          className="nav-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages..."
        />

        <nav className="nav-list">
          {filteredPages.map((navPage) => {
            const index = pages.findIndex((pageItem) => pageItem.id === navPage.id)
            return (
              <button
                key={navPage.id}
                className={index === currentIndex ? 'active' : ''}
                onClick={() => moveTo(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {navPage.nav}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="content">
        <div className="progress-line">
          <span>Page {currentIndex + 1} / {pages.length}</span>
          <span>{Math.round(((currentIndex + 1) / pages.length) * 100)}%</span>
        </div>

        <section className="hero">
          <span className="eyebrow">AWS 3-Tier Architecture</span>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </section>

        {renderPage()}

        <div className="nav-buttons">
          <button onClick={() => moveTo(Math.max(currentIndex - 1, 0))} disabled={currentIndex === 0}>
            ← Previous
          </button>
          <button onClick={() => moveTo(Math.min(currentIndex + 1, pages.length - 1))} disabled={currentIndex === pages.length - 1}>
            Next →
          </button>
        </div>
      </main>
    </div>
  )
}
