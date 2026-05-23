import httpx
from fastapi.testclient import TestClient

from gmi_hackathon.api import AppDependencies, create_app
from gmi_hackathon.models import AnalysisPacket, AnalysisRequest, ContextHit, Observation, ScoutingReport


class FakePipeline:
    def run(self, request: AnalysisRequest):
        packet = AnalysisPacket(
            request=request,
            observations=[Observation(timestamp_s=12.0, label="press trigger", confidence=0.9)],
            context_hits=[ContextHit(source="match-01", note="Comparable side", similarity_reason="Similar block")],
            raw_payload={"observations": []},
        )
        report = ScoutingReport(
            team_profile="Compact and direct.",
            key_threats=["Winger"],
            set_piece_tendencies=["Near-post"],
            historical_context=["Comparable team"],
            coaching_recommendations=["Switch play early"],
            evidence=["Synthetic"],
        )
        return type("Result", (), {"packet": packet, "report": report})


def test_analyze_endpoint_returns_packet_and_report():
    app = create_app(AppDependencies(pipeline=FakePipeline()))
    client = TestClient(app)

    response = client.post(
        "/analyze",
        json={"source": "https://example.com/clip", "team_name": "Cabo Verde", "tournament": "World Cup"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["report"]["team_profile"] == "Compact and direct."
    assert payload["packet"]["request"]["team_name"] == "Cabo Verde"


class FailingPipeline:
    def run(self, request: AnalysisRequest):
        req = httpx.Request("POST", "https://console.gmicloud.ai/v1/video/analyze")
        res = httpx.Response(status_code=404, request=req)
        raise httpx.HTTPStatusError("not found", request=req, response=res)


def test_analyze_endpoint_returns_actionable_502_on_upstream_error():
    app = create_app(AppDependencies(pipeline=FailingPipeline()))
    client = TestClient(app)

    response = client.post(
        "/analyze",
        json={"source": "https://example.com/clip", "team_name": "Cabo Verde", "tournament": "World Cup"},
    )

    assert response.status_code == 502
    payload = response.json()
    assert payload["detail"]["message"] == "Upstream GMI request failed."
    assert "GMI_BASE_URL" in payload["detail"]["hint"]