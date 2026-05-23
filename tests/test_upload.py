from fastapi.testclient import TestClient

from gmi_hackathon.api import AppDependencies, create_app
from gmi_hackathon.models import AnalysisPacket, AnalysisRequest, ContextHit, Observation, ScoutingReport


class FakeUploadPipeline:
    def run(self, request: AnalysisRequest):
        packet = AnalysisPacket(
            request=request,
            observations=[Observation(timestamp_s=3.0, label="entry", confidence=0.8)],
            context_hits=[ContextHit(source="match-02", note="Comparable context", similarity_reason="Similar press")],
            raw_payload={"observations": []},
        )
        report = ScoutingReport(
            team_profile="Aggressive press.",
            key_threats=["Winger"],
            set_piece_tendencies=["Short corner"],
            historical_context=["Comparable match"],
            coaching_recommendations=["Play through pressure"],
            evidence=["Synthetic"],
        )
        return type("Result", (), {"packet": packet, "report": report})


def test_upload_endpoint_accepts_file_and_forwards_path(tmp_path):
    app = create_app(AppDependencies(pipeline=FakeUploadPipeline()))
    client = TestClient(app)

    response = client.post(
        "/analyze-upload",
        files={"file": ("clip.mp4", b"fake-video-bytes", "video/mp4")},
        data={"team_name": "Cabo Verde", "tournament": "World Cup", "clip_minutes": "5"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["packet"]["request"]["source_type"] == "upload"
    assert payload["upload_file"] == "clip.mp4"