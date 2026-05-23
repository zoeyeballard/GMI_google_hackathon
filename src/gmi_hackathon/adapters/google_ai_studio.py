from __future__ import annotations

from typing import Any

from ..models import AnalysisPacket, ScoutingReport
from ..prompts import build_report_prompt


class GoogleAIStudioReportGenerator:
    def __init__(self, client: Any, model_name: str):
        self.client = client
        self.model_name = model_name

    def generate(self, packet: AnalysisPacket, prompt: str) -> ScoutingReport:
        response = self.client.generate_content(model=self.model_name, prompt=prompt)
        if isinstance(response, ScoutingReport):
            return response
        if isinstance(response, dict):
            return ScoutingReport.from_dict(response)
        if hasattr(response, "text"):
            return ScoutingReport.from_dict({
                "team_profile": str(response.text),
                "key_threats": [],
                "set_piece_tendencies": [],
                "historical_context": [],
                "coaching_recommendations": [],
                "evidence": ["Generated from Google AI Studio response text."],
            })
        return ScoutingReport.from_dict({
            "team_profile": str(response),
            "key_threats": [],
            "set_piece_tendencies": [],
            "historical_context": [],
            "coaching_recommendations": [],
            "evidence": ["Generated from Google AI Studio response value."],
        })


def build_report_generation_prompt(packet: AnalysisPacket) -> str:
    return build_report_prompt(packet)