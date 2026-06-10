from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timezone
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import (
    QUERY_LOG_PATH,
    LOG_DIR,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    ALLOW_LLM,
    LLM_PROVIDER,
    GROQ_API_KEY,
    GROQ_MODEL,
)
from .retriever import retriever
from .schemas import (
    SearchRequest,
    SearchResponse,
    AskRequest,
    AskResponse,
    EvalRequest,
    EvalResponse,
    AgentRequest,
    AgentResponse,
)
from .prompt import extractive_grounded_answer
from .evaluator import evaluate_retrieval
from .agent import call_llm

app = FastAPI(
    title="AWS 3-Tier Manual RAG Backend",
    version="1.1.0",
    description="FastAPI backend for hybrid retrieval, grounded answers, Groq LLM, and runbook agent.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def log_query(event: dict) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    payload = {"ts": datetime.now(timezone.utc).isoformat(), **event}
    with QUERY_LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def provider_status() -> dict:
    if LLM_PROVIDER == "groq" or (LLM_PROVIDER == "auto" and GROQ_API_KEY):
        provider = "groq"
        model = GROQ_MODEL
        key_available = bool(GROQ_API_KEY)
    elif LLM_PROVIDER == "openai" or (LLM_PROVIDER == "auto" and OPENAI_API_KEY):
        provider = "openai"
        model = OPENAI_MODEL
        key_available = bool(OPENAI_API_KEY)
    else:
        provider = "none"
        model = ""
        key_available = False

    return {
        "provider": provider,
        "model": model,
        "key_available": key_available,
        "llm_enabled": bool(ALLOW_LLM and key_available),
    }


@app.get("/api/health")
def health() -> dict:
    status = provider_status()
    return {
        "status": "ok",
        "chunk_count": len(retriever.chunks),
        "llm_enabled": status["llm_enabled"],
        "llm_provider": status["provider"],
        "llm_model": status["model"],
        "key_available": status["key_available"],
    }


@app.post("/api/reindex")
def reindex() -> dict:
    retriever.load(force=True)
    return {"status": "reindexed", "chunk_count": len(retriever.chunks)}


@app.post("/api/search", response_model=SearchResponse)
def search(request: SearchRequest) -> SearchResponse:
    results = retriever.search(request.query, top_k=request.top_k)
    log_query({
        "type": "search",
        "query": request.query,
        "top_k": request.top_k,
        "result_count": len(results),
    })
    return SearchResponse(
        query=request.query,
        top_k=request.top_k,
        results=[asdict(result) for result in results],
    )


@app.post("/api/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    results = retriever.search(request.query, top_k=request.top_k)
    contexts = [asdict(result) for result in results]

    if request.use_llm:
        answer, mode = call_llm(request.query, contexts, mode="ask")
    else:
        mode = "extractive-fallback"
        answer = extractive_grounded_answer(request.query, contexts)

    citations = [
        {
            "chunk_id": r.chunk_id,
            "section": r.section,
            "page": r.page,
            "hybrid_score": r.hybrid_score,
        }
        for r in results
    ]

    log_query({
        "type": "ask",
        "query": request.query,
        "top_k": request.top_k,
        "mode": mode,
        "result_count": len(results),
    })

    return AskResponse(
        query=request.query,
        answer=answer,
        mode=mode,
        citations=citations,
        results=[asdict(result) for result in results],
    )


@app.post("/api/agent", response_model=AgentResponse)
def run_agent(request: AgentRequest) -> AgentResponse:
    results = retriever.search(request.question, top_k=request.top_k)
    contexts = [asdict(result) for result in results]

    answer, provider_mode = call_llm(request.question, contexts, mode=request.mode)

    citations = [
        {
            "chunk_id": r.chunk_id,
            "section": r.section,
            "page": r.page,
            "hybrid_score": r.hybrid_score,
        }
        for r in results
    ]

    log_query({
        "type": "agent",
        "question": request.question,
        "top_k": request.top_k,
        "mode": request.mode,
        "provider": provider_mode,
        "result_count": len(results),
    })

    return AgentResponse(
        question=request.question,
        mode=request.mode,
        provider=provider_mode,
        answer=answer,
        citations=citations,
        retrieved=[asdict(result) for result in results],
    )


@app.post("/api/eval", response_model=EvalResponse)
def eval_retrieval(request: EvalRequest) -> EvalResponse:
    cases = [case.model_dump() for case in request.cases]
    result = evaluate_retrieval(retriever, cases, top_k=request.top_k)
    log_query({
        "type": "eval",
        "case_count": len(cases),
        "top_k": request.top_k,
        "hit_at_k": result["hit_at_k"],
        "mrr": result["mean_reciprocal_rank"],
    })
    return EvalResponse(**result)
