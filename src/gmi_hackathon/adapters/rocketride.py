from __future__ import annotations

from collections.abc import Sequence

from ..models import ContextHit
from ..local_context import LocalContextCorpus


class RocketRideContextRetriever:
    def __init__(self, corpus: LocalContextCorpus):
        self._corpus = corpus

    def search(self, query: str, limit: int = 3) -> Sequence[ContextHit]:
        results = self._corpus.search(query=query, limit=limit)
        hits: list[ContextHit] = []
        for item in results:
            hits.append(
                ContextHit(
                    source=str(item.get("source", "")),
                    note=str(item.get("note", "")),
                    similarity_reason=str(item.get("similarity_reason", "")),
                )
            )
        return hits