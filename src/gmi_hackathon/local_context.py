from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


_DEFAULT_CONTEXT_SEED = [
    {
        "source": "match-01",
        "note": "Compact 4-4-2 side that presses on back passes and protects the center.",
        "similarity_reason": "Matches compact mid-block and transition pattern.",
        "keywords": ["compact mid-block", "back pass press", "transition", "4-4-2"],
    },
    {
        "source": "match-02",
        "note": "Team that overloads the left half-space before switching quickly to the weak side.",
        "similarity_reason": "Relevant to left wing overload and quick circulation.",
        "keywords": ["left wing overload", "switch play", "half-space", "circulation"],
    },
    {
        "source": "match-03",
        "note": "Set-piece heavy underdog with near-post corner movement and blocking runs.",
        "similarity_reason": "Useful for dead-ball patterns and corner routines.",
        "keywords": ["set piece", "near post", "corner routine", "blocking run"],
    },
    {
        "source": "match-04",
        "note": "Deep defensive block that counters through a direct target forward.",
        "similarity_reason": "Relevant when the clip shows direct transitions from pressure.",
        "keywords": ["deep block", "direct counter", "target forward", "transition"],
    },
]


@dataclass(frozen=True)
class ContextEntry:
    source: str
    note: str
    similarity_reason: str
    keywords: tuple[str, ...]

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ContextEntry":
        return cls(
            source=str(data.get("source", "")),
            note=str(data.get("note", "")),
            similarity_reason=str(data.get("similarity_reason", "")),
            keywords=tuple(str(item) for item in data.get("keywords", [])),
        )


class LocalContextCorpus:
    def __init__(self, entries: list[ContextEntry]):
        self.entries = entries

    @classmethod
    def load(cls, path: Path | None = None) -> "LocalContextCorpus":
        if path is None:
            path = Path(__file__).resolve().parents[2] / "data" / "context_seed.json"
        if path.exists():
            raw_entries = json.loads(path.read_text(encoding="utf-8"))
        else:
            raw_entries = _DEFAULT_CONTEXT_SEED
        return cls([ContextEntry.from_dict(item) for item in raw_entries])

    def search(self, query: str, limit: int = 3) -> list[dict[str, str]]:
        query_tokens = {token.lower() for token in query.split() if token}
        scored_entries: list[tuple[int, ContextEntry]] = []

        for entry in self.entries:
            entry_tokens = {keyword.lower() for keyword in entry.keywords}
            score = len(query_tokens.intersection(entry_tokens))
            if score:
                scored_entries.append((score, entry))

        if not scored_entries:
            scored_entries = [(0, entry) for entry in self.entries]

        scored_entries.sort(key=lambda item: (-item[0], item[1].source))

        return [
            {
                "source": entry.source,
                "note": entry.note,
                "similarity_reason": entry.similarity_reason,
            }
            for _, entry in scored_entries[:limit]
        ]