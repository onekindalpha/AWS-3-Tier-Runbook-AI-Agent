# AWS 3-Tier Manual RAG Backend

FastAPI backend for the AWS 3-tier manual dashboard.

## Features

- DOCX ingestion
- Chunking with TOC/page-number noise filtering
- BM25 retrieval
- TF-IDF vector retrieval
- Hybrid retrieval score
- Prompt template for grounded answer
- Extractive grounded fallback when no LLM key is provided
- Optional OpenAI LLM answer generation
- Retrieval evaluation endpoint
- Query logging

## Run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.app.main:app --reload --port 8000
```

## Endpoints

```text
GET  /api/health
POST /api/reindex
POST /api/search
POST /api/ask
POST /api/eval
```

## Optional LLM

Create `.env` or export environment variables:

```bash
export ALLOW_LLM=true
export OPENAI_API_KEY="..."
export OPENAI_MODEL="gpt-4o-mini"
```

Without these variables, `/api/ask` returns an extractive grounded answer from retrieved evidence.
