from __future__ import annotations

from dataclasses import dataclass
from typing import Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .ingest import load_or_build_index
from .text_utils import tokenize, BM25


@dataclass
class RetrievalResult:
    chunk_id: str
    section: str
    page: str
    content: str
    bm25_score: float
    vector_score: float
    hybrid_score: float


class HybridRetriever:
    def __init__(self) -> None:
        self.chunks: list[dict[str, Any]] = []
        self.texts: list[str] = []
        self.tokens: list[list[str]] = []
        self.vectorizer: TfidfVectorizer | None = None
        self.tfidf_matrix = None
        self.bm25: BM25 | None = None
        self.load(force=False)

    def load(self, force: bool = False) -> None:
        self.chunks = load_or_build_index(force=force)
        self.texts = [
            f"{chunk.get('section', '')} {chunk.get('page', '')} {chunk.get('content', '')}"
            for chunk in self.chunks
        ]
        self.tokens = [tokenize(text) for text in self.texts]
        self.bm25 = BM25(self.tokens)
        self.vectorizer = TfidfVectorizer(
            tokenizer=tokenize,
            token_pattern=None,
            lowercase=False,
            ngram_range=(1, 2),
            min_df=1,
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.texts) if self.texts else None

    def _normalize_scores(self, scores: np.ndarray) -> np.ndarray:
        if scores.size == 0:
            return scores
        max_score = scores.max()
        min_score = scores.min()
        if max_score <= min_score:
            return np.zeros_like(scores, dtype=float)
        return (scores - min_score) / (max_score - min_score)

    def search(self, query: str, top_k: int = 5) -> list[RetrievalResult]:
        if not query.strip() or not self.chunks:
            return []

        query_tokens = tokenize(query)
        bm25_raw = np.array([
            self.bm25.score(query_tokens, doc_tokens) if self.bm25 else 0.0
            for doc_tokens in self.tokens
        ], dtype=float)

        if self.vectorizer is not None and self.tfidf_matrix is not None:
            query_vec = self.vectorizer.transform([query])
            vector_raw = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        else:
            vector_raw = np.zeros(len(self.chunks), dtype=float)

        bm25_norm = self._normalize_scores(bm25_raw)
        vector_norm = self._normalize_scores(vector_raw)

        # Hybrid retrieval: lexical BM25 is slightly stronger for AWS resource names.
        hybrid = (0.58 * bm25_norm) + (0.42 * vector_norm)

        ranked_indices = np.argsort(-hybrid)[:top_k]

        results: list[RetrievalResult] = []
        for idx in ranked_indices:
            if hybrid[idx] <= 0:
                continue
            chunk = self.chunks[int(idx)]
            results.append(
                RetrievalResult(
                    chunk_id=chunk["chunk_id"],
                    section=chunk["section"],
                    page=chunk["page"],
                    content=chunk["content"],
                    bm25_score=round(float(bm25_raw[idx]), 6),
                    vector_score=round(float(vector_raw[idx]), 6),
                    hybrid_score=round(float(hybrid[idx]), 6),
                )
            )
        return results


retriever = HybridRetriever()
