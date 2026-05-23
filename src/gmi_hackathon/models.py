from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass(frozen=True)
class AnalysisRequest:
    source: str
    source_type: str = "url"
    team_name: str = ""
    tournament: str = ""
    clip_minutes: int = 5

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class Observation:
    timestamp_s: float
    label: str
    confidence: float
    details: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ContextHit:
    source: str
    note: str
    similarity_reason: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class AnalysisPacket:
    request: AnalysisRequest
    observations: list[Observation] = field(default_factory=list)
    context_hits: list[ContextHit] = field(default_factory=list)
    raw_payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "request": self.request.to_dict(),
            "observations": [observation.to_dict() for observation in self.observations],
            "context_hits": [hit.to_dict() for hit in self.context_hits],
            "raw_payload": self.raw_payload,
        }


@dataclass(frozen=True)
class ScoutingReport:
    team_profile: str
    key_threats: list[str]
    set_piece_tendencies: list[str]
    historical_context: list[str]
    coaching_recommendations: list[str]
    evidence: list[str] = field(default_factory=list)
    generated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "ScoutingReport":
        return cls(
            team_profile=data.get("team_profile", ""),
            key_threats=list(data.get("key_threats", [])),
            set_piece_tendencies=list(data.get("set_piece_tendencies", [])),
            historical_context=list(data.get("historical_context", [])),
            coaching_recommendations=list(data.get("coaching_recommendations", [])),
            evidence=list(data.get("evidence", [])),
            generated_at=data.get("generated_at", datetime.now(timezone.utc).isoformat()),
        )