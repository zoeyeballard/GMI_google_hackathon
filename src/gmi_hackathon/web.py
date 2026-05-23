from __future__ import annotations

from pathlib import Path

WEB_DIR = Path(__file__).resolve().parent / "web"


def get_index_html() -> str:
    return (WEB_DIR / "index.html").read_text(encoding="utf-8")