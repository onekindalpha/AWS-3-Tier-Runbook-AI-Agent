from .text_utils import split_sentences, tokenize, normalize


SYSTEM_PROMPT = """You are an AWS 3-tier architecture runbook assistant.
Answer only from the provided context.
Do not invent missing steps.
If the context is insufficient, say that the manual does not provide enough evidence.
Use Korean.
Write as a manual action, not as a passive screenshot description.
"""


def build_prompt(query: str, contexts: list[dict]) -> str:
    context_text = "\n\n".join(
        f"[{i + 1}] section={item['section']} page={item['page']}\n{item['content']}"
        for i, item in enumerate(contexts)
    )

    return f"""{SYSTEM_PROMPT}

User question:
{query}

Retrieved context:
{context_text}

Answer format:
1. 먼저 확인할 위치:
2. 설정/클릭할 항목:
3. 검증 방법:
4. 근거:
"""


def extractive_grounded_answer(query: str, contexts: list[dict]) -> str:
    terms = tokenize(query)
    selected_sentences: list[str] = []

    for ctx in contexts:
        sentences = split_sentences(ctx.get("content", ""))
        matched = None
        for sentence in sentences:
            ns = normalize(sentence).lower()
            if any(term in ns for term in terms):
                matched = sentence
                break
        if matched is None and sentences:
            matched = sentences[0]
        if matched:
            selected_sentences.append((ctx.get("section", "매뉴얼"), matched))

    if not selected_sentences:
        return "문서에서 충분한 근거를 찾지 못했습니다. AWS 리소스명이나 설정 항목을 더 구체적으로 입력한다."

    first_section, first_sentence = selected_sentences[0]

    return "\n".join([
        f"1. 먼저 확인할 위치: {first_section}",
        f"2. 설정/클릭할 항목: {manualize(first_sentence)}",
        "3. 검증 방법: 관련 설정을 저장한 뒤 health check, curl 응답, 또는 AWS 콘솔 상태 값을 확인한다.",
        "4. 근거:",
        *[f"   - {section}: {sentence}" for section, sentence in selected_sentences[:4]],
    ])


def manualize(sentence: str) -> str:
    lower = sentence.lower()

    if any(k in lower for k in ["security group", "nacl", "inbound", "outbound", "port", "보안", "인바운드", "아웃바운드"]):
        return "Security Group/NACL 메뉴에서 허용 source, port, 방향을 설정한다."
    if any(k in lower for k in ["vpc", "subnet", "route table", "internet gateway", "nat", "서브넷", "라우트"]):
        return "VPC 메뉴에서 Subnet, Route Table, Gateway 연결을 순서대로 설정한다."
    if any(k in lower for k in ["alb", "load balancer", "target group", "nginx", "web"]):
        return "Load Balancer와 Target Group에서 Web Tier 연결 상태를 설정한다."
    if any(k in lower for k in ["api", "flask", "application", "backend"]):
        return "API 서버 설정에서 내부 endpoint와 service 연결을 설정한다."
    if any(k in lower for k in ["rds", "database", "mysql", "db"]):
        return "RDS 설정에서 DB subnet, endpoint, Security Group 접근 대상을 설정한다."
    if any(k in lower for k in ["curl", "health", "status", "test", "validation", "검증"]):
        return "Terminal 또는 health check에서 endpoint 응답 상태를 검증한다."

    return sentence[:180] + ("…" if len(sentence) > 180 else "")
