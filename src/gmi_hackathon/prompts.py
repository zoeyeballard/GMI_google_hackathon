from __future__ import annotations

from pathlib import Path

from .models import AnalysisRequest, AnalysisPacket


PROMPT_DIR = Path(__file__).resolve().parents[2] / "prompts"


def load_prompt(name: str) -> str:
    return (PROMPT_DIR / name).read_text(encoding="utf-8")


def build_video_analysis_prompt(request: AnalysisRequest) -> str:
    template = load_prompt("gmi_analysis_user.md")
    return template.format(
        source=request.source,
        source_type=request.source_type,
        team_name=request.team_name or "unknown",
        tournament=request.tournament or "unknown",
        clip_minutes=request.clip_minutes,
    )


def build_report_prompt(packet: AnalysisPacket) -> str:
    template = load_prompt("gemini_report_system.md")
    return "\n\n".join([template, "Analysis packet:", str(packet.to_dict())])