from __future__ import annotations

from typing import Any

from .config import (
    ALLOW_LLM,
    LLM_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
    GROQ_BASE_URL,
)
from .prompt import extractive_grounded_answer


AGENT_SYSTEM_PROMPT = """You are an AWS 3-tier runbook agent.
You are not allowed to claim you executed AWS console actions.
You must answer only from retrieved manual context.
Write in Korean.
Use manual/action style, not passive screenshot descriptions.
Do not say "확인한 화면".
If evidence is insufficient, say what is missing.

Return this structure:
1. 진단 요약
2. 먼저 열어볼 AWS 메뉴
3. 순서대로 수행할 작업
4. 검증 명령/검증 기준
5. 근거
"""


def choose_provider() -> tuple[str, str, str, str]:
    provider = LLM_PROVIDER

    if provider == "auto":
        if GROQ_API_KEY:
            provider = "groq"
        elif OPENAI_API_KEY:
            provider = "openai"
        else:
            provider = "none"

    if provider == "groq":
        return "groq", GROQ_API_KEY, GROQ_MODEL, GROQ_BASE_URL

    if provider == "openai":
        return "openai", OPENAI_API_KEY, OPENAI_MODEL, ""

    return "none", "", "", ""


def build_agent_prompt(question: str, contexts: list[dict[str, Any]], mode: str = "diagnose") -> str:
    context_text = "\n\n".join(
        f"[{idx + 1}] chunk_id={item['chunk_id']} section={item['section']} page={item['page']} score={item['hybrid_score']}\n{item['content']}"
        for idx, item in enumerate(contexts)
    )

    return f"""{AGENT_SYSTEM_PROMPT}

Mode:
{mode}

User question:
{question}

Retrieved manual context:
{context_text}

Important:
- Use only the context above.
- Write actual diagnostic steps.
- Do not claim you clicked AWS.
- Do not mention unavailable images.
"""


def call_llm(question: str, contexts: list[dict[str, Any]], mode: str = "diagnose") -> tuple[str, str]:
    provider, api_key, model, base_url = choose_provider()

    if not ALLOW_LLM or provider == "none" or not api_key:
        return extractive_grounded_answer(question, contexts), "extractive-fallback"

    prompt = build_agent_prompt(question, contexts, mode=mode)

    try:
        from openai import OpenAI

        if provider == "groq":
            client = OpenAI(api_key=api_key, base_url=base_url)
        else:
            client = OpenAI(api_key=api_key)

        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": AGENT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
        )
        answer = completion.choices[0].message.content or ""
        if not answer.strip():
            return extractive_grounded_answer(question, contexts), "extractive-fallback-empty-llm"
        return answer, f"{provider}:{model}"
    except Exception as exc:
        fallback = extractive_grounded_answer(question, contexts)
        return fallback + f"\n\nLLM 호출 실패로 검색 근거 기반 fallback을 사용했습니다: {type(exc).__name__}", f"extractive-fallback-after-{provider}-error"
