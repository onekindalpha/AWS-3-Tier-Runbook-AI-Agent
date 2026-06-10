import re
from collections import Counter
from math import log


TOKEN_RE = re.compile(r"[A-Za-z0-9가-힣_/-]+")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def tokenize(text: str) -> list[str]:
    return [t.lower() for t in TOKEN_RE.findall(text or "") if len(t.strip()) >= 2]


def digit_ratio(text: str) -> float:
    if not text:
        return 0.0
    return sum(ch.isdigit() for ch in text) / max(len(text), 1)


def looks_like_toc_or_page_noise(text: str) -> bool:
    compact = re.sub(r"\s+", "", text or "")
    circled = len(re.findall(r"[①-⑳㉑-㊿⑴-⑽]", text or ""))
    numbered_heads = len(re.findall(r"\d{1,3}[.)][^\s]{2,}", compact))
    page_tail_nums = len(re.findall(r"[가-힣A-Za-z)]\d{1,3}(?=\s|$|[①-⑳㉑-㊿])", text or ""))
    if len(text) >= 45 and (numbered_heads >= 3 or page_tail_nums >= 4):
        return True
    if len(text) >= 40 and circled >= 3:
        return True
    if len(text) >= 60 and digit_ratio(text) > 0.22 and text.count(".") >= 5:
        return True
    return False


def clean_paragraph(text: str) -> str:
    text = normalize(text)
    text = re.sub(r"^[①-⑳㉑-㊿⑴-⑽]\s*", "", text)
    text = re.sub(r"^\d{1,3}[.)]\s*", "", text)
    text = re.sub(r"\s*\d{1,3}$", "", text)
    text = re.sub(r"([가-힣A-Za-z)])\d{1,3}(?=\s|$)", r"\1", text)
    return normalize(text)


def is_noise_paragraph(text: str) -> bool:
    text = normalize(text)
    if not text:
        return True
    if text.lower() in {"contents", "table of contents"}:
        return True
    if text in {"목차", "차례"}:
        return True
    if re.fullmatch(r"[\d\s./①-⑳㉑-㊿()\\-]+", text):
        return True
    if looks_like_toc_or_page_noise(text):
        return True
    if len(text) < 8 and not re.search(r"(VPC|ALB|RDS|NACL|API|Subnet|Route|Security|Flask|검증|보안|서브넷)", text, re.I):
        return True
    return False


def split_sentences(text: str) -> list[str]:
    text = normalize(text)
    parts = re.split(r"(?<=[.!?。])\s+|(?<=다\.)\s+|(?<=요\.)\s+", text)
    return [normalize(p) for p in parts if len(normalize(p)) >= 12 and not looks_like_toc_or_page_noise(p)]


class BM25:
    def __init__(self, corpus_tokens: list[list[str]], k1: float = 1.5, b: float = 0.75):
        self.corpus_tokens = corpus_tokens
        self.k1 = k1
        self.b = b
        self.doc_count = len(corpus_tokens)
        self.avgdl = sum(len(doc) for doc in corpus_tokens) / max(self.doc_count, 1)
        self.doc_freq: Counter[str] = Counter()
        for doc in corpus_tokens:
            for term in set(doc):
                self.doc_freq[term] += 1
        self.idf = {
            term: log(1 + (self.doc_count - df + 0.5) / (df + 0.5))
            for term, df in self.doc_freq.items()
        }

    def score(self, query_tokens: list[str], doc_tokens: list[str]) -> float:
        if not query_tokens or not doc_tokens:
            return 0.0
        freqs = Counter(doc_tokens)
        doc_len = len(doc_tokens)
        score = 0.0
        for term in query_tokens:
            if term not in freqs:
                continue
            idf = self.idf.get(term, 0.0)
            tf = freqs[term]
            denom = tf + self.k1 * (1 - self.b + self.b * doc_len / max(self.avgdl, 1e-9))
            score += idf * ((tf * (self.k1 + 1)) / max(denom, 1e-9))
        return float(score)
