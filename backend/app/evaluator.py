from .retriever import HybridRetriever


def evaluate_retrieval(retriever: HybridRetriever, cases: list[dict], top_k: int = 5) -> dict:
    details = []
    hits = 0
    reciprocal_ranks = []

    for case in cases:
        query = case["query"]
        expected_terms = [term.lower() for term in case.get("expected_terms", [])]
        results = retriever.search(query, top_k=top_k)

        matched_rank = None
        for idx, result in enumerate(results, start=1):
            content = f"{result.section} {result.page} {result.content}".lower()
            if all(term in content for term in expected_terms):
                matched_rank = idx
                break

        is_hit = matched_rank is not None
        if is_hit:
            hits += 1
            reciprocal_ranks.append(1 / matched_rank)
        else:
            reciprocal_ranks.append(0)

        details.append({
            "query": query,
            "expected_terms": expected_terms,
            "hit": is_hit,
            "rank": matched_rank,
            "top_results": [
                {
                    "chunk_id": r.chunk_id,
                    "section": r.section,
                    "page": r.page,
                    "hybrid_score": r.hybrid_score,
                }
                for r in results
            ],
        })

    total = max(len(cases), 1)
    return {
        "total_cases": len(cases),
        "hit_at_k": hits / total,
        "mean_reciprocal_rank": sum(reciprocal_ranks) / total,
        "details": details,
    }
