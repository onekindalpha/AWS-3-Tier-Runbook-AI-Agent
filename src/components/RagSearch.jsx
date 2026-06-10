import { useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_RAG_API_BASE || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')

const quickActions = [
  { label: 'VPC / Subnet', query: 'VPC subnet route table public private' },
  { label: 'Security Group', query: 'security group inbound outbound port' },
  { label: 'ALB / Web Tier', query: 'ALB load balancer web tier target group nginx' },
  { label: 'API Tier', query: 'API Flask application tier internal' },
  { label: 'RDS', query: 'RDS database DB subnet private' },
  { label: '검증 절차', query: 'curl health status validation test' },
]

function formatScore(score) {
  if (score === undefined || score === null) return '-'
  return Number(score).toFixed(3)
}

export default function RagSearch() {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(5)
  const [useLlm, setUseLlm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState(null)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')

  const hasQuery = useMemo(() => query.trim().length > 0, [query])

  async function runSearch(nextQuery = query) {
    if (!nextQuery.trim()) return
    setLoading(true)
    setError('')
    setAnswer(null)

    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nextQuery, top_k: topK }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(`검색 API 호출 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function runAsk(nextQuery = query) {
    if (!nextQuery.trim()) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: nextQuery, top_k: topK, use_llm: useLlm }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setAnswer(data)
      setResults(data.results || [])
    } catch (err) {
      setError(`답변 API 호출 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const applyQuickAction = (action) => {
    setQuery(action.query)
    runAsk(action.query)
  }

  return (
    <section className="feature-panel rag-backend-panel">
      <div className="feature-header">
        <span className="section-label">FastAPI Hybrid RAG</span>
        <h2>문서 근거를 검색하고 grounded answer를 생성한다</h2>
        <p>
          DOCX 매뉴얼을 backend에서 chunk로 변환하고, BM25 + TF-IDF vector hybrid retrieval로 관련 근거를 찾습니다.
          LLM key가 없으면 extractive grounded answer로 fallback합니다.
        </p>
      </div>

      <div className="rag-form">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') runAsk()
          }}
          placeholder="예: Flask NACL inbound는 어디서 설정해?"
        />

        <select value={topK} onChange={(event) => setTopK(Number(event.target.value))}>
          <option value={3}>top 3</option>
          <option value={5}>top 5</option>
          <option value={8}>top 8</option>
          <option value={10}>top 10</option>
        </select>

        <label className="llm-toggle">
          <input
            type="checkbox"
            checked={useLlm}
            onChange={(event) => setUseLlm(event.target.checked)}
          />
          LLM
        </label>
      </div>

      <div className="quick-actions">
        {quickActions.map((action) => (
          <button key={action.label} onClick={() => applyQuickAction(action)}>
            {action.label}
          </button>
        ))}
      </div>

      <div className="rag-action-row">
        <button type="button" onClick={() => runSearch()} disabled={!hasQuery || loading}>
          Search evidence
        </button>
        <button type="button" onClick={() => runAsk()} disabled={!hasQuery || loading}>
          Ask with evidence
        </button>
      </div>

      {loading && <div className="rag-message">처리 중...</div>}
      {error && <div className="rag-error">{error}</div>}

      {answer && (
        <section className="grounded-answer">
          <div className="answer-head">
            <strong>Grounded answer</strong>
            <span>{answer.mode}</span>
          </div>
          <pre>{answer.answer}</pre>

          {!!answer.citations?.length && (
            <div className="citation-row">
              {answer.citations.map((citation) => (
                <span key={citation.chunk_id}>
                  {citation.chunk_id} · {citation.section}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {!!results.length && (
        <section className="retrieval-results">
          <div className="result-count">Retrieved evidence {results.length}</div>

          {results.map((result, index) => (
            <article className="retrieval-card" key={result.chunk_id}>
              <div className="retrieval-card-head">
                <strong>#{index + 1} {result.section}</strong>
                <span>{result.page}</span>
              </div>

              <p>{result.content}</p>

              <div className="score-row">
                <span>BM25 {formatScore(result.bm25_score)}</span>
                <span>Vector {formatScore(result.vector_score)}</span>
                <span>Hybrid {formatScore(result.hybrid_score)}</span>
              </div>
            </article>
          ))}
        </section>
      )}
    </section>
  )
}
