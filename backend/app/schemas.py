from pydantic import BaseModel, Field
from typing import Any


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=20)


class AskRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=12)
    use_llm: bool = False


class EvalCase(BaseModel):
    query: str
    expected_terms: list[str] = Field(default_factory=list)


class EvalRequest(BaseModel):
    cases: list[EvalCase]
    top_k: int = Field(default=5, ge=1, le=20)


class ChunkResult(BaseModel):
    chunk_id: str
    section: str
    page: str
    content: str
    bm25_score: float
    vector_score: float
    hybrid_score: float


class SearchResponse(BaseModel):
    query: str
    top_k: int
    results: list[ChunkResult]


class AskResponse(BaseModel):
    query: str
    answer: str
    mode: str
    citations: list[dict[str, Any]]
    results: list[ChunkResult]


class EvalResponse(BaseModel):
    total_cases: int
    hit_at_k: float
    mean_reciprocal_rank: float
    details: list[dict[str, Any]]


class AgentRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=6, ge=1, le=12)
    mode: str = "diagnose"


class AgentResponse(BaseModel):
    question: str
    mode: str
    provider: str
    answer: str
    citations: list[dict[str, Any]]
    retrieved: list[ChunkResult]
