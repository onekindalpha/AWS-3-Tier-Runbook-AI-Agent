# Development Notes

This file contains project structure, local setup, API examples, environment variables, Docker backend usage, and security notes for AWS 3-Tier Runbook AI Agent.

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI endpoints
│   │   ├── ingest.py        # DOCX ingestion and chunking
│   │   ├── retriever.py     # BM25 + TF-IDF hybrid retrieval
│   │   ├── prompt.py        # grounded answer prompt/fallback
│   │   ├── agent.py         # Groq RAG runbook agent
│   │   ├── evaluator.py     # retrieval evaluation
│   │   ├── schemas.py
│   │   └── config.py
│   └── requirements.txt
├── docs/
│   └── aws_3tier_manual_ver4.1.0.docx
├── src/
│   ├── components/
│   └── data/
├── public/
├── Dockerfile.backend
├── docker-compose.yml
└── README.md
```

## Run Locally

### 1. Backend

```bash
cd ~/aws-3tier-architecture-docs

python3 -m venv backend/.venv
source backend/.venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

Run without LLM generation:

```bash
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

Run with Groq:

```bash
export ALLOW_LLM=true
export LLM_PROVIDER=groq
export GROQ_API_KEY="your-groq-api-key"
export GROQ_MODEL="llama-3.1-8b-instant"

python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

Open another terminal:

```bash
cd ~/aws-3tier-architecture-docs
npm install
VITE_RAG_API_BASE=http://127.0.0.1:8000 npm run dev -- --force
```

Open:

```text
http://localhost:5173/aws-3tier-architecture-docs/
```

## API

### Health

```bash
curl http://127.0.0.1:8000/api/health
```

### Search Evidence

```bash
curl -X POST http://127.0.0.1:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Flask NACL inbound", "top_k":5}'
```

### Ask with Evidence

```bash
curl -X POST http://127.0.0.1:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"RDS 접근이 안 될 때 무엇을 확인해야 해?", "top_k":5, "use_llm":true}'
```

### Run AI Agent

```bash
curl -X POST http://127.0.0.1:8000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"question":"ALB target group이 unhealthy면 어떤 순서로 봐야 해?", "top_k":6, "mode":"diagnose"}'
```

### Retrieval Evaluation

```bash
curl -X POST http://127.0.0.1:8000/api/eval \
  -H "Content-Type: application/json" \
  -d '{
    "top_k": 5,
    "cases": [
      {
        "query": "RDS 접근이 안 될 때 확인할 항목",
        "expected_terms": ["RDS"]
      }
    ]
  }'
```

Interactive API docs:

```text
http://127.0.0.1:8000/docs
```

## Environment Variables

| Variable | Description |
|---|---|
| `ALLOW_LLM` | Enables LLM generation when set to `true` |
| `LLM_PROVIDER` | `groq`, `openai`, `auto`, or `none` |
| `GROQ_API_KEY` | Groq API key. Do not commit this value |
| `GROQ_MODEL` | Groq chat model identifier |
| `GROQ_BASE_URL` | OpenAI-compatible Groq base URL |
| `OPENAI_API_KEY` | Optional OpenAI API key |
| `OPENAI_MODEL` | Optional OpenAI model name |
| `TOP_K_DEFAULT` | Default number of retrieved chunks |

## Docker Backend

```bash
docker compose up --build rag-backend
```

Backend API:

```text
http://127.0.0.1:8000
```

## Security Note

Do not commit API keys.

Use local shell environment variables, `.env`, GitHub Secrets, or deployment platform secrets.

```bash
export GROQ_API_KEY="your-key"
```

Never put real API keys in:

- `README.md`
- frontend code
- committed `.env`
- screenshots
- issue comments
