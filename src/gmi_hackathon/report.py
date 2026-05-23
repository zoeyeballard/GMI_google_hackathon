from __future__ import annotations

from .models import ScoutingReport


def _format_lines(items: list[str]) -> str:
    if not items:
        return "- None"
    return "\n".join(f"- {item}" for item in items)


def render_scouting_report(report: ScoutingReport) -> str:
    sections = [
        "# Scouting Report",
        "",
        "## Team profile",
        report.team_profile or "No team profile generated.",
        "",
        "## Key threats",
        _format_lines(report.key_threats),
        "",
        "## Set piece tendencies",
        _format_lines(report.set_piece_tendencies),
        "",
        "## Historical context",
        _format_lines(report.historical_context),
        "",
        "## Coaching recommendations",
        _format_lines(report.coaching_recommendations),
        "",
        "## Evidence",
        _format_lines(report.evidence),
    ]
    return "\n".join(sections)