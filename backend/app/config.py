from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DOCX_PATH = PROJECT_ROOT / "docs" / "aws_3tier_manual_ver4.1.0.docx"
DATA_DIR = PROJECT_ROOT / "backend" / "data"
LOG_DIR = PROJECT_ROOT / "backend" / "logs"
INDEX_PATH = DATA_DIR / "rag_index.json"
QUERY_LOG_PATH = LOG_DIR / "queries.jsonl"

TOP_K_DEFAULT = int(os.getenv("TOP_K_DEFAULT", "5"))

ALLOW_LLM = os.getenv("ALLOW_LLM", "false").lower() in {"1", "true", "yes", "y"}
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "auto").strip().lower()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant").strip()
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip()
