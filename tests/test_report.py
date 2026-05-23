from gmi_hackathon.models import ScoutingReport
from gmi_hackathon.report import render_scouting_report


def test_render_scouting_report_has_expected_sections():
    report = ScoutingReport(
        team_profile="Compact mid-block with quick transitions.",
        key_threats=["Left winger attacks the far post."],
        set_piece_tendencies=["Near-post corner runs."],
        historical_context=["Similar to prior compact underdog sides."],
        coaching_recommendations=["Overload the left half-space."],
        evidence=["00:12 press trigger"],
    )

    rendered = render_scouting_report(report)

    assert "## Team profile" in rendered
    assert "## Key threats" in rendered
    assert "## Coaching recommendations" in rendered
    assert "- Left winger attacks the far post." in rendered