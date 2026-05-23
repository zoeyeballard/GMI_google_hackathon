from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, Sequence

from .models import AnalysisPacket, AnalysisRequest, ContextHit, Observation, ScoutingReport
from .prompts import build_report_prompt, build_video_analysis_prompt


class VideoAnalyzer(Protocol):
    def analyze(self, source: str, prompt: str, source_type: str = "url") -> dict:
        ...


class ContextRetriever(Protocol):
    def search(self, query: str, limit: int = 3) -> Sequence[ContextHit]:
        ...


class ReportGenerator(Protocol):
    def generate(self, packet: AnalysisPacket, prompt: str) -> ScoutingReport:
        ...


@dataclass(frozen=True)
class PipelineResult:
    packet: AnalysisPacket
    report: ScoutingReport


def _parse_observations(raw_observations: Sequence[dict]) -> list[Observation]:
    observations: list[Observation] = []
    for item in raw_observations:
        observations.append(
            Observation(
                timestamp_s=float(item.get("timestamp_s", 0.0)),
                label=str(item.get("label", "unknown")),
                confidence=float(item.get("confidence", 0.0)),
                details=str(item.get("details", "")),
            )
        )
    return observations


class AnalysisPipeline:
    def __init__(self, video_analyzer: VideoAnalyzer, context_retriever: ContextRetriever, report_generator: ReportGenerator):
        self.video_analyzer = video_analyzer
        self.context_retriever = context_retriever
        self.report_generator = report_generator

    def run(self, request: AnalysisRequest) -> PipelineResult:
        analysis_prompt = build_video_analysis_prompt(request)
        raw_payload = self.video_analyzer.analyze(request.source, analysis_prompt, source_type=request.source_type)

        observations = _parse_observations(raw_payload.get("observations", []))
        context_query = " ".join(
            part for part in [request.team_name, request.tournament, " ".join(raw_payload.get("historical_queries", []))] if part
        )
        context_hits = list(self.context_retriever.search(context_query or request.source, limit=3))

        packet = AnalysisPacket(
            request=request,
            observations=observations,
            context_hits=context_hits,
            raw_payload=raw_payload,
        )
        report_prompt = build_report_prompt(packet)
        report = self.report_generator.generate(packet, report_prompt)
        return PipelineResult(packet=packet, report=report)