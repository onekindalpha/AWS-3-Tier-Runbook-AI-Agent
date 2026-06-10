import { useState } from 'react'

const API_BASE = import.meta.env.VITE_RAG_API_BASE || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')

const examples = [
  'RDS 접근이 안 될 때 어디부터 확인해야 해?',
  'Flask NACL inbound 규칙은 어디에서 설정해?',
  'ALB target group이 unhealthy면 어떤 순서로 봐야 해?',
  'Web Tier에서 API Tier로 요청이 안 갈 때 진단 순서 알려줘',
]

export default function RagAgent() {
  const [question, setQuestion] = useState(examples[0])
  const [topK, setTopK] = useState(6)
  const [mode, setMode] = useState('diagnose')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState('')

  async function runAgent(nextQuestion = question) {
    if (!nextQuestion.trim()) return

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const res = await fetch(`${API_BASE}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: nextQuestion, top_k: topK, mode }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setResponse(await res.json())
    } catch (err) {
      setError(`Agent 호출 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="feature-panel rag-agent-panel">
      <div className="feature-header">
        <span className="section-label">Groq RAG Agent</span>
        <h2>문서 근거 기반으로 장애 진단 절차를 생성한다</h2>
        <p>
          이 Agent는 AWS 콘솔을 직접 조작하지 않습니다. Hybrid retrieval로 매뉴얼 근거를 찾고,
          Groq LLM이 그 근거 안에서 진단 순서와 검증 절차를 작성합니다.
        </p>
      </div>

      <div className="agent-question-box">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="예: RDS 접근이 안 될 때 어디부터 확인해야 해?"
        />

        <div className="agent-controls">
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="diagnose">diagnose</option>
            <option value="checklist">checklist</option>
            <option value="troubleshoot">troubleshoot</option>
          </select>

          <select value={topK} onChange={(event) => setTopK(Number(event.target.value))}>
            <option value={4}>top 4</option>
            <option value={6}>top 6</option>
            <option value={8}>top 8</option>
            <option value={10}>top 10</option>
          </select>

          <button type="button" onClick={() => runAgent()} disabled={loading}>
            Run Agent
          </button>
        </div>
      </div>

      <div className="agent-example-row">
        {examples.map((item) => (
          <button
            type="button"
            key={item}
            onClick={() => {
              setQuestion(item)
              runAgent(item)
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <div className="rag-message">Agent 실행 중...</div>}
      {error && <div className="rag-error">{error}</div>}

      {response && (
        <section className="agent-response">
          <div className="agent-response-head">
            <strong>Agent answer</strong>
            <span>{response.provider}</span>
          </div>

          <pre>{response.answer}</pre>

          {!!response.citations?.length && (
            <div className="citation-row">
              {response.citations.map((citation) => (
                <span key={citation.chunk_id}>
                  {citation.chunk_id} · {citation.section}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {response?.retrieved?.length > 0 && (
        <section className="agent-evidence">
          <div className="result-count">Retrieved evidence</div>
          {response.retrieved.map((item) => (
            <article className="retrieval-card" key={item.chunk_id}>
              <div className="retrieval-card-head">
                <strong>{item.section}</strong>
                <span>{item.page} · {Number(item.hybrid_score).toFixed(3)}</span>
              </div>
              <p>{item.content}</p>
            </article>
          ))}
        </section>
      )}
    </section>
  )
}
