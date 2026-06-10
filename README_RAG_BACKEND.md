# FastAPI Hybrid RAG Backend

This backend powers the AWS 3-Tier Runbook AI Agent.

## Core endpoints

```text
GET  /api/health
POST /api/reindex
POST /api/search
POST /api/ask
POST /api/agent
POST /api/eval
```

## Run with Groq

```bash
source backend/.venv/bin/activate

export ALLOW_LLM=true
export LLM_PROVIDER=groq
export GROQ_API_KEY="your-groq-api-key"
export GROQ_MODEL="llama-3.1-8b-instant"

python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## Scope

This is a RAG-powered runbook agent backend. It generates diagnosis and validation steps from retrieved manual evidence. It does not directly operate AWS resources.
