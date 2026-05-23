from gmi_hackathon.models import AnalysisRequest, AnalysisPacket
from gmi_hackathon.prompts import build_report_prompt, build_video_analysis_prompt, load_prompt


def test_gmi_prompt_includes_input_fields():
    request = AnalysisRequest(source="https://example.com/clip", team_name="Cabo Verde", tournament="World Cup")
    prompt = build_video_analysis_prompt(request)

    assert "Cabo Verde" in prompt
    assert "World Cup" in prompt
    assert "Return JSON only" in prompt


def test_report_prompt_wraps_packet_data():
    request = AnalysisRequest(source="https://example.com/clip")
    packet = AnalysisPacket(request=request, raw_payload={"observations": []})
    prompt = build_report_prompt(packet)

    assert "Analysis packet:" in prompt
    assert "observations" in prompt


def test_prompt_files_exist():
    assert "football video analysis engine" in load_prompt("gmi_analysis_system.md").lower()