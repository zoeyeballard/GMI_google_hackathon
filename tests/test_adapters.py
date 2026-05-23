import json

import httpx

from gmi_hackathon.adapters.gmi import GMIHttpVideoAnalyzer
from gmi_hackathon.adapters.google_ai_studio import GoogleAIStudioReportGenerator
from gmi_hackathon.models import AnalysisPacket, AnalysisRequest
from gmi_hackathon.prompts import build_report_prompt


def test_gmi_http_adapter_posts_expected_payload():
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["method"] = request.method
        captured["path"] = request.url.path
        captured["headers"] = dict(request.headers)
        captured["json"] = json.loads(request.content.decode())
        return httpx.Response(200, json={"observations": []})

    transport = httpx.MockTransport(handler)
    analyzer = GMIHttpVideoAnalyzer("https://api.example.com", "test-key", transport=transport)
    result = analyzer.analyze("https://example.com/clip", "prompt text")
    analyzer.close()

    assert captured["method"] == "POST"
    assert captured["path"] == "/v1/video/analyze"
    assert captured["json"]["source_type"] == "url"
    assert result["observations"] == []
    assert result["formations"] == []


def test_gmi_http_adapter_normalizes_response_shape():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "observations": [{"timestamp_s": 1.0, "label": "press", "confidence": 0.9}],
                "formations": ["4-4-2"],
                "key_players": ["left winger"],
                "set_pieces": ["near-post corner"],
                "confidence_notes": ["short clip"],
                "historical_queries": ["compact block"],
            },
        )

    analyzer = GMIHttpVideoAnalyzer("https://api.example.com", "test-key", transport=httpx.MockTransport(handler))
    result = analyzer.analyze("upload://clip", "prompt text", source_type="upload")
    analyzer.close()

    assert result["formations"] == ["4-4-2"]
    assert result["historical_queries"] == ["compact block"]


class FakeGoogleClient:
    def __init__(self):
        self.calls = []

    def generate_content(self, model: str, prompt: str):
        self.calls.append((model, prompt))
        return {
            "team_profile": "Compact mid-block.",
            "key_threats": ["Left winger"],
            "set_piece_tendencies": ["Near-post"],
            "historical_context": ["Comparable side"],
            "coaching_recommendations": ["Attack the half-space"],
            "evidence": ["Synthetic"],
        }


def test_google_ai_studio_adapter_returns_scouting_report():
    client = FakeGoogleClient()
    generator = GoogleAIStudioReportGenerator(client, "gemini-2.0-flash")
    request = AnalysisRequest(source="https://example.com/clip")
    packet = AnalysisPacket(request=request, raw_payload={"observations": []})

    report = generator.generate(packet, build_report_prompt(packet))

    assert client.calls[0][0] == "gemini-2.0-flash"
    assert report.team_profile == "Compact mid-block."